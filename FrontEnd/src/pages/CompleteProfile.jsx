import { useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";

export default function CompleteProfile() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [name, setName] = useState(user?.username || "");
  const [languages, setLanguages] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [flagshipProject, setFlagshipProject] = useState("");
  const [lastJob, setLastJob] = useState("");
  const [education, setEducation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [resumePath, setResumePath] = useState("");

  const [loading, setLoading] = useState(false);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(
        `/applicants/${user.applicant_id}`, // keep EXACT endpoint
        {
          name,
          languages,
          technologies,
          flagship_project: flagshipProject,
          last_job: lastJob,
          education,
          years_experience: parseInt(yearsExperience, 10) || 0,
          resume_path: resumePath,
        },
        { headers: authHeader }
      );

      alert("Profile updated successfully ✅");
      navigate("/user-home"); // keep EXACT navigation
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Profile update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Complete Profile"
      subtitle="Boost your match score by adding more details."
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-lg font-semibold">Candidate profile</div>
              <div className="mt-1 text-sm text-slate-600">
                Fill in as much as you can — it helps matching.
              </div>
            </div>
            <div className="text-2xl">✨</div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                    required
                  />
                </div>

                {/* Programming languages */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Programming languages
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="Python, JavaScript, Go..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Technologies
                  </label>
                  <input
                    type="text"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="AWS, Docker, Kubernetes..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Flagship project */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flagship project
                  </label>
                  <input
                    type="text"
                    value={flagshipProject}
                    onChange={(e) => setFlagshipProject(e.target.value)}
                    placeholder="A project you’re proud of"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Last job */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last job
                  </label>
                  <input
                    type="text"
                    value={lastJob}
                    onChange={(e) => setLastJob(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Years of experience */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Years of experience
                  </label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                {/* Resume path */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Resume file (path / URL)
                  </label>
                  <input
                    type="text"
                    value={resumePath}
                    onChange={(e) => setResumePath(e.target.value)}
                    placeholder="e.g. uploads/resume.pdf"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white
                             hover:bg-amber-700 transition shadow-sm
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving…" : "Save profile"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/user-home")}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700
                             hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
