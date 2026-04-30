/**
 * Goals.jsx
 * Lets users set daily nutrition goals and a long-term weight goal.
 * Data is saved to Firestore as users/{uid}/goals/current.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGoals, setGoals } from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';

const DEFAULTS = {
  calorieGoal: 2000,
  proteinGoal: 150,
  carbGoal: 250,
  fatGoal: 65,
  waterGoal: 64,
  weightGoal: '',
};

export default function Goals() {
  usePageTitle('Goals');
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const g = await getGoals(currentUser.uid);
        if (g) setForm({ ...DEFAULTS, ...g });
      } catch {
        setError('Failed to load your goals.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser.uid]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic validation
    if (Number(form.calorieGoal) < 500) return setError('Calorie goal must be at least 500.');
    if (Number(form.proteinGoal) < 0) return setError('Protein goal cannot be negative.');
    if (Number(form.waterGoal) < 8) return setError('Water goal must be at least 8 oz.');

    setSaving(true);
    try {
      await setGoals(currentUser.uid, {
        calorieGoal: Number(form.calorieGoal),
        proteinGoal: Number(form.proteinGoal),
        carbGoal: Number(form.carbGoal),
        fatGoal: Number(form.fatGoal),
        waterGoal: Number(form.waterGoal),
        weightGoal: form.weightGoal ? Number(form.weightGoal) : null,
      });
      showToast('Goals saved!');
    } catch {
      setError('Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Health Goals</h1>
        <p className="text-muted">Set your daily targets and long-term goals</p>
      </div>

      <ErrorMessage message={error} />

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Daily Nutrition Goals */}
          <section className="goals-section">
            <h2>Daily Nutrition Goals</h2>
            <p className="text-muted">These are the daily targets shown on your dashboard and used by the AI Coach.</p>

            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="calorieGoal">Daily Calories (kcal)</label>
                <input id="calorieGoal" type="number" name="calorieGoal" className="form-control" value={form.calorieGoal} onChange={handleChange} min="500" max="10000" required />
                <small className="form-hint">Typical range: 1,500–3,000 kcal</small>
              </div>
              <div className="form-group">
                <label htmlFor="waterGoal">Daily Water (oz)</label>
                <input id="waterGoal" type="number" name="waterGoal" className="form-control" value={form.waterGoal} onChange={handleChange} min="8" max="300" required />
                <small className="form-hint">64 oz = 8 cups (recommended)</small>
              </div>
            </div>

            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="proteinGoal">Protein (g)</label>
                <input id="proteinGoal" type="number" name="proteinGoal" className="form-control" value={form.proteinGoal} onChange={handleChange} min="0" max="500" required />
              </div>
              <div className="form-group">
                <label htmlFor="carbGoal">Carbohydrates (g)</label>
                <input id="carbGoal" type="number" name="carbGoal" className="form-control" value={form.carbGoal} onChange={handleChange} min="0" max="1000" required />
              </div>
              <div className="form-group">
                <label htmlFor="fatGoal">Fat (g)</label>
                <input id="fatGoal" type="number" name="fatGoal" className="form-control" value={form.fatGoal} onChange={handleChange} min="0" max="500" required />
              </div>
            </div>
          </section>

          {/* Long-Term Weight Goal */}
          <section className="goals-section">
            <h2>Weight Goal</h2>
            <p className="text-muted">Enter the weight you're working toward (optional).</p>
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="weightGoal">Target Weight (lbs)</label>
                <input id="weightGoal" type="number" name="weightGoal" className="form-control" value={form.weightGoal} onChange={handleChange} min="50" max="700" placeholder="e.g. 170" />
              </div>
            </div>
          </section>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save Goals'}
          </button>
        </form>
      </div>

      {/* Reference card */}
      <div className="card goals-reference">
        <h3>📘 Goal Reference Guide</h3>
        <ul>
          <li><strong>Calories:</strong> 1,200–1,500 kcal for weight loss · 2,000–2,500 for maintenance · 2,500+ for muscle gain</li>
          <li><strong>Protein:</strong> 0.7–1g per lb of body weight is a common target for active people</li>
          <li><strong>Carbs:</strong> 45–65% of total calories (225–325g on a 2,000 kcal diet)</li>
          <li><strong>Fat:</strong> 20–35% of total calories (44–78g on a 2,000 kcal diet)</li>
          <li><strong>Water:</strong> The general recommendation is 64 oz (8 cups) per day</li>
        </ul>
        <p className="text-muted goals-disclaimer">
          This app is a tracking tool, not medical advice. Consult a healthcare provider for personalized recommendations.
        </p>
      </div>
    </div>
  );
}
