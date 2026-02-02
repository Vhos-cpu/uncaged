// api/create-subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { creatorId, creatorName, viewerId, viewerEmail, priceAmount } = req.body;

        if (!creatorId || !viewerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const price = priceAmount || 999;

        const priceObject = await stripe.prices.create({
            unit_amount: price,
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
                name: `${creatorName || 'Creator'} Subscription`,
                metadata: { creatorId: creatorId }
            },
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: viewerEmail,
            line_items: [{ price: priceObject.id, quantity: 1 }],
            metadata: {
                creatorId: creatorId,
                viewerId: viewerId,
                type: 'subscription'
            },
            subscription_data: {
                metadata: { creatorId: creatorId, viewerId: viewerId }
            },
            success_url: `https://uncaged.one/subscription-success.html?session_id={CHECKOUT_SESSION_ID}&creator=${creatorId}`,
            cancel_url: `https://uncaged.one/creator.html?id=${creatorId}&cancelled=true`,
        });

        return res.status(200).json({ sessionId: session.id, url: session.url });

    } catch (error) {
        console.error('Subscription checkout error:', error);
        return res.status(500).json({ error: error.message });
    }
}
