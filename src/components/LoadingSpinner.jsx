/** Simple centered loading spinner */
export default function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner" role="status" aria-label="Loading…" />
    </div>
  );
}
