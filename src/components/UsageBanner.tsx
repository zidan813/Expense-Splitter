'use client';

import { useRouter } from 'next/navigation';
import { useUsage } from '@/hooks/useUsage';
import { Zap, AlertTriangle } from 'lucide-react';

export function UsageBanner() {
    const router = useRouter();
    const {
        usage,
        loading,
        isFree,
        isAtGroupLimit,
        isAtExpenseLimit,
        groupsRemaining,
        expensesRemaining
    } = useUsage();

    if (loading || !usage || !isFree) return null;

    const isNearLimit = groupsRemaining <= 1 || expensesRemaining <= 10;
    const isAtLimit = isAtGroupLimit || isAtExpenseLimit;

    if (!isNearLimit && !isAtLimit) return null;

    return (
        <div
            className={`rounded-xl p-4 mb-6 border ${isAtLimit
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                    {isAtLimit ? (
                        <AlertTriangle className={`w-5 h-5 ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`} />
                    ) : (
                        <Zap className="w-5 h-5 text-amber-600" />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className={`font-semibold ${isAtLimit ? 'text-red-900' : 'text-amber-900'
                        }`}>
                        {isAtLimit ? 'Limit Reached' : 'Approaching Limit'}
                    </h3>
                    <p className={`text-sm mt-1 ${isAtLimit ? 'text-red-700' : 'text-amber-700'
                        }`}>
                        {isAtGroupLimit && (
                            <>You've used all {usage.maxGroups} groups on the free plan. </>
                        )}
                        {isAtExpenseLimit && (
                            <>You've used all {usage.maxExpensesPerMonth} expenses this month. </>
                        )}
                        {!isAtLimit && groupsRemaining <= 1 && (
                            <>Only {groupsRemaining} group{groupsRemaining === 1 ? '' : 's'} remaining. </>
                        )}
                        {!isAtLimit && expensesRemaining <= 10 && (
                            <>{expensesRemaining} expense{expensesRemaining === 1 ? '' : 's'} left this month. </>
                        )}
                        Upgrade to Pro for unlimited access.
                    </p>
                </div>

                <button
                    onClick={() => router.push('/#pricing')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isAtLimit
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                >
                    Upgrade
                </button>
            </div>

            {/* Progress bars */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Groups</span>
                        <span className="text-gray-900 font-medium">
                            {usage.currentGroups}/{usage.maxGroups === -1 ? '∞' : usage.maxGroups}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isAtGroupLimit ? 'bg-red-500' :
                                    groupsRemaining <= 1 ? 'bg-amber-500' : 'bg-purple-500'
                                }`}
                            style={{
                                width: `${Math.min(100, (usage.currentGroups / usage.maxGroups) * 100)}%`
                            }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Expenses (monthly)</span>
                        <span className="text-gray-900 font-medium">
                            {usage.monthlyExpenses}/{usage.maxExpensesPerMonth === -1 ? '∞' : usage.maxExpensesPerMonth}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isAtExpenseLimit ? 'bg-red-500' :
                                    expensesRemaining <= 10 ? 'bg-amber-500' : 'bg-purple-500'
                                }`}
                            style={{
                                width: `${Math.min(100, (usage.monthlyExpenses / usage.maxExpensesPerMonth) * 100)}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
