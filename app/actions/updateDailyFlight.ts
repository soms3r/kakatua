'use server';

// Next.js Server Action: updateDailyFlight (app/actions/updateDailyFlight.ts)

import { prisma } from './db';
import { ActionResponse } from './types';

interface FlightProgressResult {
  missionId: string;
  title: string;
  progress: number;
  completed: boolean;
  expAwarded: number;
  currentStreak: number;
}

interface UserMissionProgress {
  id: string;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
}

export async function updateDailyFlightAction(
  userId: string,
  missionId: string,
  progressIncrement: number
): Promise<ActionResponse<FlightProgressResult>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the master mission details
      const mission = await tx.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new Error("Daily Flight route is not mapped.");
      }

      // 2. Fetch or initialize the user's progress for this mission
      // Use select ... for update via raw query to lock the row
      const rows = await tx.$queryRawUnsafe<UserMissionProgress[]>(
        `SELECT id, progress, completed, completed_at AS "completedAt" FROM user_missions
         WHERE user_id = ? AND mission_id = ?`,
        userId,
        missionId
      );

      let progressRecord: UserMissionProgress | null = rows.length > 0 ? rows[0] : null;

      let currentProgress = 0;
      let isCompleted = false;
      let expAwarded = 0;
      const targetProgress = 100;

      if (!progressRecord) {
        currentProgress = Math.min(targetProgress, progressIncrement);
        isCompleted = currentProgress >= targetProgress;

        const inserted = await tx.userMission.create({
          data: {
            userId,
            missionId,
            progress: currentProgress,
            completed: isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });
        progressRecord = inserted;
      } else {
        if (progressRecord.completed) {
          isCompleted = true;
          currentProgress = targetProgress;
        } else {
          currentProgress = Math.min(
            targetProgress,
            progressRecord.progress + progressIncrement
          );
          isCompleted = currentProgress >= targetProgress;

          const updated = await tx.userMission.update({
            where: { id: progressRecord.id },
            data: {
              progress: currentProgress,
              completed: isCompleted,
              completedAt: isCompleted ? new Date() : null,
            },
          });
          progressRecord = updated;
        }
      }

      if (isCompleted && progressRecord.completedAt) {
        expAwarded = mission.expReward;
      }

      // 3. Dynamically calculate the user's consecutive day streak
      const completions = await tx.userMission.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { not: null },
        },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
      });

      let currentStreak = 0;
      if (completions.length > 0) {
        const uniqueDates = Array.from(
          new Set(
            completions.map((c) =>
              new Date(c.completedAt!).toISOString().split('T')[0]
            )
          )
        );

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0];

        let checkDate = new Date();
        if (uniqueDates[0] === todayStr) {
          currentStreak = 1;
        } else if (uniqueDates[0] === yesterdayStr) {
          currentStreak = 1;
          checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        } else {
          currentStreak = 0;
        }

        if (currentStreak > 0) {
          for (let i = 1; i < 365; i++) {
            const previousDateStr = new Date(
              checkDate.getTime() - i * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0];
            if (uniqueDates.includes(previousDateStr)) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

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
