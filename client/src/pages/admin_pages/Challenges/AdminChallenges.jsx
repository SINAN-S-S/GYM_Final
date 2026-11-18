import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import { FaTrophy, FaPlus, FaTrash, FaMedal, FaUsers, FaCalendarAlt } from "react-icons/fa";

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("challenges"); // "challenges" | "leaderboard"

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Weekly",
    targetGoal: "Workout Consistency",
    targetNumber: 5,
    unit: "Workouts",
    points: 150,
    badge: "⚡ SQUAD BEAST",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [chalRes, leadRes] = await Promise.all([
        axios.get(`${backendUrl}/api/challenges`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        axios.get(`${backendUrl}/api/challenges/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);
      setChallenges(Array.isArray(chalRes.data) ? chalRes.data : []);
      setLeaderboard(Array.isArray(leadRes.data) ? leadRes.data : []);
    } catch (err) {
      console.error("Error fetching challenge data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [backendUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/challenges`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMsg("New challenge created & broadcast to all athletes!");
      setForm({
        title: "",
        description: "",
        category: "Weekly",
        targetGoal: "Workout Consistency",
        targetNumber: 5,
        unit: "Workouts",
        points: 150,
        badge: "⚡ SQUAD BEAST",
      });
      fetchData();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      setStatusMsg(err.response?.data?.msg || "Failed to create challenge.");
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/challenges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(challenges.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete challenge.");
    }
  };

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        {/* Header */}
        <header style={{ marginBottom: "30px", borderBottom: "1px solid #222", paddingBottom: "20px" }}>
          <p style={{ color: "#B5F23D", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "1px", margin: "0 0 6px" }}>
            ADMINISTRATION — GAMIFICATION & ENGAGEMENT
          </p>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
            FITNESS <span style={{ color: "#B5F23D" }}>CHALLENGES & LEADERBOARD</span>
          </h1>
        </header>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "26px" }}>
          <button
            onClick={() => setActiveTab("challenges")}
            style={{
              backgroundColor: activeTab === "challenges" ? "#B5F23D" : "#16161e",
              color: activeTab === "challenges" ? "#111" : "#8c8c9a",
              border: "1px solid #282836",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaTrophy /> ACTIVE CHALLENGES ({challenges.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            style={{
              backgroundColor: activeTab === "leaderboard" ? "#B5F23D" : "#16161e",
              color: activeTab === "leaderboard" ? "#111" : "#8c8c9a",
              border: "1px solid #282836",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaMedal /> ATHLETE LEADERBOARD ({leaderboard.length})
          </button>
        </div>

        {statusMsg && (
          <div style={{
            padding: "12px 18px",
            backgroundColor: "rgba(181, 242, 61, 0.15)",
            border: "1px solid #B5F23D",
            color: "#B5F23D",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}>
            {statusMsg}
          </div>
        )}

        {activeTab === "challenges" && (
          <div>
            {/* Create Challenge Form Card */}
            <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "12px", padding: "26px", marginBottom: "32px" }}>
              <h3 style={{ color: "#B5F23D", marginTop: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaPlus /> CREATE NEW FITNESS CHALLENGE
              </h3>
              <form onSubmit={handleCreateChallenge}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>CHALLENGE TITLE</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. 30-Day Pullup Master"
                      value={form.title}
                      onChange={handleChange}
                      required
                      style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>CADENCE</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                    >
                      <option value="Daily">Daily Challenge</option>
                      <option value="Weekly">Weekly Challenge</option>
                      <option value="Monthly">Monthly Challenge</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>TARGET NUMBER</label>
                    <input
                      type="number"
                      name="targetNumber"
                      placeholder="e.g. 500"
                      value={form.targetNumber}
                      onChange={handleChange}
                      required
                      style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>POINTS REWARD</label>
                    <input
                      type="number"
                      name="points"
                      placeholder="e.g. 200"
                      value={form.points}
                      onChange={handleChange}
                      required
                      style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>BADGE TITLE</label>
                    <input
                      type="text"
                      name="badge"
                      placeholder="e.g. ⚡ PULLUP TITAN"
                      value={form.badge}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#8c8c9a", marginBottom: "6px", fontWeight: "700" }}>DESCRIPTION & CRITERIA</label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Briefly describe what members need to do to complete this challenge..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "11px", backgroundColor: "#0b0b0e", border: "1px solid #333344", borderRadius: "6px", color: "#fff", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: "#B5F23D",
                    color: "#111",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                  }}
                >
                  {submitting ? "CREATING..." : "+ LAUNCH CHALLENGE"}
                </button>
              </form>
            </div>

            {/* Challenges Cards Grid */}
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "18px", color: "#fff" }}>CURRENT GYM CHALLENGES</h3>
            {loading ? (
              <p style={{ color: "#8c8c9a" }}>Loading challenges...</p>
            ) : challenges.length === 0 ? (
              <p style={{ color: "#8c8c9a" }}>No active challenges created yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {challenges.map((c) => (
                  <div key={c._id} style={{ backgroundColor: "#14141a", border: "1px solid #252532", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ backgroundColor: "rgba(181, 242, 61, 0.15)", color: "#B5F23D", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "800" }}>
                          {c.category?.toUpperCase() || "WEEKLY"}
                        </span>
                        <span style={{ color: "#B5F23D", fontWeight: 800, fontSize: "0.82rem" }}>
                          +{c.points} PTS
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 8px", fontSize: "1.1rem", color: "#fff" }}>{c.title}</h4>
                      <p style={{ margin: "0 0 14px", color: "#8c8c9a", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                      <div style={{ display: "flex", gap: "10px", fontSize: "0.78rem", color: "#aaa", marginBottom: "16px" }}>
                        <span>Target: <strong style={{ color: "#fff" }}>{c.targetNumber} {c.unit || "Units"}</strong></span>
                        <span>•</span>
                        <span>Badge: <strong style={{ color: "#B5F23D" }}>{c.badge}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #20202c", paddingTop: "12px" }}>
                      <button
                        onClick={() => handleDelete(c._id)}
                        style={{
                          backgroundColor: "transparent",
                          color: "#ff4757",
                          border: "1px solid rgba(255, 71, 87, 0.3)",
                          padding: "6px 14px",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FaTrash /> REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div style={{ backgroundColor: "#14141a", border: "1px solid #252532", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #282838", backgroundColor: "#181822" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>RANK</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>ATHLETE</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>MEMBERSHIP TIER</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>TIER BADGE</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>POINTS</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>
                      No ranked athletes found.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((m) => (
                    <tr key={m.id || m.rank} style={{ borderBottom: "1px solid #1f1f2a" }}>
                      <td style={{ padding: "14px 18px", fontWeight: "900", color: m.rank <= 3 ? "#B5F23D" : "#8c8c9a" }}>
                        #{m.rank}
                      </td>
                      <td style={{ padding: "14px 18px", fontWeight: "700", color: "#fff" }}>
                        {m.username}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#ccc", fontSize: "0.85rem" }}>
                        {m.membershipPlan}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{
                          backgroundColor: m.rank === 1 ? "rgba(181, 242, 61, 0.2)" : "#20202c",
                          color: m.rank === 1 ? "#B5F23D" : "#ccc",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "700"
                        }}>
                          {m.badge}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#B5F23D", fontWeight: "900", fontSize: "1rem" }}>
                        {m.points} PTS
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

