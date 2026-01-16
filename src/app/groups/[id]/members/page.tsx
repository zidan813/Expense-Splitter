'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Member = {
    id: string;
    user_id: string;
    email: string;
};

type Group = {
    id: string;
    name: string;
    created_by: string;
};

export default function ManageMembers() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [showInviteCopied, setShowInviteCopied] = useState(false);

    // Manual Add State
    const [manualEmail, setManualEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (user && groupId) {
            fetchData();
        }
    }, [user, groupId]);

    const fetchData = async () => {
        try {
            // Fetch group
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;
            setGroup(groupData);

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('id, user_id')
                .eq('group_id', groupId);

            if (membersError) throw membersError;

            // In a real app with 'profiles' table, we would join here.
            // For now, we mock - but if we added a manual member with a special ID, we handle it.
            const membersWithEmails = membersData.map((member) => ({
                ...member,
                email: member.user_id === user!.id ? user!.email! :
                    member.user_id.startsWith('manual_') ? 'Guest Member' :
                        `User ${member.user_id.slice(0, 4)}...`,
            }));

            setMembers(membersWithEmails);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyInvite = () => {
        const inviteUrl = `${window.location.origin}/groups/${groupId}/join`;
        navigator.clipboard.writeText(inviteUrl)
            .then(() => {
                setShowInviteCopied(true);
                setTimeout(() => setShowInviteCopied(false), 3000);
            })
            .catch(err => console.error('Failed to copy:', err));
    };

    // ... (rest of methods)

    // ... handleAddManualMember ...
    // ... handleRemoveMember ...

    // Replace the return null with error UI
    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">Group not found</h2>
                    <p className="text-gray-500 mt-2">Could not load group details.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleAddManualMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualEmail.trim() || !user || !group) return;

        setIsAdding(true);
        try {
            // Note: We attempt to insert a "Guest" member with a Generated UUID.
            // This relies on the database NOT enforcing a strict Foreign Key to auth.users.
            // If it does enforce it, this will fail, and we will catch it.

            const fakeId = `manual_${crypto.randomUUID()}`;

            const { data, error } = await supabase
                .from('group_members')
                .insert([{
                    group_id: groupId,
                    user_id: fakeId // This might fail if FK constraints exist
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23503') { // Foreign Key Violation
                    alert("This app requires all members to be registered users. Please share the invite link!");
                } else {
                    throw error;
                }
            } else {
                setMembers([...members, {
                    id: data.id,
                    user_id: fakeId,
                    email: manualEmail // Display the name they typed
                }]);
                setManualEmail('');
            }
        } catch (err) {
            console.error('Error adding member:', err);
            alert("Could not add manual member. Please use the invite link.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberUserId: string) => {
        if (!group || group.created_by !== user?.id) return; // Only creator
        if (memberUserId === group.created_by) return; // Cannot remove creator

        if (!confirm('Are you sure you want to remove this member?')) return;

        setRemovingId(memberId);
        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            setMembers(members.filter(m => m.id !== memberId));
        } catch (err) {
            console.error('Error removing member:', err);
            alert('Failed to remove member');
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!group) return null;

    const isCreator = user?.id === group.created_by;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(`/groups/${groupId}`)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1F2937]">Manage Members</h1>
                            <p className="text-sm text-gray-500">{group.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Invite Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add Members</h2>

                    <div className="space-y-6">
                        {/* Option 1: Copy Link */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <h3 className="text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Option 1: Share Link</h3>
                            <button
                                onClick={handleCopyInvite}
                                className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {showInviteCopied ? (
                                    <span className="text-green-600">Link Copied!</span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>Copy Invite Link</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Option 2: Manual Add (Experimental) */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <h3 className="text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Option 2: Add Guest (Offline User)</h3>
                            <p className="text-xs text-gray-500 mb-3">
                                Add a virtual member to track expenses for someone who doesn't use the app yet.
                            </p>
                            <form onSubmit={handleAddManualMember} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Name (e.g. John)"
                                    value={manualEmail}
                                    onChange={(e) => setManualEmail(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none text-gray-900 bg-white placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!manualEmail.trim() || isAdding}
                                    className="px-4 py-2 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                >
                                    {isAdding ? 'Adding...' : 'Add'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Group Members ({members.length})</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl">
                                        {(member.email && member.email[0]) ? member.email[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {member.email}
                                            {member.user_id === user?.id && <span className="text-gray-500 text-sm font-normal ml-2">(You)</span>}
                                            {member.user_id.startsWith('manual_') && <span className="text-gray-400 text-xs font-normal ml-2">(Guest)</span>}
                                        </p>
                                        {member.user_id === group.created_by && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Remove Button - Only for creator, can't remove self */}
                                {isCreator && member.user_id !== group.created_by && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                                        disabled={removingId === member.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remove member"
                                    >
                                        {removingId === member.id ? (
                                            <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
