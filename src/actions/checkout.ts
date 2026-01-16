'use server';

import { polar } from '@/lib/polar';
import { PRICING_CONFIG } from '@/config/pricing';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function createCheckoutSession(
    plan: keyof typeof PRICING_CONFIG,
    interval: 'monthly' | 'annually'
) {
    const productId = PRICING_CONFIG[plan][interval];

    if (!productId) {
        console.error(`Missing Product ID for ${plan} ${interval}`);
        // In production, you might want to redirect to an error page or show a toast
        // For now, we'll return an error object that the client can handle
        return { error: 'Product configuration missing. Please contact support.' };
    }

    try {
        const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const result = await polar.checkouts.create({
            products: [productId],
            successUrl: `${origin}/dashboard?checkout=success`,
        });

        if (result.url) {
            redirect(result.url);
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Checkout creation failed:', error);
        return { error: 'Failed to create checkout session. Please try again.' };
    }
}
