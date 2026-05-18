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
    exercises: "",
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
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/workouts`
      );
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
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/workouts/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/workouts`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setForm({
        title: "",
        description: "",
        level: "",
        duration: "",
        exercises: "",
      });

      setFile(null);
      setVideoFile(null);
      setImageUrl("");
      setVideoUrl("");
      setEditingId(null);

      alert(
        editingId
          ? "Workout updated successfully!"
          : "Workout added successfully!"
      );

      fetchWorkouts();
    } catch (err) {
      console.log(err);
      alert(
        "Failed to save workout: " +
          (err.response?.data?.msg || err.message)
      );
    }
  };

  const handleEdit = (workout) => {
    setForm({
      title: workout.title || "",
      description: workout.description || "",
      level: workout.level || "",
      duration: workout.duration || "",
      exercises: workout.exercises
        ? workout.exercises.join(", ")
        : "",
    });

    setEditingId(workout._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/workouts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
    <div className="admin-layout">
      <AdminSidebar />

      <div className="workout-page">
        <h1 className="title">Workouts Management</h1>

        <div className="workout-content">

          {/* FORM */}
          <form className="workout-form" onSubmit={handleSubmit}>
            <h3>
              {editingId ? "Edit Workout" : "Add New Workout"}
            </h3>

            <input
              type="text"
              name="title"
              placeholder="Workout Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="level"
              placeholder="Level"
              value={form.level}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="duration"
              placeholder="Duration"
              value={form.duration}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Workout Description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="exercises"
              placeholder="Exercises"
              value={form.exercises}
              onChange={handleChange}
              required
            />

            {/* IMAGE */}
            <div className="upload-section">
              <label>
                {editingId
                  ? "Update Cover Image"
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
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {/* VIDEO */}
            <div className="upload-section">
              <label>
                {editingId
                  ? "Update Video"
                  : "Upload Video"}
              </label>

              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={(e) =>
                  setVideoFile(e.target.files[0])
                }
              />

              <span className="or-text">— OR —</span>

              <input
                type="text"
                placeholder="Video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="primary-btn">
              {editingId
                ? "UPDATE WORKOUT"
                : "ADD WORKOUT"}
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
                    exercises: "",
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

          {/* LIST */}
          <div className="workout-list-section">

            <input
              type="text"
              className="workout-search"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="workout-grid">

              {filtered.map((workout) => (
                <div
                  className="workout-card"
                  key={workout._id}
                >
                  <div
                    className="workout-image"
                    style={{
                      backgroundImage: `url(${
                        workout.image ||
                        "https://via.placeholder.com/300"
                      })`,
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
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(workout)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(workout._id)
                        }
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