import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminWorkouts.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";

function AdminWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    duration: "",
    exercises: ""
  });
  const [file, setFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/workouts`);
      setWorkouts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("level", form.level);
    formData.append("duration", form.duration);
    formData.append("exercises", form.exercises);
    if (file) {
      formData.append("image", file);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }
    
    if (videoFile) {
      formData.append("video", videoFile);
    } else if (videoUrl) {
      formData.append("videoUrl", videoUrl);
    }

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/workouts/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/workouts`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setForm({ title: "", description: "", level: "", duration: "", exercises: "" });
      setFile(null);
      setVideoFile(null);
      setImageUrl("");
      setVideoUrl("");
      setEditingId(null);
      alert(editingId ? "Workout updated successfully!" : "Workout added successfully!");
      fetchWorkouts();
    } catch (err) {
      console.log(err);
      alert("Failed to save workout: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleEdit = (workout) => {
    setForm({
      title: workout.title || "",
      description: workout.description || "",
      level: workout.level || "",
      duration: workout.duration || "",
      exercises: workout.exercises ? workout.exercises.join(", ") : ""
    });
    setEditingId(workout._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchWorkouts();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const filtered = workouts.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    return (
  <div className="admin-layout">
    <AdminSidebar />

    <div className="workout-page">
      <h1 className="title">Workouts Management</h1>

      <div className="workout-content">

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="workout-form">

          <h3>{editingId ? "Edit Workout" : "Add New Workout"}</h3>

          <input
            type="text"
            name="title"
            placeholder="Workout Title (e.g., Full Body Blast)"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="level"
            placeholder="Level (e.g., Beginner, Advanced)"
            value={form.level}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="duration"
            placeholder="Duration (in minutes)"
            value={form.duration}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description of the workout"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="exercises"
            placeholder="Exercises (comma-separated)"
            value={form.exercises}
            onChange={handleChange}
            required
          />

          {/* IMAGE */}
          <div className="upload-section">
            <label>
              {editingId
                ? "Update Cover Image (optional)"
                : "Upload Cover Image"}
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <span className="or-text">— OR —</span>

            <input
              type="text"
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* VIDEO */}
          <div className="upload-section">
            <label>
              {editingId
                ? "Update Video (optional)"
                : "Upload Video"}
            </label>

            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />

            <span className="or-text">— OR —</span>

            <input
              type="text"
              placeholder="Video URL (https://...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="primary-btn">
            {editingId ? "UPDATE WORKOUT" : "ADD WORKOUT"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  description: "",
                  level: "",
                  duration: "",
                  exercises: ""
                });
                setFile(null);
                setVideoFile(null);
                setImageUrl("");
                setVideoUrl("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* ================= LIST ================= */}
        <div className="workout-list-section">

          <input
            type="text"
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="workout-search"
          />

          <div className="workout-grid">

            {filtered.map((workout) => (
              <div key={workout._id} className="workout-card">

                <div
                  className="workout-image"
                  style={{
                    backgroundImage: `url(${workout.image || "https://via.placeholder.com/300"})`
                  }}
                ></div>

                <div className="workout-info">

                  <div className="workout-top">
                    <span className="level-badge">
                      {workout.level}
                    </span>

                    <span className="duration">
                      ⏱ {workout.duration}m
                    </span>
                  </div>

                  <h4 className="workout-title">
                    {workout.title}
                  </h4>

                  <p className="workout-description">
                    {workout.description}
                  </p>

                  <div className="card-actions">

                    <button
                      onClick={() => handleEdit(workout)}
                      className="edit-btn"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(workout._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default AdminWorkouts;
