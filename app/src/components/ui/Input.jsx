export default function Input({
  label,
  error,
  hint,
  id,
  type = "text",
  className = "",
  ...rest
}) {
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-ink-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`bg-surface border rounded-lg px-3 py-2.5 text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-kenya-gold ${
          error ? "border-kenya-red" : "border-surface-line"
        }`}
        {...rest}
      />
      {hint && !error && <span className="text-xs text-ink-muted">{hint}</span>}
      {error && <span className="text-xs text-kenya-red">{error}</span>}
    </div>
  );
}