'use server';

// Next.js Server Action: updateDailyFlight (app/actions/updateDailyFlight.ts)

import { prisma } from './db';
import { ActionResponse } from './types';
import { computeStreak } from './streak';

interface FlightProgressResult {
  missionId: string;
  title: string;
  progress: number;
  completed: boolean;
  expAwarded: number;
  currentStreak: number;
}

export async function updateDailyFlightAction(
  userId: string,
  missionId: string,
  progressIncrement: number
): Promise<ActionResponse<FlightProgressResult>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the user's mission (normalized per-user model)
      const mission = await tx.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission || mission.userId !== userId) {
        throw new Error("Daily Flight route is not mapped to your nest.");
      }

      let currentProgress = mission.progress;
      let isCompleted = mission.status === 'COMPLETED';
      let expAwarded = 0;

      if (!isCompleted) {
        currentProgress = Math.min(mission.target, mission.progress + progressIncrement);
        isCompleted = currentProgress >= mission.target;

        await tx.mission.update({
          where: { id: missionId },
          data: {
            progress: currentProgress,
            status: isCompleted ? 'COMPLETED' : 'PENDING',
            completedAt: isCompleted ? new Date() : null,
          },
        });
      }

      if (isCompleted && mission.rewardClaimed === false) {
        expAwarded = mission.expReward;
      }

      // 2. Dynamically calculate the user's consecutive day streak
      const completions = await tx.mission.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { not: null },
        },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
      });

      const currentStreak = computeStreak(completions.map((c) => c.completedAt!));

      return {
        missionId: mission.id,
        title: mission.title,
        progress: currentProgress,
        completed: isCompleted,
        expAwarded,
        currentStreak,
      };
    });

    let completeMsg = `Flight progress logged. You are at ${result.progress}% of this daily flight.`;
    if (result.completed) {
      completeMsg = `Flight accomplished! You completed "${result.title}" and earned +${result.expAwarded} EXP. Your daily flight chain is at ${result.currentStreak} days!`;
    }

    return {
      success: true,
      message: completeMsg,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to record flight progress.",
    };
  }
}
