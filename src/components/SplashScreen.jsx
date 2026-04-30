/**
 * SplashScreen.jsx
 * Full-screen branded loading state shown while Firebase restores the session.
 * Replaces the blank white flash on first page load.
 */

export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">🥗</div>
        <h1 className="splash-title">BalanceBite</h1>
        <div className="splash-spinner" role="status" aria-label="Loading…" />
      </div>
    </div>
  );
}
