'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ============ Icons ============
const UserGroupIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AlertIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function JoinGroupPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    // Fix: Handle potential array param
    const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [groupName, setGroupName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);

    useEffect(() => {
        // Redirect to login if not authenticated, passing the current URL as returnUrl
        if (!authLoading && !user) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/auth?returnUrl=${returnUrl}`);
            return;
        }

        if (user && groupId) {
            fetchGroupInfo();
        }
    }, [user, authLoading, groupId, router]);

    const fetchGroupInfo = async () => {
        try {
            setLoading(true);
            // 1. Check if group exists
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .single();

            if (groupError) throw new Error('Group not found');
            setGroupName(group.name);

            // 2. Check if already a member
            const { data: member, error: memberError } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', user!.id)
                .maybeSingle();

            if (member) {
                setAlreadyMember(true);
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load group info');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            setError(null);

            const { error: joinError } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: user!.id,
                });

            if (joinError) throw joinError;

            // Success! Redirect to group page
            router.push(`/groups/${groupId}`);

        } catch (err) {
            console.error(err);
            setError('Failed to join group. Please try again.');
            setJoining(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                        <AlertIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Oops!</h1>
                        <p className="text-gray-600 mt-2">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full space-y-8 text-center">

                {/* Icon */}
                <div className="flex justify-center -mt-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-3xl flex items-center justify-center shadow-lg shadow-orange-200 ring-4 ring-white">
                        <UserGroupIcon className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-[#1F2937]">You've been invited!</h1>
                    <p className="text-gray-500">
                        You have been invited to join the group
                        <span className="font-bold text-[#FF6B35] block text-xl mt-1">{groupName}</span>
                    </p>
                </div>

                {alreadyMember ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckIcon />
                        </div>
                        <p className="text-green-800 font-medium">You are already a member!</p>
                        <button
                            onClick={() => router.push(`/groups/${groupId}`)}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                        >
                            Go to Group
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600">
                                {user?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Joining as</p>
                                <p className="text-sm font-medium text-gray-900">{user?.email || 'Unknown User'}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="w-full h-14 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {joining ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Joining Group...</span>
                                </>
                            ) : (
                                'Join Group'
                            )}
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-3 text-gray-400 hover:text-gray-600 font-medium transition-colors"
                        >
                            No thanks, go to dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
