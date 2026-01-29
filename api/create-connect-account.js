// api/create-connect-account.js
// Vercel Serverless Function for creating Stripe Connect accounts

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, email } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // Create a Stripe Connect Standard account
        const account = await stripe.accounts.create({
            type: 'standard',
            email: email || undefined,
            metadata: {
                firebaseUserId: userId,
                platform: 'uncaged'
            }
        });

        // Create an account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.SITE_URL || 'https://uncaged-two.vercel.app'}/stripe-connect.html?refresh=true`,
            return_url: `${process.env.SITE_URL || 'https://uncaged-two.vercel.app'}/stripe-callback.html?account=${account.id}&user=${userId}`,
            type: 'account_onboarding',
        });

        return res.status(200).json({
            success: true,
            url: accountLink.url,
            accountId: account.id
        });

    } catch (error) {
        console.error('Stripe Connect error:', error);
        return res.status(500).json({
            error: error.message,
            type: error.type
        });
    }
}
