import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

import "./Login.css";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        formData
      );

      const { token, user } = res.data;

      login(user, token);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <>
      <div className="login-page">
        {/* Back Arrow */}
        <div 
          onClick={() => navigate("/")} 
          className="auth-back-btn"
        >
          <span style={{ fontSize: '1.3rem' }}>←</span> BACK TO HOME
        </div>
        {/* Background Decorative Overlay */}
        <div className="login-bg-image"></div>
        <div className="login-overlay"></div>

        <div className="login-container">
          <header className="login-header">
            <p className="section-num">01 — ACCESS</p>
            <h1 className="heavy-title">ELITE <br /> PORTAL</h1>
          </header>

          <div className="login-card">
            <form onSubmit={handleSubmit} className="brutalist-form">
              <div className="input-field">
                <label>OPERATOR EMAIL</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@training.com"
                   onChange={handleChange}
          required
                />
              </div>

              <div className="input-field">
                <label>SECURE PASSWORD</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn">
                AUTHENTICATE
              </button>

              <div className="form-footer">
                <p>NEW RECRUIT? <span className="text-highlight" onClick={() => navigate('/signup')}>JOIN THE SQUAD</span></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}