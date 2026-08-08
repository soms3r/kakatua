// Kakatua Guardian Bot — context-aware Q&A engine (app/actions/guardianBot.ts)
// Processes guardian tickets using the user's live app context (languages,
// missions, settings, profile, availability) plus a Kakatua knowledge base.
//
// Verdicts:
//   - BOT (confident): a helpful answer is generated and returned instantly.
//   - MODERATOR (uncertain): too complex/ambiguous/technical/safety → the
//     ticket is routed to the PENDING_MODERATION queue for a human.

import { prisma } from './db';

export type BotSource = 'BOT' | 'MODERATOR';

export interface BotVerdict {
  source: BotSource;
  answer: string | null;
  confidence: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface MissionCtx {
  title: string;
  category: string;
  progress: number;
  target: number;
  status: string;
  expReward: number;
  rewardClaimed: boolean;
}

export interface UserContext {
  name: string;
  email: string;
  timezoneOffset: number;
  status: string;
  displayName: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  proficiencies: { language: string; type: string; proficiency: string | null }[];
  goals: { goalType: string; targetLevel: string | null; language: string | null; status: string }[];
  interests: string[];
  missions: MissionCtx[];
  availability: { day: string; startTime: string; endTime: string }[];
  seeking: string | null;
  callPreference: string | null;
  conversationTopics: string[];
}

export async function buildUserContext(userId: string): Promise<UserContext> {
  const [user, profile, languages, goals, missions, interests, availability, matchPref] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          timezoneOffset: true,
          status: true,
          nativeLanguages: true,
          learningLanguages: true,
          interests: true,
        },
      }),
      prisma.profile.findUnique({
        where: { userId },
        select: { displayName: true, bio: true, country: true, city: true },
      }),
      prisma.userLanguage.findMany({
        where: { userId },
        select: { type: true, proficiency: true, language: { select: { name: true } } },
      }),
      prisma.languageGoal.findMany({
        where: { userId },
        select: {
          goalType: true,
          targetLevel: true,
          status: true,
          language: { select: { name: true } },
        },
      }),
      prisma.mission.findMany({
        where: { userId },
        select: {
          title: true,
          category: true,
          progress: true,
          target: true,
          status: true,
          expReward: true,
          rewardClaimed: true,
        },
      }),
      prisma.interest.findMany({
        where: { userInterests: { some: { userId } } },
        select: { name: true },
      }),
      prisma.availability.findMany({
        where: { userId },
        select: { dayOfWeek: true, startTime: true, endTime: true },
      }),
      prisma.matchPreference.findUnique({
        where: { userId },
        select: { seeking: true, callPreference: true, conversationTopics: true },
      }),
    ]);

  const parseJson = (s: string): string[] => {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  let topics: string[] = [];
  try {
    if (matchPref?.conversationTopics) {
      const parsed = JSON.parse(matchPref.conversationTopics);
      if (Array.isArray(parsed)) topics = parsed;
    }
  } catch {
    topics = [];
  }

  return {
    name: user?.name ?? 'A flock member',
    email: user?.email ?? '',
    timezoneOffset: user ? Number(user.timezoneOffset) : 0,
    status: user?.status ?? 'active',
    displayName: profile?.displayName ?? null,
    bio: profile?.bio ?? null,
    country: profile?.country ?? null,
    city: profile?.city ?? null,
    nativeLanguages: user ? parseJson(user.nativeLanguages) : [],
    learningLanguages: user ? parseJson(user.learningLanguages) : [],
    proficiencies: languages.map((l) => ({
      language: l.language.name,
      type: l.type,
      proficiency: l.proficiency,
    })),
    goals: goals.map((g) => ({
      goalType: g.goalType,
      targetLevel: g.targetLevel,
      language: g.language?.name ?? null,
      status: g.status,
    })),
    interests: interests.map((i) => i.name),
    missions: missions.map((m) => ({
      title: m.title,
      category: m.category,
      progress: m.progress,
      target: m.target,
      status: m.status,
      expReward: m.expReward,
      rewardClaimed: m.rewardClaimed,
    })),
    availability: availability.map((a) => ({
      day: DAY_NAMES[a.dayOfWeek] ?? String(a.dayOfWeek),
      startTime: a.startTime,
      endTime: a.endTime,
    })),
    seeking: matchPref?.seeking ?? null,
    callPreference: matchPref?.callPreference ?? null,
    conversationTopics: topics,
  };
}

// ─── Intent definitions ───────────────────────────────────────────────────────

interface IntentDef {
  id: string;
  keywords: string[];
  minHits: number;
  alwaysModerator: boolean;
  generate: (c: UserContext, guardianRole: string | null, type: string) => string;
}

const SEED = 0.58; // baseline confidence once an intent is matched

function listOr(name: string, items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function missionsAnswer(c: UserContext): string {
  const active = c.missions.filter((m) => m.status === 'PENDING');
  const completed = c.missions.filter((m) => m.status === 'COMPLETED');

  let body = 'Missions are bite-sized daily, conversation, and goal challenges on the Missions tab (the rocket icon). Every mission earns EXP, and you can claim its reward as you hit 100% progress.';
  if (active.length > 0) {
    const lines = active.slice(0, 4).map(
      (m) => `• ${m.title} — ${m.progress}/${m.target} (${Math.round((m.progress / Math.max(1, m.target)) * 100)}%)`
    );
    body += `\n\nYou have ${active.length} in flight right now:\n${lines.join('\n')}`;
    body += '\nFinish a challenge and its reward will unlock automatically.';
  } else {
    body += '\n\nYou have no missions in flight right now — open the Missions tab to pick a prebuilt challenge or build your own.';
  }
  if (completed.length > 0) {
    body += `\n\nSo far you have completed ${completed.length} mission${completed.length === 1 ? '' : 's'} — keep the wings warm!`;
  }
  return body;
}

function languagesAnswer(c: UserContext): string {
  let body = `Your nest languages: native in ${listOr('', c.nativeLanguages) || 'not set yet'}`;
  if (c.learningLanguages.length > 0) {
    body += `, currently learning ${listOr('', c.learningLanguages)}.`;
  } else {
    body += '. Add a language you are learning in Nest Settings and Kakatua will tailor your matches, missions, and practice sessions around it.';
  }
  const activeGoals = c.goals.filter((g) => g.status === 'ACTIVE');
  if (activeGoals.length > 0) {
    const goalLines = activeGoals
      .slice(0, 4)
      .map((g) => `• ${g.language ?? 'Language'} — goal: ${g.goalType.replaceAll('_', ' ').toLowerCase()}` + (g.targetLevel ? ` (target ${g.targetLevel})` : ''));
    body += `\n\nYour active goals:\n${goalLines.join('\n')}`;
  }
  const profs = c.proficiencies.filter((p) => p.type === 'LEARNING' && p.proficiency);
  if (profs.length > 0) {
    body += `\n\nTracked proficiency: ${profs.map((p) => `${p.language} (${p.proficiency})`).join(', ')}.`;
  }
  body += '\nKeep a steady rhythm — small daily sessions beat marathon cramming.';
  return body;
}

function settingsAnswer(c: UserContext): string {
  let body = 'Head to Profile → Nest Settings. That is your control deck: languages, weekly availability, privacy toggles, match preferences, and your profile photo all live there.';
  if (c.displayName) body += `\n\nYour public display name is "${c.displayName}" — edit it any time in the same screen.`;
  if (c.city || c.country) {
    body += `\n\nWe have your perch down as ${[c.city, c.country].filter(Boolean).join(', ')} — update it if you have moved.`;
  }
  body += '\nYour identity sections (About, Traditions, Food, History) are edited directly on your Profile page.';
  return body;
}

function availabilityAnswer(c: UserContext): string {
  let body = 'Your weekly availability drives when partners can reach you. Every slot you open is a blade of the nest, tuned in Nest Settings → Availability.';
  if (c.availability.length > 0) {
    const slots = c.availability
      .slice(0, 6)
      .map((a) => `• ${a.day} ${a.startTime}–${a.endTime}`)
      .join('\n');
    body += `\n\nYour current slots:\n${slots}`;
  } else {
    body += '\n\nYou have no open slots yet — add some so potential practice partners can find a good time for you.';
  }
  body += `\n\nYour clock is set to UTC${c.timezoneOffset >= 0 ? '+' : ''}${c.timezoneOffset}.`;
  return body;
}

function matchmakingAnswer(c: UserContext): string {
  let body = 'Matchmaking pairs you with kindred birds — language partners, friends, mentors, or tutors — based on your preferences and interests.';
  if (c.seeking) body += `\n\nYou are currently seeking: ${c.seeking.replaceAll('_', ' ').toLowerCase()}.`;
  if (c.callPreference && c.callPreference !== 'ALL') {
    body += ` You prefer ${c.callPreference.toLowerCase()} calls.`;
  }
  if (c.conversationTopics.length > 0) {
    body += `\n\nConversation topics you picked: ${listOr('', c.conversationTopics)}.`;
  }
  if (c.learningLanguages.length > 0) {
    body += `\n\nTip: partners who speak ${listOr('', c.learningLanguages)} will be surfaced first, since that is what you are learning.`;
  }
  body += '\nTune all of this in Nest Settings → Match preferences.';
  return body;
}

function activityAnswer(c: UserContext): string {
  let body = 'The Activity tab is your flight log — it shows your recent sessions, completed missions, and streaks in one timeline.';
  const completed = c.missions.filter((m) => m.status === 'COMPLETED').length;
  if (completed > 0) body += `\n\nYou have ${completed} completed mission${completed === 1 ? '' : 's'} feeding into that history.`;
  body += '\nA streak grows when you keep the daily rhythm alive — miss a day and the feathers reset.';
  return body;
}

function guardianHelpAnswer(c: UserContext): string {
  return 'Kakatua has two global guardians: Global Buddy is the friendly casual peer for conversation practice and culture swap, and Kakatua Guide is the platform expert for missions, settings, and support.\n\nYour question lands here, in the heart of the nest. I answer from your live profile — your languages, missions, and settings — so you get personal help, not a wiki. If something is too tricky for me, a human moderator picks it up from the review queue.';
}

function practiceAnswer(c: UserContext): string {
  const learning = c.learningLanguages;
  let body = 'Practice sessions are relaxed, real conversations — the best way to keep a language alive.';
  if (learning.length > 0) {
    const topics = c.conversationTopics.length > 0 ? `good threads from ${listOr('', c.conversationTopics)}` : 'a thread from your interests';
    body += `\n\nSince you are learning ${listOr('', learning)}, I would start with Global Buddy — they are the casual conversation peer. Open a session and steer it toward ${topics}; natives love a curious learner.`;
  } else {
    body += '\nYou have not listed a language you are learning yet — add one in Nest Settings and I can tailor sessions for you.';
  }
  return body;
}

function greetingAnswer(c: UserContext): string {
  return `Hello, ${c.displayName || c.name.split(' ')[0]}! Welcome to your nest. I am the Kakatua guardian bot — ask me about missions, your languages, settings, matchmaking, or practice sessions, and I will answer from your own profile.`;
}

function safetyHowToAnswer(): string {
  return 'You can flag a bird from their profile — the report lands in the Community Watch queue and a moderator reviews it before any action is taken. Guardians themselves are protected and cannot be reported or modified.\n\nIf you are reporting a specific incident right now, our moderators will pick this up from the queue and respond to you here.';
}

const INTENTS: IntentDef[] = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'yo', 'hi there', 'good morning', 'good evening', 'good afternoon', 'thanks', 'thank you'],
    minHits: 1,
    alwaysModerator: false,
    generate: greetingAnswer,
  },
  {
    id: 'missions',
    keywords: ['mission', 'missions', 'challenge', 'quest', 'task', 'xp', 'exp', 'reward', 'level', 'progress', 'daily', 'streak', 'claim'],
    minHits: 2,
    alwaysModerator: false,
    generate: missionsAnswer,
  },
  {
    id: 'languages',
    keywords: ['language', 'speak', 'learn', 'native', 'fluent', 'proficiency', 'practice', 'dialect', 'vocabulary', 'grammar', 'fluency'],
    minHits: 2,
    alwaysModerator: false,
    generate: languagesAnswer,
  },
  {
    id: 'settings',
    keywords: ['setting', 'settings', 'profile', 'photo', 'avatar', 'edit', 'change', 'update', 'privacy', 'username', 'display name', 'bio'],
    minHits: 2,
    alwaysModerator: false,
    generate: settingsAnswer,
  },
  {
    id: 'availability',
    keywords: ['available', 'availability', 'schedule', 'slot', 'timezone', 'time zone', 'calendar', 'free time', 'when'],
    minHits: 2,
    alwaysModerator: false,
    generate: availabilityAnswer,
  },
  {
    id: 'matchmaking',
    keywords: ['match', 'matchmaking', 'partner', 'pair', 'connect', 'friend', 'mentor', 'tutor', 'seeking', 'video call', 'call preference', 'find people'],
    minHits: 2,
    alwaysModerator: false,
    generate: matchmakingAnswer,
  },
  {
    id: 'activity',
    keywords: ['activity', 'feed', 'log', 'streak', 'history', 'last active', 'timeline', 'sessions'],
    minHits: 2,
    alwaysModerator: false,
    generate: activityAnswer,
  },
  {
    id: 'guardians',
    keywords: ['guardian', 'guide', 'buddy', 'bot', 'ask', 'support', 'who are you', 'who can help', 'help me'],
    minHits: 2,
    alwaysModerator: false,
    generate: guardianHelpAnswer,
  },
  {
    id: 'practice',
    keywords: ['practice', 'conversation', 'talk', 'chat', 'speak', 'session', 'coffee chat'],
    minHits: 2,
    alwaysModerator: false,
    generate: practiceAnswer,
  },
  {
    id: 'safety',
    keywords: ['report', 'block', 'safety', 'flag', 'harass', 'abuse', 'offensive', 'spam', 'scam', 'uncomfortable', 'danger', 'stolen'],
    minHits: 2,
    alwaysModerator: true,
    generate: () => '', // never reached — always routed to a human moderator
  },
  {
    id: 'technical',
    keywords: ['error', 'bug', 'broken', 'crash', 'fail', 'failed', 'cannot', "can't", 'login', 'sign in', 'password', 'verify', 'email not', 'payment', 'subscription', 'refund', 'install', 'download', '404', '500', 'server', 'not working', 'slow', 'stuck', 'issue'],
    minHits: 1,
    alwaysModerator: true,
    generate: () => '', // never reached — routed to moderator
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s'’-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreIntent(intent: IntentDef, text: string): number {
  let hits = 0;
  for (const kw of intent.keywords) {
    if (text.includes(kw)) hits += 1;
  }
  return hits;
}

export function answerFromContext(
  ctx: UserContext,
  opts: { type: string; subject: string; message: string; guardianRole: string | null }
): BotVerdict {
  const { type, subject, message, guardianRole } = opts;
  const text = normalize(`${subject} ${message}`);

  // Safety flags are always human-reviewed, even if the wording is polite.
  if (type === 'SAFETY_FLAG') {
    return { source: 'MODERATOR', answer: null, confidence: 0.3 };
  }

  // Too vague or under-keyworded to trust an automated answer.
  if (message.trim().length < 5) {
    return { source: 'MODERATOR', answer: null, confidence: 0.2 };
  }

  // Rank all intents; greetings only win when nothing more specific matches.
  const ranked = INTENTS.map((intent) => ({ intent, hits: scoreIntent(intent, text) }))
    .filter((r) => r.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  const specific = ranked.filter((r) => r.intent.id !== 'greeting' && r.hits >= r.intent.minHits);
  const best = specific[0] ?? ranked.find((r) => r.intent.id === 'greeting' && r.hits >= r.intent.minHits);

  if (!best) {
    return { source: 'MODERATOR', answer: null, confidence: 0.25 };
  }

  // Hard technical/support issues always route to a human.
  if (best.intent.alwaysModerator) {
    return { source: 'MODERATOR', answer: null, confidence: 0.55 };
  }

  const confidence = Math.min(0.97, SEED + best.hits * 0.09);
  return {
    source: 'BOT',
    answer: best.intent.generate(ctx, guardianRole, type),
    confidence: Math.round(confidence * 100) / 100,
  };
}
