import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireUser({ children }) {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="inline-block w-8 h-8 border-2 border-ink-muted/30 border-t-kenya-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  return children;
}