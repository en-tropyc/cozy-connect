'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const linkClasses = "text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium";
  const mobileLinkClasses = "block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium";

  return (
    <nav className="bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                Cozy Connect
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/feedback" className="text-indigo-600 hover:text-indigo-900 px-3 py-2 rounded-md text-sm font-medium">
                Feedback
              </Link>
              {session ? (
                <>
                  <Link href="/matches" className={linkClasses}>Matches</Link>
                  <Link href="/profile/edit" className={linkClasses}>Edit Profile</Link>
                  <Link href="/api/auth/signout" className={linkClasses}>Sign Out</Link>
                </>
              ) : (
                <Link href="/auth/signin" className={linkClasses}>Sign In</Link>
              )}
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-20 bg-white shadow-md" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/feedback" className="block text-indigo-600 hover:text-indigo-900 px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
              Feedback
            </Link>
            {session ? (
              <>
                <Link href="/matches" className={mobileLinkClasses} onClick={toggleMobileMenu}>Matches</Link>
                <Link href="/profile/edit" className={mobileLinkClasses} onClick={toggleMobileMenu}>Edit Profile</Link>
                <Link href="/api/auth/signout" className={mobileLinkClasses} onClick={toggleMobileMenu}>Sign Out</Link>
              </>
            ) : (
              <Link href="/auth/signin" className={mobileLinkClasses} onClick={toggleMobileMenu}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 
