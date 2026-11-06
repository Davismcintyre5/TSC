import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold mb-2">404</h1>
      <p className="text-ink-muted mb-6">Page not found.</p>
      <Link to="/" className="text-kenya-gold hover:underline">Back to match</Link>
    </div>
  );
}