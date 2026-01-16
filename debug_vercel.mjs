import { Vercel } from '@vercel/sdk';

const vercel = new Vercel({
    bearerToken: 'xo2UfUWkJeR3jzpVzWHA1ou9', // Using the token you provided
});

async function main() {
    try {
        console.log('Fetching deployments...');

        // 1. Get the latest deployment
        const deployments = await vercel.deployments.getDeployments({
            limit: 1,
            target: 'production'
        });

        if (!deployments.deployments || deployments.deployments.length === 0) {
            console.log('No deployments found.');
            return;
        }

        const latest = deployments.deployments[0];
        console.log(`Latest Deployment: ${latest.url} (${latest.readyState})`);
        console.log(`Created: ${new Date(latest.createdAt).toLocaleString()}`);
        console.log(`ID: ${latest.uid}`);

        // 2. Check for build errors or runtime errors
        // Note: In newer SDK versions we might need a different call for logs, 
        // but let's first see the deployment details.

        if (latest.readyState === 'ERROR') {
            console.log('Deployment State is ERROR. Checking details...');
        } else {
            console.log('Deployment State is', latest.readyState);
        }

    } catch (error) {
        console.error('Error fetching Vercel data:', error);
    }
}

main();
