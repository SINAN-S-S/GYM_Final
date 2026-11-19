import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  Trash2,
  RotateCcw,
  Shield,
  Utensils,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  Mail,
  Award
} from "lucide-react";
import "./Users.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [bookings, setBookings] = useState([]);
  const [dietModalUser, setDietModalUser] = useState(null);
  const [dietForm, setDietForm] = useState({
    title: "Custom High-Protein Protocol",
    goal: "Muscle Gain",
    targetCalories: 2600,
    targetProtein: 180,
    targetCarbs: 260,
    targetFats: 60,
    waterLiters: 3.5,
    instructions: "Strict nutrient timing. Keep hydration above 3.5L.",
  });

  const handleAssignDiet = async (e) => {
    e.preventDefault();
    if (!dietModalUser) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/diet-plans/assign`,
        {
          userId: dietModalUser._id,
          ...dietForm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Diet plan assigned successfully to ${dietModalUser.username}!`);
      setDietModalUser(null);
    } catch (err) {
      alert("Failed to assign diet plan: " + (err.response?.data?.msg || err.message));
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBookings();
  }, []);

  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingId}`,
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "Confirmed" } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking");
    }
  };

  const handleRemoveBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to remove this trainer request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove booking");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const activeUsers = useMemo(() => filtered.filter((u) => !u.isDeleted), [filtered]);
  const deletedUsers = useMemo(() => filtered.filter((u) => u.isDeleted), [filtered]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.isDeleted && !u.isBlocked).length;
    const blocked = users.filter((u) => u.isBlocked && !u.isDeleted).length;
    const deleted = users.filter((u) => u.isDeleted).length;
    return { total, active, blocked, deleted };
  }, [users]);

  const toggleRole = async (user) => {
    const role = user.role === "admin" ? "user" : "admin";
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle role");
    }
  };

  const toggleBlock = async (user) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isBlocked: !user.isBlocked } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to toggle block status");
    }
  };

  const removeUser = async (user) => {
    if (user.role === "admin") return alert("Cannot remove an admin.");
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/remove`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isDeleted: true } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to remove user");
    }
  };

  const restoreUser = async (user) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isDeleted: false } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to restore user");
    }
  };

  const hardDeleteUser = async (user) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user? This cannot be undone."
      )
    )
      return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/hard-delete`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error(err);
      alert("Failed to permanently delete user");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="users-main-content">
        <div className="users-container-inner">
          {/* Header Banner */}
          <header className="users-page-header">
            <div>
              <span className="users-header-kicker">ADMINISTRATION — ACCESS & IDENTITY</span>
              <h1 className="users-page-title">USER MANAGEMENT & ROLES</h1>
              <p className="users-page-subtitle">
                Inspect registered athletes, assign coaching meal plans, manage access roles, and monitor trainer appointments.
              </p>
            </div>
          </header>

          {/* Quick Metrics Bar */}
          <div className="users-metrics-grid">
            <div className="metric-box">
              <div className="metric-icon total">
                <UsersIcon size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">TOTAL MEMBERS</span>
                <span className="metric-value">{stats.total}</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon active">
                <UserCheck size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">ACTIVE ACCOUNTS</span>
                <span className="metric-value">{stats.active}</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon blocked">
                <UserX size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">BLOCKED</span>
                <span className="metric-value">{stats.blocked}</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon archive">
                <RotateCcw size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-label">ARCHIVED / REMOVED</span>
                <span className="metric-value">{stats.deleted}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar: Tabs & Search */}
          <div className="users-controls-card">
            <div className="users-tabs-row">
              <button
                onClick={() => setActiveTab("users")}
                className={`user-tab-btn ${activeTab === "users" ? "active" : ""}`}
              >
                <UsersIcon size={16} />
                <span>Active Users ({users.filter((u) => !u.isDeleted).length})</span>
              </button>

              <button
                onClick={() => setActiveTab("restore")}
                className={`user-tab-btn ${activeTab === "restore" ? "active" : ""}`}
              >
                <RotateCcw size={16} />
                <span>Restore Archive ({users.filter((u) => u.isDeleted).length})</span>
              </button>

              <button
                onClick={() => setActiveTab("bookings")}
                className={`user-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
              >
                <Calendar size={16} />
                <span>Trainer Requests ({bookings.length})</span>
              </button>
            </div>

            {activeTab !== "bookings" && (
              <div className="users-search-wrapper">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search by username, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="users-search-input"
                />
                {search && (
                  <button className="clear-search-btn" onClick={() => setSearch("")}>
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: ACTIVE USERS */}
          {activeTab === "users" && (
            <div className="users-table-card">
              <div className="users-table-header">
                <span className="col-user">MEMBER IDENTITY</span>
                <span className="col-email">CONTACT & PLAN</span>
                <span className="col-role">ROLE</span>
                <span className="col-status">STATUS</span>
                <span className="col-actions">ACTIONS</span>
              </div>

              {activeUsers.length === 0 ? (
                <div className="users-empty-state">
                  <AlertTriangle size={36} className="empty-icon" />
                  <h3>No Active Users Found</h3>
                  <p>Try refining your search keyword or check the Restore Archive tab.</p>
                </div>
              ) : (
                <div className="users-table-body">
                  {activeUsers.map((user) => {
                    const isAdmin = user.role === "admin";
                    const isBlocked = !!user.isBlocked;

                    return (
                      <div className="users-table-row" key={user._id}>
                        {/* Member Identity */}
                        <div className="col-user cell-identity">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.username}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                              className="user-avatar-img"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {(user.username || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="identity-text">
                            <span className="user-name-text">{user.username}</span>
                            <span className="user-id-text">ID: {user._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Contact & Plan */}
                        <div className="col-email cell-email">
                          <div className="email-row">
                            <Mail size={13} className="email-icon" />
                            <span>{user.email}</span>
                          </div>
                          <div className="plan-badge-row">
                            <span className="user-plan-tag">
                              <Award size={11} /> {user.membership?.plan || "Pro Athlete"}
                            </span>
                            <span className="user-membership-status">
                              ({user.membership?.status || "Active"})
                            </span>
                          </div>
                        </div>

                        {/* Role Pill */}
                        <div className="col-role cell-role">
                          <span className={`user-role-badge ${isAdmin ? "admin" : "user"}`}>
                            {isAdmin ? <Shield size={12} /> : null}
                            {user.role ? user.role.toUpperCase() : "USER"}
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div className="col-status cell-status">
                          <span className={`user-status-pill ${isBlocked ? "blocked" : "active"}`}>
                            <span className="status-indicator-dot"></span>
                            {isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-actions cell-actions">
                          <button
                            onClick={() => setDietModalUser(user)}
                            className="btn-action-plan"
                            title="Assign Diet & Nutrition Protocol"
                          >
                            <Utensils size={14} />
                            <span>Plan</span>
                          </button>

                          <button
                            onClick={() => toggleRole(user)}
                            className="btn-action-role"
                            title="Toggle Admin / Member Role"
                          >
                            <Shield size={14} />
                            <span>Role</span>
                          </button>

                          <button
                            onClick={() => toggleBlock(user)}
                            className={`btn-action-block ${isBlocked ? "unblock" : "block"}`}
                            title={isBlocked ? "Unblock User Access" : "Block User Access"}
                          >
                            {isBlocked ? <CheckCircle2 size={14} /> : <UserX size={14} />}
                            <span>{isBlocked ? "Unblock" : "Block"}</span>
                          </button>

                          {!isAdmin && (
                            <button
                              onClick={() => removeUser(user)}
                              className="btn-action-remove"
                              title="Archive / Remove User to Restore List"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESTORE ARCHIVE */}
          {activeTab === "restore" && (
            <div className="users-table-card">
              <div className="users-table-header">
                <span className="col-user">MEMBER IDENTITY</span>
                <span className="col-email">CONTACT & PLAN</span>
                <span className="col-role">ROLE</span>
                <span className="col-status">ARCHIVE STATUS</span>
                <span className="col-actions">RESTORE / PURGE</span>
              </div>

              {deletedUsers.length === 0 ? (
                <div className="users-empty-state">
                  <CheckCircle2 size={36} className="empty-icon success" />
                  <h3>Restore Archive is Empty</h3>
                  <p>No removed or archived user accounts are pending restoration.</p>
                </div>
              ) : (
                <div className="users-table-body">
                  {deletedUsers.map((user) => (
                    <div className="users-table-row archived" key={user._id}>
                      <div className="col-user cell-identity">
                        <div className="user-avatar-placeholder archived">
                          {(user.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="identity-text">
                          <span className="user-name-text">{user.username}</span>
                          <span className="user-id-text">ID: {user._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="col-email cell-email">
                        <div className="email-row">
                          <Mail size={13} className="email-icon" />
                          <span>{user.email}</span>
                        </div>
                        <div className="plan-badge-row">
                          <span className="user-plan-tag archived">
                            {user.membership?.plan || "Pro Athlete"}
                          </span>
                        </div>
                      </div>

                      <div className="col-role cell-role">
                        <span className="user-role-badge user">{user.role?.toUpperCase() || "USER"}</span>
                      </div>

                      <div className="col-status cell-status">
                        <span className="user-status-pill archived">
                          <span className="status-indicator-dot archived"></span>
                          Removed
                        </span>
                      </div>

                      <div className="col-actions cell-actions">
                        <button
                          onClick={() => restoreUser(user)}
                          className="btn-action-restore"
                          title="Restore user account to active status"
                        >
                          <RotateCcw size={14} />
                          <span>Restore User</span>
                        </button>

                        <button
                          onClick={() => hardDeleteUser(user)}
                          className="btn-action-purge"
                          title="Permanently erase this account and all records"
                        >
                          <Trash2 size={14} />
                          <span>Purge Forever</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRAINER BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="users-table-card">
              <div className="users-table-header bookings">
                <span>ATHLETE</span>
                <span>ASSIGNED COACH</span>
                <span>REQUEST DATE</span>
                <span>STATUS</span>
                <span>APPOINTMENT ACTIONS</span>
              </div>

              {bookings.length === 0 ? (
                <div className="users-empty-state">
                  <Calendar size={36} className="empty-icon" />
                  <h3>No Trainer Requests Pending</h3>
                  <p>When athletes schedule private coaching sessions, requests will appear here.</p>
                </div>
              ) : (
                <div className="users-table-body">
                  {bookings.map((booking) => {
                    const isConfirmed = booking.status === "Confirmed";

                    return (
                      <div className="users-table-row bookings" key={booking._id}>
                        <div className="cell-identity">
                          <div className="user-avatar-placeholder">
                            {(booking.user?.name || booking.user?.username || booking.user?.email || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="user-name-text">
                              {booking.user?.name || booking.user?.username || "Athlete"}
                            </span>
                            <div className="user-id-text">{booking.user?.email || "No email"}</div>
                          </div>
                        </div>

                        <div>
                          <strong style={{ color: "#B5F23D" }}>
                            {booking.trainer?.name || "Senior Coach"}
                          </strong>
                          <div style={{ fontSize: "0.75rem", color: "#888" }}>
                            {booking.trainer?.specialization || "Strength & Hypertrophy"}
                          </div>
                        </div>

                        <div>
                          <span style={{ color: "#ccc", fontSize: "0.85rem" }}>
                            {new Date(booking.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div>
                          <span className={`user-status-pill ${isConfirmed ? "active" : "pending"}`}>
                            <span className="status-indicator-dot"></span>
                            {booking.status}
                          </span>
                        </div>

                        <div className="cell-actions">
                          {!isConfirmed && (
                            <button
                              onClick={() => handleAcceptBooking(booking._id)}
                              className="btn-action-accept"
                            >
                              <CheckCircle2 size={14} />
                              <span>Accept</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveBooking(booking._id)}
                            className="btn-action-purge"
                          >
                            <XCircle size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* DIET PLAN ASSIGNMENT MODAL */}
      {dietModalUser && (
        <div
          className="diet-modal-backdrop"
          onClick={() => setDietModalUser(null)}
        >
          <div
            className="diet-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="diet-modal-header">
              <div>
                <span className="modal-kicker">COACHING PROTOCOL</span>
                <h3 className="diet-modal-title">ASSIGN NUTRITION PLAN</h3>
                <p className="diet-modal-sub">
                  Assigning to athlete: <strong style={{ color: "#B5F23D" }}>{dietModalUser.username}</strong> ({dietModalUser.email})
                </p>
              </div>
              <button
                className="diet-modal-close-btn"
                onClick={() => setDietModalUser(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignDiet} className="diet-modal-form">
              <div className="form-group">
                <label>PLAN TITLE</label>
                <input
                  type="text"
                  value={dietForm.title}
                  onChange={(e) => setDietForm({ ...dietForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>GOAL</label>
                  <select
                    value={dietForm.goal}
                    onChange={(e) => setDietForm({ ...dietForm, goal: e.target.value })}
                  >
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Recomposition">Recomposition</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>DAILY CALORIES (kcal)</label>
                  <input
                    type="number"
                    value={dietForm.targetCalories}
                    onChange={(e) =>
                      setDietForm({ ...dietForm, targetCalories: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>PROTEIN (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetProtein}
                    onChange={(e) =>
                      setDietForm({ ...dietForm, targetProtein: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CARBS (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetCarbs}
                    onChange={(e) =>
                      setDietForm({ ...dietForm, targetCarbs: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>FATS (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetFats}
                    onChange={(e) =>
                      setDietForm({ ...dietForm, targetFats: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>DAILY WATER TARGET (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dietForm.waterLiters}
                  onChange={(e) =>
                    setDietForm({ ...dietForm, waterLiters: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>COACH INSTRUCTIONS & MEAL TIMING</label>
                <textarea
                  rows="3"
                  value={dietForm.instructions}
                  onChange={(e) =>
                    setDietForm({ ...dietForm, instructions: e.target.value })
                  }
                />
              </div>

              <div className="diet-modal-actions">
                <button
                  type="button"
                  onClick={() => setDietModalUser(null)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  ASSIGN PROTOCOL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
