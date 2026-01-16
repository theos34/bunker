import { Hono } from 'hono';
import { db } from '../lib/db';

const affiliates = new Hono();

// Get all affiliates
affiliates.get('/', async (c) => {
  const affiliateList = await db.affiliate.findMany({
    include: {
      clients: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to match frontend format
  const transformed = affiliateList.map((affiliate) => ({
    id: affiliate.id,
    name: affiliate.name,
    iban: affiliate.iban,
    monthlyPayoutOverride: affiliate.monthlyPayoutOverride,
    referred: affiliate.clients.map((ac) => ac.client.name),
  }));

  return c.json(transformed);
});

// Get single affiliate
affiliates.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const affiliate = await db.affiliate.findUnique({
    where: { id },
    include: {
      clients: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!affiliate) {
    return c.json({ error: 'Affiliate not found' }, 404);
  }

  return c.json({
    id: affiliate.id,
    name: affiliate.name,
    iban: affiliate.iban,
    monthlyPayoutOverride: affiliate.monthlyPayoutOverride,
    referred: affiliate.clients.map((ac) => ac.client.name),
  });
});

// Create affiliate
affiliates.post('/', async (c) => {
  const body = await c.req.json();
  const { name, iban, monthlyPayoutOverride, referred } = body;

  if (!name || !iban) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Find client IDs by name
  let clientIds: number[] = [];
  if (referred && referred.length > 0) {
    const clients = await db.client.findMany({
      where: { name: { in: referred } },
    });
    clientIds = clients.map((c) => c.id);
  }

  const affiliate = await db.affiliate.create({
    data: {
      name,
      iban,
      monthlyPayoutOverride: monthlyPayoutOverride ?? null,
      clients: {
        create: clientIds.map((clientId) => ({ clientId })),
      },
    },
    include: {
      clients: {
        include: {
          client: true,
        },
      },
    },
  });

  return c.json({
    id: affiliate.id,
    name: affiliate.name,
    iban: affiliate.iban,
    monthlyPayoutOverride: affiliate.monthlyPayoutOverride,
    referred: affiliate.clients.map((ac) => ac.client.name),
  }, 201);
});

// Update affiliate
affiliates.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, iban, monthlyPayoutOverride, referred } = body;

  const existing = await db.affiliate.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Affiliate not found' }, 404);
  }

  // Handle referred clients update
  if (referred !== undefined) {
    // Delete existing relations
    await db.affiliateClient.deleteMany({
      where: { affiliateId: id },
    });

    // Find client IDs by name and create new relations
    if (referred.length > 0) {
      const clients = await db.client.findMany({
        where: { name: { in: referred } },
      });

      await db.affiliateClient.createMany({
        data: clients.map((client) => ({
          affiliateId: id,
          clientId: client.id,
        })),
      });
    }
  }

  const affiliate = await db.affiliate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(iban !== undefined && { iban }),
      ...(monthlyPayoutOverride !== undefined && { monthlyPayoutOverride }),
    },
    include: {
      clients: {
        include: {
          client: true,
        },
      },
    },
  });

  return c.json({
    id: affiliate.id,
    name: affiliate.name,
    iban: affiliate.iban,
    monthlyPayoutOverride: affiliate.monthlyPayoutOverride,
    referred: affiliate.clients.map((ac) => ac.client.name),
  });
});

// Delete affiliate
affiliates.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const existing = await db.affiliate.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: 'Affiliate not found' }, 404);
  }

  await db.affiliate.delete({ where: { id } });

  return c.json({ success: true });
});

export default affiliates;
