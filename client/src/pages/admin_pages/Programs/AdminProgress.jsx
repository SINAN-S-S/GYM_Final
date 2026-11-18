import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProgress.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import { FaUser, FaTrash, FaSearch, FaWeight, FaCamera } from "react-icons/fa";

function AdminProgress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const fetchProgressLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/progress/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching progress logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressLogs();
  }, [backendUrl]);

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this progress log?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(logs.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete progress log");
    }
  };

  const filteredLogs = logs.filter((l) => {
    const q = search.trim().toLowerCase();
    const userMatch =
      (l.user?.username || "").toLowerCase().includes(q) ||
      (l.user?.email || "").toLowerCase().includes(q);
    return !q || userMatch;
  });

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff" }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <header style={{ marginBottom: "30px", borderBottom: "1px solid #222", paddingBottom: "20px" }}>
          <p style={{ color: "#B5F23D", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "1px", margin: "0 0 6px" }}>
            ADMINISTRATION — BIOMETRIC MONITORING
          </p>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
            MEMBER <span style={{ color: "#B5F23D" }}>BODY PROGRESS LOGS</span>
          </h1>
        </header>

        {/* Search Bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <FaSearch style={{ position: "absolute", left: "14px", top: "14px", color: "#666" }} />
            <input
              type="text"
              placeholder="Search by member username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 16px 11px 40px",
                backgroundColor: "#14141a",
                border: "1px solid #282834",
                borderRadius: "6px",
                color: "#fff",
                outline: "none",
                fontSize: "0.85rem",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#14141a", border: "1px solid #252532", borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>Loading progress data...</p>
          ) : filteredLogs.length === 0 ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>No progress logs found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #282838", backgroundColor: "#181822" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>MEMBER</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>DATE</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>WEIGHT & BMI</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>BODY FAT</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>MEASUREMENTS</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>PHOTO</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: "1px solid #1f1f2a" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#fff" }}>
                        {log.user?.username || "Athlete"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#8c8c9a" }}>
                        {log.user?.email || "No email"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#ccc", fontSize: "0.85rem" }}>
                      {new Date(log.date || log.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontWeight: "800", color: "#B5F23D" }}>{log.weight} kg</span>
                      {log.bmi && (
                        <span style={{ marginLeft: "8px", fontSize: "0.78rem", color: "#38bdf8" }}>
                          (BMI {log.bmi})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#ccc", fontSize: "0.85rem" }}>
                      {log.bodyFat ? `${log.bodyFat}%` : "-"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#aaa", fontSize: "0.8rem" }}>
                      {log.chest ? `Chest: ${log.chest}cm ` : ""}
                      {log.waist ? `Waist: ${log.waist}cm ` : ""}
                      {log.arms ? `Arms: ${log.arms}cm` : ""}
                      {!log.chest && !log.waist && !log.arms ? "-" : ""}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      {log.photos && log.photos[0]?.url ? (
                        <a href={log.photos[0].url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={log.photos[0].url}
                            alt="Progress"
                            style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "4px", border: "1px solid #333" }}
                          />
                        </a>
                      ) : (
                        <span style={{ color: "#555", fontSize: "0.78rem" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <button
                        onClick={() => deleteLog(log._id)}
                        style={{
                          backgroundColor: "transparent",
                          color: "#ff4757",
                          border: "1px solid rgba(255, 71, 87, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaTrash /> DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProgress;
