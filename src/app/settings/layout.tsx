'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, BarChart3, Shield, AlertTriangle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    {
        title: 'Account Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Plan & Billing',
        href: '/settings/billing',
        icon: CreditCard,
    },
    {
        title: 'Usage & Limits',
        href: '/settings/usage',
        icon: BarChart3,
    },
    {
        title: 'Security',
        href: '/settings/security',
        icon: Shield,
    },
    {
        title: 'Danger Zone',
        href: '/settings/danger',
        icon: AlertTriangle,
        variant: 'destructive',
    },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header matching Dashboard */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <Button variant="ghost" size="icon" className="hover:bg-orange-50 hover:text-orange-600">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Settings</h1>
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
                    <aside className="lg:w-1/4 lg:sticky lg:top-24 self-start">
                        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-4 lg:pb-0">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                            isActive
                                                ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                                                : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm",
                                            item.variant === 'destructive' && isActive && "bg-red-50 text-red-600 border-red-100",
                                            item.variant === 'destructive' && !isActive && "text-red-500 hover:bg-red-50 hover:text-red-600"
                                        )}
                                    >
                                        <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-orange-500" : "text-gray-400", item.variant === 'destructive' && "text-red-500")} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                    <div className="flex-1 lg:max-w-3xl">
                        <div className="rounded-2xl border border-gray-100 bg-white text-card-foreground shadow-sm p-6 sm:p-8 min-h-[400px]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
