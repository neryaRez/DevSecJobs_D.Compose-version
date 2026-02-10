import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import UserHome from "./pages/UserHome.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/jobs.jsx";
import DashboardApplications from "./pages/DashboardApplications.jsx";
import DashboardApplicants from "./pages/DashboardApplicants.jsx";

import MyApplications from "./pages/MyApplications.jsx";
import JobsFeed from "./pages/JobsFeed.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";

import ManagerLayout from "./layouts/ManagerLayout.jsx";

import handsImg from "./assets/hands.jpg";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home handsImg={handsImg} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/user-home"
          element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          }
        />

        {/* ✅ אזור מנהל - Layout אחד לכל תתי המסכים */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<DashboardApplications />} />
          <Route path="applicants" element={<DashboardApplicants />} />
        </Route>

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route path="/jobs-feed" element={<JobsFeed />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function Home({ handsImg }) {
  return (
    <div className="bg-slate-50 text-slate-800">
      <section className="bg-gradient-to-b from-amber-100 to-stone-300 text-amber-800 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight">
             Build Your Devops Career
            </h1>
            <p className="mt-6 text-lg text-amber-700">
              Connecting Devops & Security professionals with companies that value excellence
            </p>
          </div>

          <div className="hidden md:block rounded-xl overflow-hidden shadow-lg">
            <img src={handsImg} alt="DevSecOps" className="w-full" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Secure Hiring", icon: "🔐", text: "Security-first recruitment process." },
            { title: "Cloud & DevOps", icon: "☁️", text: "Focused on modern infrastructure roles." },
            { title: "Career Growth", icon: "🚀", text: "Opportunities that scale with you." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow p-8 text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
