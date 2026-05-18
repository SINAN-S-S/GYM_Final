import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProgress.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";

function AdminProgress() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchProgressLogs();
  }, []);

  const fetchProgressLogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/progress`
      );
      setLogs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLog = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/progress/${id}`
      );

      setLogs(logs.filter((l) => l._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="programs-page">
        <h1 className="title">User Progress Logs</h1>

        {/* Table */}
        <div className="table">
          {/* Header */}
          <div className="row header">
            <span>Date</span>
            <span>Weight</span>
            <span>Workouts</span>
            <span>Calories</span>
            <span>Measurements</span>
            <span>Actions</span>
          </div>

          {/* Logs */}
          {logs.length === 0 ? (
            <p className="empty-text">No progress logs found.</p>
          ) : (
            logs.map((log) => (
              <div className="row data-row" key={log._id}>
                <div className="mobile-item">
                  <label>Date</label>
                  <span>
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="mobile-item">
                  <label>Weight</label>
                  <span>{log.weight} kg</span>
                </div>

                <div className="mobile-item">
                  <label>Workouts</label>
                  <span>{log.workoutsCompleted}</span>
                </div>

                <div className="mobile-item">
                  <label>Calories</label>
                  <span>
                    {log.calories ? `${log.calories} kcal` : "-"}
                  </span>
                </div>

                <div className="mobile-item">
                  <label>Measurements</label>
                  <span>
                    {log.chest
                      ? `C: ${log.chest} / W: ${log.waist}`
                      : "-"}
                  </span>
                </div>

                <div className="actions">
                  <button
                    className="delete-btn"
                    onClick={() => deleteLog(log._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProgress;