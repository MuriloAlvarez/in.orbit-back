import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { db } from '../db';
import { goals, goalsCompletions } from '../db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { title } from 'process';
import { count } from 'drizzle-orm';

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate();
  const lastDayOfWeek = dayjs().endOf('week').toDate();

  const goalsCompletionUpToWeek = db.$with('goals_completion_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek)),
  );

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionsCount: count(goalsCompletions.id).as('completionsCount'),
      })
      .from(goalsCompletions)
      .where(and(lte(goalsCompletions.createdAt, lastDayOfWeek), gte(goalsCompletions.createdAt, firstDayOfWeek)))
      .groupBy(goalsCompletions.goalId),
  );

  const pendingGoals = await db
    .with(goalCompletionCounts, goalsCompletionUpToWeek)
    .select({
      id: goalsCompletionUpToWeek.id,
      title: goalsCompletionUpToWeek.title,
      desiredWeeklyFrequency: goalsCompletionUpToWeek.desiredWeeklyFrequency,
      completionCount: sql`
      COALESCE(${goalCompletionCounts.completionsCount}, 0)`.mapWith(Number),
    })
    .from(goalsCompletionUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCompletionUpToWeek.id));

  return { pendingGoals };
}
