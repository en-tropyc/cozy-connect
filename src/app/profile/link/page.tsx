'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LinkProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError({
          message: data.error,
          type: data.errorType
        });
        return;
      }

      setCodeSent(true);
      if (data.isDevelopment) {
        toast.success(data.message, { duration: 10000 }); // Show for 10 seconds
        toast('Please wait while the admin forwards you the code', { duration: 10000 });
      } else {
        toast.success('Verification code sent! Please check your email.');
      }
    } catch (error: any) {
      setError({
        message: error.message || 'Failed to send verification code',
        type: 'UNKNOWN'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError({
          message: data.error,
          type: data.errorType
        });
        return;
      }

      toast.success('Profile linked successfully!');
      router.push('/');
    } catch (error: any) {
      setError({
        message: error.message || 'Failed to link profile',
        type: 'UNKNOWN'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Link Your Profile</h1>
          <div className="mb-6">
            <p className="text-xl font-bold text-gray-900 mb-2">Find Your Profile</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Open the Airtable link: <a href="https://airtable.com/appXPGzvT71UhNsjl/shrPuJX5UkpkmO4io/tbl9Jj8pIUABtsXRo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">View Profiles Table</a></li>
              <li>Look for your name in the &quot;Name 名子&quot; column</li>
              <li>Enter your exact name as shown in the table below</li>
            </ol>
          </div>
          
          {error && (
            <div className={`mb-6 p-4 rounded-md ${
              error.type === 'INVALID_CODE' 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : error.type === 'NO_PROFILE'
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="text-sm font-medium">{error.message}</p>
              {error.type === 'INVALID_CODE' && (
                <p className="mt-2 text-sm">Please check your verification code and try again.</p>
              )}
              {error.type === 'NO_PROFILE' && (
                <p className="mt-2 text-sm">Please make sure you entered your name exactly as it appears in your profile.</p>
              )}
              {error.type === 'ALREADY_LINKED' && (
                <p className="mt-2 text-sm">Try signing in with the email address associated with your profile.</p>
              )}
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && !codeSent && (
            <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Development Mode:</strong> Verification codes will be sent to cozycowork2024@gmail.com and need to be manually forwarded to you.
              </p>
            </div>
          )}
          
          <form onSubmit={codeSent ? handleVerifyCode : handleRequestCode} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-600"
                required
                placeholder="Enter your name as it appears in your profile"
                disabled={codeSent}
              />
            </div>

            {codeSent && (
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-600"
                  required
                  placeholder="Enter the code from your email"
                />
                <p className="mt-2 text-sm text-gray-600">
                  A verification code has been sent to the email address associated with your profile.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading 
                  ? (codeSent ? 'Verifying Code...' : 'Sending Code...')
                  : (codeSent ? 'Verify Code' : 'Send Verification Code')}
              </button>
            </div>

            {codeSent && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCodeSent(false)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Try a different name
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 
