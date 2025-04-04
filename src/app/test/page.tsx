'use client';

import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Session Status: {status}</h2>
        {session ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </div>
  );
} 
