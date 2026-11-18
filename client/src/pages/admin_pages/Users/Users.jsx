import { useEffect, useState } from "react";
import axios from "axios";
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
      setUsers(res.data);
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
      setBookings(res.data);
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
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingId}`, 
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: "Confirmed" } : b));
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking");
    }
  };

  const handleRemoveBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to remove this trainer request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove booking");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/remove`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isDeleted: true } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to remove user");
    }
  };

  const restoreUser = async (user) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isDeleted: false } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to restore user");
    }
  };

  const hardDeleteUser = async (user) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${user._id}/hard-delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <div className="users-page">
         <div className="users-topbar">
  <h1 className="users-title">Users Management</h1>

  <div className="users-tabs">
    <button
      onClick={() => setActiveTab("users")}
      className={`tab-btn ${activeTab === "users" ? "active-users" : ""}`}
    >
      Active Users
    </button>

    <button
      onClick={() => setActiveTab("restore")}
      className={`tab-btn ${activeTab === "restore" ? "active-restore" : ""}`}
    >
      Restore List
    </button>

    <button
      onClick={() => setActiveTab("bookings")}
      className={`tab-btn ${activeTab === "bookings" ? "active-bookings" : ""}`}
    >
      Trainer Requests
    </button>
  </div>
</div>

          {activeTab === "users" ? (
            <>
              <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search"
              />

              <div className="table">
                <div className="row header">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {filtered.filter(u => !u.isDeleted).length === 0 ? (
                  <p style={{ padding: "20px" }}>No active users found</p>
                ) : (
                  filtered.filter(u => !u.isDeleted).map((user) => (
                    <div className="row" key={user._id}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="avatar"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#B5F23D', fontWeight: 'bold' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {user.username}
                      </span>
                      <span>
                        <div>{user.email}</div>
                        <div style={{ fontSize: "0.72rem", color: "#B5F23D", marginTop: "3px" }}>
                          {user.membership?.plan || "Pro Athlete"} ({user.membership?.status || "Active"})
                        </div>
                      </span>

                      <span style={{ fontWeight: 'bold', color: user.role === 'admin' ? '#FF4D4D' : '#B5F23D' }}>
                        {user.role}
                      </span>

                      <span className={user.isBlocked ? "blocked" : "active"}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>

                      <div className="actions" style={{ gap: '5px' }}>
                        <button onClick={() => setDietModalUser(user)} style={{ padding: '5px', fontSize: '0.78rem', background: '#38bdf8', color: '#111', border: 'none', borderRadius: '4px', fontWeight: 'bold' }} title="Assign Diet & Nutrition Plan">
                          Plan
                        </button>

                        <button onClick={() => toggleRole(user)} style={{ padding: '5px', fontSize: '0.8rem' }}>
                          Role
                        </button>

                        <button onClick={() => toggleBlock(user)} style={{ padding: '5px', fontSize: '0.8rem' }}>
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        
                        {user.role !== "admin" && (
                          <button onClick={() => removeUser(user)} style={{ padding: '5px', fontSize: '0.8rem', background: '#FF4D4D', color: '#fff', border: 'none' }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : activeTab === "restore" ? (
            <>
              <div className="table">
                <div className="row header">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {filtered.filter(u => u.isDeleted).length === 0 ? (
                  <p style={{ padding: "20px" }}>No deleted users found</p>
                ) : (
                  filtered.filter(u => u.isDeleted).map((user) => (
                    <div className="row" key={user._id}>
                      <span>{user.username}</span>
                      <span>
                        <div>{user.email}</div>
                        <div style={{ fontSize: "0.72rem", color: "#B5F23D", marginTop: "3px" }}>
                          {user.membership?.plan || "Pro Athlete"} ({user.membership?.status || "Active"})
                        </div>
                      </span>
                      
                      <span style={{ fontWeight: 'bold', color: user.role === 'admin' ? '#FF4D4D' : '#B5F23D' }}>
                        {user.role}
                      </span>

                      <span style={{ color: '#FF9F43' }}>Removed</span>

                      <div className="actions" style={{ gap: '10px' }}>
                        <button onClick={() => restoreUser(user)} style={{ padding: '5px 15px', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '4px' }}>
                          Restore User
                        </button>
                        <button onClick={() => hardDeleteUser(user)} style={{ padding: '5px 15px', background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '4px' }}>
                          Permanently Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="table">
                <div className="row header">
                  <span>User</span>
                  <span>Trainer Requested</span>
                  <span>Date Requested</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {bookings.length === 0 ? (
                  <p style={{ padding: "20px" }}>No trainer requests found</p>
                ) : (
                  bookings.map((booking) => (
                    <div className="row" key={booking._id}>
                      <span>{booking.user?.name || booking.user?.email || "Unknown User"}</span>
                      <span>{booking.trainer?.name || "Unknown Trainer"}</span>
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      
                      <span style={{ color: booking.status === "Confirmed" ? '#B5F23D' : '#FF9F43', fontWeight: 'bold' }}>
                        {booking.status}
                      </span>

                      <div className="actions" style={{ gap: '10px' }}>
                        {booking.status === "Pending" ? (
                          <>
                            <button 
                              onClick={() => handleAcceptBooking(booking._id)}
                              style={{ background: '#B5F23D', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRemoveBooking(booking._id)}
                              style={{ background: '#FF4D4D', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <span style={{ color: '#888' }}>Accepted</span>
                            <button 
                              onClick={() => handleRemoveBooking(booking._id)}
                              style={{ background: '#FF4D4D', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DIET PLAN ASSIGNMENT MODAL */}
      {dietModalUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#14141a",
            border: "1px solid #333344",
            borderRadius: "10px",
            padding: "28px",
            width: "100%",
            maxWidth: "520px",
            color: "#fff"
          }}>
            <h3 style={{ margin: "0 0 6px", color: "#B5F23D", fontSize: "1.2rem" }}>
              ASSIGN NUTRITION PLAN
            </h3>
            <p style={{ margin: "0 0 18px", color: "#aaa", fontSize: "0.85rem" }}>
              Member: <strong style={{ color: "#fff" }}>{dietModalUser.username}</strong> ({dietModalUser.email})
            </p>

            <form onSubmit={handleAssignDiet}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>PLAN TITLE</label>
                <input
                  type="text"
                  value={dietForm.title}
                  onChange={(e) => setDietForm({ ...dietForm, title: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>GOAL</label>
                  <select
                    value={dietForm.goal}
                    onChange={(e) => setDietForm({ ...dietForm, goal: e.target.value })}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                  >
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Recomposition">Recomposition</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>DAILY CALORIES</label>
                  <input
                    type="number"
                    value={dietForm.targetCalories}
                    onChange={(e) => setDietForm({ ...dietForm, targetCalories: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>PROTEIN (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetProtein}
                    onChange={(e) => setDietForm({ ...dietForm, targetProtein: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>CARBS (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetCarbs}
                    onChange={(e) => setDietForm({ ...dietForm, targetCarbs: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>FATS (g)</label>
                  <input
                    type="number"
                    value={dietForm.targetFats}
                    onChange={(e) => setDietForm({ ...dietForm, targetFats: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#8c8c9a", marginBottom: "4px", fontWeight: "700" }}>COACH INSTRUCTIONS</label>
                <textarea
                  rows="2"
                  value={dietForm.instructions}
                  onChange={(e) => setDietForm({ ...dietForm, instructions: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0b0b0e", border: "1px solid #333", borderRadius: "5px", color: "#fff", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setDietModalUser(null)}
                  style={{ padding: "10px 18px", backgroundColor: "#222", border: "1px solid #444", color: "#ccc", borderRadius: "5px", cursor: "pointer", fontWeight: "700" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 22px", backgroundColor: "#B5F23D", border: "none", color: "#111", borderRadius: "5px", cursor: "pointer", fontWeight: "800" }}
                >
                  ASSIGN PLAN
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