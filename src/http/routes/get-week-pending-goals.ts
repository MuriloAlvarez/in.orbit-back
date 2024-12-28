import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals';

export const getWeekPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/goals-pending', async () => {
    const { pendingGoals } = await getWeekPendingGoals();
    return { pendingGoals };
  });
};