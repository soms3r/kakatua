// Shared consecutive-day streak helper (app/actions/streak.ts)
// Plain server-side module (no 'use server') — imported only by server actions.

export function dayKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function computeStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates.map(dayKey)));
  const todayStr = dayKey(new Date());
  const yesterdayStr = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let streak = 0;
  let checkDate: Date;
  if (uniqueDates[0] === todayStr) {
    streak = 1;
    checkDate = new Date();
  } else if (uniqueDates[0] === yesterdayStr) {
    streak = 1;
    checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else {
    return 0;
  }

  const set = new Set(uniqueDates);
  for (let i = 1; i < 365; i++) {
    const prevKey = dayKey(new Date(checkDate.getTime() - i * 24 * 60 * 60 * 1000));
    if (set.has(prevKey)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
