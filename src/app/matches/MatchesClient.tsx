'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProfileModal from '@/components/ProfileModal';
import MatchActionButtons from '@/components/MatchActionButtons';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import type { Profile } from '@/lib/airtable';

export interface Match extends Profile {
  matchId: string;
}

interface MatchesClientProps {
  pendingMatches: Match[];
  acceptedMatches: Match[];
}

export default function MatchesClient({ pendingMatches, acceptedMatches }: MatchesClientProps) {
  const [pending, setPending] = useState<Match[]>(pendingMatches);
  const [accepted, setAccepted] = useState<Match[]>(acceptedMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setPending(current => current.filter(match => match.matchId !== matchId));
      
      // If accepted, add to accepted matches
      if (action === 'accepted') {
        const acceptedMatch = pending.find(match => match.matchId === matchId);
        if (acceptedMatch) {
          setAccepted(current => [...current, acceptedMatch]);
        }
      }

      toast.success(action === 'accepted' ? 'Connection accepted!' : 'Request declined');
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {pending.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Requested Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedMatch(match);
                    setIsModalOpen(true);
                  }}
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
                        <span className="text-4xl text-gray-600">
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
                        <span className="text-sm text-gray-600">{match.location}</span>
                      )}
                    </div>
                    
                    {match.shortIntro && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {match.shortIntro}
                      </p>
                    )}

                    <MatchActionButtons
                      matchId={match.matchId!}
                      onAction={handleMatchAction}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected</h2>
        {accepted.length === 0 ? (
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
            {accepted.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedMatch(match);
                  setIsModalOpen(true);
                }}
              >
                <div className="relative h-48">
                  {match.picture?.[0]?.url ? (
                    <Image
                      src={match.picture[0].url}
                      alt={match.name}
                      fill
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl text-gray-600">
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
                      <span className="text-sm text-gray-600">{match.location}</span>
                    )}
                  </div>
                  
                  {match.shortIntro && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {match.shortIntro}
                    </p>
                  )}

                  {match.categories && match.categories.length > 0 && (
                    <div className="mt-3">
                      <h3 className="text-sm font-medium text-gray-900">Categories/Skills</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {match.categories.map((category, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.lookingFor && (
                    <div className="mt-3">
                      <h3 className="text-sm font-medium text-gray-900">Looking For</h3>
                      <p className="mt-1 text-sm text-gray-600">{match.lookingFor}</p>
                    </div>
                  )}

                  {match.canOffer && (
                    <div className="mt-3">
                      <h3 className="text-sm font-medium text-gray-900">Can Offer</h3>
                      <p className="mt-1 text-sm text-gray-600">{match.canOffer}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    {match.linkedinLink && (
                      <a
                        href={
                          match.linkedinLink.startsWith('http')
                            ? match.linkedinLink
                            : `https://linkedin.com/in/${match.linkedinLink.replace('@', '')}`
                        }
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
                        href={
                          match.instagram.startsWith('http')
                            ? match.instagram
                            : `https://instagram.com/${match.instagram.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {match.github && (
                      <a
                        href={
                          match.github.startsWith('http')
                            ? match.github
                            : match.github.includes('github.com')
                              ? `https://${match.github.replace(/^https?:\/\//, '')}`
                              : `https://github.com/${match.github.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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

      <ProfileModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
