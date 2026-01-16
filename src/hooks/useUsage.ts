'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserUsage, UsageData } from '@/actions/usage';

export function useUsage() {
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUserUsage();
            setUsage(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch usage data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const refreshUsage = () => {
        fetchUsage();
    };

    const isAtGroupLimit = usage ?
        (usage.maxGroups !== -1 && usage.currentGroups >= usage.maxGroups) : false;

    const isAtExpenseLimit = usage ?
        (usage.maxExpensesPerMonth !== -1 && usage.monthlyExpenses >= usage.maxExpensesPerMonth) : false;

    const groupsRemaining = usage ?
        (usage.maxGroups === -1 ? Infinity : usage.maxGroups - usage.currentGroups) : 0;

    const expensesRemaining = usage ?
        (usage.maxExpensesPerMonth === -1 ? Infinity : usage.maxExpensesPerMonth - usage.monthlyExpenses) : 0;

    const isPro = usage?.plan === 'pro';
    const isBusiness = usage?.plan === 'business';
    const isFree = usage?.plan === 'free' || !usage?.plan;

    return {
        usage,
        loading,
        error,
        refreshUsage,
        isAtGroupLimit,
        isAtExpenseLimit,
        groupsRemaining,
        expensesRemaining,
        isPro,
        isBusiness,
        isFree,
    };
}
