import fs from 'fs';

if (!process.env.VERCEL_TOKEN) {
    console.error('Error: VERCEL_TOKEN environment variable is missing.');
    process.exit(1);
}
const TOKEN = process.env.VERCEL_TOKEN;
const API_BASE = 'https://api.vercel.com';

async function main() {
    try {
        console.log('🔍 Fetching latest deployment...');

        // 1. Get Deployments
        const res = await fetch(`${API_BASE}/v6/deployments?limit=1&target=production`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API Error: ${res.status} ${res.statusText} - ${text}`);
        }

        const data = await res.json();
        const deploy = data.deployments[0];

        if (!deploy) {
            console.log('❌ No deployments found.');
            return;
        }

        console.log(`✅ Latest Deployment: ${deploy.uid}`);
        console.log(`   URL: https://${deploy.url}`);
        console.log(`   State: ${deploy.state}`);
        console.log(`   Created: ${new Date(deploy.created).toLocaleString()}`);
        console.log(`   Project: ${deploy.name}`);

        // 2. Check Build Output / File Structure if possible matches
        // We can't easily see the output file structure via public API without more complex calls,
        // but we can check if there are build error logs that weren't obvious.

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

main();
