'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

interface IncomeFormState {
    source: string;
    amount: string;
    receivedBy: string; // Stores email string
}

interface FormErrors {
    source: string | null;
    amount: string | null;
    receivedBy: string | null;
}

// ============ Icons ============
const ArrowLeftIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const WalletIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ============ Skeleton Loader ============
const FormSkeleton = () => (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-gray-200 rounded-3xl" />
            </div>
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-24 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
        </div>
    </div>
);

export default function AddIncomePage() {
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
    const [formData, setFormData] = useState<IncomeFormState>({
        source: '',
        amount: '',
        receivedBy: '',
    });
    const [errors, setErrors] = useState<FormErrors>({
        source: null,
        amount: null,
        receivedBy: null,
    });
    const [touched, setTouched] = useState({
        source: false,
        amount: false,
        receivedBy: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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
                    const { data: groupData, error: groupErr } = await supabase
                        .from('groups')
                        .select('id, name')
                        .eq('id', groupId)
                        .single();

                    if (groupErr) throw groupErr;
                    setGroup(groupData);

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

                    // Default: receivedBy empty (as per request for Expenses)

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

    // Validation
    const validate = useCallback(() => {
        const newErrors: FormErrors = { source: null, amount: null, receivedBy: null };
        let isValid = true;

        if (!formData.source.trim()) {
            newErrors.source = 'Source description is required';
            isValid = false;
        }

        const amt = parseFloat(formData.amount.replace(/,/g, ''));
        if (!formData.amount || isNaN(amt) || amt <= 0) {
            newErrors.amount = 'Please enter a valid amount';
            isValid = false;
        }

        if (!formData.receivedBy) {
            newErrors.receivedBy = 'Please enter who received';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // Handlers
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (members.length === 0) {
            setError('No members to split income with.');
            return;
        }

        setIsSubmitting(true);
        try {
            const amountFloat = parseFloat(formData.amount.replace(/,/g, ''));

            // Determine Receiver logic
            let finalReceivedById = user?.id;
            // Ensure safe description
            let finalDescription = (formData.source || 'Income').trim();
            const splitAmt = (amountFloat * -1) / members.length; // Negative amount split

            const receiverMember = members.find(m => m.email && formData.receivedBy && m.email.toLowerCase() === formData.receivedBy.toLowerCase());

            if (receiverMember) {
                finalReceivedById = receiverMember.user_id;
            } else {
                finalDescription = `${finalDescription} (Received by ${formData.receivedBy})`;
            }

            // Prepare splits
            const splits = members.map(m => ({
                user_id: m.user_id,
                amount: splitAmt
            }));

            // Use atomic RPC (negative amounts = Income)
            const { error: rpcError } = await supabase.rpc(
                'add_expense_with_splits',
                {
                    p_group_id: groupId,
                    p_description: finalDescription,
                    p_amount: amountFloat * -1,
                    p_paid_by: finalReceivedById,
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
            setError('Failed to save income. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof IncomeFormState, value: string) => {
        let nextValue = value;

        if (field === 'amount') {
            // Remove everything that is not digit or dot
            const raw = value.replace(/[^0-9.]/g, '');
            // Split into integer and decimal parts
            const parts = raw.split('.');
            // Format integer part with commas
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            // Reassemble (limit to one decimal point)
            nextValue = parts.slice(0, 2).join('.');
        }

        setFormData(prev => ({ ...prev, [field]: nextValue }));

        if (touched[field]) {
            if (field === 'amount') {
                const numericVal = parseFloat(nextValue.replace(/,/g, ''));
                if (nextValue && !isNaN(numericVal)) setErrors(prev => ({ ...prev, amount: null }));
            }
            if (field === 'source' && value.length >= 3) setErrors(prev => ({ ...prev, source: null }));
            if (field === 'receivedBy' && value) setErrors(prev => ({ ...prev, receivedBy: null }));
        }
    };

    const handleBlur = (field: keyof IncomeFormState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate();
    };

    if (loading || authLoading) return <FormSkeleton />;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Add Income</h1>
                            <p className="text-sm text-gray-500">{group?.name || 'Loading...'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-8">

                    <div className="flex justify-center -mt-2">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-200 transform transition-transform hover:scale-105 duration-300">
                            <WalletIcon className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label htmlFor="source" className="block text-sm font-semibold text-gray-600 ml-1">
                                Source
                            </label>
                            <input
                                id="source"
                                type="text"
                                value={formData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                                onBlur={() => handleBlur('source')}
                                placeholder="e.g., Salary, Refund"
                                className={`w-full px-4 py-3 text-base text-[#1F2937] bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-400
                  ${errors.source
                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                        : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-green-50'
                                    }`}
                            />
                            {errors.source && touched.source && (
                                <div className="flex items-center gap-1 text-red-500 text-sm ml-1 animate-fadeIn">
                                    <AlertIcon />
                                    <span>{errors.source}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="amount" className="block text-sm font-semibold text-gray-600 ml-1">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400 select-none">
                                    $
                                </span>
                                <input
                                    id="amount"
                                    type="text"
                                    inputMode="decimal"
                                    ref={amountInputRef}
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    onBlur={() => handleBlur('amount')}
                                    placeholder="0.00"
                                    className={`w-full pl-12 pr-4 py-6 text-5xl font-bold text-[#1F2937] bg-white border-2 rounded-xl text-center focus:outline-none transition-all placeholder:text-gray-200
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono
                    ${errors.amount
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                            : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-green-50'
                                        }`}
                                />
                            </div>
                            {errors.amount && touched.amount && (
                                <div className="flex items-center gap-1 text-red-500 text-sm ml-1 justify-center">
                                    <AlertIcon />
                                    <span>{errors.amount}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="receivedBy" className="block text-sm font-semibold text-gray-600 ml-1">
                                Received By
                            </label>
                            <div className="relative">
                                <input
                                    id="receivedBy"
                                    list="members-list"
                                    type="text"
                                    value={formData.receivedBy}
                                    onChange={(e) => handleChange('receivedBy', e.target.value)}
                                    onBlur={() => handleBlur('receivedBy')}
                                    placeholder="Enter name"
                                    className={`w-full px-4 py-3 text-base text-[#1F2937] bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-400
                    ${errors.receivedBy
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                            : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-green-50'
                                        }`}
                                />

                                <datalist id="members-list">
                                    {members.map(member => (
                                        <option key={member.id} value={member.email} />
                                    ))}
                                </datalist>

                                {errors.receivedBy && touched.receivedBy && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm ml-1 mt-1 animate-fadeIn">
                                        <AlertIcon />
                                        <span>{errors.receivedBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <AlertIcon />
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || submitSuccess}
                                className={`flex-1 px-6 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all duration-300 transform
                  ${isSubmitting || submitSuccess
                                        ? 'bg-gray-400 cursor-not-allowed scale-100'
                                        : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:scale-[1.02] hover:shadow-green-200'
                                    }
                  focus:outline-none focus:ring-4 focus:ring-green-100 flex items-center justify-center gap-2
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
                                    <span>Add Income</span>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
