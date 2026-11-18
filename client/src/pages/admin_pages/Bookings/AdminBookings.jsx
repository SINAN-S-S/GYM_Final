import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import { FaCalendarAlt, FaCheck, FaTimes, FaUser, FaClock } from "react-icons/fa";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [backendUrl]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(bookings.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch (err) {
      alert("Failed to update booking status");
    }
  };

  const filteredBookings = filter === "All"
    ? bookings
    : bookings.filter((b) => b.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        <header style={{ marginBottom: "30px", borderBottom: "1px solid #222", paddingBottom: "20px" }}>
          <p style={{ color: "#B5F23D", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "1px", margin: "0 0 6px" }}>
            ADMINISTRATION — PERSONAL COACHING
          </p>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
            TRAINER <span style={{ color: "#B5F23D" }}>APPOINTMENTS</span>
          </h1>
        </header>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                backgroundColor: filter === s ? "#B5F23D" : "#16161e",
                color: filter === s ? "#111" : "#8c8c9a",
                border: "1px solid #282836",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div style={{ backgroundColor: "#14141a", border: "1px solid #252532", borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>Loading appointments...</p>
          ) : filteredBookings.length === 0 ? (
            <p style={{ padding: "30px", textAlign: "center", color: "#8c8c9a" }}>No sessions found for this status.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #282838", backgroundColor: "#181822" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>MEMBER</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>TRAINER</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>DATE & TIME</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>TYPE</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>STATUS</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#8c8c9a" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: "1px solid #1c1c26" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700 }}>
                      {b.user?.username || "Athlete"}
                      <div style={{ fontSize: "0.75rem", color: "#8c8c9a", fontWeight: 400 }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <strong>{b.trainer?.name || "Unassigned"}</strong>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>
                      <div>{new Date(b.date || b.createdAt).toLocaleDateString()}</div>
                      <div style={{ color: "#B5F23D", fontSize: "0.78rem" }}>{b.timeSlot || "Scheduled"}</div>
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>{b.sessionType || "Training"}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          backgroundColor:
                            b.status === "Confirmed"
                              ? "rgba(46, 213, 115, 0.2)"
                              : b.status === "Pending"
                              ? "rgba(255, 171, 0, 0.2)"
                              : "rgba(255, 71, 87, 0.2)",
                          color:
                            b.status === "Confirmed"
                              ? "#2ed573"
                              : b.status === "Pending"
                              ? "#ffab00"
                              : "#ff4757",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {b.status !== "Confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "Confirmed")}
                            style={{
                              backgroundColor: "rgba(46, 213, 115, 0.15)",
                              color: "#2ed573",
                              border: "1px solid #2ed573",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                            title="Approve Booking"
                          >
                            <FaCheck /> Confirm
                          </button>
                        )}
                        {b.status !== "Cancelled" && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, "Cancelled")}
                            style={{
                              backgroundColor: "rgba(255, 71, 87, 0.15)",
                              color: "#ff4757",
                              border: "1px solid #ff4757",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                            title="Reject/Cancel Booking"
                          >
                            <FaTimes /> Cancel
                          </button>
                        )}
                      </div>
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
