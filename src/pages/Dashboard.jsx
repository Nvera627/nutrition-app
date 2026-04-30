/**
 * Dashboard.jsx
 * Shows a summary of the user's logged data for today.
 * Cards shown are controlled by the user's dashboard settings.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getFoodEntries,
  getWaterLogs,
  getWeightLogs,
  getExerciseLogs,
  getGoals,
  getDashboardSettings,
} from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { usePageTitle } from '../hooks/usePageTitle';

// Returns today's date as "YYYY-MM-DD"
function today() {
  return new Date().toISOString().split('T')[0];
}

// Sums all entries that match today's date for a numeric field
function sumToday(entries, field) {
  return entries
    .filter((e) => e.date === today())
    .reduce((acc, e) => acc + (Number(e[field]) || 0), 0);
}

// Simple progress bar component
function ProgressBar({ value, max, color = '#40916c' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// Individual summary card
function SummaryCard({ title, children }) {
  return (
    <div className="card summary-card">
      <h3 className="card-title">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { currentUser } = useAuth();

  const [foodEntries, setFoodEntries] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [goals, setGoals] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [food, water, weight, exercise, g, s] = await Promise.all([
          getFoodEntries(currentUser.uid),
          getWaterLogs(currentUser.uid),
          getWeightLogs(currentUser.uid),
          getExerciseLogs(currentUser.uid),
          getGoals(currentUser.uid),
          getDashboardSettings(currentUser.uid),
        ]);
        setFoodEntries(food);
        setWaterLogs(water);
        setWeightLogs(weight);
        setExerciseLogs(exercise);
        setGoals(g);
        setSettings(s);
      } catch {
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser.uid]);

  if (loading) return <LoadingSpinner />;

  // Today's totals
  const calories = sumToday(foodEntries, 'calories');
  const protein = sumToday(foodEntries, 'protein');
  const carbs = sumToday(foodEntries, 'carbs');
  const fat = sumToday(foodEntries, 'fat');
  const water = sumToday(waterLogs, 'ounces');
  const exercise = exerciseLogs.filter((e) => e.date === today());
  const exerciseMinutes = exercise.reduce((a, e) => a + (Number(e.minutes) || 0), 0);
  const caloriesBurned = exercise.reduce((a, e) => a + (Number(e.caloriesBurned) || 0), 0);

  // Most recent weight entry
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : null;

  const calorieGoal = goals?.calorieGoal || 2000;
  const waterGoal = goals?.waterGoal || 64;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Good {getGreeting()}, {currentUser.displayName || 'there'}!</h1>
        <p className="text-muted">Here's your summary for {formatDate(today())}</p>
      </div>

      <ErrorMessage message={error} />

      {!goals && (
        <div className="alert alert-info">
          You haven't set your health goals yet.{' '}
          <Link to="/goals">Set your goals →</Link>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Calories card */}
        {settings?.showCalories !== false && (
          <SummaryCard title="🔥 Calories">
            <p className="stat-big">{calories} <span className="stat-unit">/ {calorieGoal} kcal</span></p>
            <ProgressBar
              value={calories}
              max={calorieGoal}
              color={calories > calorieGoal ? '#dc3545' : '#40916c'}
            />
            <p className="stat-sub">{Math.max(0, calorieGoal - calories)} kcal remaining</p>
          </SummaryCard>
        )}

        {/* Macros card */}
        {settings?.showMacros !== false && (
          <SummaryCard title="🥩 Macros Today">
            <div className="macro-row">
              <span>Protein</span>
              <span>{protein}g / {goals?.proteinGoal || '—'}g</span>
            </div>
            <ProgressBar value={protein} max={goals?.proteinGoal || 150} color="#52b788" />
            <div className="macro-row">
              <span>Carbs</span>
              <span>{carbs}g / {goals?.carbGoal || '—'}g</span>
            </div>
            <ProgressBar value={carbs} max={goals?.carbGoal || 250} color="#ffc107" />
            <div className="macro-row">
              <span>Fat</span>
              <span>{fat}g / {goals?.fatGoal || '—'}g</span>
            </div>
            <ProgressBar value={fat} max={goals?.fatGoal || 65} color="#fd7e14" />
          </SummaryCard>
        )}

        {/* Water card */}
        {settings?.showWater !== false && (
          <SummaryCard title="💧 Water">
            <p className="stat-big">{water} <span className="stat-unit">/ {waterGoal} oz</span></p>
            <ProgressBar value={water} max={waterGoal} color="#0d6efd" />
            <p className="stat-sub">{Math.max(0, waterGoal - water)} oz remaining</p>
          </SummaryCard>
        )}

        {/* Weight card */}
        {settings?.showWeight !== false && (
          <SummaryCard title="⚖️ Weight">
            {latestWeight ? (
              <>
                <p className="stat-big">{latestWeight} <span className="stat-unit">lbs</span></p>
                {goals?.weightGoal && (
                  <p className="stat-sub">
                    Goal: {goals.weightGoal} lbs · {Math.abs(latestWeight - goals.weightGoal).toFixed(1)} lbs to go
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted">No weight logged yet. <Link to="/progress">Log weight →</Link></p>
            )}
          </SummaryCard>
        )}

        {/* Exercise card */}
        {settings?.showExercise !== false && (
          <SummaryCard title="🏃 Exercise Today">
            {exercise.length > 0 ? (
              <>
                <p className="stat-big">{exerciseMinutes} <span className="stat-unit">min</span></p>
                <p className="stat-sub">{caloriesBurned} kcal burned · {exercise.length} session{exercise.length > 1 ? 's' : ''}</p>
              </>
            ) : (
              <p className="text-muted">No exercise logged today. <Link to="/food-log">Log exercise →</Link></p>
            )}
          </SummaryCard>
        )}
      </div>

      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          <Link to="/food-log" className="quick-link-card">+ Log Food</Link>
          <Link to="/food-log#water" className="quick-link-card">+ Log Water</Link>
          <Link to="/progress" className="quick-link-card">+ Log Weight</Link>
          <Link to="/food-log#exercise" className="quick-link-card">+ Log Exercise</Link>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
