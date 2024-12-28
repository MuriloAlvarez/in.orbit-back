import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { goals, goalsCompletions } from '../db/schema';
import dayjs from 'dayjs';

interface CreateGoalCompletionRequest {
  goalId: string;
}

export async function createGoalCompletion({ goalId }: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate();
  const lastDayOfWeek = dayjs().endOf('week').toDate();

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionsCount: count(goalsCompletions.id).as('completionsCount'),
      })
      .from(goalsCompletions)
      .where(and(lte(goalsCompletions.createdAt, lastDayOfWeek), gte(goalsCompletions.createdAt, firstDayOfWeek), eq(goalsCompletions.goalId, goalId)))
      .groupBy(goalsCompletions.goalId),
  );

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionCounts.completionsCount}, 0)`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId));

  const { completionCount, desiredWeeklyFrequency } = result[0];

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Meta já finalizada');
  }

  const insertResult = await db
    .insert(goalsCompletions)
    .values({
      goalId,
    })
    .returning();

  const goalCompletion = insertResult[0];

  return {
    goalCompletion,
  };
}
