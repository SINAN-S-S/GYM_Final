import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import { FaCalendarCheck, FaUserCheck, FaQrcode, FaSearch } from "react-icons/fa";

export default function AdminAttendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/attendance/daily-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Error fetching attendance logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [backendUrl]);

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/attendance/check-in`,
        { qrToken: qrToken.trim(), method: "Admin_Manual" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMsg(res.data.msg || "Check-in successful!");
      setQrToken("");
      fetchAttendance();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      setStatusMsg(err.response?.data?.msg || "Check-in failed. Please verify the QR token or member ID.");
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const filteredLogs = logs.filter((l) =>
    (l.user?.username || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (l.user?.email || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        <header style={{ marginBottom: "30px", borderBottom: "1px solid #222", paddingBottom: "20px" }}>
          <p style={{ color: "#B5F23D", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "1px", margin: "0 0 6px" }}>
            ADMINISTRATION — OPERATIONS
          </p>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
            ATTENDANCE & <span style={{ color: "#B5F23D" }}>QR CHECK-IN</span>
          </h1>
        </header>

        {/* Manual Check-in / Scanner Simulation Card */}
        <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "12px", padding: "24px", marginBottom: "30px" }}>
          <h3 style={{ color: "#B5F23D", marginTop: 0, fontSize: "1.1rem" }}>
            <FaQrcode style={{ marginRight: "8px" }} /> SCAN OR VERIFY MEMBER PASS
          </h3>
          <form onSubmit={handleManualCheckIn} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter Member QR Token or Member ID..."
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              style={{
                flex: 1,
                minWidth: "260px",
                padding: "12px 16px",
                backgroundColor: "#0b0b0e",
                border: "1px solid #333344",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "0.9rem",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#B5F23D",
                color: "#111",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <FaUserCheck style={{ marginRight: "6px" }} /> RECORD ENTRY
            </button>
          </form>
          {statusMsg && (
            <p style={{ marginTop: "12px", color: statusMsg.includes("fail") ? "#ff4757" : "#2ed573", fontWeight: 700, fontSize: "0.85rem" }}>
              {statusMsg}
            </p>
          )}
        </div>

        {/* Filter and Table Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
            TODAY'S VISITOR LOGS ({filteredLogs.length})
          </h3>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search athlete by name..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                backgroundColor: "#14141a",
                border: "1px solid #2e2e3e",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            />
            <FaSearch style={{ position: "absolute", left: "10px", top: "10px", color: "#8c8c9a", fontSize: "0.8rem" }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#14141a", border: "1px solid #252532", borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>Loading today's logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>No member check-ins recorded today.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #282838", backgroundColor: "#181822" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>MEMBER</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>DATE</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>CHECK-IN TIME</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>VERIFICATION</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: "1px solid #1c1c26" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700 }}>
                      {log.user?.username || "Unknown Member"}
                      <div style={{ fontSize: "0.75rem", color: "#8c8c9a", fontWeight: 400 }}>{log.user?.email}</div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>{log.date}</td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem", color: "#B5F23D" }}>
                      {new Date(log.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>
                      <span style={{ backgroundColor: "#20202c", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem" }}>
                        {log.verificationMethod || "QR_Code"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ backgroundColor: "rgba(46, 213, 115, 0.2)", color: "#2ed573", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800 }}>
                        {log.status || "Present"}
                      </span>
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
