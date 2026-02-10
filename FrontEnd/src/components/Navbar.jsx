import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
  dir="rtl"
  className="sticky top-0 z-50
             bg-gradient-to-r from-amber-100 to-stone-50 text-stone-100
             shadow-md"
>


        <div className="max-w-6xl mx-auto px-6 h-16 flex flex-row-reverse items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-stone-400 tracking-tight"
        >
          DevSecJobs
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-semibold transition ${
                isActive
                  ? "text-stone-500"
                  : "text-slate-800 hover:text-stone-400"
              }`
            }
          >
            Home
          </NavLink>
{user?.is_admin && (
  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      `text-sm font-semibold transition ${
        isActive
          ? "text-stone-400"
          : "text-slate-700 hover:text-stone-400"
      }`
    }
  >
    Dashboard
  </NavLink>
)}

{user && !user.is_admin && (
  <NavLink
    to="/user-home"
    className={({ isActive }) =>
      `text-sm font-semibold transition ${
        isActive
          ? "text-stone-400"
          : "text-slate-700 hover:text-stone-400"
      }`
    }
  >
    My Area
  </NavLink>
)}


          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-sm font-semibold transition ${
                    isActive
                      ? "text-stone-400"
                      : "text-slate-700 hover:text-stone-400"
                  }`
                }
              >
                Login
              </NavLink>

              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold
                           bg-amber-600 text-white
                           hover:bg-amber-700 transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="text-sm font-semibold text-slate-700
                         hover:text-rose-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
