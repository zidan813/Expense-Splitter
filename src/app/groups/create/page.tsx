'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CreateGroup() {
  const { user } = useAuth();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([
          {
            name: groupName,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user.id,
          },
        ]);

      if (memberError) throw memberError;

      // Redirect to the group page
      router.push(`/groups/${group.id}`);
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Create New Group</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 animate-fadeIn">
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Create a Group</h2>
            <p className="text-gray-600 text-sm sm:text-base px-2">
              Start splitting expenses with your friends, family, or roommates
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300"
                placeholder="e.g., Roommates, Trip to Paris, Family"
                required
                autoFocus
              />
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                Choose a name that describes your group
              </p>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="order-2 sm:order-1 flex-1 px-5 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 min-h-[48px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !groupName.trim()}
                className="order-1 sm:order-2 flex-1 px-5 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[48px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 sm:mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}