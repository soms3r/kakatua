'use server';

// Next.js Server Action: buildMyNest (app/actions/buildMyNest.ts)

import { prisma } from './db';
import { ActionResponse } from './types';

interface OnboardingInput {
  name: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  avatarUrl?: string;
  cultureCardData: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  };
}

export async function buildMyNestAction(
  userId: string,
  input: OnboardingInput
): Promise<ActionResponse<{ userId: string; cultureCardId: string }>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user profile details
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          nativeLanguages: JSON.stringify(input.nativeLanguages),
          learningLanguages: JSON.stringify(input.learningLanguages),
          interests: JSON.stringify(input.interests),
          timezoneOffset: input.timezoneOffset,
          avatarUrl: input.avatarUrl || null,
        },
      });

      // 2. Upsert Culture Card (1:1 with user)
      // Prisma's Json type accepts plain JS objects directly
      const cultureCard = await tx.cultureCard.upsert({
        where: { userId },
        create: {
          userId,
          data: JSON.stringify(input.cultureCardData),
        },
        update: {
          data: JSON.stringify(input.cultureCardData),
        },
      });

      return {
        userId: updatedUser.id,
        cultureCardId: cultureCard.id,
      };
    });

    return {
      success: true,
      message: "Your nest is built! Your culture card has been safely nested.",
      data: result,
    };
  } catch (error: any) {
    console.error('=== BUILD MY NEST ERROR ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    console.error('===========================');
    if (error.code === 'P2025') {
      return {
        success: false,
        error: "Nest builder user was not found.",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to construct your nest.",
    };
  }
}
