/**
 * Centered loading spinner, used for full-page or full-section loading states.
 */
export default function Loader({ size = 24, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-2 border-accent border-t-transparent"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
