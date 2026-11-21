'use strict';

const crypto = require('node:crypto');
const { db, hashPassword, verifyPassword } = require('./db');

const SESSION_COOKIE = 'ozvio_sid';
const SESSION_DAYS = 30;

function sha256(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function parseCookies(header) {
    const out = {};
    if (!header) return out;
    header.split(';').forEach(part => {
        const idx = part.indexOf('=');
        if (idx < 0) return;
        const key = part.slice(0, idx).trim();
        const val = part.slice(idx + 1).trim();
        try { out[key] = decodeURIComponent(val); } catch { out[key] = val; }
    });
    return out;
}

function publicUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
    };
}

function createSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
        .run(sha256(token), userId, expires.toISOString());
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
    return { token, expires };
}

function destroySession(token) {
    if (!token) return;
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

function getUserFromRequest(req) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE];
    if (!token) return null;
    const session = db.prepare(
        `SELECT s.expires_at, u.* FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ?`
    ).get(sha256(token));
    if (!session) return null;
    if (new Date(session.expires_at).getTime() < Date.now()) {
        destroySession(token);
        return null;
    }
    if (session.status !== 'active') return null;
    return session;
}

function sessionCookie(token, expires) {
    const maxAge = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function registerUser({ name, email, password, phone = '' }) {
    const normalized = String(email || '').trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized);
    if (existing) {
        const err = new Error('An account with this email already exists.');
        err.status = 409;
        err.code = 'EMAIL_TAKEN';
        throw err;
    }
    const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)'
    ).run(String(name).trim(), normalized, hashPassword(password), String(phone || '').trim());
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    return user;
}

function authenticate(email, password) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase());
    if (!user) return { error: 'Incorrect email or password.' };
    if (user.status !== 'active') return { error: 'This account has been deactivated. Please contact support.' };
    if (!verifyPassword(password, user.password_hash)) return { error: 'Incorrect email or password.' };
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    return { user };
}

function createResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    db.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
        .run(sha256(token), userId, expires.toISOString());
    return token;
}

function resetPassword(token, newPassword) {
    const row = db.prepare(
        'SELECT * FROM password_resets WHERE token_hash = ? AND used = 0'
    ).get(sha256(token));
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
        const err = new Error('This password reset link is invalid or has expired.');
        err.status = 400;
        throw err;
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), row.user_id);
    db.prepare('UPDATE password_resets SET used = 1 WHERE token_hash = ?').run(row.token_hash);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.user_id);
    return row.user_id;
}

function requireUser(req, res, sendJson) {
    const user = getUserFromRequest(req);
    if (!user) {
        sendJson(res, 401, { error: 'Please sign in to continue.' });
        return null;
    }
    return user;
}

function requireAdmin(req, res, sendJson) {
    const user = getUserFromRequest(req);
    if (!user) {
        sendJson(res, 401, { error: 'Administrator sign-in required.' });
        return null;
    }
    if (user.role !== 'admin') {
        sendJson(res, 403, { error: 'You do not have permission to access this area.' });
        return null;
    }
    return user;
}

module.exports = {
    SESSION_COOKIE,
    parseCookies,
    publicUser,
    createSession,
    destroySession,
    getUserFromRequest,
    sessionCookie,
    clearSessionCookie,
    registerUser,
    authenticate,
    createResetToken,
    resetPassword,
    requireUser,
    requireAdmin
};
