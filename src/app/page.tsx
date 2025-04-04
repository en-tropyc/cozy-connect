'use client';

import { useEffect, useState } from 'react';
import { Profile, getProfiles } from '@/lib/airtable';
import ProfileCard from '@/components/ProfileCard';
import { Toaster, toast } from 'react-hot-toast';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        console.log('Starting to fetch profiles...');
        const data = await getProfiles();
        console.log('Fetched profiles:', data);
        setProfiles(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError({
          message: errorMessage,
          details: error instanceof Error ? error.stack : undefined,
        });
        toast.error(`Failed to load profiles: ${errorMessage}`);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

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

  const handleSwipeRight = () => {
    toast('Interested!', { 
      icon: '❤️',
      position: 'bottom-center',
      className: 'bg-green-50 text-green-500 border border-green-100'
    });
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <p className="text-sm text-gray-500 mt-4">Please check your Airtable configuration and try again.</p>
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
