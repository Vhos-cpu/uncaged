// api/stripe-webhook.js
// Vercel Serverless Function for handling Stripe webhooks

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Firebase Admin SDK (you'll need to set this up)
// const admin = require('firebase-admin');
// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
//     });
// }
// const db = admin.firestore();

export const config = {
    api: {
        bodyParser: false, // Stripe needs the raw body
    },
};

async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
        case 'account.updated':
            // Creator's Stripe account was updated
            const account = event.data.object;
            console.log('Account updated:', account.id);
            
            // Check if onboarding is complete
            if (account.details_submitted && account.charges_enabled) {
                console.log('Creator onboarding complete:', account.id);
                
                // Update Firebase with connected status
                // const userId = account.metadata?.firebaseUserId;
                // if (userId) {
                //     await db.collection('users').doc(userId).update({
                //         stripeConnectId: account.id,
                //         stripeOnboardingComplete: true,
                //         stripeChargesEnabled: true,
                //         updatedAt: admin.firestore.FieldValue.serverTimestamp()
                //     });
                // }
            }
            break;

        case 'payment_intent.succeeded':
            // Payment was successful
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            
            // Record the transaction in Firebase
            // const { creatorId, subscriberId, type, creatorShare, platformShare } = paymentIntent.metadata;
            // await db.collection('transactions').add({
            //     stripePaymentId: paymentIntent.id,
            //     creatorId,
            //     subscriberId,
            //     type,
            //     totalAmount: paymentIntent.amount,
            //     creatorShare: parseInt(creatorShare),
            //     platformShare: parseInt(platformShare),
            //     currency: paymentIntent.currency,
            //     status: 'completed',
            //     createdAt: admin.firestore.FieldValue.serverTimestamp()
            // });
            break;

        case 'payment_intent.payment_failed':
            // Payment failed
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;

        case 'transfer.created':
            // Money was transferred to creator
            const transfer = event.data.object;
            console.log('Transfer created:', transfer.id, 'Amount:', transfer.amount);
            break;

        case 'payout.paid':
            // Payout was sent to creator's bank
            const payout = event.data.object;
            console.log('Payout completed:', payout.id);
            break;

        case 'customer.subscription.created':
            // New subscription created
            const subscription = event.data.object;
            console.log('Subscription created:', subscription.id);
            break;

        case 'customer.subscription.deleted':
            // Subscription cancelled
            const cancelledSub = event.data.object;
            console.log('Subscription cancelled:', cancelledSub.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
}
