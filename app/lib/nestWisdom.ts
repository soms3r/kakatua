// Wisdom from the Flock (app/lib/nestWisdom.ts)
// A rotating deck of inspirational quotes — prioritising renowned Bengali voices
// (Rabindranath Tagore, Kazi Nazrul Islam, Humayun Ahmed) woven together with
// global thinkers. The quote of the day is chosen deterministically so it stays
// stable for a given calendar day but changes as the flock wakes up tomorrow.

export interface WisdomQuote {
  text: string;
  author: string;
  attribution: string;
}

export const WISDOM_QUOTES: WisdomQuote[] = [
  {
    text: "Faith is the bird that feels the light and sings when the dawn is still dark.",
    author: 'Rabindranath Tagore',
    attribution: 'Poet · Bengal',
  },
  {
    text: "You can't cross the sea merely by standing and staring at the water.",
    author: 'Rabindranath Tagore',
    attribution: 'Poet · Bengal',
  },
  {
    text: "Let me not pray to be sheltered from dangers, but to be fearless in facing them.",
    author: 'Rabindranath Tagore',
    attribution: 'Poet · Bengal',
  },
  {
    text: "If you cry because the sun has gone out of your life, your tears will prevent you from seeing the stars.",
    author: 'Rabindranath Tagore',
    attribution: 'Poet · Bengal',
  },
  {
    text: "The butterfly counts not months but moments, and has time enough.",
    author: 'Rabindranath Tagore',
    attribution: 'Writer · Fireflies',
  },
  {
    text: "I sing the song of equality, where the low and the high, the singer and the beggar, all stand as one.",
    author: 'Kazi Nazrul Islam',
    attribution: 'National Poet · Bangladesh',
  },
  {
    text: "I am the rebel eternal — I raise my head beyond this world!",
    author: 'Kazi Nazrul Islam',
    attribution: 'The Rebel · Bidrohi',
  },
  {
    text: "Life is beautiful, however difficult it may seem.",
    author: 'Humayun Ahmed',
    attribution: 'Writer & Filmmaker · Bangladesh',
  },
  {
    text: "The greatest lesson in life is to see every person as a human being first.",
    author: 'Humayun Ahmed',
    attribution: 'Writer & Filmmaker · Bangladesh',
  },
  {
    text: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
    author: 'Maya Angelou',
    attribution: 'Poet · Global',
  },
  {
    text: "The wound is the place where the Light enters you.",
    author: 'Rumi',
    attribution: 'Poet · Global',
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: 'Lao Tzu',
    attribution: 'Philosopher · Global',
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: 'Aristotle',
    attribution: 'Philosopher · Global',
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: 'Mahatma Gandhi',
    attribution: 'Thinker · Global',
  },
  {
    text: "It always seems impossible until it is done.",
    author: 'Nelson Mandela',
    attribution: 'Leader · Global',
  },
  {
    text: "Alone we can do so little; together we can do so much.",
    author: 'Helen Keller',
    attribution: 'Activist · Global',
  },
];

// Deterministic quote-of-the-day: stable for a calendar day, fresh the next.
export function getDailyWisdom(now: Date = new Date()): WisdomQuote {
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return WISDOM_QUOTES[dayOfYear % WISDOM_QUOTES.length];
}
