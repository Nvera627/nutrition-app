/** Displays a red error banner. Pass the error string as the `message` prop. */
export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="error-message" role="alert">
      {message}
    </div>
  );
}
