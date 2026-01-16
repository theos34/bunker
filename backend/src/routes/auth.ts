import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { db } from '../lib/db';

const auth = new Hono();

// Login
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400);
  }

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const validPassword = await Bun.password.verify(password, user.password);

  if (!validPassword) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      expiresAt,
    },
  });

  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: expiresAt,
    path: '/',
  });

  return c.json({
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

// Logout
auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session');

  if (sessionId) {
    await db.session.delete({ where: { id: sessionId } }).catch(() => {});
    deleteCookie(c, 'session', { path: '/' });
  }

  return c.json({ success: true });
});

// Get current user
auth.get('/me', async (c) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json({ user: null });
  }

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: sessionId } }).catch(() => {});
    }
    deleteCookie(c, 'session', { path: '/' });
    return c.json({ user: null });
  }

  return c.json({
    user: {
      id: session.user.id,
      username: session.user.username,
    },
  });
});

export default auth;
