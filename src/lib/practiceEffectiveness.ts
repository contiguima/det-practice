import { loadFitbStats } from "@/lib/fillInTheBlanks/stats";
import { loadHomePracticeStats } from "@/lib/homePracticeStats";

export type PracticeEffectiveness = {
  percent: number;
  totalScored: number;
  totalCorrect: number;
  hasData: boolean;
  sources: {
    homePracticeAttempts: number;
    fillInTheBlanksChecks: number;
  };
};

/** Aggregate correctness across all scorable Practicar exercises (localStorage). */
export function loadPracticeEffectiveness(): PracticeEffectiveness {
  const home = loadHomePracticeStats();
  const fitb = loadFitbStats();

  let totalCorrect = home.totalCorrect;
  let totalScored = home.totalCorrect + home.totalWrong;
  let fitbChecks = 0;

  for (const r of Object.values(fitb.results)) {
    const attempts = Math.max(0, r.attempts);
    if (attempts === 0) continue;

    if (r.maxScore != null && r.maxScore > 0 && r.score != null) {
      totalCorrect += Math.max(0, r.score);
      totalScored += r.maxScore;
      fitbChecks += 1;
    } else {
      totalScored += attempts;
      if (r.correct) totalCorrect += attempts;
      else fitbChecks += attempts;
    }
  }

  const hasData = totalScored > 0;
  const percent = hasData ? Math.round((totalCorrect / totalScored) * 100) : 0;

  return {
    percent,
    totalScored,
    totalCorrect,
    hasData,
    sources: {
      homePracticeAttempts: home.totalCorrect + home.totalWrong,
      fillInTheBlanksChecks: fitbChecks,
    },
  };
}
