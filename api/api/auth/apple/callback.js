// api/auth/apple/callback.js
const jwt = require('jsonwebtoken');

const TEAM_ID = 'K6Y8V3KPQY';
const KEY_ID = 'B5VY92CW85';
const CLIENT_ID = 'one.uncaged.auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id_token, user } = req.body;

        // Decode the id_token to get user info
        const decodedToken = jwt.decode(id_token);
        
        if (!decodedToken) {
            return res.redirect(302, '/login.html?error=invalid_token');
        }

        const appleUserId = decodedToken.sub;
        const email = decodedToken.email;
        
        // Parse user info (only sent on first sign-in)
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

        // Redirect to frontend with user data
        // The frontend will handle Firebase authentication
        const redirectUrl = new URL('https://uncaged.one/auth-complete.html');
        redirectUrl.searchParams.set('provider', 'apple');
        redirectUrl.searchParams.set('email', email || '');
        redirectUrl.searchParams.set('uid', appleUserId);
        redirectUrl.searchParams.set('name', firstName ? `${firstName} ${lastName}`.trim() : '');

        return res.redirect(302, redirectUrl.toString());

    } catch (error) {
        console.error('Apple auth error:', error);
        return res.redirect(302, '/login.html?error=auth_failed');
    }
}
