'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../providers';
import { useSession, signOut } from 'next-auth/react';
import { HiChevronDown } from 'react-icons/hi';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // If signOut fails, try a hard refresh
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
            Novel Reader
          </Link>
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="text-gray-600 dark:text-gray-300">Loading...</div>
            ) : session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      href="/upload" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Upload Novel
                    </Link>
                  </>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span>{session.user.name || session.user.email}</span>
                    <HiChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 