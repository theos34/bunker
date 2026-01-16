import { Hono } from 'hono';
import { db } from '../lib/db';

const kpis = new Hono();

// Get KPIs
kpis.get('/', async (c) => {
  let kpi = await db.kpi.findFirst();

  if (!kpi) {
    kpi = await db.kpi.create({
      data: {
        mrr: 0,
        mrrGoal: 20000,
        activeSubscribers: 0,
      },
    });
  }

  return c.json(kpi);
});

// Update KPIs
kpis.put('/', async (c) => {
  const body = await c.req.json();
  const { mrr, mrrGoal, activeSubscribers } = body;

  let kpi = await db.kpi.findFirst();

  if (!kpi) {
    kpi = await db.kpi.create({
      data: {
        mrr: mrr ?? 0,
        mrrGoal: mrrGoal ?? 20000,
        activeSubscribers: activeSubscribers ?? 0,
      },
    });
  } else {
    kpi = await db.kpi.update({
      where: { id: kpi.id },
      data: {
        ...(mrr !== undefined && { mrr }),
        ...(mrrGoal !== undefined && { mrrGoal }),
        ...(activeSubscribers !== undefined && { activeSubscribers }),
      },
    });
  }

  return c.json(kpi);
});

export default kpis;
