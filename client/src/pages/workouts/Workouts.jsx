import { useState, useEffect, useMemo, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  FaExternalLinkAlt,
  FaLock,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import {
  resolveImageUrl,
  getWorkoutFallbackImage,
  onImageError,
} from "../../utils/imageUrl";
import { getEmbedUrl, isDirectVideoUrl } from "../../utils/videoUtils";
import "./Workouts.css";

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

export default function Workouts() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");

  // Active / Selected Video Modal
  const [activeItem, setActiveItem] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Guard against duplicate view increments in the same session
  const viewedIdsRef = useRef(new Set());

  // Access status state
  const [accessData, setAccessData] = useState({
    isLocked: true,
    hasPurchased: false,
    hasTrainer: false,
    isApproved: false,
  });

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

  // Fetch access status and all exercises/workout videos
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        // Concurrent fetch for access status, workout videos, and workout routines
        const [accessRes, videosRes, workoutsRes] = await Promise.allSettled([
          token
            ? axios.get(`${backendUrl}/api/users/access-status`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: null }),
          axios.get(`${backendUrl}/api/workout-videos`),
          axios.get(`${backendUrl}/api/workouts`),
        ]);

        if (!isMounted) return;

        if (accessRes.status === "fulfilled" && accessRes.value?.data) {
          setAccessData(accessRes.value.data);
        }

        const rawVideos =
          videosRes.status === "fulfilled" && Array.isArray(videosRes.value?.data)
            ? videosRes.value.data
            : [];

        const rawWorkouts =
          workoutsRes.status === "fulfilled" && Array.isArray(workoutsRes.value?.data)
            ? workoutsRes.value.data
            : [];

        // Normalize workout videos
        const normalizedVideos = rawVideos.map((v) => ({
          _id: v._id,
          title: v.title,
          description: v.description || "",
          category: v.category || "Full Body",
          difficulty: v.difficulty || "Beginner",
          duration: v.duration || 15,
          thumbnail:
            v.thumbnail ||
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
          videoUrl: v.videoUrl || "",
          targetedMuscles: Array.isArray(v.targetedMuscles) ? v.targetedMuscles : [],
          equipment: Array.isArray(v.equipment) ? v.equipment : [],
          trainerName: v.trainerName || "AlphaFit Master Coach",
          views: typeof v.views === "number" ? v.views : 0,
          isActive: v.isActive !== false,
          source: "video",
        }));

        // Normalize workout routines from legacy collection (if not already represented)
        const existingTitles = new Set(
          normalizedVideos.map((v) => v.title.trim().toLowerCase())
        );

        const normalizedWorkouts = rawWorkouts
          .filter((w) => !existingTitles.has((w.title || "").trim().toLowerCase()))
          .map((w) => {
            const cat = w.category === "Core" ? "Abs" : w.category || "Full Body";
            const fallbackImg = getWorkoutFallbackImage(w.title);
            return {
              _id: w._id,
              title: w.title,
              description: w.description || "",
              category: cat,
              difficulty: w.level || "Beginner",
              duration: w.duration || 20,
              thumbnail: resolveImageUrl(w.image, fallbackImg),
              videoUrl: w.videoUrl || w.video || "",
              targetedMuscles: w.targetMuscle
                ? [w.targetMuscle]
                : Array.isArray(w.exercises) && w.exercises.length > 0
                ? [w.exercises[0]]
                : [cat],
              equipment: ["Standard Gym"],
              trainerName: "AlphaFit Head Coach",
              views: 120,
              exercises: Array.isArray(w.exercises) ? w.exercises : [],
              instructions: w.instructions || "",
              source: "workout",
            };
          });

        const combined = [...normalizedVideos, ...normalizedWorkouts];
        setItems(combined);
      } catch (err) {
        console.error("Error fetching exercise and workout library:", err);
        if (isMounted) {
          setError("Failed to load exercise videos. Please refresh or try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [backendUrl]);

  // Access rule: admins, active members, or approved program purchasers
  const isUnlocked =
    user?.role === "admin" ||
    user?.membership?.status === "Active" ||
    accessData.isLocked === false ||
    accessData.hasPurchased;

  // Handle opening video modal with view count tracking
  const handleOpenVideo = async (item) => {
    setActiveItem(item);
    setModalLoading(true);

    // Compute immediate fallback related items from current list
    const fallbackRelated = items
      .filter((it) => it._id !== item._id && it.category === item.category)
      .slice(0, 3);
    setRelatedVideos(fallbackRelated);

    // Track views accurately and guard against duplicate view counting
    if (!viewedIdsRef.current.has(item._id)) {
      viewedIdsRef.current.add(item._id);

      if (item.source === "video") {
        try {
          const res = await axios.get(`${backendUrl}/api/workout-videos/${item._id}`);
          if (res.data?.video) {
            const updatedVideo = res.data.video;
            setActiveItem((prev) => (prev ? { ...prev, ...updatedVideo } : updatedVideo));
            // Update view count in main list state
            setItems((prevItems) =>
              prevItems.map((it) =>
                it._id === item._id ? { ...it, views: updatedVideo.views } : it
              )
            );
          }
          if (Array.isArray(res.data?.relatedVideos) && res.data.relatedVideos.length > 0) {
            setRelatedVideos(res.data.relatedVideos);
          }
        } catch (err) {
          console.warn("Could not increment views via endpoint:", err);
        }
      } else {
        // For legacy workout items, increment locally
        setItems((prevItems) =>
          prevItems.map((it) =>
            it._id === item._id ? { ...it, views: (it.views || 0) + 1 } : it
          )
        );
        setActiveItem((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev));
      }
    }

    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setActiveItem(null);
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

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter (support Abs/Core interchange)
      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "Abs" && item.category?.toLowerCase() === "core");

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === "All Levels" ||
        item.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      // Search query filter (matches title, description, muscles, equipment, exercises, trainer)
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        (Array.isArray(item.targetedMuscles) &&
          item.targetedMuscles.some((m) => m.toLowerCase().includes(q))) ||
        (Array.isArray(item.equipment) &&
          item.equipment.some((eq) => eq.toLowerCase().includes(q))) ||
        (Array.isArray(item.exercises) &&
          item.exercises.some((ex) => ex.toLowerCase().includes(q))) ||
        item.trainerName?.toLowerCase().includes(q);

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [items, selectedCategory, selectedDifficulty, search]);

  const embedUrl = activeItem ? getEmbedUrl(activeItem.videoUrl) : null;
  const isDirect = activeItem ? isDirectVideoUrl(activeItem.videoUrl) : false;

  return (
    <div className="workouts-page">
      <div className="workouts-container">
        {/* HEADER SECTION */}
        <header className="workouts-header">
          <div className="header-left">
            <span className="kicker-pill">03 — MASTER WORKOUT ARCHIVE</span>
            <h1 className="heavy-title">
              ELITE <br />
              <span className="accent-text">WORKOUTS & ROUTINES</span>
            </h1>
          </div>
          <div className="header-right">
            <p className="header-desc">
              Explore high-definition workout demonstration videos, technique breakdowns, and
              structured training routines designed by AlphaFit head coaches.
            </p>
          </div>
        </header>

        {/* SEARCH & FILTER CONTROLS */}
        <section className="filter-controls-wrapper">
          {/* Search Box */}
          <div className="search-box-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by movement, target muscle, equipment, routine..."
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
                className={`cat-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Level Filter Pills & Reset */}
          <div className="difficulty-pills-row">
            <span className="difficulty-label">DIFFICULTY:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                className={`diff-pill-btn ${selectedDifficulty === diff ? "active" : ""}`}
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
            <p>LOADING WORKOUT ARCHIVE...</p>
          </div>
        ) : error ? (
          <div className="video-state-box error">
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : !isUnlocked ? (
          /* LOCKED STATE (Exclusive Member Access) */
          <div className="locked-state">
            <div className="lock-icon-wrap">
              <FaLock />
            </div>
            <h2>EXCLUSIVE MEMBER WORKOUTS</h2>
            <p className="locked-desc">
              The Elite Workout & Video Library is exclusive to AlphaFit members with an
              active membership plan or enrolled training program.
            </p>

            <div className="access-check-card">
              <div className="access-check-row">
                <span>Active Alpha Membership</span>
                <span>{user?.membership?.status === "Active" ? "✅ Active" : "❌ Inactive"}</span>
              </div>
              <div className="access-check-row">
                <span>Training Program Enrolled</span>
                <span>{accessData.hasPurchased ? "✅ Enrolled" : "❌ None"}</span>
              </div>
            </div>

            <button className="upgrade-btn" onClick={() => navigate("/profile")}>
              UPGRADE MEMBERSHIP IN PROFILE
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="video-state-box empty">
            <FaDumbbell className="empty-icon" />
            <h3>No Workouts or Routines Found</h3>
            <p>
              We couldn&apos;t find any workout tutorials or routines matching your selected filters.
            </p>
            <button
              className="reset-btn"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedDifficulty("All Levels");
                setSearch("");
              }}
            >
              View All Workouts
            </button>
          </div>
        ) : (
          /* EXERCISE & WORKOUT VIDEO GRID */
          <div className="exercise-grid">
            {filteredItems.map((item) => (
              <article
                key={item._id}
                className="exercise-card"
                onClick={() => handleOpenVideo(item)}
              >
                {/* Thumbnail Container */}
                <div className="exercise-image-box">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="workout-img"
                    loading="lazy"
                    onError={(e) =>
                      onImageError(e, getWorkoutFallbackImage(item.title))
                    }
                  />
                  <div className="image-overlay"></div>

                  {/* Play Button Overlay */}
                  <div className="play-icon-overlay">
                    <FaPlay />
                  </div>

                  {/* Badges */}
                  <span className="card-badge category-badge">
                    {item.category}
                  </span>
                  <span className="card-badge duration-badge">
                    <FaClock /> {item.duration} MIN
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="card-content">
                  <div className="card-meta-row">
                    <span
                      className={`difficulty-tag ${item.difficulty?.toLowerCase()}`}
                    >
                      {item.difficulty}
                    </span>
                    <span className="views-count">
                      <FaFire /> {item.views || 0} views
                    </span>
                  </div>

                  <h3 className="exercise-name">{item.title}</h3>
                  <p className="exercise-desc">{item.description}</p>

                  {/* Movement previews if available */}
                  {Array.isArray(item.exercises) && item.exercises.length > 0 && (
                    <div className="exercise-movements-preview">
                      <strong>Movement:</strong> {item.exercises.slice(0, 3).join(", ")}
                      {item.exercises.length > 3 ? "..." : ""}
                    </div>
                  )}

                  {/* Target Muscle and Equipment Tags */}
                  <div className="card-tags-list">
                    {item.targetedMuscles?.slice(0, 2).map((m, idx) => (
                      <span key={idx} className="muscle-tag">
                        {m}
                      </span>
                    ))}
                    {item.equipment?.slice(0, 1).map((eq, idx) => (
                      <span key={idx} className="equipment-tag">
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <span className="trainer-name">
                      <FaUserCheck /> {item.trainerName || "AlphaFit Coach"}
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

      {/* FULL RESPONSIVE VIDEO DETAILS & TECHNIQUE MODAL */}
      {activeItem && (
        <div className="video-modal-overlay" onClick={handleCloseModal}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="close-video-btn"
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
                  title={activeItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="responsive-iframe"
                />
              ) : isDirect ? (
                <video
                  src={activeItem.videoUrl}
                  controls
                  autoPlay
                  className="responsive-video-element"
                >
                  Your browser does not support the video tag.
                </video>
              ) : activeItem.videoUrl ? (
                <div className="unsupported-video-fallback">
                  <FaPlay className="fallback-play-icon" />
                  <h4>External Video Demonstration</h4>
                  <p>This exercise tutorial is streamed via an external provider.</p>
                  <a
                    href={activeItem.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-external-btn"
                  >
                    Open Demonstration in New Tab <FaExternalLinkAlt />
                  </a>
                </div>
              ) : (
                <div className="unsupported-video-fallback">
                  <FaDumbbell className="fallback-play-icon" />
                  <h4>Coached Routine Breakdown</h4>
                  <p>Detailed technique notes and exercise protocol provided below.</p>
                </div>
              )}
            </div>

            {/* MODAL DETAILS BODY */}
            <div className="video-modal-body">
              {/* Meta Row */}
              <div className="modal-meta-row">
                <span className="modal-pill category-pill">
                  {activeItem.category}
                </span>
                <span
                  className={`modal-pill diff-pill ${activeItem.difficulty?.toLowerCase()}`}
                >
                  {activeItem.difficulty}
                </span>
                <span className="modal-pill duration-pill">
                  <FaClock /> {activeItem.duration} Minutes
                </span>
                <span className="modal-pill views-pill">
                  <FaFire /> {activeItem.views || 0} Views
                </span>
              </div>

              {/* Title & Coach Attribution */}
              <h2 className="modal-video-title">{activeItem.title}</h2>
              <p className="modal-coach-credit">
                Instructor:{" "}
                <strong>{activeItem.trainerName || "AlphaFit Master Coach"}</strong>
              </p>

              {/* Description & Execution Notes */}
              <div className="modal-description-box">
                <h4>Movement Technique & Execution Notes</h4>
                <p>{activeItem.description || "Master the proper kinetic chain and tempo for maximum muscular recruitment."}</p>
              </div>

              {/* Exercises in Protocol (if routine) */}
              {Array.isArray(activeItem.exercises) && activeItem.exercises.length > 0 && (
                <div className="modal-exercises-box">
                  <h4>EXERCISES IN THIS PROTOCOL</h4>
                  <ul className="modal-exercises-list">
                    {activeItem.exercises.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coach Technique Notes (if routine instructions) */}
              {activeItem.instructions && (
                <div className="modal-instructions-box">
                  <h4>COACH TECHNIQUE NOTES</h4>
                  <p>{activeItem.instructions}</p>
                </div>
              )}

              {/* Targeted Muscles & Equipment Breakdown */}
              <div className="modal-specs-grid">
                <div className="specs-column">
                  <h4>
                    <FaLayerGroup /> TARGETED MUSCLES
                  </h4>
                  <div className="specs-tags-wrap">
                    {Array.isArray(activeItem.targetedMuscles) &&
                    activeItem.targetedMuscles.length > 0 ? (
                      activeItem.targetedMuscles.map((muscle, idx) => (
                        <span key={idx} className="spec-tag muscle">
                          {muscle}
                        </span>
                      ))
                    ) : (
                      <span className="spec-tag">{activeItem.category || "Full Body"}</span>
                    )}
                  </div>
                </div>

                <div className="specs-column">
                  <h4>
                    <FaDumbbell /> REQUIRED EQUIPMENT
                  </h4>
                  <div className="specs-tags-wrap">
                    {Array.isArray(activeItem.equipment) &&
                    activeItem.equipment.length > 0 ? (
                      activeItem.equipment.map((item, idx) => (
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

              {/* RELATED EXERCISES & WORKOUTS */}
              <div className="related-videos-section">
                <h3>RELATED {activeItem.category.toUpperCase()} ROUTINES</h3>
                {modalLoading ? (
                  <div className="related-loading">Loading related tutorials...</div>
                ) : relatedVideos.length === 0 ? (
                  <p className="no-related-note">
                    More {activeItem.category} tutorials coming soon to the archive.
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
                            src={
                              related.thumbnail ||
                              "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
                            }
                            alt={related.title}
                            className="related-thumb"
                            onError={(e) =>
                              onImageError(e, getWorkoutFallbackImage(related.title))
                            }
                          />
                          <span className="related-duration">
                            {related.duration}m
                          </span>
                        </div>
                        <div className="related-details">
                          <h5 className="related-title">{related.title}</h5>
                          <span className="related-diff">{related.difficulty}</span>
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
