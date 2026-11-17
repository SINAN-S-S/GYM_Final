import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminNutrition.css";
import AdminSidebar from "../../../admin_components/AdminSidebar/AdminSidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  resolveImageUrl,
  getProductFallbackImage,
  onImageError,
  PRODUCT_FALLBACK_IMAGES
} from "../../../utils/imageUrl";

const SUPPLEMENT_CATEGORIES = [
  "Whey Protein",
  "Whey Isolate",
  "Mass Gainers",
  "Creatine",
  "Pre-Workout",
  "Vitamins and Minerals",
  "Fitness Accessories"
];

function AdminNutrition() {
  const [items, setItems] = useState([]);
  const [powders, setPowders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nutrition");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showPowderModal, setShowPowderModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editPowder, setEditPowder] = useState(null);

  // Form states
  const [form, setForm] = useState({
    name: "", calories: "", protein: "", carbs: ""
  });

  const [powderForm, setPowderForm] = useState({
    name: "", brand: "", category: "Whey Protein", price: "", description: "", inStock: true
  });

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const showNotification = (msg, isError = false) => {
    setStatusMessage({ text: msg, isError });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const fetchNutrition = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching nutrition items:", err);
      showNotification("Failed to fetch whole food items", true);
    }
  };

  const fetchPowders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/protein-powders`);
      setPowders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching supplement products:", err);
      showNotification("Failed to fetch supplement products", true);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchNutrition(), fetchPowders()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const filteredItems = items.filter((i) => {
    const q = search.trim().toLowerCase();
    return !q || i.name?.toLowerCase().includes(q);
  });

  const filteredPowders = powders.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      (p.category || "Whey Protein").toLowerCase() === selectedCategory.toLowerCase();

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Open modals
  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      name: item.name || "",
      calories: item.calories || "",
      protein: item.protein || "",
      carbs: item.carbs || ""
    } : {
      name: "", calories: "", protein: "", carbs: ""
    });
    setFile(null);
    setImageUrl(item?.image || "");
    setShowModal(true);
  };

  const openPowderModal = (powder = null) => {
    setEditPowder(powder);
    setPowderForm(powder ? {
      name: powder.name || "",
      brand: powder.brand || "",
      category: powder.category || "Whey Protein",
      price: powder.price || "",
      description: powder.description || "",
      inStock: powder.inStock !== false
    } : {
      name: "",
      brand: "",
      category: "Whey Protein",
      price: "",
      description: "",
      inStock: true
    });
    setFile(null);
    setImageUrl(powder?.image || "");
    setShowPowderModal(true);
  };

  // Submit Food
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      showNotification("Please provide a name for the food item", true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("calories", form.calories || 0);
      formData.append("protein", form.protein || 0);
      formData.append("carbs", form.carbs || 0);

      if (file) {
        formData.append("image", file);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      if (editItem) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${editItem._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("Food item updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("New food item created successfully");
      }

      setShowModal(false);
      setFile(null);
      setImageUrl("");
      fetchNutrition();
    } catch (err) {
      console.error("Save Nutrition Error:", err);
      showNotification("Error saving food item", true);
    }
  };

  // Submit Powder / Supplement
  const handlePowderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!powderForm.name.trim()) {
      showNotification("Please provide a product name", true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", powderForm.name);
      formData.append("brand", powderForm.brand || "AlphaFit Nutrition");
      formData.append("category", powderForm.category || "Whey Protein");
      formData.append("price", powderForm.price || 0);
      formData.append("description", powderForm.description || "");
      formData.append("inStock", powderForm.inStock);

      if (file) {
        formData.append("image", file);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      if (editPowder) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/protein-powders/${editPowder._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("Supplement product updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/protein-powders`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("New supplement product created successfully");
      }

      setShowPowderModal(false);
      setFile(null);
      setImageUrl("");
      fetchPowders();
    } catch (err) {
      console.error("Save Powder Error:", err);
      showNotification("Error saving supplement product", true);
    }
  };

  // Delete handlers
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`);
      showNotification("Food item deleted");
      fetchNutrition();
    } catch (err) {
      console.error("Delete Error:", err);
      showNotification("Failed to delete item", true);
    }
  };

  const deletePowder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplement product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/protein-powders/${id}`);
      showNotification("Product deleted from store");
      fetchPowders();
    } catch (err) {
      console.error("Delete Error:", err);
      showNotification("Failed to delete product", true);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="nutrition-admin">
        {/* Notification Toast */}
        {statusMessage && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: statusMessage.isError ? "#ef4444" : "#B5F23D",
              color: statusMessage.isError ? "#fff" : "#000",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: 800,
              zIndex: 9999,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Top Header & Stat Badges */}
        <div className="admin-header-row">
          <div>
            <h1 className="title">Nutrition &amp; Supplements Manager</h1>
            <p style={{ color: "#888", margin: "6px 0 0 0" }}>
              Manage Whole Foods macro database and Store Protein/Supplements inventory
            </p>
          </div>

          <div className="stat-badges-row">
            <div className="stat-badge">
              <span className="stat-label">Whole Foods</span>
              <span className="stat-num">{items.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Store Products</span>
              <span className="stat-num">{powders.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">In Stock</span>
              <span className="stat-num">{powders.filter((p) => p.inStock !== false).length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs-row">
          <button
            className={`admin-tab-btn ${activeTab === "nutrition" ? "active" : ""}`}
            onClick={() => setActiveTab("nutrition")}
          >
            Whole Foods Database ({items.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "powders" ? "active" : ""}`}
            onClick={() => setActiveTab("powders")}
          >
            Protein &amp; Supplements Store ({powders.length})
          </button>
        </div>

        {/* Search & Add Action Bar */}
        <div className="top-bar">
          <input
            className="search"
            placeholder={
              activeTab === "nutrition"
                ? "Search foods by name..."
                : "Search products by name, brand, or category..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {activeTab === "powders" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: "#141414",
                border: "1px solid #282828",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <option value="ALL">All Categories ({powders.length})</option>
              {SUPPLEMENT_CATEGORIES.map((cat) => {
                const count = powders.filter((p) => (p.category || "Whey Protein") === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          )}

          <button
            className="add-btn"
            onClick={() => (activeTab === "nutrition" ? openModal() : openPowderModal())}
          >
            + {activeTab === "nutrition" ? "Add Whole Food" : "Add Store Product"}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
            Loading Database Records...
          </div>
        ) : (
          <>
            {/* --- TAB 1: WHOLE FOODS --- */}
            {activeTab === "nutrition" && (
              <>
                {items.length > 0 && (
                  <div className="chart-box">
                    <h3>Macronutrient Profile (Calories Overview)</h3>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={items.slice(0, 10)}>
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: "6px" }}
                        />
                        <Bar dataKey="calories" fill="#B5F23D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="admin-table-wrap">
                  <div className="admin-grid-header food-columns">
                    <span>Image</span>
                    <span>Food Name</span>
                    <span>Calories</span>
                    <span>Protein</span>
                    <span>Carbs</span>
                    <span>Actions</span>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="admin-empty-state">
                      <h3>No food items found</h3>
                      <p>Add your first whole food item to make it visible in the nutrition calculator.</p>
                      <button className="add-btn" onClick={() => openModal()}>
                        + Add Food
                      </button>
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const fallback = PRODUCT_FALLBACK_IMAGES.default_product;
                      const imageSrc = resolveImageUrl(item.image, fallback);

                      return (
                        <div className="admin-grid-row food-columns" key={item._id}>
                          <div className="table-img-cell">
                            <img
                              src={imageSrc}
                              alt={item.name}
                              onError={(e) => onImageError(e, fallback)}
                            />
                          </div>
                          <span className="cell-primary">{item.name}</span>
                          <span className="cell-sub">{item.calories} kcal</span>
                          <span className="cell-sub">{item.protein}g</span>
                          <span className="cell-sub">{item.carbs}g</span>

                          <div className="actions">
                            <button className="edit-btn" onClick={() => openModal(item)}>
                              Edit
                            </button>
                            <button className="delete-btn" onClick={() => deleteItem(item._id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* --- TAB 2: STORE PRODUCTS (PROTEIN POWDERS & SUPPLEMENTS) --- */}
            {activeTab === "powders" && (
              <div className="admin-table-wrap">
                <div className="admin-grid-header powder-columns">
                  <span>Image</span>
                  <span>Product Name</span>
                  <span>Brand</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {filteredPowders.length === 0 ? (
                  <div className="admin-empty-state">
                    <h3>No supplement products found</h3>
                    <p>Add items to your store catalog to start selling supplements.</p>
                    <button className="add-btn" onClick={() => openPowderModal()}>
                      + Add Product
                    </button>
                  </div>
                ) : (
                  filteredPowders.map((item) => {
                    const fallback = getProductFallbackImage(item.name, item.brand, item.category);
                    const imageSrc = resolveImageUrl(item.image, fallback);

                    return (
                      <div className="admin-grid-row powder-columns" key={item._id}>
                        <div className="table-img-cell">
                          <img
                            src={imageSrc}
                            alt={item.name}
                            onError={(e) => onImageError(e, fallback)}
                          />
                        </div>
                        <span className="cell-primary">{item.name}</span>
                        <span className="cell-sub">{item.brand || "AlphaFit Nutrition"}</span>
                        <span className="cell-sub">{item.category || "Whey Protein"}</span>
                        <span className="cell-primary">${Number(item.price || 0).toFixed(2)}</span>
                        <span>
                          <span className={item.inStock !== false ? "pill-in-stock" : "pill-out-stock"}>
                            {item.inStock !== false ? "IN STOCK" : "OUT OF STOCK"}
                          </span>
                        </span>

                        <div className="actions">
                          <button className="edit-btn" onClick={() => openPowderModal(item)}>
                            Edit
                          </button>
                          <button className="delete-btn" onClick={() => deletePowder(item._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}

        {/* =========================================
            NUTRITION FOOD MODAL (ADD / EDIT)
        ========================================= */}
        {showModal && (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editItem ? "Edit Food Item" : "Add Whole Food Item"}</h2>
              
              <label>Food Name</label>
              <input
                placeholder="e.g. Grilled Chicken Breast"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label>Calories (kcal / 100g)</label>
              <input
                placeholder="e.g. 165"
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />

              <label>Protein (grams)</label>
              <input
                placeholder="e.g. 31"
                type="number"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
              />

              <label>Carbohydrates (grams)</label>
              <input
                placeholder="e.g. 0"
                type="number"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              />

              <div style={{ margin: "15px 0" }}>
                <label>Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ color: "#aaa" }}
                />
                
                <div style={{ textAlign: "center", color: "#666", margin: "8px 0", fontSize: "0.85rem" }}>
                  — OR ENTER DIRECT IMAGE URL —
                </div>

                <label>Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/chicken.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-save" onClick={handleSubmit}>
                  Save Food
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SUPPLEMENT PRODUCT MODAL (ADD / EDIT)
        ========================================= */}
        {showPowderModal && (
          <div className="modal" onClick={() => setShowPowderModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editPowder ? "Edit Supplement Product" : "Add Store Supplement"}</h2>

              <label>Product Name</label>
              <input
                placeholder="e.g. Gold Standard 100% Whey"
                value={powderForm.name}
                onChange={(e) => setPowderForm({ ...powderForm, name: e.target.value })}
              />

              <label>Brand</label>
              <input
                placeholder="e.g. Optimum Nutrition"
                value={powderForm.brand}
                onChange={(e) => setPowderForm({ ...powderForm, brand: e.target.value })}
              />

              <label>Category</label>
              <select
                value={powderForm.category}
                onChange={(e) => setPowderForm({ ...powderForm, category: e.target.value })}
              >
                {SUPPLEMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label>Price ($ USD)</label>
              <input
                placeholder="e.g. 59.99"
                type="number"
                step="0.01"
                value={powderForm.price}
                onChange={(e) => setPowderForm({ ...powderForm, price: e.target.value })}
              />

              <label>Description</label>
              <textarea
                placeholder="Key benefits, servings per tub, active ingredients..."
                value={powderForm.description}
                onChange={(e) => setPowderForm({ ...powderForm, description: e.target.value })}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                <input
                  type="checkbox"
                  id="inStockCheckbox"
                  checked={powderForm.inStock}
                  onChange={(e) => setPowderForm({ ...powderForm, inStock: e.target.checked })}
                  style={{ width: "auto", margin: 0 }}
                />
                <label htmlFor="inStockCheckbox" style={{ margin: 0, cursor: "pointer", color: "#fff" }}>
                  Product In Stock
                </label>
              </div>

              <div style={{ margin: "15px 0" }}>
                <label>Upload Product Image (PNG / JPG / WebP)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ color: "#aaa" }}
                />

                <div style={{ textAlign: "center", color: "#666", margin: "8px 0", fontSize: "0.85rem" }}>
                  — OR ENTER DIRECT IMAGE URL —
                </div>

                <label>Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/whey-protein.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPowderModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-save" onClick={handlePowderSubmit}>
                  Save Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNutrition;
