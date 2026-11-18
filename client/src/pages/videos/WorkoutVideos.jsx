import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaPlay,
  FaTimes,
  FaSearch,
  FaClock,
  FaDumbbell,
  FaLayerGroup,
  FaUserCheck,
  FaFire,
  FaShareAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import "./WorkoutVideos.css";

const CATEGORIES = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Abs",
  "Cardio",
  "Full Body",
];

const DIFFICULTIES = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export const getEmbedUrl = (url) => {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  }
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch && longMatch[1]) {
    return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&rel=0`;
  }
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
};

export default function WorkoutVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");

  // Active / Selected Video Modal
  const [activeVideo, setActiveVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const backendUrl = useMemo(() => {
    const isLocal =
      typeof window !== "undefined" &&
      window.location &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    if (isLocal) return "http://localhost:5000";
    const configured = (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      ""
    )
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");
    if (
      !configured ||
      /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(
        configured
      )
    ) {
      return "https://gym-final-3uya.vercel.app";
    }
    return configured;
  }, []);

  // Fetch initial videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${backendUrl}/api/workout-videos`);
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading workout videos:", err);
        setError("Unable to load workout videos. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [backendUrl]);

  // Open modal and fetch related videos
  const handleOpenVideo = async (video) => {
    setActiveVideo(video);
    setModalLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/workout-videos/${video._id}`);
      if (res.data?.video) {
        setActiveVideo(res.data.video);
      }
      if (res.data?.relatedVideos) {
        setRelatedVideos(res.data.relatedVideos);
      }
    } catch (err) {
      console.warn("Could not fetch detailed related videos:", err);
      // Fallback related from existing list
      const fallbackRelated = videos
        .filter((v) => v._id !== video._id && v.category === video.category)
        .slice(0, 3);
      setRelatedVideos(fallbackRelated);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveVideo(null);
    setRelatedVideos([]);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Category Match
      const matchesCategory =
        selectedCategory === "All" ||
        video.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Difficulty Match
      const matchesDifficulty =
        selectedDifficulty === "All Levels" ||
        video.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      // Search Query Match (Title, description, muscles, equipment)
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        video.title?.toLowerCase().includes(q) ||
        video.description?.toLowerCase().includes(q) ||
        video.category?.toLowerCase().includes(q) ||
        (Array.isArray(video.targetedMuscles) &&
          video.targetedMuscles.some((m) => m.toLowerCase().includes(q))) ||
        (Array.isArray(video.equipment) &&
          video.equipment.some((eq) => eq.toLowerCase().includes(q))) ||
        video.trainerName?.toLowerCase().includes(q);

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [videos, selectedCategory, selectedDifficulty, search]);

  const embedUrl = activeVideo ? getEmbedUrl(activeVideo.videoUrl) : null;
  const isDirectVideo =
    activeVideo?.videoUrl &&
    /\.(mp4|webm|ogg)|cloudinary/i.test(activeVideo.videoUrl);

  return (
    <div className="video-library-page">
      <div className="video-library-container">
        {/* HEADER SECTION */}
        <header className="video-library-header">
          <div className="header-meta">
            <span className="kicker-pill">04 — MASTER VIDEO ARCHIVE</span>
            <h1 className="hero-title">
              WORKOUT <br />
              <span className="accent-text">VIDEO LIBRARY</span>
            </h1>
          </div>
          <p className="hero-description">
            High-definition exercise breakdowns, movement mechanics, and elite
            coaching protocols. Filter by muscle group, category, and skill
            level to optimize your training.
          </p>
        </header>

        {/* SEARCH & FILTER CONTROLS */}
        <section className="filter-controls-wrapper">
          {/* Search Box */}
          <div className="search-box-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by movement, target muscle, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                className="clear-search-btn"
                onClick={() => setSearch("")}
                title="Clear Search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Muscle Group & Category Filter Tabs */}
          <div className="category-scroll-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cat-tab-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Level Filter Pills */}
          <div className="difficulty-pills-row">
            <span className="difficulty-label">DIFFICULTY:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                className={`diff-pill-btn ${
                  selectedDifficulty === diff ? "active" : ""
                }`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
            {(selectedCategory !== "All" ||
              selectedDifficulty !== "All Levels" ||
              search) && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All Levels");
                  setSearch("");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {/* CONTENT STATES */}
        {loading ? (
          <div className="video-state-box loading">
            <div className="spinner"></div>
            <p>LOADING WORKOUT VIDEO LIBRARY...</p>
          </div>
        ) : error ? (
          <div className="video-state-box error">
            <p>{error}</p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="video-state-box empty">
            <FaDumbbell className="empty-icon" />
            <h3>No Workout Videos Found</h3>
            <p>
              We couldn&apos;t find any workout tutorials matching your selected
              filters.
            </p>
            <button
              className="reset-btn"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedDifficulty("All Levels");
                setSearch("");
              }}
            >
              View All Videos
            </button>
          </div>
        ) : (
          /* VIDEO GRID */
          <div className="video-grid">
            {filteredVideos.map((video) => (
              <article
                key={video._id}
                className="video-card"
                onClick={() => handleOpenVideo(video)}
              >
                {/* Thumbnail Container */}
                <div className="video-thumb-container">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="video-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="thumb-overlay"></div>

                  {/* Play Button Overlay */}
                  <div className="play-button-overlay">
                    <FaPlay className="play-icon" />
                  </div>

                  {/* Badges */}
                  <span className="card-badge category-badge">
                    {video.category}
                  </span>
                  <span className="card-badge duration-badge">
                    <FaClock /> {video.duration} MIN
                  </span>
                </div>

                {/* Card Info Body */}
                <div className="video-card-body">
                  <div className="card-meta-row">
                    <span
                      className={`difficulty-tag ${video.difficulty?.toLowerCase()}`}
                    >
                      {video.difficulty}
                    </span>
                    <span className="views-count">
                      <FaFire /> {video.views || 0} views
                    </span>
                  </div>

                  <h3 className="video-card-title">{video.title}</h3>
                  <p className="video-card-desc">{video.description}</p>

                  {/* Muscle & Equipment Tags */}
                  <div className="card-tags-list">
                    {video.targetedMuscles?.slice(0, 2).map((m, idx) => (
                      <span key={idx} className="muscle-tag">
                        {m}
                      </span>
                    ))}
                    {video.equipment?.slice(0, 1).map((eq, idx) => (
                      <span key={idx} className="equipment-tag">
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="video-card-footer">
                    <span className="trainer-name">
                      <FaUserCheck /> {video.trainerName || "AlphaFit Coach"}
                    </span>
                    <span className="watch-action-link">
                      Watch Video &rarr;
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* FULL RESPONSIVE VIDEO DETAILS & PLAYER MODAL */}
      {activeVideo && (
        <div className="video-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="video-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close video player"
            >
              <FaTimes />
            </button>

            {/* VIDEO PLAYER SECTION */}
            <div className="video-player-frame">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="responsive-iframe"
                />
              ) : isDirectVideo ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="responsive-video-element"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="unsupported-video-fallback">
                  <FaPlay className="fallback-play-icon" />
                  <h4>External Video Stream</h4>
                  <p>
                    This tutorial stream is hosted on an external provider.
                  </p>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-external-btn"
                  >
                    Open Video in New Tab <FaExternalLinkAlt />
                  </a>
                </div>
              )}
            </div>

            {/* MODAL DETAILS BODY */}
            <div className="video-modal-body">
              {/* Meta Row */}
              <div className="modal-meta-row">
                <span className="modal-pill category-pill">
                  {activeVideo.category}
                </span>
                <span
                  className={`modal-pill diff-pill ${activeVideo.difficulty?.toLowerCase()}`}
                >
                  {activeVideo.difficulty}
                </span>
                <span className="modal-pill duration-pill">
                  <FaClock /> {activeVideo.duration} Minutes
                </span>
                <span className="modal-pill views-pill">
                  <FaFire /> {activeVideo.views || 0} Views
                </span>
              </div>

              {/* Title & Coach */}
              <h2 className="modal-video-title">{activeVideo.title}</h2>
              <p className="modal-coach-credit">
                Instructor:{" "}
                <strong>
                  {activeVideo.trainerName || "AlphaFit Master Coach"}
                </strong>
              </p>

              {/* Description */}
              <div className="modal-description-box">
                <h4>Movement Technique & Execution Notes</h4>
                <p>{activeVideo.description}</p>
              </div>

              {/* Targeted Muscles & Equipment Breakdown */}
              <div className="modal-specs-grid">
                <div className="specs-column">
                  <h4>
                    <FaLayerGroup /> TARGETED MUSCLES
                  </h4>
                  <div className="specs-tags-wrap">
                    {Array.isArray(activeVideo.targetedMuscles) &&
                    activeVideo.targetedMuscles.length > 0 ? (
                      activeVideo.targetedMuscles.map((muscle, idx) => (
                        <span key={idx} className="spec-tag muscle">
                          {muscle}
                        </span>
                      ))
                    ) : (
                      <span className="spec-tag">Primary Muscle Group</span>
                    )}
                  </div>
                </div>

                <div className="specs-column">
                  <h4>
                    <FaDumbbell /> REQUIRED EQUIPMENT
                  </h4>
                  <div className="specs-tags-wrap">
                    {Array.isArray(activeVideo.equipment) &&
                    activeVideo.equipment.length > 0 ? (
                      activeVideo.equipment.map((item, idx) => (
                        <span key={idx} className="spec-tag equipment">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="spec-tag">Standard Gym Setup</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RELATED WORKOUT VIDEOS */}
              <div className="related-videos-section">
                <h3>RELATED {activeVideo.category.toUpperCase()} WORKOUTS</h3>
                {modalLoading ? (
                  <div className="related-loading">
                    Loading related tutorials...
                  </div>
                ) : relatedVideos.length === 0 ? (
                  <p className="no-related-note">
                    More {activeVideo.category} tutorials coming soon to the
                    archive.
                  </p>
                ) : (
                  <div className="related-videos-grid">
                    {relatedVideos.map((related) => (
                      <div
                        key={related._id}
                        className="related-video-card"
                        onClick={() => handleOpenVideo(related)}
                      >
                        <div className="related-thumb-box">
                          <img
                            src={related.thumbnail}
                            alt={related.title}
                            className="related-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <span className="related-duration">
                            {related.duration}m
                          </span>
                        </div>
                        <div className="related-details">
                          <h5 className="related-title">{related.title}</h5>
                          <span className="related-diff">
                            {related.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
