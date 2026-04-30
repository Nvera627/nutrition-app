/**
 * FoodLog.jsx
 * Lets users add, edit, and delete food entries, water logs, and exercise logs.
 * Uses tab navigation to switch between the three log types.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addFoodEntry, getFoodEntries, updateFoodEntry, deleteFoodEntry,
  addWaterLog, getWaterLogs, updateWaterLog, deleteWaterLog,
  addExerciseLog, getExerciseLogs, updateExerciseLog, deleteExerciseLog,
} from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';

const TODAY = new Date().toISOString().split('T')[0];

// ─── Reusable confirm delete button ──────────────────────────────────────────
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
  return (
    <button className="btn btn-outline-danger btn-sm" onClick={() => setConfirm(true)}>
      Delete
    </button>
  );
}

// ─── Food Tab ─────────────────────────────────────────────────────────────────
function FoodTab({ userId }) {
  const { showToast } = useToast();
  const EMPTY = { date: TODAY, mealType: 'breakfast', foodName: '', calories: '', protein: '', carbs: '', fat: '' };
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setEntries(await getFoodEntries(userId)); }
    catch { setError('Failed to load food entries.'); }
    finally { setLoading(false); }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.foodName.trim()) return setError('Food name is required.');
    if (!form.calories || Number(form.calories) < 0) return setError('Enter a valid calorie count.');
    setSaving(true);
    try {
      const data = {
        date: form.date,
        mealType: form.mealType,
        foodName: form.foodName.trim(),
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
      };
      const wasEditing = !!editId;
      if (editId) {
        await updateFoodEntry(userId, editId, data);
      } else {
        await addFoodEntry(userId, data);
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
      showToast(wasEditing ? 'Food entry updated!' : 'Food entry added!');
    } catch {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(entry) {
    setEditId(entry.id);
    setForm({
      date: entry.date, mealType: entry.mealType, foodName: entry.foodName,
      calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditId(null); setForm(EMPTY); }

  async function handleDelete(id) {
    try { await deleteFoodEntry(userId, id); await load(); }
    catch { setError('Failed to delete entry.'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>{editId ? 'Edit Food Entry' : 'Add Food Entry'}</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="log-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Meal Type</label>
            <select name="mealType" className="form-control" value={form.mealType} onChange={handleChange}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Food Name</label>
          <input type="text" name="foodName" className="form-control" value={form.foodName} onChange={handleChange} placeholder="e.g. Grilled Chicken Breast" required />
        </div>
        <div className="form-row four-col">
          <div className="form-group">
            <label>Calories</label>
            <input type="number" name="calories" className="form-control" value={form.calories} onChange={handleChange} min="0" placeholder="kcal" />
          </div>
          <div className="form-group">
            <label>Protein (g)</label>
            <input type="number" name="protein" className="form-control" value={form.protein} onChange={handleChange} min="0" placeholder="g" />
          </div>
          <div className="form-group">
            <label>Carbs (g)</label>
            <input type="number" name="carbs" className="form-control" value={form.carbs} onChange={handleChange} min="0" placeholder="g" />
          </div>
          <div className="form-group">
            <label>Fat (g)</label>
            <input type="number" name="fat" className="form-control" value={form.fat} onChange={handleChange} min="0" placeholder="g" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update Entry' : 'Add Entry'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <h2 className="section-title">Food Log</h2>
      {entries.length === 0 ? (
        <p className="text-muted">No food entries yet. Add your first meal above!</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Meal</th><th>Food</th>
                <th>Cal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className={editId === entry.id ? 'row-editing' : ''}>
                  <td>{entry.date}</td>
                  <td><span className="meal-badge">{entry.mealType}</span></td>
                  <td>{entry.foodName}</td>
                  <td>{entry.calories}</td>
                  <td>{entry.protein}g</td>
                  <td>{entry.carbs}g</td>
                  <td>{entry.fat}g</td>
                  <td className="action-cell">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(entry)}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(entry.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Water Tab ────────────────────────────────────────────────────────────────
function WaterTab({ userId }) {
  const { showToast } = useToast();
  const EMPTY = { date: TODAY, ounces: '' };
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setLogs(await getWaterLogs(userId)); }
    catch { setError('Failed to load water logs.'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.ounces || Number(form.ounces) <= 0) return setError('Enter a valid amount in ounces.');
    setSaving(true);
    try {
      const data = { date: form.date, ounces: Number(form.ounces) };
      const wasEditing = !!editId;
      if (editId) { await updateWaterLog(userId, editId, data); }
      else { await addWaterLog(userId, data); }
      setForm(EMPTY); setEditId(null); await load();
      showToast(wasEditing ? 'Water log updated!' : 'Water logged!');
    } catch { setError('Failed to save log.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteWaterLog(userId, id); await load(); }
    catch { setError('Failed to delete log.'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>{editId ? 'Edit Water Log' : 'Log Water'}</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="log-form compact-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" className="form-control" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Ounces</label>
            <input type="number" name="ounces" className="form-control" value={form.ounces} onChange={(e) => setForm((f) => ({ ...f, ounces: e.target.value }))} min="1" placeholder="oz" required />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Log Water'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <h2 className="section-title">Water History</h2>
      {logs.length === 0 ? <p className="text-muted">No water logs yet.</p> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Ounces</th><th>Actions</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td><td>{log.ounces} oz</td>
                  <td className="action-cell">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => { setEditId(log.id); setForm({ date: log.date, ounces: log.ounces }); }}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(log.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Exercise Tab ─────────────────────────────────────────────────────────────
function ExerciseTab({ userId }) {
  const { showToast } = useToast();
  const EMPTY = { date: TODAY, activity: '', minutes: '', caloriesBurned: '' };
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setLogs(await getExerciseLogs(userId)); }
    catch { setError('Failed to load exercise logs.'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.activity.trim()) return setError('Activity name is required.');
    if (!form.minutes || Number(form.minutes) <= 0) return setError('Enter a valid duration.');
    setSaving(true);
    try {
      const data = { date: form.date, activity: form.activity.trim(), minutes: Number(form.minutes), caloriesBurned: Number(form.caloriesBurned) || 0 };
      const wasEditing = !!editId;
      if (editId) { await updateExerciseLog(userId, editId, data); }
      else { await addExerciseLog(userId, data); }
      setForm(EMPTY); setEditId(null); await load();
      showToast(wasEditing ? 'Exercise updated!' : 'Exercise logged!');
    } catch { setError('Failed to save log.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteExerciseLog(userId, id); await load(); }
    catch { setError('Failed to delete log.'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>{editId ? 'Edit Exercise Log' : 'Log Exercise'}</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="log-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" className="form-control" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Activity</label>
            <input type="text" name="activity" className="form-control" value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="e.g. Running" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" name="minutes" className="form-control" value={form.minutes} onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))} min="1" placeholder="minutes" />
          </div>
          <div className="form-group">
            <label>Calories Burned</label>
            <input type="number" name="caloriesBurned" className="form-control" value={form.caloriesBurned} onChange={(e) => setForm((f) => ({ ...f, caloriesBurned: e.target.value }))} min="0" placeholder="kcal" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Log Exercise'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <h2 className="section-title">Exercise History</h2>
      {logs.length === 0 ? <p className="text-muted">No exercise logs yet.</p> : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Activity</th><th>Minutes</th><th>Cal Burned</th><th>Actions</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td><td>{log.activity}</td><td>{log.minutes} min</td><td>{log.caloriesBurned}</td>
                  <td className="action-cell">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => { setEditId(log.id); setForm({ date: log.date, activity: log.activity, minutes: log.minutes, caloriesBurned: log.caloriesBurned }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                    <DeleteButton onDelete={() => handleDelete(log.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main FoodLog Component ───────────────────────────────────────────────────
export default function FoodLog() {
  usePageTitle('Food Log');
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('food');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Log Your Activity</h1>
        <p className="text-muted">Track food, water, and exercise</p>
      </div>

      <div className="tabs">
        {[['food', '🍽️ Food'], ['water', '💧 Water'], ['exercise', '🏃 Exercise']].map(([key, label]) => (
          <button
            key={key}
            className={`tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === 'food' && <FoodTab userId={currentUser.uid} />}
        {tab === 'water' && <WaterTab userId={currentUser.uid} />}
        {tab === 'exercise' && <ExerciseTab userId={currentUser.uid} />}
      </div>
    </div>
  );
}
