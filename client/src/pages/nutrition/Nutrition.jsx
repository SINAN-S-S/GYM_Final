import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import {
  resolveImageUrl,
  getProductFallbackImage,
  onImageError,
  PRODUCT_FALLBACK_IMAGES,
} from '../../utils/imageUrl';
import './Nutrition.css';

const CATEGORIES = [
  "ALL",
  "Whey Protein",
  "Whey Isolate",
  "Mass Gainers",
  "Creatine",
  "Pre-Workout",
  "Vitamins and Minerals",
  "Fitness Accessories",
];

function Nutrition() {
  const [foods, setFoods] = useState([]);
  const [powders, setPowders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  // Store filtering & search state
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [productQty, setProductQty] = useState(1);

  const navigate = useNavigate();
  const { addToCart, openCart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFood, resPowders] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/protein-powders`),
        ]);
        setFoods(Array.isArray(resFood.data) ? resFood.data : []);
        setPowders(Array.isArray(resPowders.data) ? resPowders.data : []);
      } catch (err) {
        console.error("Error fetching nutrition data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // All real database products from MongoDB Fitness
  const allStoreProducts = useMemo(() => {
    return powders.map((p) => {
      const cat =
        p.category ||
        (p.brand?.toLowerCase().includes("isolate") || p.name?.toLowerCase().includes("isolate")
          ? "Whey Isolate"
          : "Whey Protein");

      return {
        ...p,
        category: cat,
        brand: p.brand || "AlphaFit Nutrition",
      };
    });
  }, [powders]);

  // Filtered store products
  const filteredProducts = useMemo(() => {
    return allStoreProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [allStoreProducts, selectedCategory, searchQuery]);

  const handleOpenProductDetails = (product) => {
    setSelectedProduct(product);
    setProductQty(1);
  };

  const handleAddToCart = (product, qty = 1, e) => {
    if (e) e.stopPropagation();
    addToCart(product, qty);
  };

  const handleBuyNow = (product, e, qty = 1) => {
    if (e) e.stopPropagation();
    navigate(`/checkout/${product._id}?type=powder&qty=${qty}`);
  };

  return (
    <div className="nutrition-page">
      <div className="nutrition-container">
        {/* Header Section */}
        <header className="nutrition-header">
          <div className="header-left">
            <p className="section-num">04 — NUTRITION &amp; SUPPLEMENTS</p>
            <h1 className="heavy-title">FUEL <br /> RIGHT</h1>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">Loading Nutrition &amp; Store Database...</div>
        ) : (
          <>
            {/* --- STORE HERO PROMO BANNER --- */}
            <div className="store-banner-card" onClick={() => setIsStoreOpen(true)}>
              <div className="store-banner-content">
                <span className="banner-tag">OFFICIAL STORE PORTAL</span>
                <h2 className="banner-title">PROTEIN &amp; SUPPLEMENTS STORE</h2>
                <p className="banner-desc">
                  Explore certified Whey Proteins, Isolates, Creatine, Pre-Workouts, and Mass Gainers.
                  Tested for banned substances, guaranteed purity, and delivered to your doorstep.
                </p>
                <div className="banner-action-row">
                  <button className="banner-btn" onClick={() => setIsStoreOpen(true)}>
                    LAUNCH STORE →
                  </button>
                  <button
                    className="banner-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCart();
                    }}
                  >
                    VIEW CART
                  </button>
                </div>
              </div>

              <div className="banner-stats">
                <div className="b-stat">
                  <strong>100%</strong>
                  <span>PURE ISOLATE</span>
                </div>
                <div className="b-stat">
                  <strong>24G</strong>
                  <span>PROTEIN/SCOOP</span>
                </div>
                <div className="b-stat">
                  <strong>FREE</strong>
                  <span>DELIVERY</span>
                </div>
              </div>
            </div>

            {/* --- QUICK SHELF: FEATURED STORE PRODUCTS --- */}
            <div className="section-title-bar">
              <h2 className="shelf-heading">FEATURED SUPPLEMENTS</h2>
              <button className="view-all-link" onClick={() => setIsStoreOpen(true)}>
                VIEW FULL STORE ({allStoreProducts.length} PRODUCTS) →
              </button>
            </div>

            {allStoreProducts.length === 0 ? (
              <div className="empty-state">No products available in the store.</div>
            ) : (
              <div className="nutrition-grid" style={{ marginBottom: "70px" }}>
                {allStoreProducts.slice(0, 4).map((product) => {
                  const fallback = getProductFallbackImage(
                    product.name,
                    product.brand,
                    product.category
                  );
                  const imageSrc = resolveImageUrl(product.image, fallback);

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                      onClick={() => handleOpenProductDetails(product)}
                    >
                      <div className="product-image-box">
                        <img
                          src={imageSrc}
                          alt={product.name}
                          onError={(e) => onImageError(e, fallback)}
                          className="product-img"
                        />
                        <span className={`stock-badge ${product.inStock ? "in" : "out"}`}>
                          {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
                        </span>
                      </div>

                      <div className="product-body">
                        <div className="product-category-row">
                          <span className="p-brand">{product.brand}</span>
                          <span className="p-cat">{product.category}</span>
                        </div>

                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-desc">{product.description?.slice(0, 110)}...</p>

                        <div className="product-footer">
                          <div className="price-box">
                            <span className="price-val">${Number(product.price).toFixed(2)}</span>
                          </div>

                          <div className="card-actions">
                            <button
                              className="add-cart-btn"
                              disabled={!product.inStock}
                              onClick={(e) => handleAddToCart(product, 1, e)}
                              title="Add to Cart"
                            >
                              + CART
                            </button>
                            <button
                              className="buy-now-btn"
                              disabled={!product.inStock}
                              onClick={(e) => handleBuyNow(product, e)}
                            >
                              BUY NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- MACRO DATABASE SECTION --- */}
            <div className="section-title-bar" style={{ marginTop: "40px" }}>
              <h2 className="shelf-heading">WHOLE FOODS MACRO DATABASE</h2>
              <span className="shelf-subtitle">Verified macronutrient content per 100g serving</span>
            </div>

            {foods.length === 0 ? (
              <div className="empty-state">No whole food items registered. Check back later!</div>
            ) : (
              <div className="nutrition-grid">
                {foods.map((food) => {
                  const fallback = PRODUCT_FALLBACK_IMAGES.default_product;
                  const imageSrc = resolveImageUrl(food.image, fallback);

                  return (
                    <div
                      key={food._id}
                      className="food-card"
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="food-image-wrapper">
                        <img
                          src={imageSrc}
                          alt={food.name}
                          onError={(e) => onImageError(e, fallback)}
                          className="food-img"
                        />
                      </div>

                      <div className="food-content">
                        <span className="food-tag">WHOLE FOOD</span>
                        <h3 className="food-name">{food.name}</h3>

                        <div className="calories-display">
                          <span className="cal-num">{food.calories}</span>
                          <span className="cal-unit">kcal / serving</span>
                        </div>

                        <div className="macro-row">
                          <div className="macro-item">
                            <span className="macro-val">{food.protein}g</span>
                            <span className="macro-label">PROTEIN</span>
                          </div>
                          <div className="macro-item">
                            <span className="macro-val">{food.carbs}g</span>
                            <span className="macro-label">CARBS</span>
                          </div>
                          <div className="macro-item">
                            <span className="macro-val">{food.fat || 0}g</span>
                            <span className="macro-label">FAT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================================================
          1. PROTEIN & SUPPLEMENTS STORE MODAL
      =================================================== */}
      {isStoreOpen && (
        <div className="store-modal-overlay" onClick={() => setIsStoreOpen(false)}>
          <div
            className="store-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="store-modal-header">
              <div className="header-titles">
                <span className="modal-kicker">ALPHAFIT SUPPLEMENTS VAULT</span>
                <h2 className="modal-heading">PROTEIN &amp; SUPPLEMENTS STORE</h2>
                <p className="modal-sub">
                  Scientifically backed formulation. Zero fillers. Verified bioavailability.
                </p>
              </div>

              <div className="header-actions">
                <button
                  className="modal-cart-shortcut-btn"
                  onClick={() => {
                    setIsStoreOpen(false);
                    openCart();
                  }}
                  title="Open Cart"
                >
                  🛒 VIEW CART
                </button>
                <button
                  className="store-close-btn"
                  onClick={() => setIsStoreOpen(false)}
                  aria-label="Close Store Modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="store-controls-bar">
              {/* Search Bar */}
              <div className="store-search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search proteins, gainers, creatine, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="store-search-input"
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="category-pills-row">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Count Indicator */}
            <div className="store-results-info">
              <span>Showing {filteredProducts.length} certified supplements</span>
              {selectedCategory !== "ALL" && (
                <span className="active-cat-label">Filtered by: <strong>{selectedCategory}</strong></span>
              )}
            </div>

            {/* Products Grid */}
            <div className="store-modal-grid">
              {filteredProducts.length === 0 ? (
                <div className="no-results-box">
                  <div className="no-res-icon">🧪</div>
                  <h3>NO PRODUCTS MATCH YOUR SEARCH</h3>
                  <p>Try clearing filters or searching with different keywords.</p>
                  <button
                    className="reset-filters-btn"
                    onClick={() => {
                      setSelectedCategory("ALL");
                      setSearchQuery("");
                    }}
                  >
                    SHOW ALL PRODUCTS
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const fallback = getProductFallbackImage(
                    product.name,
                    product.brand,
                    product.category
                  );
                  const imageSrc = resolveImageUrl(product.image, fallback);

                  return (
                    <div
                      key={product._id}
                      className="store-product-card"
                      onClick={() => handleOpenProductDetails(product)}
                    >
                      <div className="store-img-container">
                        <img
                          src={imageSrc}
                          alt={product.name}
                          onError={(e) => onImageError(e, fallback)}
                          className="store-card-img"
                        />
                        <span className={`store-stock-tag ${product.inStock ? "in" : "out"}`}>
                          {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
                        </span>
                      </div>

                      <div className="store-card-content">
                        <div className="store-card-meta">
                          <span className="card-brand">{product.brand}</span>
                          <span className="card-cat">{product.category}</span>
                        </div>

                        <h3 className="card-product-name">{product.name}</h3>
                        <p className="card-desc-snippet">{product.description?.slice(0, 95)}...</p>

                        <div className="store-card-bottom">
                          <div className="store-price-tag">
                            ${Number(product.price).toFixed(2)}
                          </div>

                          <div className="store-card-actions">
                            <button
                              className="btn-details-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProductDetails(product);
                              }}
                            >
                              DETAILS
                            </button>
                            <button
                              className="btn-cart-lime"
                              disabled={!product.inStock}
                              onClick={(e) => handleAddToCart(product, 1, e)}
                            >
                              + CART
                            </button>
                            <button
                              className="btn-buy-white"
                              disabled={!product.inStock}
                              onClick={(e) => handleBuyNow(product, e)}
                            >
                              BUY NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          2. PRODUCT DETAILS MODAL
      =================================================== */}
      {selectedProduct && (
        <div className="product-details-overlay" onClick={() => setSelectedProduct(null)}>
          <div
            className="product-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="details-close-btn"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close Product Details"
            >
              ✕
            </button>

            <div className="details-columns">
              {/* Product Visual Box */}
              <div className="details-image-section">
                <div className="details-img-wrap">
                  <img
                    src={resolveImageUrl(
                      selectedProduct.image,
                      getProductFallbackImage(
                        selectedProduct.name,
                        selectedProduct.brand,
                        selectedProduct.category
                      )
                    )}
                    alt={selectedProduct.name}
                    onError={(e) =>
                      onImageError(
                        e,
                        getProductFallbackImage(
                          selectedProduct.name,
                          selectedProduct.brand,
                          selectedProduct.category
                        )
                      )
                    }
                    className="details-main-img"
                  />
                </div>
                <div className="details-badge-row">
                  <span className="spec-pill">✓ 100% AUTHENTIC</span>
                  <span className="spec-pill">✓ LAB TESTED</span>
                  <span className="spec-pill">✓ FAST DISPATCH</span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="details-info-section">
                <div className="details-meta-header">
                  <span className="brand-tag">{selectedProduct.brand}</span>
                  <span className="category-tag">{selectedProduct.category}</span>
                </div>

                <h2 className="details-product-title">{selectedProduct.name}</h2>

                <div className="details-price-row">
                  <span className="details-price">${Number(selectedProduct.price).toFixed(2)}</span>
                  <span className={`details-stock-pill ${selectedProduct.inStock ? "in" : "out"}`}>
                    {selectedProduct.inStock ? "● READY FOR IMMEDIATE DISPATCH" : "✕ CURRENTLY OUT OF STOCK"}
                  </span>
                </div>

                <div className="details-divider"></div>

                <div className="details-description">
                  <h4>PRODUCT OVERVIEW</h4>
                  <p>{selectedProduct.description || "A pharmaceutical-grade supplement designed to enhance recovery, muscle protein synthesis, and physical resilience."}</p>
                </div>

                {selectedProduct.specs && (
                  <div className="details-specs-box">
                    <h4>PERFORMANCE HIGHLIGHTS</h4>
                    <ul>
                      {selectedProduct.specs.map((spec, i) => (
                        <li key={i}>⚡ {spec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="details-purchase-controls">
                  <div className="qty-picker">
                    <label>QUANTITY:</label>
                    <div className="qty-stepper">
                      <button
                        onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                        disabled={productQty <= 1}
                      >
                        −
                      </button>
                      <span>{productQty}</span>
                      <button onClick={() => setProductQty((q) => Math.min(10, q + 1))}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="details-buttons-row">
                    <button
                      className="details-add-cart-btn"
                      disabled={!selectedProduct.inStock}
                      onClick={() => {
                        addToCart(selectedProduct, productQty);
                        setSelectedProduct(null);
                      }}
                    >
                      ADD {productQty} TO CART (${(selectedProduct.price * productQty).toFixed(2)})
                    </button>

                    <button
                      className="details-buy-btn"
                      disabled={!selectedProduct.inStock}
                      onClick={() => {
                        const qty = productQty;
                        setSelectedProduct(null);
                        navigate(`/checkout/${selectedProduct._id}?type=powder&qty=${qty}`);
                      }}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          3. MACRO FOOD DETAILS MODAL
      =================================================== */}
      {selectedFood && (
        <div className="nutrition-modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="nutrition-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="nutrition-modal-close" onClick={() => setSelectedFood(null)}>
              &times;
            </button>
            <div className="modal-img-container">
              <img
                src={resolveImageUrl(selectedFood.image, PRODUCT_FALLBACK_IMAGES.default_product)}
                alt={selectedFood.name}
                onError={(e) => onImageError(e, PRODUCT_FALLBACK_IMAGES.default_product)}
                className="nutrition-modal-img"
              />
            </div>
            <div className="nutrition-modal-details">
              <p className="nutrition-category">NUTRITION ITEM</p>
              <h2 className="nutrition-title">{selectedFood.name}</h2>
              <p style={{ color: '#ccc', margin: '15px 0', lineHeight: '1.6' }}>
                {selectedFood.description ||
                  "A nutritious choice to hit your macro goals and fuel your performance."}
              </p>

              <div className="calories-display" style={{ marginBottom: '20px' }}>
                <span className="cal-num">{selectedFood.calories}</span>
                <span className="cal-unit">kcal / serving</span>
              </div>

              <div className="macro-row" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                <div className="macro-item">
                  <span className="macro-val">{selectedFood.protein}g</span>
                  <span className="macro-label">PROTEIN</span>
                </div>
                <div className="macro-item">
                  <span className="macro-val">{selectedFood.carbs}g</span>
                  <span className="macro-label">CARBS</span>
                </div>
                <div className="macro-item">
                  <span className="macro-val">{selectedFood.fat || 0}g</span>
                  <span className="macro-label">FAT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nutrition;
