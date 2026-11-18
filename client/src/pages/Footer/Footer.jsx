import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="footer-logo">AlphaFit</h2>
          </Link>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          <div className="link-column">
            <h3>PROGRAMS</h3>
            <ul>
              <li><Link to="/programs">Fat Loss Protocol</Link></li>
              <li><Link to="/programs">Muscle Hypertrophy</Link></li>
              <li><Link to="/programs">Home Conditioning</Link></li>
              <li><Link to="/programs">Strength & Power</Link></li>
              <li><Link to="/programs">All Programs</Link></li>
            </ul>
          </div>

          <div className="link-column">
            <h3>RESOURCES</h3>
            <ul>
              <li><Link to="/workouts">Workouts & Library</Link></li>
              <li><Link to="/nutrition">Nutrition & Supplements</Link></li>
              <li><Link to="/blog">Fitness Blog</Link></li>
              <li><Link to="/calculator">Calorie Calculator</Link></li>
              <li><Link to="/bmi-calculator">BMI Assessment</Link></li>
              <li><Link to="/community">Community Feed</Link></li>
            </ul>
          </div>

          <div className="link-column">
            <h3>COMPANY</h3>
            <ul>
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/trainers">Elite Trainers</Link></li>
              <li><Link to="/trainer-info">Fitness Architecture</Link></li>
              <li><Link to="/workout-planner">Workout Planner</Link></li>
              <li><Link to="/programs">Memberships</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="bottom-content">
          <p className="copyright">© {new Date().getFullYear()} AlphaFit FITNESS. All rights reserved.</p>
          <p className="footer-motto">Train Hard. Stay Consistent. Get Results.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;