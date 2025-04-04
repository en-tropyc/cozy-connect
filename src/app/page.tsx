'use client';

import { useEffect, useState } from 'react';
import { Profile, getProfiles } from '@/lib/airtable';
import ProfileCard from '@/components/ProfileCard';
import { Toaster, toast } from 'react-hot-toast';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedProfiles = await getProfiles();
        setProfiles(fetchedProfiles);
        
        // Find the current user's profile
        if (session?.user?.email) {
          const userProfile = fetchedProfiles.find(
            profile => profile.email === session.user.email
          );
          setUserProfile(userProfile || null);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError({
          message: 'Failed to load profiles',
          details: err instanceof Error ? err.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex >= profiles.length) return;
      
      if (e.key === 'ArrowLeft') {
        handleSwipeLeft();
      } else if (e.key === 'ArrowRight') {
        handleSwipeRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, profiles.length]);

  const handleSwipeLeft = () => {
    toast('Not interested', { 
      icon: '❌',
      position: 'bottom-center',
      className: 'bg-red-50 text-red-500 border border-red-100'
    });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = async () => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swipedProfileId: profiles[currentIndex].id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create match');
      }

      toast('Interested!', { 
        icon: '❤️',
        position: 'bottom-center',
        className: 'bg-green-50 text-green-500 border border-green-100'
      });
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match. Please try again.');
    } finally {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Cozy Connect</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to start connecting with other professionals.
          </p>
          <Link
            href="/auth/signin"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <p className="text-gray-600 mb-6">
            Welcome to Cozy Connect! Before you can start connecting with others,
            you need to create your profile.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Why create a profile?</h2>
            <ul className="text-blue-700 space-y-2">
              <li>• Share your professional background</li>
              <li>• Highlight your skills and interests</li>
              <li>• Connect with like-minded professionals</li>
              <li>• Find potential collaborators</li>
            </ul>
          </div>
          <Link
            href="/profile/create"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Create Your Profile
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profiles</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {error.details && (
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-w-full w-full max-h-48">
            {error.details}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No more profiles to show</h1>
        <p className="text-gray-600">Check back later for new connections!</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <Toaster />
      <div className="relative w-full max-w-md h-[calc(100vh-80px)]">
        <AnimatePresence>
          {profiles
            .slice(currentIndex, currentIndex + 3)
            .map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isActive={index === 0}
                style={{
                  zIndex: profiles.length - index,
                  scale: 1 - index * 0.05,
                  opacity: 1 - index * 0.2,
                  translateY: index * -8,
                }}
              />
            ))
            .reverse()}
        </AnimatePresence>
      </div>
      <div className="flex gap-6 mt-6 mb-4">
        <button
          onClick={handleSwipeLeft}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
        >
          <XMarkIcon className="h-8 w-8 text-red-500" />
        </button>
        <button
          onClick={handleSwipeRight}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
        >
          <HeartIcon className="h-8 w-8 text-green-500" />
        </button>
      </div>
    </main>
  );
}
