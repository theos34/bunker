import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { db } from '../lib/db';

export async function authMiddleware(c: Context, next: Next) {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: sessionId } });
    }
    return c.json({ error: 'Session expired' }, 401);
  }

  c.set('user', session.user);
  c.set('sessionId', sessionId);

  await next();
}
