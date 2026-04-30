/**
 * coachRules.js
 * Pure rule-based coaching logic. No Firebase or React imports — safe to test in isolation.
 */

// Returns "YYYY-MM-DD" for N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Sum a numeric field for all entries on a specific date
function sumForDate(entries, date, field) {
  return entries
    .filter((e) => e.date === date)
    .reduce((acc, e) => acc + (Number(e[field]) || 0), 0);
}

/**
 * generateSuggestions
 * Compares the user's logged data against their goals and returns coaching cards.
 * @returns {{ id: string, type: 'warning'|'info'|'success', title: string, message: string }[]}
 */
export function generateSuggestions({ foodEntries, waterLogs, weightLogs, exerciseLogs, goals }) {
  const TODAY = new Date().toISOString().split('T')[0];

  if (!goals) {
    return [{
      id: 'no-goals',
      type: 'info',
      title: 'Set Your Goals First',
      message: 'Head over to the Goals page to set your daily targets. Your AI Coach will give personalized suggestions once you have goals.',
    }];
  }

  const suggestions = [];

  const todayCalories = sumForDate(foodEntries, TODAY, 'calories');
  const todayProtein = sumForDate(foodEntries, TODAY, 'protein');
  const todayWater = sumForDate(waterLogs, TODAY, 'ounces');

  const { calorieGoal = 2000, proteinGoal = 150, waterGoal = 64 } = goals;

  // ── Calorie rules ──────────────────────────────────────────────────────────
  if (todayCalories > calorieGoal) {
    suggestions.push({
      id: 'over-calories',
      type: 'warning',
      title: '⚠️ Calorie Goal Exceeded',
      message: `You've logged ${todayCalories} kcal today, which is ${todayCalories - calorieGoal} kcal over your goal of ${calorieGoal} kcal. Consider lighter meals or a walk to balance things out.`,
    });
  } else if (todayCalories > calorieGoal * 0.9) {
    suggestions.push({
      id: 'near-calories',
      type: 'info',
      title: '🟡 Approaching Your Calorie Goal',
      message: `You're at ${todayCalories} kcal — only ${calorieGoal - todayCalories} kcal away from your goal of ${calorieGoal} kcal. Be mindful of your next meal or snack.`,
    });
  }

  // ── Protein rule ───────────────────────────────────────────────────────────
  const proteinPct = proteinGoal > 0 ? todayProtein / proteinGoal : 1;
  if (proteinPct < 0.5) {
    suggestions.push({
      id: 'low-protein',
      type: 'warning',
      title: '🥩 Low Protein Intake',
      message: `You've only hit ${todayProtein}g of protein today (goal: ${proteinGoal}g). Try adding eggs, Greek yogurt, chicken, or a protein shake to your next meal.`,
    });
  }

  // ── Water rule ─────────────────────────────────────────────────────────────
  const waterPct = waterGoal > 0 ? todayWater / waterGoal : 1;
  if (waterPct < 0.5) {
    suggestions.push({
      id: 'low-water',
      type: 'warning',
      title: '💧 Drink More Water',
      message: `You've logged only ${todayWater} oz of water today (goal: ${waterGoal} oz). Staying hydrated improves energy, focus, and metabolism.`,
    });
  } else if (waterPct >= 1) {
    suggestions.push({
      id: 'water-goal-met',
      type: 'success',
      title: '💧 Water Goal Reached!',
      message: `Great job! You've hit your water goal of ${waterGoal} oz today. Keep it up!`,
    });
  }

  // ── Weight trend rule ──────────────────────────────────────────────────────
  if (weightLogs.length >= 3 && goals.weightGoal) {
    const sorted = [...weightLogs].sort((a, b) => (a.date > b.date ? -1 : 1));
    const recent = sorted[0]?.weight;
    const older = sorted[2]?.weight;
    const goalWeight = Number(goals.weightGoal);

    if (recent && older) {
      const trending = recent < older;
      const needsLoss = recent > goalWeight;

      if (trending && needsLoss) {
        suggestions.push({
          id: 'weight-trend-good',
          type: 'success',
          title: '📉 Great Weight Trend!',
          message: `Your weight has dropped from ${older} lbs to ${recent} lbs over your last few entries. You're making progress toward your goal of ${goalWeight} lbs — keep it up!`,
        });
      } else if (!trending && needsLoss) {
        suggestions.push({
          id: 'weight-trend-stall',
          type: 'info',
          title: '⚖️ Weight is Holding Steady',
          message: `Your weight hasn't decreased recently. If your goal is to reach ${goalWeight} lbs, consider reviewing your calorie intake or increasing activity.`,
        });
      }
    }
  }

  // ── Exercise consistency rule ──────────────────────────────────────────────
  const last3Days = [TODAY, daysAgo(1), daysAgo(2), daysAgo(3)];
  const exercisedRecently = exerciseLogs.some((e) => last3Days.includes(e.date));

  if (!exercisedRecently && exerciseLogs.length > 0) {
    suggestions.push({
      id: 'exercise-streak',
      type: 'info',
      title: '🏃 Time to Move!',
      message: "You haven't logged any exercise in the past 3 days. Even a 20-minute walk can improve your energy and support your goals. You've got this!",
    });
  } else if (exercisedRecently) {
    const recentSessions = exerciseLogs.filter((e) => e.date >= daysAgo(7));
    if (recentSessions.length >= 4) {
      suggestions.push({
        id: 'exercise-great',
        type: 'success',
        title: '🏅 Exercise Consistency is Excellent!',
        message: `You've logged ${recentSessions.length} exercise sessions in the past 7 days. Your consistency is paying off — keep going!`,
      });
    }
  }

  // ── All good message ───────────────────────────────────────────────────────
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'all-good',
      type: 'success',
      title: "✅ You're on Track!",
      message: "Everything looks great today. Keep up the excellent habits and log your meals to stay on target.",
    });
  }

  return suggestions;
}
