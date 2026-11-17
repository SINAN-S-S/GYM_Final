import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminGoals.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";

function AdminGoals() {
  const [goals, setGoals] = useState([]);
  const [search, setSearch] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", target: "" });

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/goals`);
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const filtered = goals.filter((g) =>
    g.title?.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (goal) => {
    setEditingGoal(goal);
    setEditForm({
      title: goal.title || "",
      description: goal.description || "",
      target: goal.target || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/goals/${editingGoal._id}`, editForm);
      setEditingGoal(null);
      fetchGoals();
      alert("Goal updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update goal");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/goals/${id}`);
      setGoals(goals.filter((g) => g._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <div className="goals-page">

        <h1 className="title"> Goals Management</h1>

        {/* Search */}
        <input
          className="search"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Table */}
        <div className="table">

          <div className="row header">
            <span>Title</span>
            <span>Description</span>
            <span>Target</span>
            <span>Actions</span>
          </div>

          {filtered.length === 0 ? (
            <p style={{ padding: "20px" }}>No goals found</p>
          ) : (
            filtered.map((goal) => (
              <div className="row" key={goal._id}>

                <span>{goal.title}</span>
                <span>{goal.description}</span>
                <span>{goal.target}</span>

                <div className="actions">
                  <button className="edit-btn" onClick={() => startEdit(goal)}>Edit</button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteGoal(goal._id)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))
          )}

        </div>

        {editingGoal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '8px', width: '450px', border: '1px solid #333' }}>
              <h2 style={{ color: '#B5F23D', marginBottom: '20px' }}>Edit Goal</h2>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>TITLE</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>DESCRIPTION</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>TARGET</label>
                  <input
                    type="number"
                    value={editForm.target}
                    onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: '#B5F23D', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    SAVE CHANGES
                  </button>
                  <button type="button" onClick={() => setEditingGoal(null)} style={{ flex: 1, padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminGoals;