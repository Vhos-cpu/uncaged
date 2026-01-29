// api/create-payment.js
// Vercel Serverless Function for processing payments with 85/15 split

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

    const { 
        amount,           // Amount in cents (e.g., 999 for $9.99)
        creatorStripeId,  // Creator's Stripe Connect account ID
        creatorId,        // Firebase user ID of creator
        subscriberId,     // Firebase user ID of subscriber
        type,             // 'subscription', 'tip', or 'ppv'
        description       // Payment description
    } = req.body;

    if (!amount || !creatorStripeId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Calculate the split
        // Creator gets 85%, Platform keeps 15%
        const creatorAmount = Math.floor(amount * 0.85);
        
        // Create a PaymentIntent with automatic transfer to creator
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            // This sends 85% directly to the creator's connected account
            transfer_data: {
                destination: creatorStripeId,
                amount: creatorAmount,
            },
            metadata: {
                creatorId: creatorId || 'unknown',
                subscriberId: subscriberId || 'unknown',
                type: type || 'subscription',
                platform: 'uncaged',
                creatorShare: creatorAmount,
                platformShare: amount - creatorAmount
            },
            description: description || `Uncaged ${type || 'payment'}`
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            breakdown: {
                total: amount,
                creatorShare: creatorAmount,
                platformShare: amount - creatorAmount,
                creatorPercent: 85,
                platformPercent: 15
            }
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            error: error.message,
            type: error.type
        });
    }
}
