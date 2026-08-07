// Server Action: Create / Update a User's Culture Card with rich content.
// (app/actions/createCard.ts)

'use server';

import { prisma } from './db';
import { ActionResponse, WizardFormData } from './types';
import { guardAgainstAmbassadorMutation } from './ambassadors';

export async function createUserCultureCardAction(
  userId: string,
  form: WizardFormData
): Promise<ActionResponse<{ userId: string }> > {
  // Guard: cannot create cards for ambassadors
  try {
    await guardAgainstAmbassadorMutation(userId, 'modified');
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  try {
    // ── Build basic CultureCard data (backward-compat) ──────────────────────
    const basicData = {
      traditions: form.traditionsSummary,
      food: form.foodSummary,
      history: form.historySummary,
      funFact: form.funFact,
    };

    // ── Build detailedContent ───────────────────────────────────────────────
    const detailedContent = {
      languageInfo: {
        primaryLanguage: form.primaryLanguage,
        majorDialects: [],   // User can add later; system ambassadors have these populated
        keyPhrases: form.keyPhrases,
      },
      culturalRituals: form.rituals,
      culinaryNarrative: form.dishes,
      historicalContext: form.historySummary,
      socialEtiquette: form.socialEtiquette,
    };

    // ── Upsert CultureCard ──────────────────────────────────────────────────
    const existing = await prisma.cultureCard.findUnique({ where: { userId } });

    if (existing) {
      await prisma.cultureCard.update({
        where: { userId },
        data: {
          data: JSON.stringify(basicData),
          detailedContent: JSON.stringify(detailedContent),
        },
      });
    } else {
      await prisma.cultureCard.create({
        data: {
          userId,
          data: JSON.stringify(basicData),
          detailedContent: JSON.stringify(detailedContent),
        },
      });
    }

    // ── Also update User profile fields for backward compatibility ───────────
    await prisma.user.update({
      where: { id: userId },
      data: {
        traditions: form.traditionsSummary || null,
        favoriteFood: form.foodSummary || null,
        historyInterest: form.historySummary || null,
      },
    });

    return { success: true, message: 'Your cultural card has been woven into the flock.', data: { userId } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create cultural card.' };
  }
}
