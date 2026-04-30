/**
 * aicoach.test.js
 * Tests for the rule-based generateSuggestions function in AICoach.jsx.
 * No Firebase or browser APIs are needed — pure logic tests.
 */

import { describe, it, expect } from 'vitest';
// Import from the pure utility — no Firebase or React deps, so no mocking needed
import { generateSuggestions } from '../src/utils/coachRules';

// Helper: build a food entry for today
function foodEntry(calories, protein, carbs = 0, fat = 0) {
  const today = new Date().toISOString().split('T')[0];
  return { date: today, calories, protein, carbs, fat };
}

// Helper: build a water log for today
function waterLog(ounces) {
  const today = new Date().toISOString().split('T')[0];
  return { date: today, ounces };
}

// Helper: build a weight log N days ago
function weightLog(weight, daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { date: d.toISOString().split('T')[0], weight };
}

// Helper: build an exercise log N days ago
function exerciseLog(minutes, daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { date: d.toISOString().split('T')[0], minutes, activity: 'Running', caloriesBurned: 200 };
}

const defaultGoals = {
  calorieGoal: 2000,
  proteinGoal: 150,
  carbGoal: 250,
  fatGoal: 65,
  waterGoal: 64,
  weightGoal: 170,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('generateSuggestions', () => {
  it('returns a "set goals" suggestion when no goals are provided', () => {
    const result = generateSuggestions({
      foodEntries: [], waterLogs: [], weightLogs: [], exerciseLogs: [], goals: null,
    });
    expect(result[0].id).toBe('no-goals');
  });

  it('warns when calories exceed the daily goal', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(2500, 120)],
      waterLogs: [waterLog(70)],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('over-calories');
  });

  it('warns when approaching (>90%) the calorie goal', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1850, 120)], // 92.5% of 2000
      waterLogs: [waterLog(70)],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('near-calories');
    expect(ids).not.toContain('over-calories');
  });

  it('warns when protein is below 50% of the goal', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1500, 60)], // 60/150 = 40%
      waterLogs: [waterLog(70)],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('low-protein');
  });

  it('does NOT warn about protein when intake is at or above 50%', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1500, 80)], // 80/150 > 50%
      waterLogs: [waterLog(70)],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).not.toContain('low-protein');
  });

  it('warns when water intake is below 50% of the goal', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1500, 100)],
      waterLogs: [waterLog(20)], // 20/64 = 31%
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('low-water');
  });

  it('celebrates when water goal is met', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1500, 100)],
      waterLogs: [waterLog(64)], // exactly at goal
      weightLogs: [],
      exerciseLogs: [exerciseLog(30)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('water-goal-met');
  });

  it('suggests exercise when no activity has been logged in 3 days', () => {
    const result = generateSuggestions({
      foodEntries: [],
      waterLogs: [],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30, 5)], // last exercise was 5 days ago
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('exercise-streak');
  });

  it('praises exercise consistency when 4+ sessions in the last 7 days', () => {
    const result = generateSuggestions({
      foodEntries: [],
      waterLogs: [],
      weightLogs: [],
      exerciseLogs: [
        exerciseLog(30, 0),
        exerciseLog(30, 1),
        exerciseLog(30, 2),
        exerciseLog(30, 4),
      ],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('exercise-great');
  });

  it('praises a downward weight trend toward the goal', () => {
    const result = generateSuggestions({
      foodEntries: [],
      waterLogs: [],
      weightLogs: [
        weightLog(175, 0),  // most recent (today)
        weightLog(177, 3),
        weightLog(180, 7),
      ],
      exerciseLogs: [exerciseLog(30)],
      goals: { ...defaultGoals, weightGoal: 170 },
    });
    const ids = result.map((s) => s.id);
    expect(ids).toContain('weight-trend-good');
  });

  it('returns an all-good message when everything looks great', () => {
    const result = generateSuggestions({
      foodEntries: [foodEntry(1500, 100)],
      waterLogs: [waterLog(64)],
      weightLogs: [],
      exerciseLogs: [exerciseLog(30, 0)],
      goals: defaultGoals,
    });
    const ids = result.map((s) => s.id);
    // Should have water-goal-met but NOT any warnings
    expect(ids).not.toContain('over-calories');
    expect(ids).not.toContain('low-protein');
    expect(ids).not.toContain('low-water');
  });
});
