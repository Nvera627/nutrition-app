/**
 * Profile.jsx
 * Shows account info and lets users customize their dashboard card layout.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSettings, setDashboardSettings, getUserProfile } from '../firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  usePageTitle('Profile');
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [p, s] = await Promise.all([
          getUserProfile(currentUser.uid),
          getDashboardSettings(currentUser.uid),
        ]);
        setProfile(p);
        setSettings(s);
      } catch {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser.uid]);

  function handleToggle(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError('');
    try {
      await setDashboardSettings(currentUser.uid, settings);
      showToast('Dashboard preferences saved!');
    } catch {
      setError('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const cardOptions = [
    { key: 'showCalories', label: '🔥 Calories Card' },
    { key: 'showMacros', label: '🥩 Macros Card' },
    { key: 'showWater', label: '💧 Water Card' },
    { key: 'showWeight', label: '⚖️ Weight Card' },
    { key: 'showExercise', label: '🏃 Exercise Card' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile &amp; Settings</h1>
        <p className="text-muted">Manage your account and dashboard preferences</p>
      </div>

      <ErrorMessage message={error} />

      {/* Account Info */}
      <div className="card">
        <h2>Account Info</h2>
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-label">Username</span>
            <span className="profile-value">{currentUser.displayName || profile?.username || '—'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-label">Email</span>
            <span className="profile-value">{currentUser.email}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-label">Member Since</span>
            <span className="profile-value">
              {profile?.createdAt?.toDate
                ? profile.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Customization */}
      {settings && (
        <div className="card">
          <h2>Dashboard Cards</h2>
          <p className="text-muted">Choose which cards appear on your dashboard.</p>

          <div className="toggle-list">
            {cardOptions.map(({ key, label }) => (
              <label key={key} className="toggle-row">
                <span>{label}</span>
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={settings[key] ?? true}
                  onChange={() => handleToggle(key)}
                />
                <span className="toggle-slider" />
              </label>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
            style={{ marginTop: '1.5rem' }}
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card danger-zone">
        <h2>Sign Out</h2>
        <p className="text-muted">You will be returned to the login page.</p>
        <button
          className="btn btn-danger"
          onClick={async () => { await logout(); }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
