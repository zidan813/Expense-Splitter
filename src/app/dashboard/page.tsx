'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ============ TypeScript Types ============
type DashboardStats = {
  totalGroups: number;
  totalExpenses: number;
  youOwe: number;
  youAreOwed: number;
};

type GroupCard = {
  id: string;
  name: string;
  memberCount: number;
  totalExpenses: number;
  yourBalance: number;
  created_at: string;
  created_by: string;
};

type RecentActivity = {
  id: string;
  description: string;
  amount: number;
  groupName: string;
  paidBy: string;
  created_at: string;
  isYou: boolean;
};

// ============ Icon Components ============
const GroupIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

// ============ Loading Skeleton Components ============
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
      <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded-lg w-24 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-20"></div>
  </div>
);

const GroupCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
      <div className="h-5 bg-gray-200 rounded w-20"></div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="p-4 bg-gray-50 rounded-xl animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// ============ Main Dashboard Component ============
export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalExpenses: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [incomingActivity, setIncomingActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Menu & Modal State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Click outside handler for menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch all groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user!.id);

      if (memberError) throw memberError;

      const groupIds = memberGroups?.map(m => m.group_id) || [];

      if (groupIds.length === 0) {
        setGroups([]);
        setStats({
          totalGroups: 0,
          totalExpenses: 0,
          youOwe: 0,
          youAreOwed: 0,
        });
        setRecentActivity([]);
        setLoading(false);
        return;
      }

      // 2. Fetch group details
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // 3. Fetch member counts and expenses for each group
      const groupCards: GroupCard[] = [];
      let totalExpensesSum = 0;
      let myTotalSpending = 0;
      let myTotalIncome = 0;
      let youOweTotal = 0;
      let youAreOwedTotal = 0;
      const allActivities: RecentActivity[] = [];
      const incomingTransactions: RecentActivity[] = [];

      for (const group of groupsData || []) {
        // Get member count
        const { count: memberCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        // Get all expenses for this group
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });

        if (expensesError) throw expensesError;

        // Calculate group totals and user balance
        let groupTotalExpenses = 0;
        let userBalance = 0;
        const membersInGroup = memberCount || 1;

        for (const expense of expenses || []) {
          const isPayer = expense.paid_by === user!.id;

          if (expense.amount < 0) {
            // Income
            const incomeAmt = Math.abs(expense.amount);
            if (isPayer) myTotalIncome += incomeAmt;

            incomingTransactions.push({
              id: expense.id,
              description: expense.description,
              amount: incomeAmt,
              groupName: group.name,
              paidBy: expense.paid_by,
              created_at: expense.created_at,
              isYou: isPayer,
            });
          } else {
            // Expense
            groupTotalExpenses += expense.amount;
            totalExpensesSum += expense.amount;
            if (isPayer) myTotalSpending += expense.amount;
          }

          // Balance Calc
          const splitAmount = expense.amount / membersInGroup;
          if (isPayer) {
            userBalance += expense.amount - splitAmount;
          } else {
            userBalance -= splitAmount;
          }

          if (allActivities.length < 20) {
            allActivities.push({
              id: expense.id,
              description: expense.description,
              amount: Math.abs(expense.amount),
              groupName: group.name,
              paidBy: expense.paid_by,
              created_at: expense.created_at,
              isYou: isPayer,
            });
          }
        }

        if (userBalance < 0) {
          youOweTotal += Math.abs(userBalance);
        } else {
          youAreOwedTotal += userBalance;
        }

        groupCards.push({
          id: group.id,
          name: group.name,
          memberCount: memberCount || 0,
          totalExpenses: groupTotalExpenses,
          yourBalance: userBalance,
          created_at: group.created_at,
          created_by: group.created_by,
        });
      }

      const timeSort = (a: RecentActivity, b: RecentActivity) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

      allActivities.sort(timeSort);
      incomingTransactions.sort(timeSort);

      setGroups(groupCards);
      setStats({
        totalGroups: groupCards.length,
        totalExpenses: totalExpensesSum,
        youOwe: youOweTotal + myTotalSpending,
        youAreOwed: youAreOwedTotal + myTotalIncome,
      });
      setRecentActivity(allActivities.slice(0, 5));
      setIncomingActivity(incomingTransactions.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete || !user) return;
    setIsDeleting(true);

    try {
      // 1. Delete group (cascade will handle the rest)
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupToDelete.id)
        .eq('created_by', user.id);

      if (error) throw error;

      // 2. Update local state
      setGroups(groups.filter(g => g.id !== groupToDelete.id));
      setStats(prev => ({ ...prev, totalGroups: prev.totalGroups - 1 }));
      setGroupToDelete(null);
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Auth loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" onClick={() => setActiveMenuId(null)}>
      {/* ============ Header ============ */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & App Name */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-xl shadow-lg shadow-orange-200">
                <WalletIcon />
                <svg className="w-7 h-7 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Expense Splitter</h1>
                <p className="text-sm text-gray-500 hidden sm:block">{user.email}</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-600 max-w-[150px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Main Content ============ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="ml-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ============ Statistics Cards ============ */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* Total Groups */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group cursor-default transform hover:-translate-y-1"
                  style={{ animationDelay: '0ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                      <GroupIcon />
                    </div>
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-1">{stats.totalGroups}</h3>
                  <p className="text-gray-500 text-sm">Total Groups</p>
                </div>

                {/* Total Expenses */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group cursor-default transform hover:-translate-y-1"
                  style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                      <ExpenseIcon />
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                      All Time
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-1">{formatCurrency(stats.totalExpenses)}</h3>
                  <p className="text-gray-500 text-sm">Total Expenses</p>
                </div>

                {/* Your Expense (Previously "You Owe") */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group cursor-default transform hover:-translate-y-1"
                  style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-200 group-hover:scale-110 transition-transform duration-300">
                      <ArrowDownIcon />
                    </div>
                    {stats.youOwe > 0 && (
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <h3 className="text-4xl font-bold text-red-600 mb-1">{formatCurrency(stats.youOwe)}</h3>
                  <p className="text-gray-500 text-sm">Your Expense</p>
                </div>

                {/* You're Owed */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group cursor-default transform hover:-translate-y-1"
                  style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
                      <ArrowUpIcon />
                    </div>
                    {stats.youAreOwed > 0 && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                        Incoming
                      </span>
                    )}
                  </div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-1">{formatCurrency(stats.youAreOwed)}</h3>
                  <p className="text-gray-500 text-sm">You&apos;re Owed</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============ Main Grid: Groups + Sidebar ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============ Groups Section (Left - 2 cols) ============ */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Groups</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {loading ? 'Loading...' : `${stats.totalGroups} group${stats.totalGroups !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const firstGroup = groups[0];
                    if (firstGroup) {
                      router.push(`/groups/${firstGroup.id}/income/add`);
                    } else {
                      alert('Please create a group first!');
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-200 hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add Income</span>
                </button>
                <button
                  onClick={() => router.push('/groups/create')}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-semibold hover:from-[#e55f2f] hover:to-[#e57d49] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-200 hover:shadow-xl"
                >
                  <PlusIcon />
                  <span className="hidden sm:inline">Create Group</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <GroupCardSkeleton />
                <GroupCardSkeleton />
                <GroupCardSkeleton />
                <GroupCardSkeleton />
              </div>
            ) : groups.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-6">
                  <GroupIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No groups yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Create your first group to start splitting expenses with friends, family, or roommates!
                </p>
                <button
                  onClick={() => router.push('/groups/create')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-semibold hover:from-[#e55f2f] hover:to-[#e57d49] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-200"
                >
                  <PlusIcon />
                  Create Your First Group
                </button>
              </div>
            ) : (
              /* Groups Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {groups.map((group, index) => (
                  <div
                    key={group.id}
                    className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col group transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={(e) => {
                      // Only navigate if not clicking the menu
                      if (!(e.target as HTMLElement).closest('button')) {
                        router.push(`/groups/${group.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-lg font-bold text-gray-800 truncate mb-1 group-hover:text-[#FF6B35] transition-colors cursor-pointer">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <UserIcon />
                          <span>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Menu for Creator */}
                      {group.created_by === user?.id ? (
                        <div className="relative z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === group.id ? null : group.id);
                            }}
                            className={`p-2 rounded-xl transition-colors ${activeMenuId === group.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
                          >
                            <MenuIcon />
                          </button>

                          {activeMenuId === group.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-20 animate-fadeIn bg-opacity-95 backdrop-blur-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/groups/${group.id}/edit`);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                ✏️ Edit Group
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/groups/${group.id}/members`);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                👥 Manage Members
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  setGroupToDelete(group);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                🗑️ Delete Group
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:from-[#FF6B35] group-hover:to-[#FF8E53] transition-all duration-300">
                          <svg className="w-6 h-6 text-[#FF6B35] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Group Stats */}
                    <div className="flex items-center justify-between py-3 border-t border-gray-100 mt-2">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Total Expenses</p>
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(group.totalExpenses)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Your Balance</p>
                        <p className={`text-lg font-bold ${group.yourBalance > 0.01 ? 'text-emerald-600' :
                          group.yourBalance < -0.01 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {group.yourBalance > 0.01 ? '+' : ''}{formatCurrency(group.yourBalance)}
                        </p>
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400" suppressHydrationWarning>
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-[#FF6B35] group-hover:gap-2 transition-all">
                        View Details
                        <ChevronRightIcon />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ============ Sidebar: Quick Stats & Recent Activity ============ */}
          <section className="space-y-6">
            {/* Quick Balance Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <WalletIcon />
                Balance Summary
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-medium">Incoming</span>
                    <span className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.youAreOwed)}</span>
                  </div>
                  <p className="text-sm text-emerald-600 mt-1">Money owed to you</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-medium">Outgoing</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(stats.youOwe)}</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">Money you owe</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Net Balance</span>
                    <span className={`text-2xl font-bold ${stats.youAreOwed - stats.youOwe > 0 ? 'text-emerald-600' :
                      stats.youAreOwed - stats.youOwe < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {stats.youAreOwed - stats.youOwe > 0 ? '+' : ''}{formatCurrency(stats.youAreOwed - stats.youOwe)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.youAreOwed - stats.youOwe > 0 ? 'You\'re in the green!' :
                      stats.youAreOwed - stats.youOwe < 0 ? 'You have pending payments' : 'All settled up!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Incoming Money List (New Section) */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Incoming Money
              </h3>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                  <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                </div>
              ) : incomingActivity.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 text-sm">No incoming transactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingActivity.map((activity) => (
                    <div key={activity.id} className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.groupName}</p>
                      </div>
                      <span className="text-emerald-600 font-bold">
                        +{formatCurrency(activity.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClockIcon />
                Recent Activity
              </h3>
              {loading ? (
                <div className="space-y-3">
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <ClockIcon />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                  <p className="text-gray-400 text-xs mt-1">Add expenses to see activity here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${activity.isYou ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                          <svg className={`w-4 h-4 ${activity.isYou ? 'text-emerald-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.groupName}</p>
                          <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>{formatRelativeTime(activity.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${activity.isYou ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {formatCurrency(activity.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.isYou ? 'You paid' : 'Added'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Group CTA */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Start a new group</h3>
                <p className="text-white/80 text-sm mb-4">
                  Split expenses with friends, roommates, or on your next trip!
                </p>
                <button
                  onClick={() => router.push('/groups/create')}
                  className="w-full py-3 bg-white text-[#FF6B35] rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon />
                  Create New Group
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete Group?
            </h2>

            <p className="text-gray-600 text-center mb-8">
              This will permanently delete "<strong>{groupToDelete.name}</strong>" and all its expenses.
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setGroupToDelete(null)}
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

      {/* ============ Footer ============ */}
      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Expense Splitter</span>
            </div>
            <p className="text-sm text-gray-400">
              © {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}