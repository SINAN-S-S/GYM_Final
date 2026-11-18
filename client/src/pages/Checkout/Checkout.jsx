import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../../context/CartContext";
import {
  resolveImageUrl,
  getProductFallbackImage,
  getProgramFallbackImage,
  onImageError,
} from "../../utils/imageUrl";
import "./Checkout.css";

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "program";
  const isCartMode = queryParams.get("mode") === "cart" || !id;
  const initialQty = Math.max(1, parseInt(queryParams.get("qty") || "1", 10));

  const { cartItems, cartSubtotal, clearCart } = useContext(CartContext);

  const [singleQty, setSingleQty] = useState(initialQty);
  const [singleItem, setSingleItem] = useState(null);
  const [loading, setLoading] = useState(!isCartMode);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Customer Information & Delivery Address Form
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    // Read logged-in user to prefill info
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCustomerInfo((prev) => ({
          ...prev,
          fullName: u.name || u.username || "",
          email: u.email || "",
          phone: u.phone || "",
        }));
      } catch (e) {
        console.error("Failed to parse cached user:", e);
      }
    }

    if (isCartMode) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        const endpoint =
          type === "powder" ? `/api/protein-powders/${id}` : `/api/programs/${id}`;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`);
        setSingleItem(res.data);
      } catch (err) {
        console.error("Error fetching checkout item:", err);
        // Fallback for demo supplements if clicked from catalog
        if (id?.startsWith("supp-")) {
          setSingleItem({
            _id: id,
            name: "AlphaFit Pro Supplement",
            brand: "AlphaFit Lab Series",
            price: 999,
            image: "",
          });
        } else {
          setStatusMessage({
            type: "error",
            text: "Failed to load checkout details. Please check connection.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, type, isCartMode]);

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  // Handle Back button safely without modifying cart state
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/nutrition");
    }
  };

  // Compile items to buy
  const itemsToCheckout = isCartMode
    ? cartItems
    : singleItem
    ? [
        {
          _id: singleItem._id,
          name: singleItem.title || singleItem.name,
          brand: singleItem.brand || "AlphaFit",
          price: Number(singleItem.price) || 49.99,
          quantity: singleQty,
          image: singleItem.image,
          category: type === "powder" ? (singleItem.category || "Supplement") : "Program",
        },
      ]
    : [];

  const totalAmount = isCartMode
    ? cartSubtotal
    : singleItem
    ? (Number(singleItem.price) || 49.99) * singleQty
    : 0;

  const validateCustomerForm = () => {
    if (!customerInfo.fullName.trim()) {
      setStatusMessage({ type: "error", text: "Please provide your Full Name." });
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your Contact Phone Number." });
      return false;
    }
    // If physical product / cart, require delivery address
    const isPhysical = isCartMode || type === "powder";
    if (isPhysical) {
      if (!customerInfo.street.trim() || !customerInfo.city.trim() || !customerInfo.postalCode.trim()) {
        setStatusMessage({
          type: "error",
          text: "Please provide your complete Delivery Address (Street, City, Postal Code) for supplement dispatch.",
        });
        return false;
      }
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ===================================================
  // 1. RAZORPAY TEST PAYMENT HANDLER
  // ===================================================
  const handleRazorpayPayment = async () => {
    setStatusMessage(null);
    if (!validateCustomerForm()) return;

    setIsProcessing(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to complete payment.");
      navigate("/login");
      return;
    }

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setStatusMessage({
          type: "error",
          text: "Razorpay Checkout SDK failed to load. Please verify your internet connection.",
        });
        setIsProcessing(false);
        return;
      }

      // 1. Create Order on Backend
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/order`,
        {
          amount: totalAmount,
          currency: "INR",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SqsqeZeAEUmA2p",
        amount: order.amount,
        currency: order.currency,
        name: "AlphaFit Nutrition & Fitness",
        description: isCartMode
          ? `Cart Order (${itemsToCheckout.length} items)`
          : `Order for ${itemsToCheckout[0]?.name}`,
        order_id: order.id,
        prefill: {
          name: customerInfo.fullName,
          email: customerInfo.email || "athlete@alphafit.com",
          contact: customerInfo.phone || "9999999999",
        },
        theme: {
          color: "#B5F23D",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setStatusMessage({
              type: "warning",
              text: "Payment was cancelled or closed. No funds were charged.",
            });
          },
        },
        handler: async function (response) {
          try {
            // 2. Verify signature and save purchase on backend
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                itemId: !isCartMode ? id : undefined,
                itemType: isCartMode ? "StoreCart" : type === "powder" ? "ProteinPowder" : "Program",
                amount: totalAmount,
                items: itemsToCheckout,
                shippingAddress: customerInfo,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              if (isCartMode) clearCart();
              setConfirmedOrder(verifyRes.data.purchase || {
                transactionId: response.razorpay_payment_id,
                amount: totalAmount,
                paymentMethod: "Razorpay",
                shippingAddress: customerInfo,
                items: itemsToCheckout,
              });
            }
          } catch (err) {
            console.error("Verification error:", err);
            setStatusMessage({
              type: "error",
              text: "Payment verification failed on the server. Please contact support.",
            });
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        setIsProcessing(false);
        const reason =
          response.error?.description ||
          response.error?.reason ||
          "Payment was declined by bank.";
        setStatusMessage({
          type: "error",
          text: `Payment Failed: ${reason}. You can retry or use Demo Payment.`,
        });
      });

      paymentObject.open();
    } catch (err) {
      console.error("Purchase error:", err);
      setIsProcessing(false);
      const errMsg =
        err.response?.data?.message || "Failed to initialize payment gateway.";
      setStatusMessage({
        type: "error",
        text: `${errMsg} You can also use the Demo Payment option below.`,
      });
    }
  };

  // ===================================================
  // 2. DEMO PAYMENT HANDLER (NO REAL MONEY)
  // ===================================================
  const handleDemoPayment = async (simulateFailure = false) => {
    setStatusMessage(null);
    if (!simulateFailure && !validateCustomerForm()) return;

    setIsProcessing(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to complete payment.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/demo`,
        {
          itemId: !isCartMode ? id : undefined,
          itemType: isCartMode ? "StoreCart" : type === "powder" ? "ProteinPowder" : "Program",
          amount: totalAmount,
          simulateFailure,
          items: itemsToCheckout,
          shippingAddress: customerInfo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.alreadyOwned) {
        setStatusMessage({
          type: "info",
          text: "You already have active membership for this item! Access is unlocked.",
        });
        setTimeout(() => {
          navigate(type === "program" ? "/trainers" : "/profile");
        }, 1800);
        return;
      }

      if (isCartMode) clearCart();

      setConfirmedOrder(res.data.purchase || {
        transactionId: `DEMO_TXN_${Date.now()}`,
        amount: totalAmount,
        paymentMethod: "DEMO",
        shippingAddress: customerInfo,
        items: itemsToCheckout,
      });
    } catch (err) {
      console.error("Demo Payment error:", err);
      const msg =
        err.response?.data?.message ||
        "Demo payment simulation encountered an issue.";
      setStatusMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-state">Loading Checkout Details...</div>
      </div>
    );
  }

  // ===================================================
  // 3. ORDER CONFIRMATION SCREEN
  // ===================================================
  if (confirmedOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-top-nav">
            <button type="button" className="checkout-back-btn" onClick={() => navigate("/nutrition")} aria-label="Back to Store">
              <span className="back-arrow">←</span> Back to Store
            </button>
          </div>
          <div className="order-confirmation-card">
            <div className="confirmation-header">
              <span className="success-icon">✓</span>
              <span className="order-tag">ORDER CONFIRMED &amp; DISPATCH QUEUED</span>
              <h1 className="confirmation-title">THANK YOU FOR YOUR ORDER</h1>
              <p className="order-subtext">
                Your order has been registered in the database. A confirmation has been generated
                for your athlete profile.
              </p>
            </div>

            <div className="confirmation-grid">
              <div className="conf-details-box">
                <h3>ORDER INFORMATION</h3>
                <div className="conf-row">
                  <span>Transaction ID:</span>
                  <strong className="code-text">{confirmedOrder.transactionId}</strong>
                </div>
                <div className="conf-row">
                  <span>Payment Method:</span>
                  <span className={`method-pill ${confirmedOrder.paymentMethod === "DEMO" ? "demo" : "real"}`}>
                    {confirmedOrder.paymentMethod === "DEMO" ? "DEMO / SIMULATED" : "RAZORPAY VERIFIED"}
                  </span>
                </div>
                <div className="conf-row">
                  <span>Total Amount Paid:</span>
                  <strong className="amount-highlight">${Number(confirmedOrder.amount).toFixed(2)}</strong>
                </div>
                <div className="conf-row">
                  <span>Order Status:</span>
                  <span className="status-pill-success">PAID &amp; CONFIRMED</span>
                </div>
              </div>

              {customerInfo.street && (
                <div className="conf-details-box">
                  <h3>DELIVERY DESTINATION</h3>
                  <p><strong>{customerInfo.fullName}</strong> ({customerInfo.phone})</p>
                  <p>{customerInfo.street}</p>
                  <p>{customerInfo.city}, {customerInfo.state} - {customerInfo.postalCode}</p>
                  <p className="delivery-eta">📦 Estimated Delivery: 2-4 Business Days</p>
                </div>
              )}
            </div>

            <div className="conf-items-summary">
              <h3>ITEMS IN THIS ORDER</h3>
              <div className="conf-items-list">
                {itemsToCheckout.map((item, idx) => (
                  <div key={idx} className="conf-item-row">
                    <span>{item.name} <strong>× {item.quantity || 1}</strong></span>
                    <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="view-profile-btn" onClick={() => navigate("/profile")}>
                VIEW ORDER IN PROFILE
              </button>
              <button className="continue-shop-btn" onClick={() => navigate("/nutrition")}>
                RETURN TO NUTRITION STORE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart mode but cart is empty
  if (isCartMode && itemsToCheckout.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-top-nav">
            <button type="button" className="checkout-back-btn" onClick={handleBack} aria-label="Back">
              <span className="back-arrow">←</span> Back
            </button>
          </div>
          <div className="empty-cart-checkout">
            <h2>YOUR CART IS EMPTY</h2>
            <p>Add some supplements or fitness programs before heading to checkout.</p>
            <button className="browse-store-btn" onClick={() => navigate("/nutrition")}>
              BROWSE NUTRITION STORE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If single item not found
  if (!isCartMode && !singleItem) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-top-nav">
            <button type="button" className="checkout-back-btn" onClick={handleBack} aria-label="Back">
              <span className="back-arrow">←</span> Back
            </button>
          </div>
          <div className="empty-state">Item details not found.</div>
          <button className="continue-shop-btn" onClick={() => navigate("/nutrition")}>
            BACK TO STORE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* TOP NAVIGATION WITH CLEAR BACK BUTTON */}
        <div className="checkout-top-nav">
          <button type="button" className="checkout-back-btn" onClick={handleBack} aria-label="Back">
            <span className="back-arrow">←</span> Back
          </button>
          <span className="checkout-step-badge">
            {isCartMode ? "Multi-Item Cart Checkout" : "Direct Buy Checkout"}
          </span>
        </div>

        <header className="checkout-header">
          <span className="section-kicker">05 — SECURE CHECKOUT</span>
          <h1 className="heavy-title">
            COMPLETE <br /> PURCHASE
          </h1>
        </header>

        {statusMessage && (
          <div className={`status-alert ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="checkout-main-grid">
          {/* =========================================
              LEFT COLUMN: PRODUCTS & CUSTOMER DETAILS
          ========================================= */}
          <div className="checkout-details-column">
            {/* 1. Items Summary */}
            <div className="checkout-card">
              <div className="card-top-bar">
                <h3>ORDER SUMMARY ({itemsToCheckout.length} {itemsToCheckout.length === 1 ? "ITEM" : "ITEMS"})</h3>
                {isCartMode && (
                  <button className="edit-cart-link" onClick={() => navigate("/nutrition")}>
                    + Add More Items
                  </button>
                )}
              </div>

              <div className="checkout-items-list">
                {itemsToCheckout.map((item, idx) => {
                  const fallback = item.category === "Program" 
                    ? getProgramFallbackImage(item.name) 
                    : getProductFallbackImage(item.name, item.brand, item.category);
                  const imageSrc = resolveImageUrl(item.image, fallback);

                  return (
                    <div key={idx} className="checkout-item-card">
                      <div className="checkout-img-wrap">
                        <img
                          src={imageSrc}
                          alt={item.name}
                          onError={(e) => onImageError(e, fallback)}
                          className="checkout-item-img"
                        />
                      </div>

                      <div className="checkout-item-info">
                        <div className="checkout-item-head">
                          <span className="brand-name">{item.brand || "AlphaFit"}</span>
                          <span className="unit-cost">${Number(item.price).toFixed(2)}</span>
                        </div>
                        <h4 className="item-title">{item.name}</h4>
                        <div className="item-qty-row">
                          {!isCartMode ? (
                            <div className="single-qty-controls">
                              <span style={{ fontSize: "0.75rem", color: "#888", marginRight: "4px" }}>Qty:</span>
                              <button
                                type="button"
                                className="qty-stepper-btn"
                                onClick={() => setSingleQty((q) => Math.max(1, q - 1))}
                                disabled={singleQty <= 1}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="qty-num-val">{singleQty}</span>
                              <button
                                type="button"
                                className="qty-stepper-btn"
                                onClick={() => setSingleQty((q) => Math.min(20, q + 1))}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span>Qty: <strong>{item.quantity || 1}</strong></span>
                          )}
                          <span className="line-cost">
                            Subtotal: ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer Information & Delivery Address */}
            <div className="checkout-card">
              <h3>CUSTOMER &amp; DELIVERY DETAILS</h3>
              <div className="customer-form-grid">
                <div className="form-field full-width">
                  <label>FULL NAME *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Athlete Name"
                    value={customerInfo.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="athlete@alphafit.com"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-field">
                  <label>PHONE NUMBER *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>DELIVERY STREET ADDRESS *</label>
                  <input
                    type="text"
                    name="street"
                    placeholder="House/Apartment #, Street, Locality"
                    value={customerInfo.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>CITY *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City / Region"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>STATE / PROVINCE</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={customerInfo.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-field">
                  <label>POSTAL / PIN CODE *</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="560001"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: PAYMENT METHOD & REVIEW
          ========================================= */}
          <div className="checkout-sidebar-column">
            {/* Price Breakdown */}
            <div className="checkout-card">
              <h3>PRICE BREAKDOWN</h3>
              <div className="price-breakdown-list">
                <div className="breakdown-row">
                  <span>Items Subtotal</span>
                  <strong>${totalAmount.toFixed(2)}</strong>
                </div>

                <div className="breakdown-row">
                  <span>Shipping &amp; Handling</span>
                  <span className="free-shipping-tag">FREE (DISPATCH WAIVED)</span>
                </div>

                <div className="breakdown-row total">
                  <span>Total Amount Due</span>
                  <span className="grand-total">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="checkout-card payment-options-card">
              <h3>SELECT PAYMENT METHOD</h3>

              <div className="payment-options">
                {/* Razorpay Test Gateway */}
                <label
                  className={`payment-option ${paymentMethod === "Razorpay" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === "Razorpay"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setStatusMessage(null);
                    }}
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <span className="option-title">Razorpay Test Gateway</span>
                      <span className="option-badge gateway">TEST GATEWAY</span>
                    </div>
                    <span className="option-desc">
                      UPI, Cards, NetBanking via official Razorpay test mode
                    </span>
                  </div>
                </label>

                {/* Demo Payment */}
                <label
                  className={`payment-option ${paymentMethod === "DEMO" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="DEMO"
                    checked={paymentMethod === "DEMO"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setStatusMessage(null);
                    }}
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <span className="option-title">Demo Payment (No Real Money)</span>
                      <span className="option-badge demo">SIMULATED</span>
                    </div>
                    <span className="option-desc">
                      Simulate payment success or failure without deducting funds
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Box based on Selected Method */}
              {paymentMethod === "Razorpay" ? (
                <div className="pay-panel">
                  <div className="test-helper-card">
                    <strong>💡 Razorpay Test Mode:</strong> Use UPI <code>success@razorpay</code> or test card <code>4000 0000 0000 0002</code> with any valid future date &amp; OTP.
                  </div>

                  <button
                    className="pay-now-btn"
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "OPENING GATEWAY..."
                      : `PAY $${totalAmount.toFixed(2)} VIA RAZORPAY`}
                  </button>
                </div>
              ) : (
                <div className="pay-panel">
                  <p className="demo-notice-text">
                    🧪 Simulated Demo Checkout: Confirms the order, logs a <code>DEMO</code> transaction in MongoDB, and updates your profile order history.
                  </p>

                  <button
                    className="pay-now-btn"
                    onClick={() => handleDemoPayment(false)}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "PROCESSING DEMO..."
                      : `CONFIRM DEMO ORDER ($${totalAmount.toFixed(2)})`}
                  </button>

                  <button
                    className="simulate-fail-btn"
                    onClick={() => handleDemoPayment(true)}
                    disabled={isProcessing}
                  >
                    SIMULATE PAYMENT FAILURE (TEST ERROR HANDLING)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
