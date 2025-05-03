'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Cozy Connect
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/feedback"
              className="text-indigo-600 hover:text-indigo-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Feedback
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/matches"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Matches
                </Link>
                <Link
                  href="/profile/edit"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
