// api/webhook-subscription.js
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

export const config = {
    api: { bodyParser: false },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.metadata?.type === 'subscription') {
                    await db.collection('subscriptions').add({
                        viewerId: session.metadata.viewerId,
                        creatorId: session.metadata.creatorId,
                        subscriptionId: session.subscription,
                        customerId: session.customer,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const { creatorId, viewerId } = subscription.metadata;
                
                const snapshot = await db.collection('subscriptions')
                    .where('subscriptionId', '==', subscription.id)
                    .limit(1).get();
                
                if (!snapshot.empty) {
                    await snapshot.docs[0].ref.update({
                        status: subscription.status,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        updatedAt: new Date()
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                
                const snapshot = await db.collection('subscriptions')
                    .where('subscriptionId', '==', subscription.id)
                    .limit(1).get();
                
                if (!snapshot.empty) {
                    await snapshot.docs[0].ref.update({
                        status: 'cancelled',
                        updatedAt: new Date()
                    });
                }
                break;
            }
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
