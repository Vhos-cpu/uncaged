const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, email, returnUrl } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ error: 'Missing userId or email' });
        }

        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            metadata: {
                firebase_uid: userId
            }
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://uncaged-two.vercel.app/stripe-connect.html?refresh=true',
            return_url: 'https://uncaged-two.vercel.app/stripe-callback.html',
            type: 'account_onboarding',
        });

        return res.status(200).json({
            success: true,
            accountId: account.id,
            onboardingUrl: accountLink.url
        });

    } catch (error) {
        console.error('Stripe Connect Error:', error);
        return res.status(500).json({
            error: error.message,
            type: error.type || 'unknown'
        });
    }
};
