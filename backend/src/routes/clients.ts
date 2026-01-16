import { Hono } from 'hono';
import { db } from '../lib/db';

const clients = new Hono();

// Get all clients
clients.get('/', async (c) => {
  const clientList = await db.client.findMany({
    include: {
      affiliates: {
        include: {
          affiliate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to match frontend format
  const transformed = clientList.map((client) => ({
    id: client.id,
    name: client.name,
    integrationDate: client.integrationDate,
    adAccountId: client.adAccountId,
    totalSpent: client.totalSpent,
    phone: client.phone,
  }));

  return c.json(transformed);
});

// Get single client
clients.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const client = await db.client.findUnique({
    where: { id },
    include: {
      affiliates: {
        include: {
          affiliate: true,
        },
      },
    },
  });

  if (!client) {
    return c.json({ error: 'Client not found' }, 404);
  }

  return c.json({
    id: client.id,
    name: client.name,
    integrationDate: client.integrationDate,
    adAccountId: client.adAccountId,
    totalSpent: client.totalSpent,
    phone: client.phone,
  });
});

// Create client
clients.post('/', async (c) => {
  const body = await c.req.json();
  const { name, integrationDate, adAccountId, totalSpent, phone } = body;

  if (!name || !integrationDate || !adAccountId || !phone) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const client = await db.client.create({
    data: {
      name,
      integrationDate,
      adAccountId,
      totalSpent: totalSpent ?? 0,
      phone,
    },
  });

  return c.json({
    id: client.id,
    name: client.name,
    integrationDate: client.integrationDate,
    adAccountId: client.adAccountId,
    totalSpent: client.totalSpent,
    phone: client.phone,
  }, 201);
});

// Update client
clients.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, integrationDate, adAccountId, totalSpent, phone } = body;

  const existing = await db.client.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Client not found' }, 404);
  }

  const client = await db.client.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(integrationDate !== undefined && { integrationDate }),
      ...(adAccountId !== undefined && { adAccountId }),
      ...(totalSpent !== undefined && { totalSpent }),
      ...(phone !== undefined && { phone }),
    },
  });

  return c.json({
    id: client.id,
    name: client.name,
    integrationDate: client.integrationDate,
    adAccountId: client.adAccountId,
    totalSpent: client.totalSpent,
    phone: client.phone,
  });
});

// Delete client
clients.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const existing = await db.client.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Client not found' }, 404);
  }

  await db.client.delete({ where: { id } });

  return c.json({ success: true });
});

export default clients;
