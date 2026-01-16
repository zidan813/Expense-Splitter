'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const fullName = formData.get('fullName') as string;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: 'Not authenticated' };
    }

    // Update Auth Metadata (User Identity)
    const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
    });

    if (updateError) {
        return { error: updateError.message };
    }

    // If we had a separate 'profiles' table we would update it here too
    // For now, assuming auth metadata is the source of truth for name

    revalidatePath('/settings/profile');
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { error: "Passwords don't match" };
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function deleteAccount(formData: FormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Supabase Admin needed to delete user? 
    // Usually client library cannot delete own user unless enabled in settings.
    // For safety, we might just mark as deleted or use an RPC if enabled.
    // Standard Supabase pattern: use RPC 'delete_own_account' or call Edge Function with Service Role.
    // Here we will try generic method, if it fails we might need an RPC.

    // Actually, allowing users to delete themselves directly via the API is a setting in Supabase Auth > User Settings.
    // If not enabled, this might fail.

    // Let's assume we need an RPC for this to be safe and clean up data.
    // But for now, we'll return a "Contact Support" if direct delete isn't allowed,
    // Or we will try to delete via an RPC that uses `security definer`.

    // We'll create a simple RPC for this later if needed, 
    // but typically specialized RPCs are better for cascade deletes.

    // For this implementation, we will assume we can't easily auto-delete without logic.
    // Let's try calling an RPC we'll call 'request_account_deletion' (placeholder)
    // OR just return a message saying "This feature requires Admin setup".

    // NOTE: In a real app, this should be a soft delete or an admin API call.
    return { error: "Please contact support to delete your account (Safety Halt)." };
}
