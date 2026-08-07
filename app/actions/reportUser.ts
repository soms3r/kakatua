'use server';

// Next.js Server Action: reportUser (app/actions/reportUser.ts)
// Blocks reports against protected ambassador accounts.

import { prisma } from './db';
import { ActionResponse } from './types';
import { guardAgainstAmbassadorMutation } from './ambassadors';

interface ReportResult {
  reportCount: number;
  status: string;
  ipBanned: boolean;
}

export async function reportUserAction(
  reporterId: string,
  reportedId: string,
  reason: string
): Promise<ActionResponse<ReportResult>> {
  if (reporterId === reportedId) {
    return {
      success: false,
      error: "A bird cannot chirp warnings against its own nest.",
    };
  }

  // Guard: cannot report ambassadors
  try {
    await guardAgainstAmbassadorMutation(reportedId, 'reported');
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Record the report log (unique constraint prevents duplicates)
      try {
        await tx.userReport.create({
          data: { reporterId, reportedId, reason },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new Error(
            "You have already alerted the flock about this bird."
          );
        }
        throw err;
      }

      // 2. Atomically increment report_count and read back the new state
      const [updated] = await tx.$queryRawUnsafe<
        { report_count: number; status: string; suspension_until: Date | null }[]
      >(
        `UPDATE users
         SET report_count = report_count + 1
         WHERE id = ?
         RETURNING report_count, status, suspension_until`,
        reportedId
      );

      if (!updated) {
        throw new Error("Reported bird has flown away.");
      }

      const nextReportCount = Number(updated.report_count);
      const now = new Date();

      // 3. Calculate tiered bans based on the atomically-read count
      let newStatus = updated.status;
      let suspensionUntil: Date | null = updated.suspension_until;
      let ipBanned = false;

      if (nextReportCount >= 20) {
        newStatus = 'banned';
        ipBanned = true;
        suspensionUntil = null;
      } else if (nextReportCount >= 10) {
        newStatus = 'suspended';
        suspensionUntil = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );
      } else if (nextReportCount >= 5) {
        newStatus = 'suspended';
        const currentSuspensionLimit = new Date(
          now.getTime() + 15 * 24 * 60 * 60 * 1000
        );
        if (
          !updated.suspension_until ||
          updated.suspension_until < currentSuspensionLimit
        ) {
          suspensionUntil = currentSuspensionLimit;
        }
      }

      // 4. Update status and suspension based on tiered logic
      await tx.user.update({
        where: { id: reportedId },
        data: {
          status: newStatus,
          suspensionUntil,
        },
      });

      return {
        reportCount: nextReportCount,
        status: newStatus,
        ipBanned,
      };
    });

    let statusMsg = "Report recorded. The flock has been alerted.";
    if (result.status === 'suspended') {
      statusMsg =
        "Warning confirmed. The bird's wings have been clipped and suspended.";
    } else if (result.status === 'banned') {
      statusMsg =
        "Critical threat. The bird has been permanently banned from the flock.";
    }

    return {
      success: true,
      message: statusMsg,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Flock alert failed to deliver.",
    };
  }
}
