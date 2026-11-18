import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPlay,
  FaSearch,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaDumbbell,
  FaFire,
  FaCheckCircle,
} from "react-icons/fa";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import { getEmbedUrl } from "../../videos/WorkoutVideos";
import "./AdminVideos.css";

const CATEGORIES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Abs",
  "Cardio",
  "Full Body",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form Modal State (Add or Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const initialForm = {
    title: "",
    description: "",
    category: "Chest",
    difficulty: "Beginner",
    duration: 15,
    thumbnail: "",
    videoUrl: "",
    targetedMuscles: "",
    equipment: "",
    trainerName: "AlphaFit Master Coach",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  // Preview Modal State
  const [previewVideo, setPreviewVideo] = useState(null);

  const token = localStorage.getItem("token");

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

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendUrl}/api/workout-videos?includeInactive=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching videos for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [backendUrl]);

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError("");
    setFormSuccess("");
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (video) => {
    setEditingId(video._id);
    setFormData({
      title: video.title || "",
      description: video.description || "",
      category: video.category || "Chest",
      difficulty: video.difficulty || "Beginner",
      duration: video.duration || 15,
      thumbnail: video.thumbnail || "",
      videoUrl: video.videoUrl || "",
      targetedMuscles: Array.isArray(video.targetedMuscles)
        ? video.targetedMuscles.join(", ")
        : "",
      equipment: Array.isArray(video.equipment)
        ? video.equipment.join(", ")
        : "",
      trainerName: video.trainerName || "AlphaFit Master Coach",
      isActive: video.isActive !== false,
    });
    setFormError("");
    setFormSuccess("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError("");
  };

  // Submit Add or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.thumbnail.trim() ||
      !formData.videoUrl.trim()
    ) {
      setFormError("Please fill out all mandatory fields.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        ...formData,
        duration: Number(formData.duration),
      };

      if (editingId) {
        await axios.put(
          `${backendUrl}/api/workout-videos/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormSuccess("Workout video updated successfully!");
      } else {
        await axios.post(`${backendUrl}/api/workout-videos`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormSuccess("Workout video published successfully!");
      }

      await fetchVideos();
      setTimeout(() => {
        handleCloseForm();
      }, 700);
    } catch (err) {
      console.error("Save video error:", err);
      setFormError(
        err.response?.data?.msg || "Error saving workout video. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Video Status (Active / Inactive)
  const handleToggleStatus = async (video) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/workout-videos/${video._id}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, isActive: res.data.isActive } : v
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      alert("Failed to toggle video active status.");
    }
  };

  // Delete Video Safely
  const handleDeleteVideo = async (video) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the video:\n"${video.title}"?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${backendUrl}/api/workout-videos/${video._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos((prev) => prev.filter((v) => v._id !== video._id));
    } catch (err) {
      console.error("Delete video error:", err);
      alert("Failed to delete video. Please check your admin privileges.");
    }
  };

  // Filtered List
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesCategory =
        selectedCategory === "All" ||
        v.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.trainerName?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [videos, selectedCategory, search]);

  // Summary Metrics
  const totalCount = videos.length;
  const activeCount = videos.filter((v) => v.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);

  const previewEmbed = previewVideo ? getEmbedUrl(previewVideo.videoUrl) : null;
  const isDirectPreview =
    previewVideo?.videoUrl &&
    /\.(mp4|webm|ogg)|cloudinary/i.test(previewVideo.videoUrl);

  return (
    <div className="admin-page-container">
      <AdminSidebar />

      <main className="admin-main-content">
        {/* HEADER */}
        <header className="admin-videos-header">
          <div>
            <span className="admin-tag">MEDIA MANAGEMENT</span>
            <h1 className="admin-title">WORKOUT VIDEO ARCHIVE</h1>
            <p className="admin-sub">
              Manage member video tutorials, technique breakdowns, and
              multi-category video streams.
            </p>
          </div>

          <button className="add-video-btn" onClick={handleOpenAdd}>
            <FaPlus /> ADD WORKOUT VIDEO
          </button>
        </header>

        {/* METRICS ROW */}
        <div className="admin-metrics-row">
          <div className="metric-box">
            <span className="metric-lbl">TOTAL VIDEOS</span>
            <span className="metric-val">{totalCount}</span>
          </div>
          <div className="metric-box active-box">
            <span className="metric-lbl">ACTIVE / LIVE</span>
            <span className="metric-val">{activeCount}</span>
          </div>
          <div className="metric-box inactive-box">
            <span className="metric-lbl">INACTIVE</span>
            <span className="metric-val">{inactiveCount}</span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">TOTAL VIEWS</span>
            <span className="metric-val">{totalViews.toLocaleString()}</span>
          </div>
        </div>

        {/* SEARCH & CATEGORY BAR */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search videos by title or coach..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-cat-select-wrap">
            <label>CATEGORY:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* VIDEOS TABLE */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-table-state">Loading video database...</div>
          ) : filteredVideos.length === 0 ? (
            <div className="admin-table-state">
              No workout videos found. Click &quot;ADD WORKOUT VIDEO&quot; to
              publish your first tutorial.
            </div>
          ) : (
            <table className="admin-videos-table">
              <thead>
                <tr>
                  <th>VIDEO</th>
                  <th>CATEGORY</th>
                  <th>DIFFICULTY</th>
                  <th>DURATION</th>
                  <th>VIEWS</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video._id}>
                    {/* Video Info & Thumbnail */}
                    <td>
                      <div className="table-video-cell">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="table-thumb"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="table-video-titles">
                          <strong className="title-text">{video.title}</strong>
                          <span className="coach-text">
                            Coach: {video.trainerName || "AlphaFit Coach"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="cat-badge">{video.category}</span>
                    </td>

                    {/* Difficulty */}
                    <td>
                      <span
                        className={`diff-badge ${video.difficulty?.toLowerCase()}`}
                      >
                        {video.difficulty}
                      </span>
                    </td>

                    {/* Duration */}
                    <td>
                      <span className="duration-text">
                        <FaClock /> {video.duration} min
                      </span>
                    </td>

                    {/* Views */}
                    <td>
                      <span className="views-text">
                        <FaFire /> {video.views || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status-pill ${
                          video.isActive ? "active" : "inactive"
                        }`}
                      >
                        {video.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-group">
                        {/* Preview */}
                        <button
                          className="act-btn preview"
                          onClick={() => setPreviewVideo(video)}
                          title="Preview Video Player"
                        >
                          <FaPlay />
                        </button>

                        {/* Edit */}
                        <button
                          className="act-btn edit"
                          onClick={() => handleOpenEdit(video)}
                          title="Edit Video"
                        >
                          <FaEdit />
                        </button>

                        {/* Toggle Status */}
                        <button
                          className={`act-btn toggle ${
                            video.isActive ? "deactivate" : "activate"
                          }`}
                          onClick={() => handleToggleStatus(video)}
                          title={
                            video.isActive
                              ? "Deactivate Video"
                              : "Activate Video"
                          }
                        >
                          {video.isActive ? <FaEyeSlash /> : <FaEye />}
                        </button>

                        {/* Delete */}
                        <button
                          className="act-btn delete"
                          onClick={() => handleDeleteVideo(video)}
                          title="Delete Video Safely"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ADD / EDIT VIDEO MODAL */}
      {isFormOpen && (
        <div className="admin-modal-backdrop" onClick={handleCloseForm}>
          <div
            className="admin-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>
                {editingId ? "EDIT WORKOUT VIDEO" : "ADD NEW WORKOUT VIDEO"}
              </h3>
              <button className="modal-close" onClick={handleCloseForm}>
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-alert error">{formError}</div>}
            {formSuccess && (
              <div className="form-alert success">
                <FaCheckCircle /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="admin-video-form">
              <div className="form-grid-2">
                {/* Title */}
                <div className="form-group full-width">
                  <label>VIDEO TITLE *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Incline Dumbbell Press Technique Masterclass"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label>CATEGORY *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div className="form-group">
                  <label>DIFFICULTY LEVEL *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label>DURATION (MINUTES) *</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>

                {/* Trainer / Coach Name */}
                <div className="form-group">
                  <label>COACH / INSTRUCTOR</label>
                  <input
                    type="text"
                    value={formData.trainerName}
                    onChange={(e) =>
                      setFormData({ ...formData, trainerName: e.target.value })
                    }
                    placeholder="e.g. Coach Marcus Vance"
                  />
                </div>

                {/* Video URL */}
                <div className="form-group full-width">
                  <label>VIDEO URL * (YouTube, Vimeo, Cloudinary, or MP4)</label>
                  <input
                    type="url"
                    required
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                  />
                </div>

                {/* Thumbnail URL */}
                <div className="form-group full-width">
                  <label>THUMBNAIL IMAGE URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/... or Cloudinary image URL"
                  />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label>DESCRIPTION & FORM CUES *</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the movement pattern, safety considerations, and target benefits..."
                  ></textarea>
                </div>

                {/* Targeted Muscles */}
                <div className="form-group">
                  <label>TARGETED MUSCLES (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.targetedMuscles}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetedMuscles: e.target.value,
                      })
                    }
                    placeholder="e.g. Pectorals, Anterior Deltoids, Triceps"
                  />
                </div>

                {/* Equipment */}
                <div className="form-group">
                  <label>REQUIRED EQUIPMENT (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) =>
                      setFormData({ ...formData, equipment: e.target.value })
                    }
                    placeholder="e.g. Barbell, Weight Plates, Flat Bench"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="form-group checkbox-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <span>Active and visible in Member Video Library</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions-row">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-save-btn"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingId
                    ? "UPDATE VIDEO"
                    : "PUBLISH VIDEO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW VIDEO MODAL */}
      {previewVideo && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="admin-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-header">
              <h4>PREVIEW: {previewVideo.title}</h4>
              <button
                className="modal-close"
                onClick={() => setPreviewVideo(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="preview-player-wrap">
              {previewEmbed ? (
                <iframe
                  src={previewEmbed}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="preview-iframe"
                />
              ) : isDirectPreview ? (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="preview-video-element"
                />
              ) : (
                <div className="preview-fallback">
                  <p>External Stream URL: {previewVideo.videoUrl}</p>
                </div>
              )}
            </div>

            <div className="preview-meta">
              <span className="cat-badge">{previewVideo.category}</span>
              <span className="diff-badge">{previewVideo.difficulty}</span>
              <span>{previewVideo.duration} mins</span>
              <p>{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
