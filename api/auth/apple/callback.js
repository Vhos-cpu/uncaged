import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id_token, user } = req.body;

        if (!id_token) {
            return res.redirect('/login.html?error=no_token');
        }

        const tokenParts = id_token.split('.');
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

        const appleUserId = payload.sub;
        const email = payload.email;
        
        let firstName = '';
        let lastName = '';
        if (user) {
            try {
                const userData = typeof user === 'string' ? JSON.parse(user) : user;
                firstName = userData.name?.firstName || '';
                lastName = userData.name?.lastName || '';
            } catch (e) {
                console.log('Could not parse user data');
            }
        }

        const params = new URLSearchParams({
            provider: 'apple',
            appleUserId,
            email: email || '',
            firstName,
            lastName
        });

        return res.redirect(`/auth-complete.html?${params.toString()}`);

    } catch (error) {
        console.error('Apple callback error:', error);
        return res.redirect('/login.html?error=callback_failed');
    }
}
