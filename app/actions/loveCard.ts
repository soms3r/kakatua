// Server Action: Toggle Love Reaction on a Culture Card (app/actions/loveCard.ts)

'use server';

import { prisma } from './db';
import { ActionResponse } from './types';

interface LoveToggleResult {
  loveCount: number;
  isLoved: boolean;
}

export async function toggleLoveAction(
  userId: string,
  cultureCardId: string
): Promise<ActionResponse<LoveToggleResult>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingLike = await tx.cultureCardLike.findUnique({
        where: {
          userId_cultureCardId: { userId, cultureCardId },
        },
      });

      if (existingLike) {
        await tx.cultureCardLike.delete({
          where: { id: existingLike.id },
        });

        const card = await tx.cultureCard.update({
          where: { id: cultureCardId },
          data: { loveCount: { decrement: 1 } },
        });

        return {
          loveCount: Math.max(0, card.loveCount),
          isLoved: false,
        };
      } else {
        await tx.cultureCardLike.create({
          data: { userId, cultureCardId },
        });

        const card = await tx.cultureCard.update({
          where: { id: cultureCardId },
          data: { loveCount: { increment: 1 } },
        });

        return {
          loveCount: card.loveCount,
          isLoved: true,
        };
      }
    });

    return {
      success: true,
      message: result.isLoved ? 'You spread some love!' : 'Love removed.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to toggle love reaction.',
    };
  }
}

export async function getUserLoveStatus(
  userId: string,
  cultureCardId: string
): Promise<ActionResponse<boolean>> {
  try {
    const like = await prisma.cultureCardLike.findUnique({
      where: {
        userId_cultureCardId: { userId, cultureCardId },
      },
    });

    return { success: true, message: 'Love status loaded.', data: !!like };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to check love status.' };
  }
}
