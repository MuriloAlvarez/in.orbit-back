import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { getWeekPendingGoalsRoute } from './routes/get-week-pending-goals';
import { createGoalCompletionsRoute } from './routes/create-goal-completion';
import { createGoalRoute } from './routes/create-goal';
import { getWeekSummaryRoute } from './routes/get-week-summary';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createGoalRoute);
app.register(getWeekPendingGoalsRoute);
app.register(createGoalCompletionsRoute);
app.register(getWeekSummaryRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('hello world');
  });

// 07:30
