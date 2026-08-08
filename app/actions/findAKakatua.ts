'use server';

// Next.js Server Action: findAKakatua (app/actions/findAKakatua.ts)

import { prisma } from './db';
import { ActionResponse } from './types';
import { logActivity } from './activity';
import { trackUserAction } from './missions';

export interface MatchedUserData {
  id: string;
  name: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  compatibilityScore: number;
}

function parseUserArrays<T extends { nativeLanguages: string; learningLanguages: string; interests: string }>(
  row: T
): T & { nativeLanguages: string[]; learningLanguages: string[]; interests: string[] } {
  return {
    ...row,
    nativeLanguages: JSON.parse(row.nativeLanguages),
    learningLanguages: JSON.parse(row.learningLanguages),
    interests: JSON.parse(row.interests),
  };
}

export async function findAKakatuaAction(userId: string): Promise<ActionResponse<MatchedUserData | null>> {
  try {
    const match = await prisma.$transaction(async (tx) => {
      // 1. Fetch current user
      const rawUser = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!rawUser) {
        throw new Error("Bird not found in the forest.");
      }

      const user = parseUserArrays(rawUser);

      if (user.status === 'suspended' || user.status === 'banned') {
        throw new Error("This bird's wings are clipped due to moderation guidelines.");
      }

      // 2. Put user in 'searching' state
      await tx.user.update({
        where: { id: userId },
        data: { status: 'searching' }
      });

      // 3. Find candidates in 'searching' status (filter in code for SQLite)
      const rawCandidates = await tx.user.findMany({
        where: {
          status: 'searching',
          id: { not: userId },
        }
      });

      const candidates = rawCandidates
        .map(parseUserArrays)
        .filter((c) => {
          const hasLearningOverlap = user.nativeLanguages.some((lang) => c.learningLanguages.includes(lang));
          const hasNativeOverlap = user.learningLanguages.some((lang) => c.nativeLanguages.includes(lang));
          return hasLearningOverlap && hasNativeOverlap;
        });

      if (candidates.length === 0) {
        return null;
      }

      const userTz = Number(user.timezoneOffset);
      let bestCandidate = null;
      let highestScore = -1;

      // 4. Calculate compatibility scores for all candidates
      for (const candidate of candidates) {
        const candidateTz = Number(candidate.timezoneOffset);

        // Interest overlap count
        const overlapInterests = user.interests.filter(interest => 
          candidate.interests.includes(interest)
        );
        const interestCount = overlapInterests.length;

        // Circular timezone difference
        const tzDiff = Math.abs(userTz - candidateTz);
        const circularDiff = Math.min(tzDiff, 24 - tzDiff);
        const tzScore = 12 - circularDiff;

        // Compatibility Score = (Interests Overlap * 10) + Timezone Alignment Score
        const score = (interestCount * 10) + tzScore;

        if (score > highestScore) {
          highestScore = score;
          bestCandidate = candidate;
        } else if (score === highestScore) {
          // Tie breaker: Prefer the candidate waiting the longest (earliest createdAt)
          if (!bestCandidate || candidate.createdAt < bestCandidate.createdAt) {
            bestCandidate = candidate;
          }
        }
      }

      if (bestCandidate) {
        // 5. Optimistic Concurrency Match: Update candidate and user
        // Ensure the candidate is STILL in 'searching' state to avoid double-matching
        const candidateUpdate = await tx.user.updateMany({
          where: {
            id: bestCandidate.id,
            status: 'searching'
          },
          data: { status: 'active' }
        });

        if (candidateUpdate.count === 0) {
          throw new Error("Chosen candidate took flight with another bird.");
        }

        // Update the current user status to active
        await tx.user.update({
          where: { id: userId },
          data: { status: 'active' }
        });

        return {
          id: bestCandidate.id,
          name: bestCandidate.name,
          avatarUrl: bestCandidate.avatarUrl,
          nativeLanguages: bestCandidate.nativeLanguages,
          learningLanguages: bestCandidate.learningLanguages,
          interests: bestCandidate.interests,
          timezoneOffset: Number(bestCandidate.timezoneOffset),
          compatibilityScore: highestScore
        };
      }

      return null;
    });

    if (match) {
      await logActivity(
        userId,
        'VIDEO_MATCH_COMPLETED',
        `Wings aligned with ${match.name}`,
        `You took flight with ${match.name}, a new language partner.`,
        {
          partnerId: match.id,
          compatibilityScore: match.compatibilityScore,
          minutes: 15,
        }
      );

      await trackUserAction(userId, 'VIDEO_MATCH_COMPLETED', { label: `Matched with ${match.name}` });

      return {
        success: true,
        message: "Your wings aligned! You have taken flight with a new partner.",
        data: match
      };
    } else {
      return {
        success: true,
        message: "Nesting in the queue. No compatible birds are currently airborne.",
        data: null
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to launch matchmaking flight."
    };
  }
}
