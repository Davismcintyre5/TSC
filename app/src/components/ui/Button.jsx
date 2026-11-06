export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-5 py-3",
  };

  const variants = {
    primary: "bg-kenya-green text-white hover:brightness-110",
    gold: "bg-kenya-gold text-kenya-black hover:brightness-110",
    ghost: "bg-transparent text-ink border border-surface-line hover:bg-surface-alt",
    danger: "bg-kenya-red text-white hover:brightness-110",
    link: "bg-transparent text-kenya-gold underline hover:no-underline px-0",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}