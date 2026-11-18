import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaPlay, FaTimes, FaSearch, FaDumbbell, FaClock, FaLayerGroup } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import {
  resolveImageUrl,
  getWorkoutFallbackImage,
  onImageError,
} from '../../utils/imageUrl';
import './Workouts.css';

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"];
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

function Workouts() {
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");

  const [accessData, setAccessData] = useState({ isLocked: true, hasPurchased: false, hasTrainer: false, isApproved: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        
        // Fetch access status
        if (token) {
          try {
            const accessRes = await axios.get(`${backendUrl}/api/users/access-status`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAccessData(accessRes.data);
          } catch (accessErr) {
            console.error("Error fetching access status", accessErr);
          }
        }

        // Fetch workouts
        const res = await axios.get(`${backendUrl}/api/workouts`);
        setWorkouts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (workout) => {
    const fallback = getWorkoutFallbackImage(workout?.title);
    return resolveImageUrl(workout?.image, fallback);
  };

  const closeVideo = () => setActiveWorkout(null);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;
    }
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (longMatch && longMatch[1]) {
      return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1`;
    }
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1`;
    }
    return null;
  };

  // Access rule: admins, active members, or approved program purchasers
  const isUnlocked =
    user?.role === 'admin' ||
    user?.membership?.status === 'Active' ||
    accessData.isLocked === false ||
    accessData.hasPurchased;

  // Filtered Workouts
  const filteredWorkouts = workouts.filter((w) => {
    const matchesCat =
      selectedCategory === "All" ||
      (w.category && w.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (w.title && w.title.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesLevel =
      selectedLevel === "All Levels" ||
      (w.level && w.level.toLowerCase() === selectedLevel.toLowerCase());

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (w.title && w.title.toLowerCase().includes(q)) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      (w.targetMuscle && w.targetMuscle.toLowerCase().includes(q)) ||
      (Array.isArray(w.exercises) && w.exercises.some((ex) => ex.toLowerCase().includes(q)));

    return matchesCat && matchesLevel && matchesSearch;
  });

  return (
    <div className="workouts-page">
      <div className="workouts-container">
        <header className="workouts-header">
          <div className="header-left">
            <p className="kicker">03 — WORKOUT & VIDEO LIBRARY</p>
            <h1 className="heavy-title">ELITE <br/> ROUTINES</h1>
          </div>
          <div className="header-right">
            <p className="header-desc">
              Explore exercise demonstration videos, technique breakdowns, and structured training routines designed by AlphaFit head coaches.
            </p>
          </div>
        </header>

        {/* Search & Filter Controls */}
        <div className="workout-filter-controls" style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: "480px" }}>
            <input
              type="text"
              placeholder="Search by routine, muscle, or exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                backgroundColor: "#141418",
                border: "1px solid #2a2a34",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none"
              }}
            />
            <FaSearch style={{ position: "absolute", left: "14px", top: "14px", color: "#8c8c9a" }} />
          </div>

          {/* Category Tabs */}
          <div className="filter-bar" style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #1c1c24" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Level Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#8c8c9a", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginRight: "6px" }}>
              DIFFICULTY:
            </span>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  background: selectedLevel === lvl ? "rgba(181, 242, 61, 0.15)" : "#181820",
                  color: selectedLevel === lvl ? "#B5F23D" : "#8c8c9a",
                  border: selectedLevel === lvl ? "1px solid #B5F23D" : "1px solid #282834",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading workout routines...</div>
        ) : !isUnlocked ? (
          <div className="locked-state" style={{ textAlign: 'center', padding: '100px 20px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#FF4D4D' }}>🔒 ACCESS RESTRICTED</h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 30px' }}>
              The Elite Exercise & Video Library is exclusive to AlphaFit members with an active membership plan.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto', textAlign: 'left', background: '#0a0a0a', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Alpha Membership</span>
                <span>{user?.membership?.status === 'Active' ? "✅" : "❌"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Program Purchased</span>
                <span>{accessData.hasPurchased ? "✅" : "❌"}</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/profile'} 
              style={{ marginTop: '40px', background: '#B5F23D', color: '#000', border: 'none', padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
            >
              UPGRADE MEMBERSHIP IN PROFILE
            </button>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center", color: "#8c8c9a" }}>
            No routines found matching your filter criteria. Try selecting another category or clearing your search.
          </div>
        ) : (
          <div className="exercise-grid">
            {filteredWorkouts.map(workout => (
              <div 
                className="exercise-card" 
                key={workout._id} 
                onClick={() => setActiveWorkout(workout)}
                style={{ cursor: 'pointer' }}
              >
                <div className="exercise-image-box" style={{ position: "relative" }}>
                  <img
                    src={getImageUrl(workout)}
                    alt={workout.title}
                    className="workout-img"
                    loading="lazy"
                    onError={(e) => onImageError(e, getWorkoutFallbackImage(workout.title))}
                  />
                  <div className="image-overlay"></div>
                  {(workout.video || workout.videoUrl) && (
                    <div className="play-icon-overlay">
                      <FaPlay />
                    </div>
                  )}
                  {workout.category && (
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      backgroundColor: "rgba(0,0,0,0.75)",
                      color: "#B5F23D",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: "800",
                      letterSpacing: "0.5px"
                    }}>
                      {workout.category}
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="exercise-name">{workout.title}</h3>
                  <p className="muscle-group">{workout.description}</p>
                  
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="exercises-list" style={{ marginTop: '10px', fontSize: '0.82rem', color: '#888' }}>
                      <strong>Movement:</strong> {workout.exercises.slice(0, 3).join(", ")}{workout.exercises.length > 3 ? "..." : ""}
                    </div>
                  )}

                  <div className="tag-group" style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                    <span className="tag">{workout.level || 'Beginner'}</span>
                    <span className="tag tool-tag">{workout.duration ? `${workout.duration} mins` : '20 mins'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Demonstration & Details Modal */}
      {activeWorkout && (
        <div className="video-modal-overlay" onClick={closeVideo} style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()} style={{
            position: "relative",
            backgroundColor: "#14141a",
            border: "1px solid #2e2e3e",
            borderRadius: "14px",
            maxWidth: "760px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px"
          }}>
            <button
              className="close-video-btn"
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "#8c8c9a",
                fontSize: "1.2rem",
                cursor: "pointer",
                zIndex: 10
              }}
            >
              <FaTimes />
            </button>

            {/* Video Player */}
            {(activeWorkout.video || activeWorkout.videoUrl) ? (
              <div style={{ marginBottom: "20px", borderRadius: "8px", overflow: "hidden", background: "#000" }}>
                {getEmbedUrl(activeWorkout.video || activeWorkout.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(activeWorkout.video || activeWorkout.videoUrl)}
                    title={activeWorkout.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="workout-video-player"
                    style={{ width: '100%', height: '380px', border: 'none' }}
                  />
                ) : (
                  <video
                    src={activeWorkout.video || activeWorkout.videoUrl}
                    controls
                    autoPlay
                    className="workout-video-player"
                    style={{ width: '100%', maxHeight: '380px' }}
                  />
                )}
              </div>
            ) : (
              <div style={{
                height: "220px",
                background: "#1c1c24",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                color: "#8c8c9a"
              }}>
                <FaPlay style={{ fontSize: "2rem", opacity: 0.4 }} />
              </div>
            )}

            {/* Workout Details */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <span style={{ backgroundColor: "rgba(181, 242, 61, 0.15)", color: "#B5F23D", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "800" }}>
                {activeWorkout.category || "General"}
              </span>
              <span style={{ backgroundColor: "#20202c", color: "#8c8c9a", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
                {activeWorkout.level || "Beginner"}
              </span>
              <span style={{ backgroundColor: "#20202c", color: "#8c8c9a", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
                {activeWorkout.duration ? `${activeWorkout.duration} mins` : "20 mins"}
              </span>
            </div>

            <h2 style={{ fontSize: "1.6rem", color: "#fff", margin: "0 0 10px" }}>{activeWorkout.title}</h2>
            <p style={{ color: "#aaa", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 16px" }}>
              {activeWorkout.description}
            </p>

            {activeWorkout.targetMuscle && (
              <div style={{ marginBottom: "14px" }}>
                <strong style={{ color: "#B5F23D", fontSize: "0.85rem" }}>Target Muscle: </strong>
                <span style={{ color: "#fff", fontSize: "0.85rem" }}>{activeWorkout.targetMuscle}</span>
              </div>
            )}

            {activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
              <div style={{ marginBottom: "16px", backgroundColor: "#181822", padding: "14px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 8px", color: "#B5F23D", fontSize: "0.9rem" }}>EXERCISES IN THIS PROTOCOL</h4>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#ccc", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {activeWorkout.exercises.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeWorkout.instructions && (
              <div style={{ backgroundColor: "#181822", padding: "14px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 8px", color: "#B5F23D", fontSize: "0.9rem" }}>COACH TECHNIQUE NOTES</h4>
                <p style={{ margin: 0, color: "#ccc", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {activeWorkout.instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Workouts;
