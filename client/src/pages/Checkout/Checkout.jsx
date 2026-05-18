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
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const endpoint = type === "powder" ? `/api/protein-powders/${id}` : `/api/programs/${id}`;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, type]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to make a purchase.");
      navigate("/login");
      return;
    }

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Create Order
      const amount = item.price || 99;
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/order`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const order = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_replace_me",
        amount: order.amount,
        currency: order.currency,
        name: "AlphaFit",
        description: `Payment for ${item.title || item.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/payment/verify`,
              response,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Record purchase
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/purchases`,
              {
                itemId: id,
                itemType: type,
                paymentMethod: "Razorpay",
                amount,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (type === "program") {
              alert("👉 Payment successful! Program started.");
              navigate("/trainers");
            } else {
              alert("👉 Purchase successful! Your order has been placed.");
              navigate("/profile");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed.");
          }
        },
        theme: {
          color: "#B5F23D",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="checkout-page"><div className="loading-state">Loading Checkout...</div></div>;
  if (!item) return <div className="checkout-page"><div className="empty-state">Item not found.</div></div>;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="heavy-title">COMPLETE <br /> PURCHASE</h1>
        
        <div className="checkout-grid">
          {/* Item Details Side */}
          <div className="program-summary">
            <h3>ORDER SUMMARY</h3>
            <div className="summary-card">
              <h4>{item.title || item.name}</h4>
              {type === "program" ? (
                <p>{item.difficulty} • {item.duration}</p>
              ) : (
                <p>{item.brand} • Physical Product</p>
              )}
              <div className="price-tag">
                ${item.price || 99}.00
              </div>
            </div>
          </div>

          {/* Payment Side */}
          <div className="payment-section">
            <h3>SELECT PAYMENT METHOD</h3>
            
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === "Razorpay" ? "selected" : ""}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Razorpay" 
                  checked={paymentMethod === "Razorpay"} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                <span className="option-text">Razorpay (Cards, UPI, NetBanking)</span>
              </label>
            </div>

            <button 
              className="pay-now-btn" 
              onClick={handlePayment} 
              disabled={isProcessing}
            >
              {isProcessing ? "PROCESSING PAYMENT..." : `PAY $${item.price || 99}.00 SECURELY`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
