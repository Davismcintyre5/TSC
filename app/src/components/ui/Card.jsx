export default function Card({ children, className = "", as: As = "div", ...rest }) {
  return (
    <As
      className={`bg-surface border border-surface-line rounded-xl p-5 ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}