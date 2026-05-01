/**
 * Progress.jsx
 * Shows charts for weekly calories, water, weight, and exercise.
 * Also allows logging weight from this page.
 */

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import {
  getFoodEntries,
  getWaterLogs,
  getWeightLogs,
  getExerciseLogs,
  addWeightLog,
  updateWeightLog,
  deleteWeightLog,
} from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TODAY = new Date().toISOString().split('T')[0];

// Build an array of the last N days as "YYYY-MM-DD" strings
function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// Short weekday label from "YYYY-MM-DD"
function shortDay(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

// Sum a numeric field across all entries for a given date
function sumForDate(entries, date, field) {
  return entries
    .filter((e) => e.date === date)
    .reduce((acc, e) => acc + (Number(e[field]) || 0), 0);
}

// Delete confirm button
function DeleteButton({ onDelete }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>Confirm</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
      </>
    );
  }
  return <button className="btn btn-outline-danger btn-sm" onClick={() => setConfirm(true)}>Delete</button>;
}

export default function Progress() {
  usePageTitle('Progress');
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [foodEntries, setFoodEntries] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Weight form state
  const [weightForm, setWeightForm] = useState({ date: TODAY, weight: '' });
  const [editWeightId, setEditWeightId] = useState(null);
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => { loadAll(); }, [currentUser.uid]);

  async function loadAll() {
    setLoading(true);
    try {
      const [food, water, weight, exercise] = await Promise.all([
        getFoodEntries(currentUser.uid),
        getWaterLogs(currentUser.uid),
        getWeightLogs(currentUser.uid),
        getExerciseLogs(currentUser.uid),
      ]);
      setFoodEntries(food);
      setWaterLogs(water);
      setWeightLogs(weight);
      setExerciseLogs(exercise);
    } catch {
      setError('Failed to load progress data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleWeightSubmit(e) {
    e.preventDefault();
    setError('');
    if (!weightForm.weight || Number(weightForm.weight) <= 0) return setError('Enter a valid weight.');
    setSavingWeight(true);
    try {
      const data = { date: weightForm.date, weight: Number(weightForm.weight) };
      if (editWeightId) { await updateWeightLog(currentUser.uid, editWeightId, data); }
      else { await addWeightLog(currentUser.uid, data); }
      setWeightForm({ date: TODAY, weight: '' });
      setEditWeightId(null);
      await loadAll();
      showToast(editWeightId ? 'Weight entry updated!' : 'Weight logged!');
    } catch { setError('Failed to save weight.'); }
    finally { setSavingWeight(false); }
  }

  async function handleDeleteWeight(id) {
    try { await deleteWeightLog(currentUser.uid, id); await loadAll(); }
    catch { setError('Failed to delete weight entry.'); }
  }

  if (loading) return <LoadingSpinner />;

  const last7 = getLastNDays(7);

  // Build chart datasets
  const calorieData = last7.map((date) => ({
    day: shortDay(date),
    Calories: sumForDate(foodEntries, date, 'calories'),
  }));

  const waterData = last7.map((date) => ({
    day: shortDay(date),
    'Water (oz)': sumForDate(waterLogs, date, 'ounces'),
  }));

  const exerciseData = last7.map((date) => ({
    day: shortDay(date),
    Minutes: sumForDate(exerciseLogs, date, 'minutes'),
  }));

  // Weight chart — last 14 entries sorted oldest → newest
  const weightChartData = [...weightLogs]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(-14)
    .map((entry) => ({ date: entry.date, 'Weight (lbs)': entry.weight }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress Charts</h1>
        <p className="text-muted">Visualize your last 7 days of activity</p>
      </div>

      <ErrorMessage message={error} />

      {/* ── Charts ─────────────────────────────────────────────────── */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h3>🔥 Calories (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Calories" fill="#40916c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>💧 Water Intake (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Water (oz)" fill="#0d6efd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>🏃 Exercise Minutes (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Minutes" fill="#fd7e14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>⚖️ Weight Trend</h3>
          {weightChartData.length < 2 ? (
            <p className="text-muted chart-empty">Log at least 2 weight entries to see your trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Weight (lbs)"
                  stroke="#6f42c1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Weight Logger ───────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>{editWeightId ? 'Edit Weight Entry' : 'Log Weight'}</h2>
        <form onSubmit={handleWeightSubmit} className="log-form compact-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={weightForm.date}
                onChange={(e) => setWeightForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Weight (lbs)</label>
              <input
                type="number"
                className="form-control"
                value={weightForm.weight}
                onChange={(e) => setWeightForm((f) => ({ ...f, weight: e.target.value }))}
                min="50"
                max="700"
                step="0.1"
                placeholder="e.g. 175.5"
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingWeight}>
              {savingWeight ? 'Saving…' : editWeightId ? 'Update' : 'Log Weight'}
            </button>
            {editWeightId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditWeightId(null); setWeightForm({ date: TODAY, weight: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="section-title">Weight History</h3>
        {weightLogs.length === 0 ? (
          <p className="text-muted">No weight entries yet. Log your first one above!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Weight</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {weightLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{log.weight} lbs</td>
                    <td className="action-cell">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => { setEditWeightId(log.id); setWeightForm({ date: log.date, weight: log.weight }); }}
                      >
                        Edit
                      </button>
                      <DeleteButton onDelete={() => handleDeleteWeight(log.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
