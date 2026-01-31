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
        const { creatorId, creatorStripeId, amount, userId, userEmail, creatorName, successUrl, cancelUrl } = req.body;

        if (!creatorStripeId || !amount || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount < 1) {
            return res.status(400).json({ error: 'Minimum tip amount is $1' });
        }

        // Create Stripe Checkout Session for one-time payment
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Tip for ${creatorName || 'Creator'}`,
                            description: `One-time tip`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: Math.round(amount * 100 * 0.15), // Platform takes 15%
                transfer_data: {
                    destination: creatorStripeId, // Creator's connected account
                },
            },
            metadata: {
                creatorId: creatorId,
                tipperId: userId,
                tipAmount: amount.toString(),
                type: 'tip'
            },
            success_url: successUrl || 'https://uncaged-two.vercel.app/tip-success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl || 'https://uncaged-two.vercel.app/subscribe.html',
        });

        return res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe Tip Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to create tip session'
        });
    }
}
