'use client';

import { supabase } from '@/lib/supabase';

export interface UsageData {
    currentGroups: number;
    monthlyExpenses: number;
    plan: 'free' | 'pro' | 'business';
    maxGroups: number;
    maxExpensesPerMonth: number;
    maxMembersPerGroup: number;
    historyDays: number;
    features: {
        receipt_scanning: boolean;
        export: boolean;
        custom_categories: boolean;
        api_access?: boolean;
        sso?: boolean;
    };
}

export interface LimitCheck {
    allowed: boolean;
    reason?: string;
    currentUsage?: number;
    limit?: number;
    upgradeRequired?: boolean;
}

const DEFAULT_FREE_LIMITS: UsageData = {
    currentGroups: 0,
    monthlyExpenses: 0,
    plan: 'free',
    maxGroups: 3,
    maxExpensesPerMonth: 50,
    maxMembersPerGroup: 5,
    historyDays: 30,
    features: {
        receipt_scanning: false,
        export: false,
        custom_categories: false,
    }
};

export async function getUserUsage(): Promise<UsageData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_FREE_LIMITS;

    // 1. Get Plan Limits
    const { data: planData, error: planError } = await supabase
        .rpc('get_user_plan_limits', { p_user_id: user.id });

    if (planError) {
        console.error('Error fetching plan limits:', planError);
        return DEFAULT_FREE_LIMITS;
    }

    // 2. Get Current Usage
    const { data: usageData, error: usageError } = await supabase
        .from('user_usage_cache')
        .select('current_groups_count, current_month_expenses')
        .eq('user_id', user.id)
        .single();

    if (usageError && usageError.code !== 'PGRST116') { // Ignore not found, treat as 0
        console.error('Error fetching usage cache:', usageError);
    }

    const limits = planData?.limits || {};
    const features = {
        receipt_scanning: limits.can_scan_receipts || false,
        export: limits.can_export || false,
        custom_categories: false, // Not yet in DB
        api_access: false,
        sso: false,
    };

    return {
        currentGroups: usageData?.current_groups_count || 0,
        monthlyExpenses: usageData?.current_month_expenses || 0,
        plan: planData?.plan || 'free',
        maxGroups: limits.max_groups ?? 3,
        maxExpensesPerMonth: limits.max_expenses_per_month ?? 50,
        maxMembersPerGroup: limits.max_members_per_group ?? 5,
        historyDays: 30, // Default for now
        features: features,
    };
}

export async function canCreateGroup(): Promise<LimitCheck> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { allowed: false, reason: 'Not authenticated' };
    }

    const { data: allowed, error } = await supabase
        .rpc('check_limit', { p_user_id: user.id, p_metric_key: 'groups' });

    if (error) {
        console.error('Error checking group limit:', error);
        return { allowed: true }; // Fail open
    }

    if (!allowed) {
        const usage = await getUserUsage();
        return {
            allowed: false,
            reason: `You've reached the maximum of ${usage?.maxGroups} groups on the free plan.`,
            currentUsage: usage?.currentGroups,
            limit: usage?.maxGroups,
            upgradeRequired: true,
        };
    }

    return { allowed: true };
}

export async function canAddExpense(): Promise<LimitCheck> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { allowed: false, reason: 'Not authenticated' };
    }

    const { data: allowed, error } = await supabase
        .rpc('check_limit', { p_user_id: user.id, p_metric_key: 'monthly_expenses' });

    if (error) {
        console.error('Error checking expense limit:', error);
        return { allowed: true }; // Fail open
    }

    if (!allowed) {
        const usage = await getUserUsage();
        return {
            allowed: false,
            reason: `You've reached the limit of ${usage?.maxExpensesPerMonth} expenses this month.`,
            currentUsage: usage?.monthlyExpenses,
            limit: usage?.maxExpensesPerMonth,
            upgradeRequired: true,
        };
    }

    return { allowed: true };
}

export async function canAddMember(groupId: string): Promise<LimitCheck> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { allowed: false, reason: 'Not authenticated' };
    }

    // 1. Get Plan Limits
    const usage = await getUserUsage();
    const limit = usage.maxMembersPerGroup;

    if (limit === -1) return { allowed: true };

    // 2. Get Current Group Count
    const { count, error } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

    if (error) {
        console.error('Error checking group members:', error);
        return { allowed: true };
    }

    if ((count || 0) >= limit) {
        return {
            allowed: false,
            reason: `This group has reached the limit of ${limit} members.`,
            limit: limit,
            upgradeRequired: true,
        };
    }

    return { allowed: true };
}

export async function getUserPlan(): Promise<'free' | 'pro' | 'business'> {
    const usage = await getUserUsage();
    return usage?.plan || 'free';
}
