import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { createGoal } from '../functions/create-goal';
import { getWeekPendingGoals } from '../functions/getWeekPendingGoals';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get('/goals-pending', async () => {
  const { pendingGoals } = await getWeekPendingGoals();
  return { pendingGoals };
});

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async (request) => {
    const { desiredWeeklyFrequency, title } = request.body;
    await createGoal({
      title,
      desiredWeeklyFrequency,
    });
  },
);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('hello world');
  });

//1:43:00
