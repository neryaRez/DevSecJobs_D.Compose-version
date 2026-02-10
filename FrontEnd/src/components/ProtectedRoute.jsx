// 📁 src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // מצב טעינה – לא נציג כלום עד שנסיים לבדוק אם יש משתמש
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        טוען...
      </div>
    );
  }

  // אם אין משתמש מחובר → נשלח אותו ל-login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // אם נדרש אדמין אבל המשתמש לא אדמין → שולחים אותו ל-home
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/user-home" replace />;
  }

  // אחרת – מציגים את המסך המקורי
  return children;
}
