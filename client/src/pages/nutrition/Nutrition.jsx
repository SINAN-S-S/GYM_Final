import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import {
  resolveImageUrl,
  getProductFallbackImage,
  getFoodFallbackImage,
  onImageError,
} from '../../utils/imageUrl';
import './Nutrition.css';

const CATEGORIES = [
  "All Products",
  "Whey Protein",
  "Whey Isolate",
  "Mass Gainers",
  "Creatine",
  "Pre-Workout",
  "Vitamins and Minerals",
  "Fitness Accessories",
];

// Helper to highlight matching text in live search suggestions
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// GreenBasket-style Live Search Dropdown Component
function LiveSearchBar({
  searchQuery,
  setSearchQuery,
  allProducts,
  onSelectProduct,
  placeholder = "Search 73 certified supplements by name, brand, category (e.g. Optimum, Creatine)...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!query) return [];
    return allProducts.filter((p) => {
      return (
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    });
  }, [allProducts, query]);

  const handleSelect = (product) => {
    onSelectProduct(product);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="live-search-wrapper" ref={containerRef}>
      <div className="live-search-input-box">
        <span className="live-search-icon">🔍</span>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="live-search-field"
        />
        {searchQuery && (
          <button
            type="button"
            className="live-search-clear"
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
            }}
            aria-label="Clear Search"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="live-search-dropdown" role="listbox">
          <div className="dropdown-summary-bar">
            <span>
              {suggestions.length > 0
                ? `FOUND ${suggestions.length} MATCHING SUPPLEMENT${suggestions.length > 1 ? "S" : ""}`
                : "NO PRODUCTS FOUND"}
            </span>
            <span className="dropdown-tag">LIVE SEARCH</span>
          </div>

          {suggestions.length === 0 ? (
            <div className="dropdown-empty-state">
              <span className="empty-ico">🧪</span>
              <p className="empty-msg">
                No products found matching "<strong>{searchQuery}</strong>"
              </p>
              <span className="empty-hint">
                Try searching for Whey, Isolate, Creatine, Pre-Workout, or brand names like Optimum Nutrition, MuscleBlaze, Dymatize.
              </span>
            </div>
          ) : (
            <div className="dropdown-list">
              {suggestions.slice(0, 8).map((product) => {
                const fallback = getProductFallbackImage(product.name, product.brand, product.category);
                const thumbSrc = resolveImageUrl(product.image, fallback);

                return (
                  <div
                    key={product._id}
                    className="dropdown-item"
                    onClick={() => handleSelect(product)}
                    role="option"
                    tabIndex={0}
                  >
                    <div className="dropdown-thumb-wrap">
                      <img
                        src={thumbSrc}
                        alt={product.name}
                        onError={(e) => onImageError(e, fallback)}
                        className="dropdown-thumb-img"
                      />
                    </div>

                    <div className="dropdown-item-info">
                      <div className="dropdown-item-name">
                        {highlightMatch(product.name, query)}
                      </div>
                      <div className="dropdown-item-meta">
                        <span className="dropdown-brand-badge">{product.brand}</span>
                        <span className="dropdown-cat-badge">{product.category}</span>
                        <span className={`dropdown-stock-badge ${product.inStock ? "in" : "out"}`}>
                          {product.inStock ? "● IN STOCK" : "✕ OUT OF STOCK"}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-price-col">
                      <span className="dropdown-price-val">${Number(product.price).toFixed(2)}</span>
                      <span className="dropdown-view-btn">VIEW →</span>
                    </div>
                  </div>
                );
              })}

              {suggestions.length > 8 && (
                <div className="dropdown-more-footer">
                  + {suggestions.length - 8} more matching products available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Product Card Component with smooth image loading state and fallback handling
function ProductCard({ product, onSelect, onAddToCart, onBuyNow }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const fallback = getProductFallbackImage(product.name, product.brand, product.category);
  const imageSrc = resolveImageUrl(product.image, fallback);

  return (
    <div className="product-card" onClick={() => onSelect(product)}>
      <div className="product-image-box">
        {!imgLoaded && <div className="product-img-skeleton" />}
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            setImgLoaded(true);
            onImageError(e, fallback);
          }}
          className={`product-img ${imgLoaded ? "loaded" : "loading"}`}
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

        <h3 className="product-title" title={product.name}>{product.name}</h3>
        <p className="product-desc">
          {product.description?.slice(0, 110) || "Certified pharmaceutical-grade fitness supplement engineered for maximum muscle protein synthesis."}...
        </p>

        <div className="product-footer">
          <div className="price-box">
            <span className="price-val">${Number(product.price).toFixed(2)}</span>
          </div>

          <div className="card-actions">
            <button
              className="add-cart-btn"
              disabled={!product.inStock}
              onClick={(e) => onAddToCart(product, 1, e)}
              title="Add to Cart"
            >
              + CART
            </button>
            <button
              className="buy-now-btn"
              disabled={!product.inStock}
              onClick={(e) => onBuyNow(product, e)}
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Store Modal Card Component (Grid View)
function StoreModalCard({ product, onSelect, onAddToCart, onBuyNow }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const fallback = getProductFallbackImage(product.name, product.brand, product.category);
  const imageSrc = resolveImageUrl(product.image, fallback);

  return (
    <div className="store-product-card" onClick={() => onSelect(product)}>
      <div className="store-img-container">
        {!imgLoaded && <div className="product-img-skeleton" />}
        <img
          src={imageSrc}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            setImgLoaded(true);
            onImageError(e, fallback);
          }}
          className={`store-card-img ${imgLoaded ? "loaded" : "loading"}`}
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

        <h3 className="card-product-name" title={product.name}>{product.name}</h3>
        <p className="card-desc-snippet">
          {product.description?.slice(0, 95) || "Scientifically backed supplement formulation."}...
        </p>

        <div className="store-card-bottom">
          <div className="store-price-tag">
            ${Number(product.price).toFixed(2)}
          </div>

          <div className="store-card-actions">
            <button
              className="btn-details-ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
            >
              DETAILS
            </button>
            <button
              className="btn-cart-lime"
              disabled={!product.inStock}
              onClick={(e) => onAddToCart(product, 1, e)}
            >
              + CART
            </button>
            <button
              className="btn-buy-white"
              disabled={!product.inStock}
              onClick={(e) => onBuyNow(product, e)}
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Store Modal List Item Component (List View)
function StoreModalListItem({ product, onSelect, onAddToCart, onBuyNow }) {
  const fallback = getProductFallbackImage(product.name, product.brand, product.category);
  const imageSrc = resolveImageUrl(product.image, fallback);

  return (
    <div className="store-product-list-item" onClick={() => onSelect(product)}>
      <div className="store-list-img-box">
        <img
          src={imageSrc}
          alt={product.name}
          onError={(e) => onImageError(e, fallback)}
          className="store-list-img"
        />
      </div>

      <div className="store-list-info">
        <div className="store-card-meta">
          <span className="card-brand">{product.brand}</span>
          <span className="card-cat">{product.category}</span>
          <span className={`store-stock-tag inline ${product.inStock ? "in" : "out"}`}>
            {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
          </span>
        </div>
        <h4 className="store-list-title">{product.name}</h4>
        <p className="store-list-desc">
          {product.description?.slice(0, 120) || "Scientifically backed supplement formulation."}...
        </p>
      </div>

      <div className="store-list-pricing-actions">
        <div className="store-price-tag">${Number(product.price).toFixed(2)}</div>
        <div className="store-list-btns">
          <button
            className="btn-details-ghost"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
          >
            DETAILS
          </button>
          <button
            className="btn-cart-lime"
            disabled={!product.inStock}
            onClick={(e) => onAddToCart(product, 1, e)}
          >
            + CART
          </button>
          <button
            className="btn-buy-white"
            disabled={!product.inStock}
            onClick={(e) => onBuyNow(product, e)}
          >
            BUY
          </button>
        </div>
      </div>
    </div>
  );
}

function Nutrition() {
  const [foods, setFoods] = useState([]);
  const [powders, setPowders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [storeViewMode, setStoreViewMode] = useState("grid"); // "grid" | "list"

  // Store filtering & search state
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [productQty, setProductQty] = useState(1);
  const [showAllOnPage, setShowAllOnPage] = useState(true);

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
      const isAll =
        !selectedCategory ||
        selectedCategory.toUpperCase() === "ALL" ||
        selectedCategory.toLowerCase() === "all products";

      const matchesCategory =
        isAll ||
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

  // Displayed products on the main page
  const displayedProducts = useMemo(() => {
    if (showAllOnPage || (selectedCategory !== "All Products" && selectedCategory !== "ALL") || searchQuery.trim()) {
      return filteredProducts;
    }
    return filteredProducts.slice(0, 8);
  }, [filteredProducts, showAllOnPage, selectedCategory, searchQuery]);

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

            {/* --- SUPPLEMENTS & STORE PRODUCTS SHELF --- */}
            <div className="section-title-bar">
              <div className="shelf-title-group">
                <h2 className="shelf-heading">ALPHAFIT SUPPLEMENTS &amp; STORE</h2>
                <span className="shelf-subtitle">
                  Showing {displayedProducts.length} of {allStoreProducts.length} certified supplements
                </span>
              </div>
              <div className="shelf-right-actions">
                <button
                  className={`shelf-toggle-btn ${showAllOnPage ? "active" : ""}`}
                  onClick={() => setShowAllOnPage(!showAllOnPage)}
                >
                  {showAllOnPage ? "SHOW COMPACT" : `VIEW ALL (${filteredProducts.length}) PRODUCTS`}
                </button>
                <button className="view-all-link" onClick={() => setIsStoreOpen(true)}>
                  LAUNCH STORE PORTAL ↗
                </button>
              </div>
            </div>

            {/* LIVE SEARCH BAR (Main Page Shelf) */}
            <div className="main-shelf-search-row">
              <LiveSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                allProducts={allStoreProducts}
                onSelectProduct={handleOpenProductDetails}
                placeholder="Live Search: Type product or brand (e.g. Optimum, MuscleBlaze, Creatine)..."
              />
            </div>

            {/* Category Filter Pills on Main Page */}
            <div className="main-category-pills">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === "All Products" || cat === "ALL"
                    ? allStoreProducts.length
                    : allStoreProducts.filter(
                        (p) => p.category?.toLowerCase() === cat.toLowerCase()
                      ).length;
                const isSelected =
                  selectedCategory.toLowerCase() === cat.toLowerCase() ||
                  ((cat === "All Products" || cat === "ALL") &&
                    (selectedCategory === "ALL" || selectedCategory === "All Products"));
                return (
                  <button
                    key={cat}
                    className={`cat-pill ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowAllOnPage(true);
                    }}
                  >
                    {cat.toUpperCase()} {count > 0 ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>

            {displayedProducts.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🧪</div>
                <p>No products found matching your current filter.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSearchQuery("");
                  }}
                  style={{ marginTop: "12px" }}
                >
                  RESET SEARCH &amp; FILTERS
                </button>
              </div>
            ) : (
              <div className="nutrition-grid" style={{ marginBottom: "70px" }}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onSelect={handleOpenProductDetails}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
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
                  const fallback = getFoodFallbackImage(food.name);
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
                          loading="lazy"
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
              {/* GreenBasket Live Search Bar inside Modal */}
              <LiveSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                allProducts={allStoreProducts}
                onSelectProduct={handleOpenProductDetails}
                placeholder="Search proteins, gainers, creatine, brands (e.g. Optimum, MuscleBlaze)..."
              />

              {/* Category Filter Pills */}
              <div className="category-pills-row">
                {CATEGORIES.map((cat) => {
                  const isSelected =
                    selectedCategory.toLowerCase() === cat.toLowerCase() ||
                    ((cat === "All Products" || cat === "ALL") &&
                      (selectedCategory === "ALL" || selectedCategory === "All Products"));
                  return (
                    <button
                      key={cat}
                      className={`cat-pill ${isSelected ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Count Indicator & View Toggle */}
            <div className="store-results-info">
              <div className="store-results-left">
                <span>Showing {filteredProducts.length} certified supplements</span>
                {selectedCategory !== "ALL" && selectedCategory !== "All Products" && (
                  <span className="active-cat-label">
                    Filtered by: <strong>{selectedCategory}</strong>
                  </span>
                )}
              </div>

              <div className="store-view-toggle">
                <button
                  type="button"
                  className={`view-mode-btn ${storeViewMode === "grid" ? "active" : ""}`}
                  onClick={() => setStoreViewMode("grid")}
                  title="Grid View"
                >
                  <span style={{ fontSize: "1rem" }}>⊞</span> Grid
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${storeViewMode === "list" ? "active" : ""}`}
                  onClick={() => setStoreViewMode("list")}
                  title="List View"
                >
                  <span style={{ fontSize: "1rem" }}>☰</span> List
                </button>
              </div>
            </div>

            {/* Products Display Container (Grid or List) */}
            {filteredProducts.length === 0 ? (
              <div className="no-results-box">
                <div className="no-res-icon">🧪</div>
                <h3>NO PRODUCTS MATCH YOUR SEARCH</h3>
                <p>Try clearing filters or searching with different keywords.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSearchQuery("");
                  }}
                >
                  SHOW ALL PRODUCTS
                </button>
              </div>
            ) : storeViewMode === "list" ? (
              <div className="store-modal-list">
                {filteredProducts.map((product) => (
                  <StoreModalListItem
                    key={product._id}
                    product={product}
                    onSelect={handleOpenProductDetails}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="store-modal-grid">
                {filteredProducts.map((product) => (
                  <StoreModalCard
                    key={product._id}
                    product={product}
                    onSelect={handleOpenProductDetails}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
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
                  <p>
                    {selectedProduct.description ||
                      "A pharmaceutical-grade supplement designed to enhance recovery, muscle protein synthesis, and physical resilience."}
                  </p>
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

                {/* Related & Matching Products in Category */}
                {(() => {
                  const matchingProducts = allStoreProducts
                    .filter(
                      (p) =>
                        p._id !== selectedProduct._id &&
                        p.category?.toLowerCase() === selectedProduct.category?.toLowerCase()
                    )
                    .slice(0, 6);

                  if (matchingProducts.length === 0) return null;

                  return (
                    <div className="details-related-section">
                      <div className="related-title-row">
                        <span className="related-kicker">
                          MATCHING IN {selectedProduct.category?.toUpperCase()}
                        </span>
                        <span className="related-count">({matchingProducts.length} related)</span>
                      </div>
                      <div className="details-related-grid">
                        {matchingProducts.map((rel) => {
                          const relFallback = getProductFallbackImage(rel.name, rel.brand, rel.category);
                          return (
                            <div
                              key={rel._id}
                              className="related-product-card"
                              onClick={() => {
                                setSelectedProduct(rel);
                                setProductQty(1);
                              }}
                              title={`View ${rel.name}`}
                            >
                              <div className="related-img-wrap">
                                <img
                                  src={resolveImageUrl(rel.image, relFallback)}
                                  alt={rel.name}
                                  onError={(e) => onImageError(e, relFallback)}
                                  className="related-thumb-img"
                                />
                              </div>
                              <div className="related-info">
                                <span className="related-brand">{rel.brand}</span>
                                <h5 className="related-name">{rel.name}</h5>
                                <span className="related-price">${Number(rel.price).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
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
                src={resolveImageUrl(selectedFood.image, getFoodFallbackImage(selectedFood.name))}
                alt={selectedFood.name}
                onError={(e) => onImageError(e, getFoodFallbackImage(selectedFood.name))}
                className="nutrition-modal-img"
              />
            </div>
            <div className="nutrition-modal-details">
              <p className="nutrition-category">NUTRITION ITEM</p>
              <h2 className="nutrition-title">{selectedFood.name}</h2>
              <p style={{ color: "#ccc", margin: "15px 0", lineHeight: "1.6" }}>
                {selectedFood.description ||
                  "A nutritious choice to hit your macro goals and fuel your performance."}
              </p>

              <div className="calories-display" style={{ marginBottom: "20px" }}>
                <span className="cal-num">{selectedFood.calories}</span>
                <span className="cal-unit">kcal / serving</span>
              </div>

              <div className="macro-row" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
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
