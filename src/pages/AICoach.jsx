/**
 * AICoach.jsx
 * Rule-based coaching suggestions derived from the user's logged data and goals.
 * No external AI API is used — all logic runs locally in the browser.
 * The actual rule logic lives in src/utils/coachRules.js so it can be tested independently.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFoodEntries, getWaterLogs, getWeightLogs, getExerciseLogs, getGoals } from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { generateSuggestions } from '../utils/coachRules';
import { usePageTitle } from '../hooks/usePageTitle';

// Re-export so older test imports still work
export { generateSuggestions };

// Badge color class per suggestion type
const typeClass = {
  warning: 'suggestion-warning',
  info: 'suggestion-info',
  success: 'suggestion-success',
};

export default function AICoach() {
  usePageTitle('AI Coach');
  const { currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => { analyze(); }, []);

  async function analyze() {
    setLoading(true);
    setError('');
    try {
      const [foodEntries, waterLogs, weightLogs, exerciseLogs, goals] = await Promise.all([
        getFoodEntries(currentUser.uid),
        getWaterLogs(currentUser.uid),
        getWeightLogs(currentUser.uid),
        getExerciseLogs(currentUser.uid),
        getGoals(currentUser.uid),
      ]);

      setSuggestions(generateSuggestions({ foodEntries, waterLogs, weightLogs, exerciseLogs, goals }));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to load your coaching data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Coach</h1>
        <p className="text-muted">
          Personalized suggestions based on your logged data — no external AI, just smart rules.
        </p>
      </div>

      <ErrorMessage message={error} />

      <div className="coach-meta">
        <span className="coach-badge">Rule-Based · Privacy Friendly</span>
        {lastUpdated && <span className="text-muted">Last updated: {lastUpdated}</span>}
        <button className="btn btn-outline-primary btn-sm" onClick={analyze} disabled={loading}>
          Refresh Analysis
        </button>
      </div>

      <div className="suggestions-list">
        {suggestions.map((s) => (
          <div key={s.id} className={`suggestion-card ${typeClass[s.type]}`}>
            <h3 className="suggestion-title">{s.title}</h3>
            <p className="suggestion-message">{s.message}</p>
          </div>
        ))}
      </div>

      <div className="card coach-info">
        <h3>How Your AI Coach Works</h3>
        <ul>
          <li>Compares today's food log against your calorie and protein goals</li>
          <li>Checks your water intake against your daily water goal</li>
          <li>Analyzes the trend of your last weight entries</li>
          <li>Checks if you've logged exercise in the past 3 days</li>
        </ul>
        <p className="text-muted">
          Make sure your <Link to="/goals">Goals</Link> are set and you log daily for the best suggestions.
        </p>
      </div>
    </div>
  );
}
