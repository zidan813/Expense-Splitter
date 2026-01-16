'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Crown, Sparkles } from 'lucide-react';
import { ShimmerButton } from '@/components/ui/shimmer-button';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason?: string;
    currentUsage?: number;
    limit?: number;
    limitType?: 'groups' | 'expenses' | 'members';
}

export function UpgradeModal({
    isOpen,
    onClose,
    reason,
    currentUsage,
    limit,
    limitType = 'groups',
}: UpgradeModalProps) {
    const router = useRouter();

    const limitMessages = {
        groups: {
            title: 'Group Limit Reached',
            description: 'Upgrade to create unlimited groups and manage all your expenses in one place.',
            icon: Crown,
        },
        expenses: {
            title: 'Monthly Expense Limit Reached',
            description: 'Upgrade to add unlimited expenses and never worry about hitting limits again.',
            icon: Zap,
        },
        members: {
            title: 'Member Limit Reached',
            description: 'Upgrade to add more members to your groups and split expenses with everyone.',
            icon: Sparkles,
        },
    };

    const { title, description, icon: Icon } = limitMessages[limitType];

    const handleUpgrade = () => {
        onClose();
        router.push('/#pricing');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mx-4">
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 px-6 py-8 text-white text-center">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon className="w-8 h-8" />
                                </div>

                                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                                {currentUsage !== undefined && limit !== undefined && (
                                    <p className="text-white/80 text-sm">
                                        You've used {currentUsage} of {limit} {limitType}
                                    </p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-600 text-center mb-6">
                                    {reason || description}
                                </p>

                                {/* Benefits */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Unlimited groups & expenses</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Receipt scanning (OCR)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Export to PDF/CSV</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Priority support</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <ShimmerButton
                                        onClick={handleUpgrade}
                                        className="w-full py-3"
                                        background="#000000"
                                        borderRadius="12px"
                                        shimmerColor="#ffffff"
                                    >
                                        Upgrade to Pro
                                    </ShimmerButton>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>

                                {/* Pricing note */}
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Starting at $9.99/month • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
