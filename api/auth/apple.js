// api/auth/apple.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const TEAM_ID = 'K6Y8V3KPQY';
const KEY_ID = 'B5VY92CW85';
const CLIENT_ID = 'one.uncaged.auth';
const REDIRECT_URI = 'https://uncaged.one/auth/apple/callback';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const state = crypto.randomBytes(16).toString('hex');
        
        const authUrl = new URL('https://appleid.apple.com/auth/authorize');
        authUrl.searchParams.set('client_id', CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code id_token');
        authUrl.searchParams.set('response_mode', 'form_post');
        authUrl.searchParams.set('scope', 'name email');
        authUrl.searchParams.set('state', state);
        
        res.setHeader('Set-Cookie', `apple_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
        
        return res.redirect(302, authUrl.toString());
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
