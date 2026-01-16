'use client';

import { updateProfile, updatePassword, deleteAccount } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Refs for resetting forms
    const passwordFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        load();
    }, []);

    const handleProfileSubmit = async (formData: FormData) => {
        setUpdatingProfile(true);
        setProfileMessage(null);

        const result = await updateProfile(formData);

        if (result.error) {
            setProfileMessage({ type: 'error', text: result.error });
        } else {
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            setUser(updatedUser);
        }

        setUpdatingProfile(false);
    };

    const handlePasswordUpdate = async (formData: FormData) => {
        const result = await updatePassword(formData);
        if (result.error) {
            alert(result.error);
        } else {
            alert("Password updated successfully!");
            passwordFormRef.current?.reset();
        }
    };

    const handleDeleteAccount = async (formData: FormData) => {
        if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;

        const result = await deleteAccount(formData);
        if (result.error) {
            alert(result.error);
        } else {
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-screen bg-[#FAFAFA]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-[#FAFAFA]">
                <p className="text-muted-foreground mb-4">No user data available. Please sign in.</p>
                <Link href="/auth">
                    <Button>Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 mb-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Profile</CardTitle>
                        <CardDescription>Manage your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section Removed */}

                        <form action={handleProfileSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Email is managed via your identity provider.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    defaultValue={user.user_metadata?.full_name || ''}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>User ID</Label>
                                <code className="relative w-fit rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                    {user.id}
                                </code>
                            </div>

                            {profileMessage && (
                                <div className={`p-3 rounded-lg text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                    {profileMessage.text}
                                </div>
                            )}

                            <Button type="submit" disabled={updatingProfile} className="mt-2">
                                {updatingProfile ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form ref={passwordFormRef} action={handlePasswordUpdate} className="space-y-4 max-w-sm">
                            <div className="space-y-2">
                                <Label htmlFor="current">New Password</Label>
                                <Input id="current" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input id="confirm" name="confirmPassword" type="password" required />
                            </div>
                            <Button type="submit" variant="outline">Update Password</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-semibold text-red-900">Danger Zone</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Permanently delete your account and all data.
                            </p>
                        </div>
                        <form action={handleDeleteAccount}>
                            <Button variant="destructive">Delete Account</Button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
