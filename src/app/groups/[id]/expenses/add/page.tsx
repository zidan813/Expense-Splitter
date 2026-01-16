'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { canAddExpense, LimitCheck } from '@/actions/usage';
import { UpgradeModal } from '@/components/UpgradeModal';

// ============ TypeScript Types ============
interface Group {
    id: string;
    name: string;
}

interface Member {
    id: string;
    user_id: string;
    email: string;
}

interface ExpenseFormState {
    description: string;
    amount: string;
    paidBy: string;
}

interface FormErrors {
    description: string | null;
    amount: string | null;
    paidBy: string | null;
}

// ============ Icons ============
const ArrowLeftIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ReceiptIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
);

const UserGroupIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AlertIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// ============ Skeleton Loader ============
const FormSkeleton = () => (
    <div className="min-h-screen bg-[#F8F9FA]">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
                <div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 animate-pulse">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl sm:rounded-3xl" />
                </div>
                <div className="space-y-4 sm:space-y-6">
                    <div className="h-12 bg-gray-200 rounded-xl" />
                    <div className="h-20 sm:h-24 bg-gray-200 rounded-xl" />
                    <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="h-12 sm:h-14 bg-gray-200 rounded-xl flex-1" />
                    <div className="h-12 sm:h-14 bg-gray-200 rounded-xl flex-1" />
                </div>
            </div>
        </div>
    </div>
);

export default function AddExpensePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;
    const amountInputRef = useRef<HTMLInputElement>(null);

    // Data Loading State
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<ExpenseFormState>({
        description: '',
        amount: '',
        paidBy: '',
    });
    const [errors, setErrors] = useState<FormErrors>({
        description: null,
        amount: null,
        paidBy: null,
    });
    const [touched, setTouched] = useState({
        description: false,
        amount: false,
        paidBy: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitInfo, setLimitInfo] = useState<LimitCheck | null>(null);

    // Auth Redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // Data Fetching
    useEffect(() => {
        if (user && groupId) {
            const fetchData = async () => {
                try {
                    // Fetch Group
                    const { data: groupData, error: groupErr } = await supabase
                        .from('groups')
                        .select('id, name')
                        .eq('id', groupId)
                        .single();

                    if (groupErr) throw groupErr;
                    setGroup(groupData);

                    // Fetch Members
                    const { data: membersData, error: membersErr } = await supabase
                        .from('group_members')
                        .select('id, user_id')
                        .eq('group_id', groupId);

                    if (membersErr) throw membersErr;

                    // Mock Emails & Parse Manual Guest Names
                    const enrichedMembers = membersData.map(m => {
                        let displayName = `User ${m.user_id.slice(0, 4)}...`;

                        if (m.user_id === user.id) {
                            displayName = user.email!;
                        } else if (m.user_id.startsWith('manual_')) {
                            const parts = m.user_id.split('_');
                            if (parts.length >= 3) {
                                displayName = parts.slice(1, -1).join(' ').replace(/_/g, ' ');
                            } else {
                                displayName = 'Guest Member';
                            }
                        }

                        return {
                            ...m,
                            email: displayName
                        };
                    });

                    setMembers(enrichedMembers);

                } catch (err) {
                    console.error(err);
                    setError('Failed to load group details.');
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [user, groupId]);

    // Real-time Split Calculation
    const splitAmount = useMemo(() => {
        const amt = parseFloat(formData.amount);
        if (!amt || isNaN(amt) || members.length === 0) return 0;
        return amt / members.length;
    }, [formData.amount, members.length]);

    const formattedSplit = useMemo(() => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(splitAmount);
    }, [splitAmount]);

    // Validation
    const validate = useCallback(() => {
        const newErrors: FormErrors = { description: null, amount: null, paidBy: null };
        let isValid = true;

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        } else if (formData.description.length < 3) {
            newErrors.description = 'Minimum 3 characters required';
            isValid = false;
        }

        const amt = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amt) || amt <= 0) {
            newErrors.amount = 'Please enter a valid amount';
            isValid = false;
        } else if (amt > 999999) {
            newErrors.amount = 'Amount is too high';
            isValid = false;
        }

        if (!formData.paidBy) {
            newErrors.paidBy = 'Please enter who paid';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // Handlers
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // Check expense limit before submitting
        const limitCheck = await canAddExpense();
        if (!limitCheck.allowed) {
            setLimitInfo(limitCheck);
            setShowUpgradeModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const amountFloat = parseFloat(formData.amount);

            // Determine Payer logic
            let finalPaidById = user?.id;
            let finalDescription = formData.description.trim();

            const payerMember = members.find(m => m.email.toLowerCase() === formData.paidBy.toLowerCase());

            if (payerMember) {
                finalPaidById = payerMember.user_id;
            } else {
                finalDescription = `${finalDescription} (Paid by ${formData.paidBy})`;
            }

            // Prepare splits
            // We need to use "manual_" prefix handling or rely on member IDs. 
            // In the enrichedMembers, we have user_id. 
            // The table stores 'user_id' as TEXT now (or we confirmed it is TEXT).
            const splits = members.map(m => ({
                user_id: m.user_id,
                amount: splitAmount
            }));

            // Use atomic RPC
            const { error: rpcError } = await supabase.rpc(
                'add_expense_with_splits',
                {
                    p_group_id: groupId,
                    p_description: finalDescription,
                    p_amount: amountFloat,
                    p_paid_by: finalPaidById,
                    p_splits: splits
                }
            );

            if (rpcError) throw rpcError;

            setSubmitSuccess(true);
            setTimeout(() => {
                router.push(`/groups/${groupId}`);
            }, 1000);

        } catch (err) {
            console.error(err);
            setError('Failed to save expense. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof ExpenseFormState, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            if (field === 'amount' && value && !isNaN(parseFloat(value))) {
                setErrors(prev => ({ ...prev, amount: null }));
            }
            if (field === 'description' && value.length >= 3) {
                setErrors(prev => ({ ...prev, description: null }));
            }
            if (field === 'paidBy') {
                const exists = members.some(m => m.email.toLowerCase() === value.toLowerCase());
                if (exists) setErrors(prev => ({ ...prev, paidBy: null }));
            }
        }
    };

    const handleBlur = (field: keyof ExpenseFormState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate();
    };

    if (loading || authLoading) return <FormSkeleton />;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1F2937]">Add Expense</h1>
                            <p className="text-xs sm:text-sm text-gray-500">{group?.name || 'Loading...'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 lg:py-8">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8">

                    {/* Icon Badge */}
                    <div className="flex justify-center -mt-1 sm:-mt-2">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-orange-200 transform transition-transform hover:scale-105 duration-300">
                            <ReceiptIcon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">

                        {/* Description Input */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-600 ml-1">
                                Description
                            </label>
                            <input
                                id="description"
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                onBlur={() => handleBlur('description')}
                                placeholder="e.g., Dinner at Italian Place"
                                className={`w-full px-4 py-3 text-base text-[#1F2937] bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-400
                  ${errors.description
                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                        : 'border-gray-200 focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50'
                                    }`}
                            />
                            {errors.description && touched.description && (
                                <div className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm ml-1 animate-fadeIn">
                                    <AlertIcon />
                                    <span>{errors.description}</span>
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="amount" className="block text-sm font-semibold text-gray-600 ml-1">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-400 select-none">
                                    $
                                </span>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    ref={amountInputRef}
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    onBlur={() => handleBlur('amount')}
                                    placeholder="0.00"
                                    className={`w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-5 lg:py-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] bg-white border-2 rounded-xl text-center focus:outline-none transition-all placeholder:text-gray-200
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono
                    ${errors.amount
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                            : 'border-gray-200 focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50'
                                        }`}
                                />
                            </div>

                            {/* Split Preview */}
                            {splitAmount > 0 && (
                                <div className="flex items-center justify-center gap-2 mt-2 py-2 px-3 sm:px-4 bg-gray-50 rounded-lg border border-gray-100 mx-auto w-fit">
                                    <UserGroupIcon className="text-[#FF6B35] w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-base sm:text-lg font-bold text-[#1F2937]">
                                        {formattedSplit}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-500">/ person</span>
                                </div>
                            )}

                            {errors.amount && touched.amount && (
                                <div className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm ml-1 justify-center">
                                    <AlertIcon />
                                    <span>{errors.amount}</span>
                                </div>
                            )}
                        </div>

                        {/* Paid By Input */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="paidBy" className="block text-sm font-semibold text-gray-600 ml-1">
                                Paid By
                            </label>
                            <div className="relative">
                                <input
                                    id="paidBy"
                                    list="members-list"
                                    type="text"
                                    value={formData.paidBy}
                                    onChange={(e) => handleChange('paidBy', e.target.value)}
                                    onBlur={() => handleBlur('paidBy')}
                                    placeholder="Enter name"
                                    className={`w-full px-4 py-3 text-base text-[#1F2937] bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-400
                    ${errors.paidBy
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                            : 'border-gray-200 focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50'
                                        }`}
                                />

                                {/* Datalist for autocomplete */}
                                <datalist id="members-list">
                                    {members.map(member => (
                                        <option key={member.id} value={member.email} />
                                    ))}
                                </datalist>

                                {errors.paidBy && touched.paidBy && (
                                    <div className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm ml-1 mt-1 animate-fadeIn">
                                        <AlertIcon />
                                        <span>{errors.paidBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 sm:gap-3">
                                <AlertIcon />
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="order-2 sm:order-1 flex-1 px-5 sm:px-6 py-3 sm:py-3.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 min-h-[48px]"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || submitSuccess}
                                className={`order-1 sm:order-2 flex-1 px-5 sm:px-6 py-3 sm:py-3.5 text-white rounded-xl font-bold shadow-lg transition-all duration-300 transform min-h-[48px]
                  ${isSubmitting || submitSuccess
                                        ? 'bg-gray-400 cursor-not-allowed scale-100'
                                        : 'bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] hover:from-[#e55f2f] hover:to-[#e57d49] hover:scale-[1.02] hover:shadow-orange-200'
                                    }
                  focus:outline-none focus:ring-4 focus:ring-orange-100 flex items-center justify-center gap-2
                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Adding...</span>
                                    </>
                                ) : submitSuccess ? (
                                    <>
                                        <CheckIcon />
                                        <span>Success!</span>
                                    </>
                                ) : (
                                    <span>Add Expense</span>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-400 pt-1 sm:pt-2">
                            Expense will be split equally among {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>

                    </form>
                </div>
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason={limitInfo?.reason}
                currentUsage={limitInfo?.currentUsage}
                limit={limitInfo?.limit}
                limitType="expenses"
            />
        </div>
    );
}
