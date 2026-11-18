import { useState, useContext, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Close menu on link click
  const closeMenu = () => setOpen(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="logo" onClick={closeMenu}>
            AlphaFit
          </Link>

          {/* Navigation Links (Desktop & Mobile Drawer) */}
          <ul className={`nav-links ${open ? "active" : ""}`}>
            {/* Mobile-only header inside drawer */}
            <li className="mobile-header">
              <span className="mobile-logo">AlphaFit</span>
              {isAuthenticated && user && (
                <div className="mobile-user-greeting">
                  <span className="greeting-label">SIGNED IN AS</span>
                  <span className="greeting-name">{user.username}</span>
                </div>
              )}
            </li>

            <li>
              <NavLink to="/programs" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Programs
              </NavLink>
            </li>
            <li>
              <NavLink to="/exercises" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Exercises
              </NavLink>
            </li>
            <li>
              <NavLink to="/nutrition" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Nutrition
              </NavLink>
            </li>
            <li>
              <NavLink to="/calculator" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Calories
              </NavLink>
            </li>
            <li>
              <NavLink to="/bmi-calculator" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                BMI
              </NavLink>
            </li>
            <li>
              <NavLink to="/progress" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Progress
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                Community
              </NavLink>
            </li>
            {isAuthenticated && user && (
              <li>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? "active-nav" : "")} onClick={closeMenu}>
                  Profile
                </NavLink>
              </li>
            )}

            {/* Mobile Auth Actions */}
            <li className="mobile-auth-section">
              {isAuthenticated && user ? (
                <div className="mobile-auth-group">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => `mobile-profile-link ${isActive ? "active-nav" : ""}`}
                    onClick={closeMenu}
                  >
                    <FaUser /> My Dashboard
                  </NavLink>

                  {user.role === "admin" && (
                    <NavLink to="/admin" className="mobile-admin-link" onClick={closeMenu}>
                      <FaShieldAlt /> Admin Panel
                    </NavLink>
                  )}

                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="mobile-guest-group">
                  <Link to="/login" className="mobile-login-btn" onClick={closeMenu}>
                    Sign In / Register
                  </Link>
                </div>
              )}
            </li>
          </ul>

          {/* Desktop Auth Section */}
          <div className="desktop-auth-actions">
            {isAuthenticated && user ? (
              <div className="auth-pill-group">
                {user.role === "admin" && (
                  <Link to="/admin" className="nav-admin-badge" title="Admin Panel">
                    <FaShieldAlt /> ADMIN
                  </Link>
                )}

                <NavLink
                  to="/profile"
                  className={({ isActive }) => `user-profile-pill ${isActive ? "active-nav" : ""}`}
                  title={`Logged in as ${user.username}`}
                >
                  <FaUser className="user-icon" />
                  <span className="user-name">{user.username}</span>
                </NavLink>

                <button onClick={handleLogout} className="nav-logout-btn" title="Sign Out">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn">
                LOGIN
              </Link>
            )}
          </div>

          {/* Hamburger Menu Toggle Button */}
          <div
            className={`hamburger ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            role="button"
            tabIndex={0}
          >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {open && <div className="nav-backdrop" onClick={closeMenu}></div>}
    </>
  );
}
