'use server';

// Next.js Server Action: submitFeedback (app/actions/submitFeedback.ts)

import { prisma } from './db';
import { ActionResponse } from './types';

export type FeedbackCategory = 'Bug' | 'Idea' | 'FeatureRequest' | 'Other';
export type FeedbackStatus = 'New' | 'Reviewing' | 'Resolved';

interface FeedbackInput {
  message: string;
  category: FeedbackCategory;
  contactInfo?: string;
}

interface FeedbackResult {
  id: string;
  category: string;
  status: string;
}

export async function submitFeedbackAction(
  input: FeedbackInput,
  userId?: string
): Promise<ActionResponse<FeedbackResult>> {
  if (!input.message || input.message.trim().length === 0) {
    return {
      success: false,
      error: "Your nest message is empty. The flock would love to hear your thoughts!"
    };
  }

  if (input.message.length > 2000) {
    return {
      success: false,
      error: "That's a lengthy migration! Please keep your message under 2000 characters."
    };
  }

  const validCategories: FeedbackCategory[] = ['Bug', 'Idea', 'FeatureRequest', 'Other'];
  if (!validCategories.includes(input.category)) {
    return {
      success: false,
      error: "That category flew right out of the nest. Please pick Bug, Idea, Feature Request, or Other."
    };
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || null,
        message: input.message.trim(),
        category: input.category,
        contactInfo: input.contactInfo?.trim() || null,
        status: 'New',
      },
    });

    return {
      success: true,
      message: "Your words have reached the flock! Our feathered friends will review your message soon.",
      data: {
        id: feedback.id,
        category: feedback.category,
        status: feedback.status,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "The flock's messenger bird got lost. Please try again."
    };
  }
}
