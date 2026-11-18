import { useEffect, useState } from "react";
import axios from "axios";
import "./Trainers.css";
import { useNavigate } from "react-router-dom";
import {
  resolveImageUrl,
  getTrainerFallbackImage,
  onImageError,
} from "../../utils/imageUrl";

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/trainers`);
        setTrainers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const getImageUrl = (trainer) => {
    const fallback = getTrainerFallbackImage(trainer?.name, trainer?.expertise);
    return resolveImageUrl(trainer?.image, fallback);
  };

  return (
    <div className="trainers-page">
      <div className="trainers-container">
        <header className="trainers-header">
          <div className="header-left">
            <p className="section-num">10 — EXPERT COACHING</p>
            <h1 className="heavy-title">MEET THE <br /> TRAINERS</h1>
          </div>
          <p className="header-desc">
            Our elite squad of trainers ready to push you beyond your limits.
          </p>
        </header>

        {loading ? (
          <div className="loading-state">Loading trainers...</div>
        ) : trainers.length === 0 ? (
          <div className="empty-state">No trainers currently available.</div>
        ) : (
          <div className="trainers-grid">
            {trainers.map((trainer) => (
              <div 
                className="trainer-card" 
                key={trainer._id}
                onClick={() => navigate(`/trainer/${trainer._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="trainer-image-wrapper">
                  <img
                    src={getImageUrl(trainer)}
                    alt={trainer.name}
                    className="trainer-image"
                    onError={(e) => onImageError(e, getTrainerFallbackImage(trainer.name, trainer.expertise))}
                  />
                  <div className="status-badge">
                    {trainer.isActive ? (
                      <span className="active-dot"></span>
                    ) : (
                      <span className="inactive-dot"></span>
                    )}
                    {trainer.isActive ? "AVAILABLE" : "UNAVAILABLE"}
                  </div>
                </div>
                <div className="trainer-info">
                  <h3 className="trainer-name">{trainer.name}</h3>
                  <p className="trainer-expertise">{trainer.expertise}</p>
                  <div className="trainer-time">
                    <span>🕒 {trainer.availableTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Trainers;
