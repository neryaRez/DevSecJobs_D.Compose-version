// 📁 src/pages/Register.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        is_admin: isAdmin, // ✅ שולחים ל-Backend
      });

      // שמירת המשתמש ו-token ב-AuthContext + localStorage
      login(res.data.user, res.data.access_token);

      // הפניה למסך המתאים
      if (res.data.user.is_admin) {
        navigate("/dashboard");
      } else {
        navigate("/complete-profile"); // ניצור בקרוב דף השלמת פרופיל
      }
    } catch (error) {
      console.error(error);
      alert("שגיאה בהרשמה - אנא נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-amber-100 to-stone-300 text-slate-800
             flex items-center justify-center p-4"
      >
      <form
        dir="rtl"
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-right"
      >

        <h1 className="text-3xl font-bold text-amber-700 text-center mb-6">
          הרשמה 📝
        </h1>

          {/* שם משתמש */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            שם משתמש
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="הכנס שם משתמש"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-5
                       focus:outline-none focus:ring-2 focus:ring-amber-300"
          />

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

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <label className="text-gray-700 font-medium">אני מגייס (Recruiter)</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? "נרשם..." : "צור חשבון"}
        </button>

        <p dir="rtl" className="text-center text-gray-600 mt-4">
          כבר יש לך חשבון?{" "}
          <a href="/login" className="text-amber-700 hover:underline">
            התחבר כאן
          </a>
        </p>
      </form>
    </div>
  );
}
