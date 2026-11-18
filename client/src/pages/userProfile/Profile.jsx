import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaUser,
  FaDumbbell,
  FaCalendarCheck,
  FaAppleAlt,
  FaChartLine,
  FaTrophy,
  FaIdCard,
  FaCreditCard,
  FaBell,
  FaSignOutAlt,
  FaPlus,
  FaCheck,
  FaTimes,
  FaQrcode,
  FaWater,
  FaFire,
  FaRunning,
  FaLock,
  FaUnlock,
  FaTrash
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, setUser, logout } = useContext(AuthContext);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Core Data States
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    weight: "",
    height: "",
    goal: "",
    membership: { plan: "Standard", status: "Active", expiresAt: null },
    points: 150,
    qrCode: "",
  });
  const [access, setAccess] = useState({ isLocked: true, hasPurchased: false, hasTrainer: false, isApproved: false });
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [workouts, setWorkouts] = useState([]);
  const [progressLogs, setProgressLogs] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [waterCount, setWaterCount] = useState(1250); // ml
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalCheckIns: 0, streak: 0 });
  const [qrData, setQrData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Forms & Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    title: "",
    category: "Chest",
    durationMinutes: 45,
    caloriesBurned: 350,
    exercises: [{ name: "Barbell Bench Press", sets: [{ reps: 10, weight: 60 }] }],
  });
  const [progressForm, setProgressForm] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    chest: "",
    waist: "",
    arms: "",
    photoUrl: "",
    notes: "",
  });
  const [bookingForm, setBookingForm] = useState({
    trainerId: "",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: "09:00 AM",
    sessionType: "Personal Training",
    notes: "",
  });

  const getBackendUrl = () => {
    const isLocal = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isLocal) return "http://localhost:5000";
    const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
    if (!configured || /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(configured)) {
      return "https://gym-final-3uya.vercel.app";
    }
    return configured;
  };
  const backendUrl = getBackendUrl();

  // Initial Data Fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchAllDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. User Profile & Access Status
        try {
          const profileRes = await axios.get(`${backendUrl}/api/users/profile`, { headers });
          if (profileRes.data) {
            setProfile(profileRes.data);
            setProgressForm((prev) => ({
              ...prev,
              weight: profileRes.data.weight || "",
              height: profileRes.data.height || "",
            }));
            if (!authUser && setUser) {
              setUser(profileRes.data);
            }
          }
        } catch (err) {
          if (err.response?.status === 401) {
            logout();
            navigate("/login");
            return;
          }
        }

        const accessRes = await axios.get(`${backendUrl}/api/users/access-status`, { headers }).catch(() => null);
        if (accessRes?.data) setAccess(accessRes.data);

        // 2. Attendance & QR
        const qrRes = await axios.get(`${backendUrl}/api/attendance/my-qr`, { headers }).catch(() => null);
        if (qrRes?.data) setQrData(qrRes.data);

        const attHistRes = await axios.get(`${backendUrl}/api/attendance/my-history`, { headers }).catch(() => null);
        if (attHistRes?.data) {
          const list = attHistRes.data.history || attHistRes.data.records || (Array.isArray(attHistRes.data) ? attHistRes.data : []);
          const safeList = Array.isArray(list) ? list : [];
          setAttendanceHistory(safeList);
          setAttendanceStats({
            totalCheckIns: attHistRes.data.totalCheckIns || attHistRes.data.totalDays || safeList.length,
            streak: attHistRes.data.streak || 0,
          });
        }

        // 3. Workouts
        const workoutRes = await axios.get(`${backendUrl}/api/workout-logs/my`, { headers }).catch(() => null);
        if (workoutRes?.data) {
          const wList = workoutRes.data.logs || workoutRes.data.workouts || (Array.isArray(workoutRes.data) ? workoutRes.data : []);
          setWorkouts(Array.isArray(wList) ? wList : []);
        }

        // 4. Progress
        const progRes = await axios.get(`${backendUrl}/api/progress/my`, { headers }).catch(() => null);
        if (progRes?.data) {
          const pList = Array.isArray(progRes.data) ? progRes.data : (progRes.data.progress || []);
          setProgressLogs(Array.isArray(pList) ? pList : []);
        }

        // 5. Diet Plan
        const dietRes = await axios.get(`${backendUrl}/api/diet-plans/my`, { headers }).catch(() => null);
        if (dietRes?.data) setDietPlan(dietRes.data);

        // 6. Trainers & Bookings
        const trainerRes = await axios.get(`${backendUrl}/api/trainers`).catch(() => null);
        if (trainerRes?.data) {
          const tList = Array.isArray(trainerRes.data) ? trainerRes.data : [];
          setTrainers(tList);
          if (tList.length > 0) {
            setBookingForm((prev) => ({ ...prev, trainerId: tList[0]._id }));
          }
        }

        const bookingRes = await axios.get(`${backendUrl}/api/bookings/mybookings`, { headers }).catch(() => null);
        if (bookingRes?.data) {
          const bList = Array.isArray(bookingRes.data) ? bookingRes.data : (bookingRes.data.bookings || []);
          setBookings(Array.isArray(bList) ? bList : []);
        }

        // 7. Challenges & Leaderboard
        const chalRes = await axios.get(`${backendUrl}/api/challenges`, { headers }).catch(() => null);
        if (chalRes?.data) {
          setChallenges(Array.isArray(chalRes.data) ? chalRes.data : []);
        }

        const leaderRes = await axios.get(`${backendUrl}/api/challenges/leaderboard`, { headers }).catch(() => null);
        if (leaderRes?.data) {
          setLeaderboard(Array.isArray(leaderRes.data) ? leaderRes.data : []);
        }

        // 8. Memberships & Purchases
        const plansRes = await axios.get(`${backendUrl}/api/memberships/plans`).catch(() => null);
        if (plansRes?.data) {
          setMembershipPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        }

        const purchaseRes = await axios.get(`${backendUrl}/api/purchases/my-purchases`, { headers }).catch(() => null);
        if (purchaseRes?.data) {
          const purList = Array.isArray(purchaseRes.data) ? purchaseRes.data : (purchaseRes.data.purchases || []);
          setPurchases(Array.isArray(purList) ? purList : []);
        }

        // 9. Notifications
        const notifRes = await axios.get(`${backendUrl}/api/notifications/my`, { headers }).catch(() => null);
        if (notifRes?.data) {
          const nList = notifRes.data.notifications || (Array.isArray(notifRes.data) ? notifRes.data : []);
          setNotifications(Array.isArray(nList) ? nList : []);
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [backendUrl, navigate, logout]);

  // Profile Save
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${backendUrl}/api/users/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setProfile(res.data);
        if (setUser) setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.msg || "Error updating profile");
    }
  };

  // Self Check-In / Test QR Check-in
  const handleSelfCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/attendance/check-in`,
        { qrToken: qrData?.qrToken, method: "QR_Code" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg || "Check-in recorded successfully!");
      // Refresh attendance history
      const attHistRes = await axios.get(`${backendUrl}/api/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (attHistRes?.data) {
        const list = attHistRes.data.history || attHistRes.data.records || [];
        setAttendanceHistory(list);
        setAttendanceStats({
          totalCheckIns: attHistRes.data.totalCheckIns || list.length,
          streak: attHistRes.data.streak || 0,
        });
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Check-in failed");
    }
  };

  // Self Check-Out
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/attendance/check-out`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg || "Check-out logged successfully! Great session.");
      // Refresh attendance history
      const attHistRes = await axios.get(`${backendUrl}/api/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (attHistRes?.data) {
        const list = attHistRes.data.history || attHistRes.data.records || [];
        setAttendanceHistory(list);
        setAttendanceStats({
          totalCheckIns: attHistRes.data.totalCheckIns || list.length,
          streak: attHistRes.data.streak || 0,
        });
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Check-out failed. You might not have checked in today.");
    }
  };

  // Delete Workout Log
  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout log?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/workout-logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(workouts.filter((w) => w._id !== id));
      alert("Workout log removed.");
    } catch (err) {
      alert("Failed to delete workout log");
    }
  };

  // Delete Progress Entry
  const handleDeleteProgress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this progress entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressLogs(progressLogs.filter((p) => p._id !== id));
      alert("Progress entry removed.");
    } catch (err) {
      alert("Failed to delete progress entry");
    }
  };

  // Update Challenge Progress
  const handleUpdateChallengeProgress = async (challengeId, increment = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${backendUrl}/api/challenges/${challengeId}/progress`,
        { increment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg || "Challenge progress updated!");
      // Refresh challenges and leaderboard
      const [chalRes, leadRes] = await Promise.all([
        axios.get(`${backendUrl}/api/challenges`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/challenges/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (chalRes?.data) setChallenges(chalRes.data);
      if (leadRes?.data) setLeaderboard(leadRes.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update challenge progress. Join challenge first!");
    }
  };

  // Workout Log Submission
  const handleLogWorkout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/workout-logs`, workoutForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newLog = res.data.log || res.data;
      setWorkouts([newLog, ...workouts]);
      alert("Workout logged successfully! +25 Alpha Points earned.");
      setWorkoutForm({
        title: "",
        category: "Chest",
        durationMinutes: 45,
        caloriesBurned: 350,
        exercises: [{ name: "Barbell Bench Press", sets: [{ reps: 10, weight: 60 }] }],
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to log workout");
    }
  };

  // Progress Log Submission
  const handleLogProgress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/progress`, progressForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newProg = res.data.progress || res.data;
      setProgressLogs([newProg, ...progressLogs]);
      alert(`Progress logged! Calculated BMI: ${newProg.bmi || "Recorded"} (${newProg.category || "Normal"})`);
      setProgressForm({
        weight: "",
        height: "",
        bodyFat: "",
        chest: "",
        waist: "",
        arms: "",
        photoUrl: "",
        notes: "",
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to log progress");
    }
  };

  // Book Trainer Appointment
  const handleBookTrainer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/bookings/book`,
        {
          trainerId: bookingForm.trainerId,
          date: bookingForm.date,
          timeSlot: bookingForm.timeSlot,
          sessionType: bookingForm.sessionType,
          notes: bookingForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings([res.data.booking, ...bookings]);
      alert("Training session booked successfully!");
    } catch (err) {
      alert(err.response?.data?.msg || "Booking failed. Slot may already be occupied.");
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)));
      alert("Booking cancelled.");
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  // Join Challenge
  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/challenges/${challengeId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.msg || "Joined challenge!");
      // Refresh challenges
      const chalRes = await axios.get(`${backendUrl}/api/challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (chalRes?.data) setChallenges(chalRes.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to join challenge");
    }
  };

  // Purchase/Renew Membership
  const handlePurchaseMembership = async (planId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/memberships/purchase`,
        { planId, paymentMethod: "Razorpay" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Membership upgraded to ${res.data.membership.plan}! Expires: ${new Date(res.data.membership.expiresAt).toLocaleDateString()}`);
      setProfile((prev) => ({ ...prev, membership: res.data.membership }));
    } catch (err) {
      alert(err.response?.data?.msg || "Membership upgrade failed");
    }
  };

  // Mark All Notifications Read
  const handleMarkNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []));
    } catch (err) {
      console.error(err);
    }
  };

  // QR Code Image Generator URL
  const qrImageSrc = qrData?.qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData.qrToken)}&bgcolor=111116&color=B5F23D`
    : "";

  // Safe Progress Arrays & Calculate Latest BMI
  const safeProgress = Array.isArray(progressLogs) ? progressLogs : [];
  const latestWeight = Number(safeProgress[0]?.weight || profile.weight || 75);
  const latestHeight = Number(safeProgress[0]?.height || profile.height || 178);
  const calculatedBMI = latestHeight > 0 ? (latestWeight / Math.pow(latestHeight / 100, 2)).toFixed(1) : "22.5";
  const bmiCategory = calculatedBMI < 18.5 ? "Underweight" : calculatedBMI < 25 ? "Normal" : calculatedBMI < 30 ? "Overweight" : "Obese";

  // Progression Chart Data
  const chartData = [...safeProgress]
    .slice(-10)
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
    .map((p) => ({
      date: new Date(p.date || p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: Number(p.weight) || latestWeight,
      bmi: Number(p.bmi) || Number(calculatedBMI),
    }));

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>LOADING ALPHAFIT MEMBER HUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* TOP HERO MEMBER CARD */}
        <div className="member-hero-card">
          <div className="member-hero-info">
            <div className="member-avatar">
              <FaUser />
            </div>
            <div>
              <div className="member-tag-row">
                <span className="membership-tier-badge">{profile.membership?.plan || "PRO ATHLETE"}</span>
                <span className={`membership-status-pill ${profile.membership?.status === "Active" ? "active" : "trial"}`}>
                  {profile.membership?.status || "ACTIVE"}
                </span>
              </div>
              <h1 className="member-name">{profile.username || authUser?.username || "Alpha Athlete"}</h1>
              <p className="member-meta">
                ID: {profile._id ? profile._id.slice(-8).toUpperCase() : "AP-8924"} • {profile.email}
              </p>
            </div>
          </div>

          <div className="member-hero-actions">
            <button className="qr-badge-btn" onClick={() => setShowQRModal(true)} title="Show Digital Gym Pass">
              <FaQrcode /> SHOW PASS
            </button>
            <button
              className="member-logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign Out"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* QUICK STATS METRIC TILES */}
        <div className="member-metrics-row">
          <div className="metric-tile">
            <div className="metric-header">
              <span>WORKOUTS</span>
              <FaDumbbell className="metric-icon" />
            </div>
            <div className="metric-value">{workouts.length}</div>
            <span className="metric-sub">Sessions Logged</span>
          </div>

          <div className="metric-tile">
            <div className="metric-header">
              <span>ATTENDANCE</span>
              <FaCalendarCheck className="metric-icon" />
            </div>
            <div className="metric-value">{attendanceStats.streak} <small>DAYS</small></div>
            <span className="metric-sub">{attendanceStats.totalCheckIns} Total Gym Visits</span>
          </div>

          <div className="metric-tile">
            <div className="metric-header">
              <span>CURRENT BMI</span>
              <FaChartLine className="metric-icon" />
            </div>
            <div className="metric-value">{calculatedBMI}</div>
            <span className="metric-sub">{bmiCategory} ({latestWeight} kg)</span>
          </div>

          <div className="metric-tile highlight">
            <div className="metric-header">
              <span>LOYALTY POINTS</span>
              <FaTrophy className="metric-icon gold" />
            </div>
            <div className="metric-value">{profile.points || 150}</div>
            <span className="metric-sub">Rank #12 in Alpha Gym</span>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLS */}
        <div className="profile-tabs-nav">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <FaIdCard /> OVERVIEW
          </button>
          <button className={`tab-btn ${activeTab === "workouts" ? "active" : ""}`} onClick={() => setActiveTab("workouts")}>
            <FaDumbbell /> WORKOUTS ({workouts.length})
          </button>
          <button className={`tab-btn ${activeTab === "progress" ? "active" : ""}`} onClick={() => setActiveTab("progress")}>
            <FaChartLine /> BODY PROGRESS
          </button>
          <button className={`tab-btn ${activeTab === "diet" ? "active" : ""}`} onClick={() => setActiveTab("diet")}>
            <FaAppleAlt /> DIET & MACROS
          </button>
          <button className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
            <FaCalendarCheck /> ATTENDANCE & QR
          </button>
          <button className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
            <FaUser /> TRAINER APPOINTMENTS
          </button>
          <button className={`tab-btn ${activeTab === "challenges" ? "active" : ""}`} onClick={() => setActiveTab("challenges")}>
            <FaTrophy /> CHALLENGES
          </button>
          <button className={`tab-btn ${activeTab === "membership" ? "active" : ""}`} onClick={() => setActiveTab("membership")}>
            <FaCreditCard /> MEMBERSHIP & BILLS
          </button>
          <button className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
            <FaBell /> ALERTS ({(Array.isArray(notifications) ? notifications.filter((n) => !n.isRead).length : 0)})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane-content">
            <div className="overview-grid">
              
              {/* Account Quick Details */}
              <div className="dashboard-card">
                <h3>MEMBER PROFILE</h3>
                <form className="brutalist-form" onSubmit={handleUpdateProfile}>
                  <div className="input-field">
                    <label>USERNAME</label>
                    <input
                      name="username"
                      value={profile.username || ""}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    />
                  </div>
                  <div className="input-field">
                    <label>EMAIL</label>
                    <input
                      name="email"
                      value={profile.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="input-field">
                    <label>PHONE</label>
                    <input
                      name="phone"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="save-btn">UPDATE PROFILE</button>
                </form>
              </div>

              {/* Digital Pass Widget */}
              <div className="dashboard-card qr-summary-card">
                <h3>DIGITAL ACCESS PASS</h3>
                <div className="qr-box">
                  {qrImageSrc ? (
                    <img src={qrImageSrc} alt="Member QR" className="member-qr-img" />
                  ) : (
                    <div className="qr-placeholder">Pass Ready</div>
                  )}
                  <p className="qr-token-label">{qrData?.qrToken || "AP-MEMBER-PASS"}</p>
                  <button className="checkin-test-btn" onClick={handleSelfCheckIn}>
                    <FaCheck /> SIMULATE GYM CHECK-IN
                  </button>
                </div>
              </div>

              {/* Daily Nutrition & Water Snapshot */}
              <div className="dashboard-card water-tracker-card">
                <h3>HYDRATION & WATER TARGET</h3>
                <div className="water-tracker-box">
                  <div className="water-level-display">
                    <FaWater className="water-icon" />
                    <span className="water-count-text">{waterCount} / 3000 ml</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (waterCount / 3000) * 100)}%` }}></div>
                  </div>
                  <div className="water-actions">
                    <button className="water-btn" onClick={() => setWaterCount((prev) => Math.min(5000, prev + 250))}>
                      + 250ml Glass
                    </button>
                    <button className="water-btn" onClick={() => setWaterCount((prev) => Math.max(0, prev - 250))}>
                      - 250ml
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment Snapshot */}
              <div className="dashboard-card">
                <h3>NEXT TRAINER SESSION</h3>
                {bookings.length > 0 ? (
                  <div className="next-booking-box">
                    <div className="session-icon"><FaUser /></div>
                    <div>
                      <h4>{bookings[0].trainer?.name || "Assigned Coach"}</h4>
                      <p>{bookings[0].sessionType || "Personal Training"} • {new Date(bookings[0].date).toLocaleDateString()} at {bookings[0].timeSlot || "Morning"}</p>
                      <span className={`status-pill ${bookings[0].status?.toLowerCase()}`}>{bookings[0].status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-slot-box">
                    <p>No upcoming personal training sessions scheduled.</p>
                    <button className="save-btn" onClick={() => setActiveTab("bookings")}>BOOK A SESSION</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: WORKOUT TRACKING */}
        {activeTab === "workouts" && (
          <div className="tab-pane-content">
            {/* Workout Volume & Frequency Analytics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "22px" }}>
              <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "#8c8c9a", fontWeight: "700" }}>THIS WEEK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#B5F23D", marginTop: "4px" }}>
                  {Array.isArray(workouts) ? workouts.filter(w => new Date(w.date || w.createdAt) >= new Date(Date.now() - 7 * 86400000)).length : 0}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#666" }}>Workouts</div>
              </div>
              <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "#8c8c9a", fontWeight: "700" }}>THIS MONTH</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#38bdf8", marginTop: "4px" }}>
                  {Array.isArray(workouts) ? workouts.filter(w => new Date(w.date || w.createdAt) >= new Date(Date.now() - 30 * 86400000)).length : 0}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#666" }}>Workouts</div>
              </div>
              <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "#8c8c9a", fontWeight: "700" }}>ACTIVE TIME</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginTop: "4px" }}>
                  {Array.isArray(workouts) ? workouts.reduce((sum, w) => sum + (Number(w.durationMinutes) || 0), 0) : 0}m
                </div>
                <div style={{ fontSize: "0.68rem", color: "#666" }}>Logged Minutes</div>
              </div>
              <div style={{ backgroundColor: "#14141a", border: "1px solid #282834", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", color: "#8c8c9a", fontWeight: "700" }}>CALORIES BURNED</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ff4757", marginTop: "4px" }}>
                  {Array.isArray(workouts) ? workouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0) : 0}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#666" }}>Total kcal</div>
              </div>
            </div>

            {/* Daily Assigned Coach Workout Protocol */}
            <div style={{ backgroundColor: "#14141a", border: "1px solid rgba(181, 242, 61, 0.35)", borderRadius: "10px", padding: "18px 22px", marginBottom: "22px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ backgroundColor: "#B5F23D", color: "#111", fontSize: "0.68rem", fontWeight: "900", padding: "2px 8px", borderRadius: "3px" }}>DAILY PROTOCOL</span>
                  <span style={{ color: "#8c8c9a", fontSize: "0.78rem" }}>Goal: {profile.goal || "Hypertrophy & Strength"}</span>
                </div>
                <h4 style={{ margin: "4px 0", fontSize: "1.1rem", color: "#fff" }}>Alpha Compound Strength & Hypertrophy Split</h4>
                <p style={{ margin: 0, color: "#aaa", fontSize: "0.82rem" }}>
                  4 Sets x 10-12 Reps • Barbell Compound Lifts • 45 Minutes • Target: Full Body Power
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWorkoutForm({
                    title: "Alpha Compound Strength Split",
                    category: "Full Body",
                    durationMinutes: 50,
                    caloriesBurned: 420,
                    exercises: [{ name: "Barbell Squats & Bench Press", sets: [{ reps: 10, weight: 70 }] }],
                  });
                  alert("Protocol loaded into form! Adjust weights/reps and hit '+ LOG COMPLETED WORKOUT'.");
                }}
                style={{
                  backgroundColor: "#B5F23D",
                  color: "#111",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  letterSpacing: "0.5px"
                }}
              >
                + LOAD PROTOCOL
              </button>
            </div>

            <div className="two-column-layout">
              {/* Form to log a workout */}
              <div className="dashboard-card">
                <h3>LOG TODAY'S WORKOUT</h3>
                <form onSubmit={handleLogWorkout} className="brutalist-form">
                  <div className="input-field">
                    <label>WORKOUT TITLE</label>
                    <input
                      placeholder="e.g. Heavy Upper Body Push"
                      required
                      value={workoutForm.title}
                      onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="input-field">
                      <label>CATEGORY</label>
                      <select
                        value={workoutForm.category}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, category: e.target.value })}
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Full Body">Full Body</option>
                      </select>
                    </div>
                    <div className="input-field">
                      <label>DURATION (MINUTES)</label>
                      <input
                        type="number"
                        min="5"
                        max="240"
                        value={workoutForm.durationMinutes}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, durationMinutes: Number(e.target.value) })}
                      />
                    </div>
                    <div className="input-field">
                      <label>CALORIES BURNED</label>
                      <input
                        type="number"
                        min="0"
                        value={workoutForm.caloriesBurned}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, caloriesBurned: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="input-field">
                    <label>PRIMARY EXERCISE & WEIGHT</label>
                    <input
                      placeholder="e.g. Incline Dumbbell Press (3 Sets x 12 Reps @ 28kg)"
                      value={workoutForm.exercises[0]?.name || ""}
                      onChange={(e) => {
                        const ex = [...workoutForm.exercises];
                        ex[0] = { ...ex[0], name: e.target.value };
                        setWorkoutForm({ ...workoutForm, exercises: ex });
                      }}
                    />
                  </div>

                  <button type="submit" className="save-btn">+ LOG COMPLETED WORKOUT</button>
                </form>
              </div>

              {/* History of Workouts */}
              <div className="dashboard-card">
                <h3>WORKOUT LOGS HISTORY</h3>
                {workouts.length === 0 ? (
                  <p className="empty-msg">No workout logs recorded yet. Start logging today!</p>
                ) : (
                  <div className="history-list">
                    {workouts.map((w) => (
                      <div className="history-item" key={w._id}>
                        <div className="history-info">
                          <h4>{w.title}</h4>
                          <span>
                            {new Date(w.date || w.createdAt).toLocaleDateString()} • {w.category} • {w.durationMinutes} mins
                          </span>
                        </div>
                        <div className="history-meta">
                          <span className="calorie-badge"><FaFire /> {w.caloriesBurned} kcal</span>
                          <span className="status-pill active">COMPLETED</span>
                          <button
                            className="cancel-booking-btn"
                            onClick={() => handleDeleteWorkout(w._id)}
                            title="Delete Log"
                            style={{ padding: "4px 8px" }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BODY PROGRESS & MEASUREMENTS */}
        {activeTab === "progress" && (
          <div className="tab-pane-content">
            <div className="two-column-layout">
              {/* Form to log progress */}
              <div className="dashboard-card">
                <h3>RECORD BODY MEASUREMENTS</h3>
                <form onSubmit={handleLogProgress} className="brutalist-form">
                  <div className="form-row">
                    <div className="input-field">
                      <label>WEIGHT (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={progressForm.weight}
                        onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label>HEIGHT (CM)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={progressForm.height}
                        onChange={(e) => setProgressForm({ ...progressForm, height: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label>BODY FAT % (OPTIONAL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={progressForm.bodyFat}
                        onChange={(e) => setProgressForm({ ...progressForm, bodyFat: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-field">
                      <label>CHEST (CM)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={progressForm.chest}
                        onChange={(e) => setProgressForm({ ...progressForm, chest: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label>WAIST (CM)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={progressForm.waist}
                        onChange={(e) => setProgressForm({ ...progressForm, waist: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label>ARMS (CM)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={progressForm.arms}
                        onChange={(e) => setProgressForm({ ...progressForm, arms: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="input-field">
                    <label>COACH NOTES / JOURNAL</label>
                    <input
                      placeholder="e.g. Feeling strong, bench press increased by 5kg"
                      value={progressForm.notes}
                      onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                    />
                  </div>

                  <div className="input-field">
                    <label>PROGRESS PHOTO URL (OPTIONAL)</label>
                    <input
                      placeholder="e.g. https://... progress photo link"
                      value={progressForm.photoUrl}
                      onChange={(e) => setProgressForm({ ...progressForm, photoUrl: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="save-btn">RECORD PROGRESS</button>
                </form>
              </div>

              {/* Progress History List */}
              <div className="dashboard-card">
                <h3>PROGRESS TIMELINE</h3>
                {progressLogs.length === 0 ? (
                  <p className="empty-msg">No progress checkpoints recorded yet.</p>
                ) : (
                  <div className="history-list">
                    {progressLogs.map((p) => (
                      <div className="history-item" key={p._id}>
                        <div className="history-info">
                          <h4>{p.weight} kg • BMI: {p.bmi || calculatedBMI} ({p.category || bmiCategory})</h4>
                          <span>
                            {new Date(p.date || p.createdAt).toLocaleDateString()}
                            {p.chest ? ` • Chest: ${p.chest}cm` : ""}
                            {p.arms ? ` • Arms: ${p.arms}cm` : ""}
                            {p.waist ? ` • Waist: ${p.waist}cm` : ""}
                          </span>
                        </div>
                        <div className="history-meta">
                          {p.bodyFat && <span className="status-pill">{p.bodyFat}% BF</span>}
                          <button
                            className="cancel-booking-btn"
                            onClick={() => handleDeleteProgress(p._id)}
                            title="Delete Entry"
                            style={{ padding: "4px 8px" }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Before & After Visual Comparison */}
            {Array.isArray(progressLogs) && progressLogs.length > 0 && (
              <div className="dashboard-card" style={{ marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0 }}>BEFORE & AFTER COMPARISON</h3>
                  <span style={{ fontSize: "0.8rem", color: "#B5F23D", fontWeight: 700 }}>
                    {progressLogs.length} Checkpoints Logged
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  {/* Baseline / Starting */}
                  <div style={{ backgroundColor: "#181822", padding: "18px", borderRadius: "8px", textAlign: "center" }}>
                    <p style={{ color: "#8c8c9a", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "1px", margin: "0 0 10px" }}>
                      FIRST RECORD ({new Date(progressLogs[progressLogs.length - 1].date || progressLogs[progressLogs.length - 1].createdAt).toLocaleDateString()})
                    </p>
                    {progressLogs[progressLogs.length - 1].photos?.[0]?.url ? (
                      <img
                        src={progressLogs[progressLogs.length - 1].photos[0].url}
                        alt="Baseline Progress"
                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", marginBottom: "12px" }}
                      />
                    ) : (
                      <div style={{ height: "140px", backgroundColor: "#101014", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#666", marginBottom: "12px", fontSize: "0.85rem" }}>
                        Photo Not Provided
                      </div>
                    )}
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff" }}>
                      {progressLogs[progressLogs.length - 1].weight || latestWeight} kg
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#8c8c9a", marginTop: "4px" }}>
                      BMI: {progressLogs[progressLogs.length - 1].bmi || calculatedBMI} • {progressLogs[progressLogs.length - 1].bodyFat ? `${progressLogs[progressLogs.length - 1].bodyFat}% BF` : "Baseline"}
                    </div>
                  </div>

                  {/* Current / Latest */}
                  <div style={{ backgroundColor: "#181822", padding: "18px", borderRadius: "8px", textAlign: "center", border: "1px solid rgba(181, 242, 61, 0.4)" }}>
                    <p style={{ color: "#B5F23D", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "1px", margin: "0 0 10px" }}>
                      LATEST CHECKPOINT ({new Date(progressLogs[0].date || progressLogs[0].createdAt).toLocaleDateString()})
                    </p>
                    {progressLogs[0].photos?.[0]?.url ? (
                      <img
                        src={progressLogs[0].photos[0].url}
                        alt="Latest Progress"
                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", marginBottom: "12px" }}
                      />
                    ) : (
                      <div style={{ height: "140px", backgroundColor: "#101014", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#666", marginBottom: "12px", fontSize: "0.85rem" }}>
                        Photo Not Provided
                      </div>
                    )}
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#B5F23D" }}>
                      {progressLogs[0].weight || latestWeight} kg
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#8c8c9a", marginTop: "4px" }}>
                      BMI: {progressLogs[0].bmi || calculatedBMI} • {progressLogs[0].bodyFat ? `${progressLogs[0].bodyFat}% BF` : "Latest"}
                    </div>
                  </div>
                </div>

                {progressLogs.length > 1 && (
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#121218", borderRadius: "6px", textAlign: "center", fontSize: "0.9rem", color: "#ccc" }}>
                    Total Weight Delta: <strong style={{ color: "#B5F23D" }}>
                      {((progressLogs[0].weight || latestWeight) - (progressLogs[progressLogs.length - 1].weight || latestWeight)).toFixed(1)} kg
                    </strong>
                    {" "}• Time Span: <strong style={{ color: "#fff" }}>
                      {Math.max(1, Math.round((new Date(progressLogs[0].date || progressLogs[0].createdAt) - new Date(progressLogs[progressLogs.length - 1].date || progressLogs[progressLogs.length - 1].createdAt)) / (1000 * 60 * 60 * 24)))} Days
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Recharts Graphical Progression */}
            <div className="dashboard-card" style={{ marginTop: "24px" }}>
              <h3>WEIGHT & BMI PROGRESSION (INTERACTIVE CHART)</h3>
              {chartData.length > 0 ? (
                <div style={{ width: "100%", height: 260, marginTop: "16px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#8c8c9a" fontSize={11} />
                      <YAxis stroke="#8c8c9a" fontSize={11} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#181820", border: "1px solid #333", borderRadius: "6px", color: "#fff" }}
                        labelStyle={{ color: "#B5F23D", fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#B5F23D" strokeWidth={3} dot={{ fill: "#B5F23D", r: 4 }} name="Weight (kg)" />
                      <Line type="monotone" dataKey="bmi" stroke="#38bdf8" strokeWidth={2} dot={{ fill: "#38bdf8", r: 3 }} name="BMI" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="empty-msg">Log at least one measurement to view your progression curve.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DIET & MEAL SCHEDULE */}
        {activeTab === "diet" && (
          <div className="tab-pane-content">
            <div className="diet-overview-banner">
              <div className="macro-card">
                <span>TARGET CALORIES</span>
                <h3>{dietPlan?.targetCalories || 2400} <small>kcal</small></h3>
              </div>
              <div className="macro-card">
                <span>PROTEIN</span>
                <h3>{dietPlan?.targetProtein || 170}g</h3>
                <small className="macro-sub">Muscle Recovery</small>
              </div>
              <div className="macro-card">
                <span>CARBOHYDRATES</span>
                <h3>{dietPlan?.targetCarbs || 230}g</h3>
                <small className="macro-sub">Energy & Power</small>
              </div>
              <div className="macro-card">
                <span>HEALTHY FATS</span>
                <h3>{dietPlan?.targetFats || 65}g</h3>
                <small className="macro-sub">Hormone Health</small>
              </div>
            </div>

            <div className="dashboard-card" style={{ marginTop: "24px" }}>
              <h3>DAILY MEAL SCHEDULE</h3>
              <div className="meals-grid">
                {(dietPlan?.meals || [
                  { mealType: "Breakfast", name: "High-Protein Oats & Whey", calories: 550, protein: 42, time: "08:00 AM", items: ["Rolled oats 80g", "Whey isolate 1 scoop", "Blueberries", "Almond butter 15g"] },
                  { mealType: "Lunch", name: "Lean Chicken Rice Bowl", calories: 680, protein: 50, time: "01:00 PM", items: ["Grilled chicken breast 200g", "Jasmine rice 150g", "Steamed broccoli", "Olive oil dressing"] },
                  { mealType: "Pre-Workout", name: "Banana & Espresso", calories: 180, protein: 4, time: "04:30 PM", items: ["1 Large banana", "Double espresso or Alpha Pre-workout"] },
                  { mealType: "Dinner", name: "Salmon with Sweet Potato", calories: 650, protein: 45, time: "08:00 PM", items: ["Wild salmon fillet 180g", "Baked sweet potato 200g", "Mixed greens salad"] },
                ]).map((m, idx) => (
                  <div className="meal-card" key={idx}>
                    <div className="meal-header">
                      <span className="meal-badge">{m.mealType}</span>
                      <span className="meal-time">{m.time}</span>
                    </div>
                    <h4>{m.name}</h4>
                    <p className="meal-macros">{m.calories} kcal • {m.protein}g Protein</p>
                    {m.items && (
                      <ul className="meal-items-list">
                        {m.items.map((it, i) => (
                          <li key={i}>• {it}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ATTENDANCE & QR */}
        {activeTab === "attendance" && (
          <div className="tab-pane-content">
            <div className="two-column-layout">
              {/* Digital Pass */}
              <div className="dashboard-card qr-full-card">
                <h3>DIGITAL GYM PASS</h3>
                <p className="pass-desc">Present this QR Code at the turnstile scanner or front desk on every visit.</p>
                <div className="qr-box">
                  {qrImageSrc ? (
                    <img src={qrImageSrc} alt="Member QR Code" className="member-qr-large" />
                  ) : (
                    <div className="qr-placeholder">Generating Pass...</div>
                  )}
                  <h4 className="qr-member-title">{profile.username}</h4>
                  <p className="qr-member-sub">TOKEN: {qrData?.qrToken || "AP-MEMBER-PASS"}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "14px", width: "100%", maxWidth: "340px" }}>
                    <button className="checkin-test-btn" onClick={handleSelfCheckIn} style={{ flex: 1, justifyContent: "center" }}>
                      <FaCheck /> CHECK IN
                    </button>
                    <button
                      className="checkin-test-btn"
                      onClick={handleCheckOut}
                      style={{ flex: 1, justifyContent: "center", borderColor: "#ff4757", color: "#ff4757" }}
                    >
                      <FaSignOutAlt /> CHECK OUT
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="dashboard-card">
                <h3>ATTENDANCE HISTORY</h3>
                {attendanceHistory.length === 0 ? (
                  <p className="empty-msg">No gym visits recorded yet. Check in on your next workout!</p>
                ) : (
                  <table className="brutalist-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>TIME</th>
                        <th>METHOD</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((att) => (
                        <tr key={att._id}>
                          <td>{att.date}</td>
                          <td>{new Date(att.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                          <td>{att.verificationMethod || "QR_Code"}</td>
                          <td><span className="status-pill active">{att.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TRAINER APPOINTMENTS */}
        {activeTab === "bookings" && (
          <div className="tab-pane-content">
            <div className="two-column-layout">
              {/* Booking Form */}
              <div className="dashboard-card">
                <h3>BOOK PERSONAL TRAINING SESSION</h3>
                <form onSubmit={handleBookTrainer} className="brutalist-form">
                  <div className="input-field">
                    <label>SELECT TRAINER</label>
                    <select
                      value={bookingForm.trainerId}
                      onChange={(e) => setBookingForm({ ...bookingForm, trainerId: e.target.value })}
                      required
                    >
                      {trainers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.specialty || "Elite Coach"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="input-field">
                      <label>SESSION DATE</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label>TIME SLOT</label>
                      <select
                        value={bookingForm.timeSlot}
                        onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                      >
                        <option value="07:00 AM">07:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                      </select>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                        {["07:00 AM", "09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setBookingForm({ ...bookingForm, timeSlot: s })}
                            style={{
                              background: bookingForm.timeSlot === s ? "#B5F23D" : "#1e1e26",
                              color: bookingForm.timeSlot === s ? "#111" : "#8c8c9a",
                              border: "1px solid #282834",
                              borderRadius: "4px",
                              padding: "3px 6px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="input-field">
                    <label>SESSION TYPE</label>
                    <select
                      value={bookingForm.sessionType}
                      onChange={(e) => setBookingForm({ ...bookingForm, sessionType: e.target.value })}
                    >
                      <option value="Personal Training">Personal Training</option>
                      <option value="Nutrition Consultation">Nutrition Consultation</option>
                      <option value="Body Assessment">Body Assessment</option>
                      <option value="Form Correction">Form Correction</option>
                    </select>
                  </div>

                  <div className="input-field">
                    <label>NOTES FOR COACH</label>
                    <input
                      placeholder="e.g. Focus on deadlift technique and lower back tightness"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="save-btn">CONFIRM APPOINTMENT</button>
                </form>
              </div>

              {/* Booking History */}
              <div className="dashboard-card">
                <h3>YOUR APPOINTMENTS</h3>
                {bookings.length === 0 ? (
                  <p className="empty-msg">No appointments requested yet.</p>
                ) : (
                  <div className="history-list">
                    {bookings.map((b) => (
                      <div className="history-item" key={b._id}>
                        <div className="history-info">
                          <h4>{b.trainer?.name || "Trainer"}</h4>
                          <span>
                            {new Date(b.date || b.createdAt).toLocaleDateString()} at {b.timeSlot || "Scheduled Slot"} • {b.sessionType || "Training"}
                          </span>
                        </div>
                        <div className="history-meta">
                          <span className={`status-pill ${b.status?.toLowerCase()}`}>{b.status}</span>
                          {b.status !== "Cancelled" && (
                            <button
                              className="cancel-booking-btn"
                              onClick={() => handleCancelBooking(b._id)}
                              title="Cancel Session"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CHALLENGES & LEADERBOARD */}
        {activeTab === "challenges" && (
          <div className="tab-pane-content">
            <div className="two-column-layout">
              {/* Active Challenges */}
              <div className="dashboard-card">
                <h3>ACTIVE FITNESS CHALLENGES</h3>
                <div className="challenges-list">
                  {(challenges.length > 0 ? challenges : [
                    { _id: "c1", title: "30-Day Consistency Beast", description: "Check in to AlphaFit at least 20 times this month", category: "Monthly", points: 250, badge: "Consistency King" },
                    { _id: "c2", title: "10,000 Pushups Club", description: "Log your weekly upper body sessions towards 10k total pushups", category: "Weekly", points: 150, badge: "Pushup Beast" },
                    { _id: "c3", title: "Cardio Crusher 50k", description: "Burn 5,000 calories via cardio and HIIT protocols", category: "Daily", points: 100, badge: "Cardio Titan" },
                  ]).map((c) => (
                    <div className="challenge-item-card" key={c._id}>
                      <div className="challenge-header">
                        <span className="challenge-cat-badge">{c.category}</span>
                        <span className="challenge-pts">+{c.points} PTS</span>
                      </div>
                      <h4>{c.title}</h4>
                      <p>{c.description}</p>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                        <button className="join-challenge-btn" onClick={() => handleJoinChallenge(c._id)}>
                          {c.isJoined ? "JOINED" : "JOIN CHALLENGE"}
                        </button>
                        <button
                          className="join-challenge-btn"
                          onClick={() => handleUpdateChallengeProgress(c._id, 1)}
                          style={{ borderColor: "#38bdf8", color: "#38bdf8" }}
                          title="Record 1 unit of progress toward this goal"
                        >
                          +1 LOG PROGRESS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="dashboard-card">
                <h3>ALPHAFIT LEADERBOARD</h3>
                <table className="brutalist-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>ATHLETE</th>
                      <th>POINTS</th>
                      <th>BADGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leaderboard.length > 0 ? leaderboard : [
                      { username: "Alex 'Viking' M.", points: 840, rank: 1, badge: "Titan" },
                      { username: "Sarah Connor", points: 720, rank: 2, badge: "Iron Lady" },
                      { username: profile.username || "You", points: profile.points || 150, rank: 3, badge: "Athlete" },
                      { username: "Marcus Vance", points: 410, rank: 4, badge: "Challenger" },
                    ]).map((user, idx) => (
                      <tr key={idx} className={user.username === profile.username ? "highlight-row" : ""}>
                        <td>#{user.rank || idx + 1}</td>
                        <td><strong>{user.username}</strong></td>
                        <td>{user.points}</td>
                        <td><span className="status-pill active">{user.badge || "PRO"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MEMBERSHIP & BILLS */}
        {activeTab === "membership" && (
          <div className="tab-pane-content">
            <div className="dashboard-card current-plan-banner">
              <div className="plan-banner-details">
                <span className="tier-tag">{profile.membership?.plan?.toUpperCase() || "STANDARD MEMBERSHIP"}</span>
                <h2>Active Plan Status: {profile.membership?.status || "Active"}</h2>
                <p>
                  Expires: {profile.membership?.expiresAt ? new Date(profile.membership.expiresAt).toLocaleDateString() : "Valid for 30 Days"} • Includes Full Gym Access, Locker, & AI Coach
                </p>
              </div>
            </div>

            <h3 style={{ margin: "28px 0 16px", color: "#B5F23D" }}>UPGRADE OR RENEW MEMBERSHIP</h3>
            <div className="membership-tiers-grid">
              {(membershipPlans.length > 0 ? membershipPlans : [
                { _id: "p1", name: "Alpha Monthly", tier: "Basic", price: 49, durationMonths: 1, description: "Full gym floor access and mobile app", features: ["Full Equipment Access", "Locker Room", "Digital QR Pass", "AI Fitness Coach"] },
                { _id: "p2", name: "Pro Athlete (3 Months)", tier: "Pro", price: 129, durationMonths: 3, description: "Includes 2 personal trainer sessions", features: ["All Basic Features", "2 Trainer Bookings/Mo", "Custom Diet Blueprint", "Priority Booking"] },
                { _id: "p3", name: "Titan VIP (Annual)", tier: "Elite", price: 399, durationMonths: 12, description: "Unrestricted access with private sauna", features: ["Unlimited Trainer Sessions", "Private Sauna & Recovery", "Free Whey Protein Shakes", "VIP Locker Pass"] },
              ]).map((plan) => (
                <div className="tier-pricing-card" key={plan._id}>
                  <span className="tier-badge">{plan.tier || "TIER"}</span>
                  <h4>{plan.name}</h4>
                  <div className="plan-price">${plan.price} <small>/ {plan.durationMonths} Mo</small></div>
                  <ul className="tier-features-list">
                    {(plan.features || []).map((f, i) => (
                      <li key={i}><FaCheck className="check-icon" /> {f}</li>
                    ))}
                  </ul>
                  <button className="select-plan-btn" onClick={() => handlePurchaseMembership(plan._id)}>
                    SELECT & RENEW
                  </button>
                </div>
              ))}
            </div>

            {/* Purchase History */}
            <div className="dashboard-card" style={{ marginTop: "32px" }}>
              <h3>PURCHASE & PAYMENT HISTORY</h3>
              {purchases.length === 0 ? (
                <p className="empty-msg">No previous transactions found.</p>
              ) : (
                <div className="history-list">
                  {purchases.map((p) => {
                    const title = p.items && p.items.length > 0
                      ? `Order (${p.items.length} items): ${p.items.map((i) => i.name).slice(0, 2).join(", ")}`
                      : p.itemId?.title || p.itemId?.name || "Purchased Item";
                    return (
                      <div className="history-item" key={p._id}>
                        <div className="history-info">
                          <h4>{title}</h4>
                          <span>{new Date(p.createdAt).toLocaleDateString()} • {p.paymentMethod}</span>
                        </div>
                        <div className="history-meta">
                          <span className="status-pill active">{p.status || "Completed"}</span>
                          <span className="price">${Number(p.amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="tab-pane-content">
            <div className="dashboard-card">
              <div className="notif-header-row">
                <h3>NOTIFICATIONS & ANNOUNCEMENTS</h3>
                <button className="mark-read-btn" onClick={handleMarkNotificationsRead}>
                  MARK ALL READ
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="empty-msg">No alerts or announcements at this time.</p>
              ) : (
                <div className="notifications-list">
                  {notifications.map((n) => (
                    <div className={`notification-item ${n.isRead ? "read" : "unread"}`} key={n._id}>
                      <div className="notif-icon"><FaBell /></div>
                      <div className="notif-content">
                        <h4>{n.title}</h4>
                        <p>{n.message}</p>
                        <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* POPUP MODAL FOR QR CODE */}
      {showQRModal && (
        <div className="qr-modal-backdrop" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
              <FaTimes />
            </button>
            <h2 className="qr-modal-title">ALPHAFIT DIGITAL PASS</h2>
            <p className="qr-modal-desc">Present at Gym Front Desk / Turnstile Scanner</p>
            {qrImageSrc ? (
              <img src={qrImageSrc} alt="Member QR Code" className="qr-modal-img" />
            ) : (
              <div className="qr-placeholder">Pass Ready</div>
            )}
            <h3 className="qr-modal-username">{profile.username}</h3>
            <span className="qr-modal-token">{qrData?.qrToken || "AP-MEMBER-PASS"}</span>
            <button className="checkin-test-btn" onClick={handleSelfCheckIn} style={{ marginTop: "18px" }}>
              <FaCheck /> SIMULATE SCAN NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
