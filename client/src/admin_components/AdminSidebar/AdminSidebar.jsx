import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  Calendar,
  Trophy,
  Users,
  BookOpen,
  Apple,
  Layers,
  Dumbbell,
  Activity,
  MessageSquare,
  Target,
  TrendingUp,
  UserCheck,
  Database,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import "./AdminSidebar.css";

const ADMIN_NAV_LINKS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/attendance", label: "Attendance & QR", icon: QrCode },
  { path: "/admin/bookings", label: "Appointments", icon: Calendar },
  { path: "/admin/challenges", label: "Challenges & Board", icon: Trophy },
  { path: "/admin/users", label: "Users & Roles", icon: Users },
  { path: "/admin/blogs", label: "Articles & Blogs", icon: BookOpen },
  { path: "/admin/nutrition", label: "Nutrition & Store", icon: Apple },
  { path: "/admin/programs", label: "Training Programs", icon: Layers },
  { path: "/admin/workouts", label: "Workouts Library", icon: Dumbbell },
  { path: "/admin/bmi-history", label: "BMI & Metrics", icon: Activity },
  { path: "/admin/community", label: "Community Feed", icon: MessageSquare },
  { path: "/admin/goals", label: "Fitness Goals", icon: Target },
  { path: "/admin/progress", label: "Member Progress", icon: TrendingUp },
  { path: "/admin/trainers", label: "Coaches & Trainers", icon: UserCheck },
  { path: "/admin/exercise-bank", label: "Exercise Bank", icon: Database },
];

function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="admin-mobile-topbar">
        <div className="mobile-brand">
          <ShieldCheck className="brand-icon-mobile" size={22} />
          <span className="brand-text">ALPHAFIT ADMIN</span>
        </div>
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div className="admin-sidebar-backdrop" onClick={closeMobile} />
      )}

      {/* Sidebar Main Element */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div className="brand-row">
            <div className="brand-shield">
              <ShieldCheck size={22} className="shield-svg" />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">ALPHAFIT</span>
              <span className="brand-tag">MANAGEMENT CONSOLE</span>
            </div>
          </div>
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            <span className="status-label">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="admin-sidebar-nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          {ADMIN_NAV_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon-box">
                  <Icon size={18} className="nav-icon" />
                </span>
                <span className="nav-item-text">{item.label}</span>
                <span className="active-glow-pill"></span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <NavLink to="/" onClick={closeMobile} className="back-site-btn">
            <ArrowLeft size={16} />
            <span>Back to Public Site</span>
          </NavLink>

          <button onClick={handleLogout} className="admin-logout-btn" title="Sign out of Admin Panel">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
