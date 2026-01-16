'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ============ Types ============
type Group = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

type Member = {
  id: string;
  user_id: string;
  email: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

// ============ Icons ============
const BackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

export default function GroupDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const menuRef = useRef<HTMLDivElement>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});

  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Transaction UI State
  const [activeTransMenuId, setActiveTransMenuId] = useState<string | null>(null);
  const [transToDelete, setTransToDelete] = useState<Expense | null>(null);
  const [transToEdit, setTransToEdit] = useState<Expense | null>(null);
  const [editTransForm, setEditTransForm] = useState({ description: '', amount: '' });

  // Guest Add UI State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestAmount, setGuestAmount] = useState(''); // New "2nd Box"
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Action State
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');

  // Toast state
  const [showInviteCopied, setShowInviteCopied] = useState(false);

  useEffect(() => {
    if (user && groupId) {
      fetchGroupData();
    }
  }, [user, groupId]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Group Menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      // Transaction Menus
      if (
        !(event.target as Element).closest('.trans-menu-btn') &&
        !(event.target as Element).closest('.trans-menu-dropdown')
      ) {
        setActiveTransMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchGroupData = async () => {
    try {
      // Fetch group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);
      setEditName(groupData.name);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Mock members emails
      const membersWithEmails = (membersData || []).map((member) => ({
        ...member,
        email: member.user_id === user!.id ? user!.email! :
          member.user_id.startsWith('manual_') ? 'Guest Member' :
            `User ${member.user_id.slice(0, 4)}...`,
      }));

      setMembers(membersWithEmails);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      calculateBalances(expensesData || [], membersWithEmails);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const calculateBalances = (expensesList: Expense[], membersList: Member[]) => {
    const balanceMap: { [key: string]: number } = {};

    membersList.forEach((member) => {
      balanceMap[member.user_id] = 0;
    });

    expensesList.forEach((expense) => {
      const totalAmount = expense.amount;
      const splitAmount = totalAmount / membersList.length;

      balanceMap[expense.paid_by] = (balanceMap[expense.paid_by] || 0) + totalAmount;

      membersList.forEach((member) => {
        balanceMap[member.user_id] = (balanceMap[member.user_id] || 0) - splitAmount;
      });
    });

    setBalances(balanceMap);
  };

  const getUserEmail = (userId: string) => {
    if (userId === user?.id) return user.email;
    const member = members.find(m => m.user_id === userId);
    return member?.email || 'Unknown User';
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/groups/${groupId}/join`;
    navigator.clipboard.writeText(inviteUrl);
    setShowInviteCopied(true);
    setTimeout(() => setShowInviteCopied(false), 3000);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: editName.trim() })
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) throw error;

      setGroup({ ...group, name: editName.trim() });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group name.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !user) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting group:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert('Failed to delete group. Please try again.');
    }
  };

  // Transaction Actions
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transToEdit || !user) return;

    setIsSaving(true);
    try {
      const amountFloat = parseFloat(editTransForm.amount);
      // Preserve negative sign if it was income
      const finalAmount = transToEdit.amount < 0 ? -Math.abs(amountFloat) : Math.abs(amountFloat);

      const { error } = await supabase
        .from('expenses')
        .update({
          description: editTransForm.description,
          amount: finalAmount
        })
        .eq('id', transToEdit.id);

      if (error) throw error;

      const updatedExpenses = expenses.map(ex =>
        ex.id === transToEdit.id
          ? { ...ex, description: editTransForm.description, amount: finalAmount }
          : ex
      );
      setExpenses(updatedExpenses);
      calculateBalances(updatedExpenses, members);
      setTransToEdit(null);
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("Failed to update transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!transToDelete || !user) return;
    setIsDeleting(true);
    try {
      // Safe Delete: Delete splits first
      const { error: splitError } = await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', transToDelete.id);

      if (splitError && splitError.code !== '42P01') {
        console.warn("Could not delete splits, trying to delete expense directly:", splitError);
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', transToDelete.id);

      if (error) throw error;

      const updatedExpenses = expenses.filter(ex => ex.id !== transToDelete.id);
      setExpenses(updatedExpenses);
      calculateBalances(updatedExpenses, members);
      setTransToDelete(null);
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Guest Member Action
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !user || !group) return;

    setIsAddingGuest(true);
    setGuestError(null);

    // We append the name to the ID to store it, e.g. "manual_John_UUID"
    const fakeId = `manual_${guestName.trim().replace(/\s+/g, '_')}_${crypto.randomUUID()}`;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: fakeId
        }])
        .select()
        .single();

      if (error) {
        // Check for UUID syntax error (22P02) OR FK violation (23503)
        if (error.code === '22P02' || error.code === '23503') {
          setGuestError('db_check_required');
        } else {
          console.error("Supabase Error:", error);
          throw error;
        }
      } else {
        // Member Added. Now Add Initial Expense if provided
        let newExpenses = [...expenses];
        if (guestAmount && parseFloat(guestAmount) > 0) {
          const { data: expenseData, error: expenseError } = await supabase.from('expenses').insert([{
            group_id: groupId,
            description: `Initial Deposit (${guestName})`,
            amount: parseFloat(guestAmount),
            paid_by: fakeId
          }]).select().single();

          if (!expenseError && expenseData) {
            newExpenses = [expenseData, ...newExpenses];
          }
        }

        // Update local state
        const newMember: Member = {
          id: data.id,
          user_id: fakeId,
          email: guestName.trim()
        };

        const updatedMembers = [...members, newMember];
        setMembers(updatedMembers);
        setExpenses(newExpenses);
        calculateBalances(newExpenses, updatedMembers);

        setGuestName('');
        setGuestAmount('');
        setShowGuestModal(false);
      }
    } catch (err) {
      console.error('Error adding member logic:', err);
      // Fallback to show the DB error to the user if it persists
      if (guestError !== 'db_check_required') {
        setGuestError("Could not add manual member. See console for details.");
      }
    } finally {
      setIsAddingGuest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Group not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#FF6B35] hover:text-[#FF8E53] font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === group.created_by;

  // Helper to extract name from guest ID if needed
  const getDisplayName = (member: Member) => {
    if (member.user_id === user?.id) return user.email || 'You';
    if (member.user_id.startsWith('manual_')) {
      // ID format: manual_John_Doe_UUID
      // We actually store the "email" property in local state correctly on add, 
      // but on refresh, we only have ID. 
      // Real app would have a profiles table. 
      // For now, we try to parse it from ID if the "email" field isn't friendly.
      if (member.email === 'Guest Member') {
        const parts = member.user_id.split('_');
        if (parts.length >= 3) {
          // manual (0), Name (1), ... UUID (last)
          // Rejoin parts 1 to length-2 to get name
          return parts.slice(1, -1).join(' ').replace(/_/g, ' ');
        }
        return 'Guest';
      }
      return member.email;
    }
    return member.email;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              >
                <BackIcon />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#1F2937]">{group.name}</h1>
                <p className="text-sm text-gray-500">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopyInvite}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border-2 border-orange-100 text-[#FF6B35] rounded-xl font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                {showInviteCopied ? (
                  <>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon />
                    <span>Invite</span>
                  </>
                )}
              </button>

              <div className="flex gap-3 flex-1 sm:flex-none">
                <button
                  onClick={() => router.push(`/groups/${groupId}/income/add`)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Income</span>
                </button>
                <button
                  onClick={() => router.push(`/groups/${groupId}/expenses/add`)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-bold hover:from-[#e55f2f] hover:to-[#e57d49] transition-all transform hover:scale-105 shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <PlusIcon />
                  <span>Add Expense</span>
                </button>
              </div>

              {/* Group Settings Menu */}
              {isCreator && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`p-2 rounded-xl transition-colors ${menuOpen ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <MenuIcon />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-20 animate-fadeIn bg-opacity-95 backdrop-blur-sm">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowEditModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        ✏️ Edit Group
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push(`/groups/${groupId}/members`);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        👥 Manage Members
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        🗑️ Delete Group
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Expenses Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Transactions</h2>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <ReceiptIcon />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-6">Start by adding your first expense or income</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/groups/${groupId}/expenses/add`)}
                      className="px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-bold hover:bg-[#e55f2f] transition-all"
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => router.push(`/groups/${groupId}/income/add`)}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
                    >
                      Add Income
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => {
                    const isIncome = expense.amount < 0;
                    const canEdit = user?.id === expense.paid_by || isCreator;

                    return (
                      <div key={expense.id} className={`p-4 border-2 rounded-2xl transition-all cursor-default group relative ${isIncome ? 'border-green-100 hover:border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-orange-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="pr-8">
                            <h3 className={`font-bold text-lg transition-colors ${isIncome ? 'text-gray-800' : 'text-[#1F2937] group-hover:text-[#FF6B35]'}`}>{expense.description}</h3>
                            <p className="text-sm text-gray-500">{isIncome ? 'Received by' : 'Paid by'} <span className="font-medium text-gray-700">{getUserEmail(expense.paid_by)}</span></p>
                          </div>

                          <div className="text-right">
                            <p className={`text-2xl font-bold ${isIncome ? 'text-emerald-600' : 'text-[#FF6B35]'}`}>
                              {isIncome ? '+' : ''}${Math.abs(expense.amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              ${Math.abs(expense.amount / members.length).toFixed(2)} / person
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-400" suppressHydrationWarning>
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>

                          {/* Transaction Menu */}
                          {canEdit && (
                            <div className="relative">
                              <button
                                className="trans-menu-btn p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTransMenuId(activeTransMenuId === expense.id ? null : expense.id);
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>

                              {activeTransMenuId === expense.id && (
                                <div className="trans-menu-dropdown absolute right-0 bottom-full mb-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fadeIn">
                                  <button
                                    onClick={() => {
                                      setActiveTransMenuId(null);
                                      setTransToEdit(expense);
                                      setEditTransForm({
                                        description: expense.description,
                                        amount: Math.abs(expense.amount).toString()
                                      });
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveTransMenuId(null);
                                      setTransToDelete(expense);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Balances Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#1F2937] mb-4">Balances</h2>
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">Add expenses to see balances</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const balance = balances[member.user_id] || 0;
                    const isPositive = balance > 0.01;
                    const isNegative = balance < -0.01;
                    return (
                      <div key={member.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-[#1F2937] text-sm truncate max-w-[120px]">
                            {getDisplayName(member)}
                            {member.user_id === user?.id && <span className="text-[#FF6B35] ml-1">(You)</span>}
                          </p>
                          <p className={`font-bold text-lg ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
                            {isPositive ? '+' : ''}${Math.abs(balance).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled up'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Members Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1F2937]">Members</h2>
                <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-lg">
                  {members.length}
                </span>
              </div>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg border-2 border-white shadow-sm">
                      {(getDisplayName(member) || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F2937] text-sm truncate">{getDisplayName(member)}</p>
                      {member.user_id === user?.id && <p className="text-xs text-[#FF6B35] font-medium">You</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={handleCopyInvite}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-[#FF6B35] hover:text-[#FF6B35] hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlusIcon />
                  <span>Invite Member</span>
                </button>
                <button
                  onClick={() => setShowGuestModal(true)}
                  className="w-full py-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                >
                  + Add Guest Manually
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Group Name</h2>
              <p className="text-gray-500 mt-2">Update how your group appears to others.</p>
            </div>

            <form onSubmit={handleUpdateGroup}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all text-gray-900 bg-white"
                  placeholder="e.g. Family Expenses"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-bold hover:bg-[#e55f2f] transition-colors shadow-lg shadow-orange-200 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {transToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Edit Transaction</h2>
            <form onSubmit={handleUpdateExpense}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none text-gray-900 bg-white"
                    value={editTransForm.description}
                    onChange={(e) => setEditTransForm({ ...editTransForm, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none text-gray-900 bg-white"
                    value={editTransForm.amount}
                    onChange={(e) => setEditTransForm({ ...editTransForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransToEdit(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-bold hover:bg-[#e55f2f] transition-colors shadow-lg shadow-orange-200 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete {group.name}?
            </h2>

            <p className="text-gray-600 text-center mb-8">
              This will permanently delete the group and all related expenses.
              This action <strong>cannot</strong> be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {transToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Transaction?</h2>
            <p className="text-gray-600 text-center mb-8">
              Are you sure you want to remove <strong>{transToDelete.description}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTransToDelete(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Add Guest Member</h2>
              <p className="text-gray-500 mt-2">Add a virtual member to track their expenses.</p>
            </div>

            {guestError === 'db_check_required' ? (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
                <h3 className="text-red-800 font-bold mb-2">Database Setup Required</h3>
                <p className="text-red-600 text-sm mb-3">To use Guest Members, your database needs a quick update initially.</p>
                <p className="text-gray-700 text-xs mb-1">Run this SQL in your Supabase Dashboard:</p>
                <div className="bg-black text-white p-3 rounded-lg text-xs overflow-x-auto font-mono mb-2">
                  <div className="mb-2 text-gray-500">-- 1. Allow guest users</div>
                  <div className="mb-2">ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;</div>
                  <div className="mb-2 text-gray-500">-- 2. Allow text IDs</div>
                  <div>ALTER TABLE group_members ALTER COLUMN user_id TYPE text;</div>
                </div>
                <button
                  onClick={() => setGuestError(null)}
                  className="mt-4 w-full py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200"
                >
                  OK, I've run it
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddGuest}>
                {guestError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm text-center">
                    {guestError}
                  </div>
                )}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all text-gray-900 bg-white"
                      placeholder="e.g. John"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={guestAmount}
                      onChange={(e) => setGuestAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-all text-gray-900 bg-white"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount this guest has already paid.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGuestModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isAddingGuest}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-bold hover:bg-[#e55f2f] transition-colors shadow-lg shadow-orange-200 disabled:opacity-50"
                    disabled={isAddingGuest}
                  >
                    {isAddingGuest ? 'Adding...' : 'Add Guest'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.1s ease-out;
        }
      `}</style>
    </div>
  );
}