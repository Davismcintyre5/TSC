export default function Spinner({ size = 20, className = "" }) {
  return (
    <span
      className={`inline-block border-2 border-ink-muted/30 border-t-kenya-gold rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}