import { Hono } from 'hono';
import { db } from '../lib/db';

const activity = new Hono();

// ==================== MRR History ====================

// Get MRR history
activity.get('/mrr-history', async (c) => {
  const history = await db.mrrHistory.findMany({
    orderBy: { month: 'asc' },
  });

  return c.json(history.map((h) => ({
    id: h.id,
    month: h.month,
    value: h.value,
  })));
});

// Create MRR history entry
activity.post('/mrr-history', async (c) => {
  const body = await c.req.json();
  const { month, value } = body;

  if (!month || value === undefined) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Check if month already exists
  const existing = await db.mrrHistory.findUnique({ where: { month } });
  if (existing) {
    return c.json({ error: 'Entry for this month already exists' }, 400);
  }

  const entry = await db.mrrHistory.create({
    data: { month, value },
  });

  return c.json({
    id: entry.id,
    month: entry.month,
    value: entry.value,
  }, 201);
});

// Update MRR history entry
activity.put('/mrr-history/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { month, value } = body;

  const existing = await db.mrrHistory.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Entry not found' }, 404);
  }

  // Check for duplicate month if changing
  if (month && month !== existing.month) {
    const duplicate = await db.mrrHistory.findUnique({ where: { month } });
    if (duplicate) {
      return c.json({ error: 'Entry for this month already exists' }, 400);
    }
  }

  const entry = await db.mrrHistory.update({
    where: { id },
    data: {
      ...(month !== undefined && { month }),
      ...(value !== undefined && { value }),
    },
  });

  return c.json({
    id: entry.id,
    month: entry.month,
    value: entry.value,
  });
});

// Delete MRR history entry
activity.delete('/mrr-history/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const existing = await db.mrrHistory.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Entry not found' }, 404);
  }

  await db.mrrHistory.delete({ where: { id } });

  return c.json({ success: true });
});

// ==================== Client Activity ====================

// Get client activity
activity.get('/client-activity', async (c) => {
  const activityList = await db.clientActivity.findMany({
    orderBy: { month: 'asc' },
  });

  return c.json(activityList.map((a) => ({
    id: a.id,
    month: a.month,
    gained: a.gained,
    lost: a.lost,
  })));
});

// Create client activity entry
activity.post('/client-activity', async (c) => {
  const body = await c.req.json();
  const { month, gained, lost } = body;

  if (!month || gained === undefined || lost === undefined) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Check if month already exists
  const existing = await db.clientActivity.findUnique({ where: { month } });
  if (existing) {
    return c.json({ error: 'Entry for this month already exists' }, 400);
  }

  const entry = await db.clientActivity.create({
    data: { month, gained, lost },
  });

  return c.json({
    id: entry.id,
    month: entry.month,
    gained: entry.gained,
    lost: entry.lost,
  }, 201);
});

// Update client activity entry
activity.put('/client-activity/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { month, gained, lost } = body;

  const existing = await db.clientActivity.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Entry not found' }, 404);
  }

  // Check for duplicate month if changing
  if (month && month !== existing.month) {
    const duplicate = await db.clientActivity.findUnique({ where: { month } });
    if (duplicate) {
      return c.json({ error: 'Entry for this month already exists' }, 400);
    }
  }

  const entry = await db.clientActivity.update({
    where: { id },
    data: {
      ...(month !== undefined && { month }),
      ...(gained !== undefined && { gained }),
      ...(lost !== undefined && { lost }),
    },
  });

  return c.json({
    id: entry.id,
    month: entry.month,
    gained: entry.gained,
    lost: entry.lost,
  });
});

// Delete client activity entry
activity.delete('/client-activity/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const existing = await db.clientActivity.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Entry not found' }, 404);
  }

  await db.clientActivity.delete({ where: { id } });

  return c.json({ success: true });
});

export default activity;
