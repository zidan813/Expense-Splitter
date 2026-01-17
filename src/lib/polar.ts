import { Polar } from '@polar-sh/sdk';

if (!process.env.POLAR_ACCESS_TOKEN) {
    console.warn('POLAR_ACCESS_TOKEN is missing from environment variables');
}

export const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
    server: process.env.POLAR_ENVIRONMENT === 'sandbox' || process.env.NODE_ENV === 'development' ? 'sandbox' : 'production',
});
