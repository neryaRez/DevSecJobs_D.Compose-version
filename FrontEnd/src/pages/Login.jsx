// 📁 src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      login(res.data.user, res.data.access_token);

      if (res.data.user.is_admin) navigate("/dashboard");
      else navigate("/user-home");
    } catch (error) {
      console.error(error);
      alert("שגיאה בהתחברות - בדוק את פרטי המשתמש שלך");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-amber-100 to-stone-300 text-slate-800
                 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-3xl font-bold text-center text-amber-700 mb-8">
          התחברות 🔑
        </h1>

        <form onSubmit={handleSubmit}>
          {/* אימייל */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            אימייל
          </label>
          <input
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-5
                       text-left
                       focus:outline-none focus:ring-2 focus:ring-amber-300"
          />

          {/* סיסמה */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            סיסמה
          </label>
          <input
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-6
                       text-left
                       focus:outline-none focus:ring-2 focus:ring-amber-300"
          />

          {/* כפתור */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white
                       bg-amber-600 hover:bg-amber-700 transition shadow-sm
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>
        </form>

        {/* טקסט תחתון */}
        <p dir="rtl" className="text-center text-slate-600 mt-6">
          אין לך חשבון?{" "}
          <Link
            to="/register"
            className="text-amber-700 font-semibold hover:underline"
          >
            צור אחד כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
