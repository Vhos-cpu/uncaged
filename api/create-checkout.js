const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // CORS headers
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
        const { creatorId, creatorStripeId, planName, planPrice, userId, userEmail, successUrl, cancelUrl } = req.body;

        if (!creatorStripeId || !planPrice || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${planName} Subscription`,
                            description: `Monthly subscription to creator`,
                        },
                        unit_amount: Math.round(planPrice * 100), // Convert to cents
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_percent: 15, // Platform takes 15%, creator gets 85%
                transfer_data: {
                    destination: creatorStripeId, // Creator's connected account
                },
            },
            metadata: {
                creatorId: creatorId,
                subscriberId: userId,
                planName: planName,
            },
            success_url: successUrl || 'https://uncaged-two.vercel.app/subscribe-success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl || 'https://uncaged-two.vercel.app/subscribe.html',
        });

        return res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to create checkout session'
        });
    }
}
