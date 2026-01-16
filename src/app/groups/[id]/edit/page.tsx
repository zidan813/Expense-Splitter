'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Group = {
    id: string;
    name: string;
    created_by: string;
};

export default function EditGroup() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;

    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && groupId) {
            fetchGroup();
        }
    }, [user, groupId]);

    const fetchGroup = async () => {
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (error) throw error;

            // Security check
            if (data.created_by !== user!.id) {
                router.push(`/groups/${groupId}`);
                return;
            }

            setGroupName(data.name);
        } catch (err: any) {
            console.error('Error fetching group:', err);
            setError('Failed to load group details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');

        try {
            const { error } = await supabase
                .from('groups')
                .update({ name: groupName.trim() })
                .eq('id', groupId)
                .eq('created_by', user.id);

            if (error) throw error;

            router.push(`/groups/${groupId}`);
        } catch (err: any) {
            console.error('Error updating group:', err);
            setError(err.message || 'Failed to update group');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(`/groups/${groupId}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg
                                className="w-6 h-6 text-gray-600"
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
                        <h1 className="text-2xl font-bold text-gray-800">Edit Group</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-fadeIn">
                    <div className="mb-8 text-center">
                        <div className="inline-block p-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl mb-4">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Group Name</h2>
                        <p className="text-gray-600">
                            Update how your group appears to members
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-all duration-300 hover:border-orange-300"
                                placeholder="e.g., Roommates, Trip to Paris"
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/groups/${groupId}`)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !groupName.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-semibold hover:from-[#e55f2f] hover:to-[#e57d49] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-3"
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
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
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
