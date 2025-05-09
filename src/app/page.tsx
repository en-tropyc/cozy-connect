'use client';

import { useEffect, useState } from 'react';
import { Profile, getProfiles } from '@/lib/airtable';
import ProfileCard from '@/components/ProfileCard';
import { Toaster, toast } from 'react-hot-toast';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { X, RotateCcw } from 'lucide-react';
import { Heart } from 'lucide-react';

// Custom match toast component
const MatchToast = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 1],
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }}
    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg"
  >
    <motion.span
      animate={{ 
        scale: [1, 1.2, 1],
        transition: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1
        }
      }}
    >
      ❤️
    </motion.span>
    <span className="font-bold text-lg">It's a match!</span>
    <motion.span
      animate={{ 
        scale: [1, 1.2, 1],
        transition: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1,
          delay: 0.5
        }
      }}
    >
      🎉
    </motion.span>
  </motion.div>
);

export default function Home() {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<{ profile: Profile; matchId: string | null } | null>(null);
  const [cachedProfiles, setCachedProfiles] = useState<Profile[]>([]);
  const [pendingSwipes, setPendingSwipes] = useState<Array<{ profileId: string; action: 'left' | 'right'; timestamp: number }>>([]);
  const CHUNK_SIZE = 10;
  const PREFETCH_THRESHOLD = 5;
  const BATCH_SIZE = 3;
  const BATCH_TIMEOUT = 2000; // Process batch after 2 seconds of no activity

  useEffect(() => {
    if (status === 'loading') return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Home - Fetching profiles, session status:', {
          status,
          userEmail: session?.user?.email
        });
        
        const fetchedProfiles = await getProfiles();
        
        // Find and set the user's profile (for profile linking)
        if (session?.user?.email) {
          console.log('Home - Looking for user profile:', {
            userEmail: session.user.email,
            totalProfiles: fetchedProfiles.length,
            profileEmails: fetchedProfiles.map(p => ({
              name: p.name,
              email: p.email,
              cozyConnectGmail: p.cozyConnectGmail
            }))
          });

          // First try to fetch profile directly from API
          try {
            console.log('Home - Fetching user profile from API');
            const response = await fetch('/api/profile');
            const data = await response.json();
            console.log('Home - Profile API response:', data);

            if (data.success) {
              console.log('Home - Found user profile from API');
              setUserProfile(data.data);
            } else {
              console.log('Home - No profile found from API:', data.error);
              setUserProfile(null);
            }
          } catch (error) {
            console.error('Home - Error fetching profile from API:', error);
            setUserProfile(null);
          }
        } else {
          console.log('Home - No user email in session');
        }

        // Filter out the user's own profile and blacklisted profiles from the stack
        const otherProfiles = fetchedProfiles.filter(profile => 
          profile.cozyConnectGmail !== session?.user?.email &&
          profile.email !== session?.user?.email
        );
        
        console.log('Home - Filtered profiles:', {
          total: fetchedProfiles.length,
          filtered: otherProfiles.length,
          excluded: fetchedProfiles.length - otherProfiles.length
        });
        
        // Cache filtered profiles for the stack
        setCachedProfiles(otherProfiles);
        
        // Load first chunk of profiles
        setProfiles(otherProfiles.slice(0, CHUNK_SIZE));
        setHasMore(otherProfiles.length > CHUNK_SIZE);

        // Prefetch images for the first few profiles
        otherProfiles.slice(0, 3).forEach(profile => {
          if (profile.picture?.[0]?.url) {
            const img = new Image();
            img.src = profile.picture[0].url;
          }
        });
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

  // Load more profiles when needed
  useEffect(() => {
    if (currentIndex >= profiles.length - PREFETCH_THRESHOLD && hasMore && cachedProfiles.length > profiles.length) {
      // Load next chunk from cache, ensuring we don't include user's own profile
      const nextChunk = cachedProfiles
        .slice(profiles.length, profiles.length + CHUNK_SIZE);
      
      setProfiles(prev => [...prev, ...nextChunk]);
      setHasMore(cachedProfiles.length > profiles.length + CHUNK_SIZE);

      // Prefetch images for the next chunk
      nextChunk.forEach(profile => {
        if (profile.picture?.[0]?.url) {
          const img = new Image();
          img.src = profile.picture[0].url;
        }
      });
    }
  }, [currentIndex, profiles.length, hasMore, cachedProfiles]);

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

  // Process pending swipes when batch size is met or timeout occurs
  useEffect(() => {
    if (pendingSwipes.length === 0) return;

    const processPendingSwipes = async () => {
      const now = Date.now();
      const oldestSwipe = pendingSwipes[0];
      const timeWaiting = now - oldestSwipe.timestamp;
      
      // Process if we have enough swipes or the oldest swipe has been waiting too long
      if (pendingSwipes.length >= BATCH_SIZE || timeWaiting >= BATCH_TIMEOUT) {
        // Take all pending swipes
        const swipesToProcess = [...pendingSwipes];
        
        try {
          // Clear the queue optimistically
          setPendingSwipes([]);

          // Process right swipes in parallel
          const rightSwipes = swipesToProcess.filter(swipe => swipe.action === 'right');
          const results = await Promise.allSettled(
            rightSwipes.map(swipe => 
              fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ swipedProfileId: swipe.profileId }),
              }).then(res => res.json())
            )
          );

          // Handle results and show match notifications
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.isMatch) {
              toast.custom((t) => <MatchToast />, {
                duration: 3000,
                position: 'bottom-center',
                style: { background: 'transparent', boxShadow: 'none' },
              });
            } else if (result.status === 'rejected') {
              console.error('Failed to process swipe:', result.reason);
              // Add failed swipe back to queue
              setPendingSwipes(prev => [...prev, rightSwipes[index]]);
            }
          });
        } catch (error) {
          console.error('Error processing swipes:', error);
          // On catastrophic error, add all swipes back to queue
          setPendingSwipes(prev => [...prev, ...swipesToProcess]);
        }
      }
    };

    // Set up timer to check for pending swipes
    const timer = setInterval(processPendingSwipes, Math.min(BATCH_TIMEOUT / 2, 1000));
    
    // Process immediately if batch size is met
    if (pendingSwipes.length >= BATCH_SIZE) {
      processPendingSwipes();
    }

    return () => clearInterval(timer);
  }, [pendingSwipes]);

  const handleSwipeLeft = () => {
    const currentProfile = profiles[currentIndex];
    
    // Optimistically update UI
    setCurrentIndex(prev => prev + 1);
    setPendingSwipes(prev => [...prev, { 
      profileId: currentProfile.id, 
      action: 'left',
      timestamp: Date.now()
    }]);
    
    // Show toast immediately
    toast('Not interested', { 
      icon: '❌',
      position: 'bottom-center',
      className: 'bg-red-50 text-red-500 border border-red-100'
    });
  };

  const handleSwipeRight = () => {
    const currentProfile = profiles[currentIndex];
    
    // Optimistically update UI
    setCurrentIndex(prev => prev + 1);
    setPendingSwipes(prev => [...prev, { 
      profileId: currentProfile.id, 
      action: 'right',
      timestamp: Date.now()
    }]);
    setLastSwipedProfile({ profile: currentProfile, matchId: null });
    
    // Show toast immediately
    toast('Interested!', { 
      icon: '❤️',
      position: 'bottom-center',
      className: 'bg-green-50 text-green-500 border border-green-100'
    });
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
                isMatch={profile.isMatch}
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
    </main>
  );
}
