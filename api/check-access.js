// api/check-access.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { viewerId, creatorId } = req.method === 'GET' ? req.query : req.body;

        if (!viewerId || !creatorId) {
            return res.status(400).json({ hasAccess: false, error: 'Missing viewerId or creatorId' });
        }

        // Creator always has access to their own content
        if (viewerId === creatorId) {
            return res.status(200).json({ hasAccess: true, reason: 'owner' });
        }

        // Check for active subscription
        const subscriptionsRef = db.collection('subscriptions');
        const query = subscriptionsRef
            .where('viewerId', '==', viewerId)
            .where('creatorId', '==', creatorId)
            .where('status', '==', 'active')
            .limit(1);

        const snapshot = await query.get();

        if (!snapshot.empty) {
            const subscription = snapshot.docs[0].data();
            const now = new Date();
            const periodEnd = subscription.currentPeriodEnd?.toDate() || new Date(0);
            
            if (periodEnd > now) {
                return res.status(200).json({ 
                    hasAccess: true, 
                    reason: 'subscribed',
                    expiresAt: periodEnd.toISOString()
                });
            }
        }

        return res.status(200).json({ hasAccess: false, reason: 'not_subscribed' });

    } catch (error) {
        console.error('Access check error:', error);
        return res.status(500).json({ hasAccess: false, error: 'Server error' });
    }
}
