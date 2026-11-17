import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "program";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read cached user for prefill
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse cached user:", e);
      }
    }

    const fetchItem = async () => {
      try {
        const endpoint =
          type === "powder" ? `/api/protein-powders/${id}` : `/api/programs/${id}`;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
        setStatusMessage({
          type: "error",
          text: "Failed to load checkout details. Please check connection.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, type]);

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

  // 1. RAZORPAY TEST PAYMENT HANDLER
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to make a purchase.");
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

      const amount = item.price || 99;

      // 1. Create Order on Backend
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/order`,
        {
          amount,
          currency: "INR",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SqsqeZeAEUmA2p",
        amount: order.amount,
        currency: order.currency,
        name: "AlphaFit Gym",
        description: `Payment for ${item.title || item.name}`,
        order_id: order.id,
        prefill: {
          name: user?.name || user?.username || "AlphaFit Athlete",
          email: user?.email || "athlete@alphafit.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: "#B5F23D",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setStatusMessage({
              type: "warning",
              text: "Payment was cancelled or closed. No amount was deducted.",
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
                itemId: id,
                itemType: type,
                amount,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              setStatusMessage({
                type: "success",
                text: `Payment verified successfully! Transaction ID: ${response.razorpay_payment_id}. Membership activated!`,
              });

              setTimeout(() => {
                if (type === "program") {
                  navigate("/trainers");
                } else {
                  navigate("/profile");
                }
              }, 1800);
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

      // Handle card decline / network failures
      paymentObject.on("payment.failed", function (response) {
        setIsProcessing(false);
        const reason =
          response.error?.description ||
          response.error?.reason ||
          "Payment was declined by bank.";
        setStatusMessage({
          type: "error",
          text: `Payment Failed: ${reason}. You can retry or switch to Demo Payment.`,
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

  // 2. DEMO PAYMENT HANDLER (NO REAL MONEY)
  const handleDemoPayment = async (simulateFailure = false) => {
    setIsProcessing(true);
    setStatusMessage(null);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to complete payment.");
      navigate("/login");
      return;
    }

    try {
      const amount = item.price || 99;
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/demo`,
        {
          itemId: id,
          itemType: type,
          amount,
          simulateFailure,
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

      setStatusMessage({
        type: "success",
        text: `Demo Payment Confirmed! Transaction ID: ${res.data.purchase?.transactionId}. Membership and features activated.`,
      });

      setTimeout(() => {
        if (type === "program") {
          navigate("/trainers");
        } else {
          navigate("/profile");
        }
      }, 1800);
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
        <div className="loading-state">Loading Checkout...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="checkout-page">
        <div className="empty-state">Item not found.</div>
      </div>
    );
  }

  const itemPrice = item.price || 99;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="heavy-title">
          COMPLETE <br /> PURCHASE
        </h1>

        {statusMessage && (
          <div className={`status-alert ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="checkout-grid">
          {/* Item Details Side */}
          <div className="program-summary">
            <h3>ORDER SUMMARY</h3>
            <div className="summary-card">
              <h4>{item.title || item.name}</h4>
              {type === "program" ? (
                <p>
                  {item.level || item.difficulty || "All Levels"} • {item.duration || "Multi-Week"}
                </p>
              ) : (
                <p>{item.brand || "AlphaFit Nutrition"} • Physical Product</p>
              )}
              <div className="price-tag">${itemPrice}.00</div>
            </div>
          </div>

          {/* Payment Selection Side */}
          <div className="payment-section">
            <h3>SELECT PAYMENT METHOD</h3>

            <div className="payment-options">
              {/* Option 1: Razorpay Test Gateway */}
              <label
                className={`payment-option ${paymentMethod === "Razorpay" ? "selected" : ""
                  }`}
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
                    <span className="option-title">Razorpay Test Payment</span>
                    <span className="option-badge gateway">TEST GATEWAY</span>
                  </div>
                  <span className="option-desc">
                    Cards, UPI, NetBanking via official Razorpay test gateway
                  </span>
                </div>
              </label>

              {/* Option 2: Demo Payment (No Real Money) */}
              <label
                className={`payment-option ${paymentMethod === "DEMO" ? "selected" : ""
                  }`}
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
                    Instant simulated checkout for demonstration & evaluation
                  </span>
                </div>
              </label>
            </div>

            {/* Dynamic Panel Depending on Selected Method */}
            {paymentMethod === "Razorpay" ? (
              <div className="pay-panel">
                <h4>💳 Razorpay Test Checkout</h4>
                <p className="panel-note">
                  Click below to open the Razorpay secure test dialog. In test mode, you can test UPI (`success@razorpay`) or standard test card details without real transactions.
                </p>

                <div className="test-helper-card">
                  <strong>💡 Test Mode Hint:</strong> Use test card <code>4000 0000 0000 0002</code> or UPI <code>success@razorpay</code>. Any valid expiry &amp; OTP will succeed.
                </div>

                <button
                  className="pay-now-btn"
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "OPENING GATEWAY..."
                    : `PAY $${itemPrice}.00 VIA RAZORPAY`}
                </button>
              </div>
            ) : (
              <div className="pay-panel">
                <h4>🧪 Demo Payment Confirmation</h4>
                <p className="panel-note">
                  This simulated checkout activates the selected membership and logs a <code>DEMO</code> transaction in the database without collecting payment information.
                </p>

                <div className="demo-confirm-details">
                  <div className="demo-row">
                    <span>Plan / Item:</span>
                    <strong>{item.title || item.name}</strong>
                  </div>
                  <div className="demo-row">
                    <span>Amount:</span>
                    <strong>${itemPrice}.00 USD</strong>
                  </div>
                  <div className="demo-row">
                    <span>Method:</span>
                    <span>DEMO (Zero Deductions)</span>
                  </div>
                  <div className="demo-row">
                    <span>Access Grant:</span>
                    <span>Instant Membership Activation</span>
                  </div>
                </div>

                <div className="demo-actions">
                  <button
                    className="pay-now-btn"
                    onClick={() => handleDemoPayment(false)}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "CONFIRMING DEMO..."
                      : `CONFIRM DEMO PAYMENT ($${itemPrice}.00)`}
                  </button>

                  <button
                    className="simulate-fail-btn"
                    onClick={() => handleDemoPayment(true)}
                    disabled={isProcessing}
                  >
                    SIMULATE PAYMENT FAILURE (TEST ERROR HANDLING)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
