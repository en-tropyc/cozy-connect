'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Match {
  id: string;
  name: string;
  email?: string;
  picture?: { url: string }[];
  companyTitle?: string;
  location?: string;
  shortIntro?: string;
  linkedinLink?: string;
  instagram?: string;
  matchId?: string;
  matchStatus?: string;
}

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleMatchAction = async (matchId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          status: action
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update connection request');
      }

      // Remove the match from pending matches
      setPendingMatches(current => current.filter(match => match.matchId !== matchId));
      
      // If accepted, add to accepted matches
      if (action === 'accepted') {
        const acceptedMatch = pendingMatches.find(match => match.matchId === matchId);
        if (acceptedMatch) {
          setAcceptedMatches(current => [...current, acceptedMatch]);
        }
      }

      toast.success(action === 'accepted' ? 'Connection accepted!' : 'Request declined');
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection request. Please try again.');
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch matches');
        }

        // Separate matches into pending and accepted
        const pending: Match[] = [];
        const accepted: Match[] = [];
        
        data.matches.forEach((match: Match) => {
          if (match.matchStatus === 'pending') {
            pending.push(match);
          } else if (match.matchStatus === 'accepted') {
            accepted.push(match);
          }
        });

        setPendingMatches(pending);
        setAcceptedMatches(accepted);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchMatches();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Matches</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {pendingMatches.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Requested Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    {match.picture?.[0]?.url ? (
                      <Image
                        src={match.picture[0].url}
                        alt={match.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">
                          {match.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{match.name}</h2>
                        {match.companyTitle && (
                          <p className="text-sm text-gray-600">{match.companyTitle}</p>
                        )}
                      </div>
                      {match.location && (
                        <span className="text-sm text-gray-500">{match.location}</span>
                      )}
                    </div>
                    
                    {match.shortIntro && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{match.shortIntro}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleMatchAction(match.matchId!, 'accepted')}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleMatchAction(match.matchId!, 'rejected')}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected</h2>
        {acceptedMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">You haven't connected with anyone yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Networking
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  {match.picture?.[0]?.url ? (
                    <Image
                      src={match.picture[0].url}
                      alt={match.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl text-gray-400">
                        {match.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{match.name}</h2>
                      {match.companyTitle && (
                        <p className="text-sm text-gray-600">{match.companyTitle}</p>
                      )}
                    </div>
                    {match.location && (
                      <span className="text-sm text-gray-500">{match.location}</span>
                    )}
                  </div>
                  
                  {match.shortIntro && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{match.shortIntro}</p>
                  )}

                  <div className="mt-4 flex gap-3">
                    {match.linkedinLink && (
                      <a
                        href={match.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {match.instagram && (
                      <a
                        href={`https://instagram.com/${match.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {match.email && (
                      <a
                        href={`mailto:${match.email}`}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
