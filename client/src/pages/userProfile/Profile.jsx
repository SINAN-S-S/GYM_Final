import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [user, setUser] = useState({ username: "", email: "", phone: "", weight: "", height: "", goal: "" });
  const [access, setAccess] = useState({ isLocked: true, hasPurchased: false, hasTrainer: false, isApproved: false });
  const [purchases, setPurchases] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Fresh User Profile
        try {
          const profileRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.data) {
            setUser(profileRes.data);
            localStorage.setItem("user", JSON.stringify(profileRes.data));
          }
        } catch (profileErr) {
          console.error("Error fetching fresh profile:", profileErr);
          if (profileErr.response?.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }
        }

        // Fetch Access Status
        const accessRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/access-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAccess(accessRes.data);

        // Fetch Purchases
        const purchaseRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/purchases/my-purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(purchaseRes.data);

        // Fetch Bookings
        const bookingRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/mybookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, logout]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(user));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (loading) return <div className="profile-page"><div className="loading-state">Loading Dashboard...</div></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <header className="profile-header">
          <div className="header-left">
            <h1 className="heavy-title">OPERATOR <br/> DASHBOARD</h1>
          </div>
          <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className={`status-badge ${access.isLocked ? 'locked' : 'unlocked'}`}>
              {access.isLocked ? "🔒 ACCESS RESTRICTED" : "🔓 FULL ACCESS"}
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="profile-logout-btn"
              title="Sign Out"
            >
              LOGOUT
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          
          {/* Section A: Account Details */}
          <div className="dashboard-card account-details">
            <h3>ACCOUNT DETAILS</h3>
            <div className="brutalist-form">
              <div className="input-field">
                <label>USERNAME</label>
                <input name="username" value={user.username || ""} onChange={handleChange} />
              </div>
              <div className="input-field">
                <label>EMAIL</label>
                <input name="email" value={user.email || ""} onChange={handleChange} />
              </div>
              <div className="input-field">
                <label>PHONE</label>
                <input name="phone" value={user.phone || ""} onChange={handleChange} />
              </div>
              <button className="save-btn" onClick={handleSave}>UPDATE PROFILE</button>
            </div>
          </div>

          {/* Section B: Premium Access Tracker */}
          <div className="dashboard-card access-tracker">
            <h3>PREMIUM ACCESS STATUS</h3>
            <p className="tracker-desc">Complete these requirements to unlock the Elite Exercise Library.</p>
            
            <div className="checklist">
              <div className={`check-item ${access.hasPurchased ? 'complete' : ''}`}>
                <div className="indicator"></div>
                <div className="check-content">
                  <h4>1. Program Purchased</h4>
                  <span>{access.hasPurchased ? "Completed" : "Pending"}</span>
                </div>
              </div>
              
              <div className={`check-item ${access.hasTrainer ? 'complete' : ''}`}>
                <div className="indicator"></div>
                <div className="check-content">
                  <h4>2. Trainer Selected</h4>
                  <span>{access.hasTrainer ? "Completed" : "Pending"}</span>
                </div>
              </div>
              
              <div className={`check-item ${access.isApproved ? 'complete' : ''}`}>
                <div className="indicator"></div>
                <div className="check-content">
                  <h4>3. Admin Approval</h4>
                  <span>{access.isApproved ? "Confirmed" : "Pending"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Purchased Programs */}
          <div className="dashboard-card wide-card purchases-history">
            <h3>PURCHASE HISTORY</h3>
            {purchases.length === 0 ? (
              <p className="empty-msg">No programs purchased yet.</p>
            ) : (
              <div className="history-list">
                {purchases.map(p => (
                  <div className="history-item" key={p._id}>
                    <div className="history-info">
                      <h4>{p.itemId?.title || p.itemId?.name || p.program?.title || "Purchased Item"}</h4>
                      <span>
                        {new Date(p.createdAt).toLocaleDateString()}
                        {p.itemId?.duration ? ` • ${p.itemId.duration}` : p.itemId?.brand ? ` • ${p.itemId.brand}` : ""}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span className={`payment-method ${p.paymentMethod === 'DEMO' ? 'demo-badge' : ''}`}>{p.paymentMethod}</span>
                      {p.status && (
                        <span className={`status-pill ${p.status.toLowerCase()}`}>{p.status}</span>
                      )}
                      <span className="price">${p.amount}.00</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section D: Trainer Requests */}
          <div className="dashboard-card wide-card bookings-history">
            <h3>TRAINER REQUESTS</h3>
            {bookings.length === 0 ? (
              <p className="empty-msg">No trainer sessions requested yet.</p>
            ) : (
              <div className="history-list">
                {bookings.map(b => (
                  <div className="history-item" key={b._id}>
                    <div className="history-info">
                      <h4>{b.trainer?.name || "Unknown Trainer"}</h4>
                      <span>Requested on {new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="history-meta">
                      <span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;