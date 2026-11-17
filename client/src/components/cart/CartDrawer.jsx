import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import {
  resolveImageUrl,
  getProductFallbackImage,
  onImageError,
} from "../../utils/imageUrl";
import "./CartDrawer.css";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    openCart,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartSubtotal,
    toastMessage,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout?mode=cart");
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`cart-toast ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Cart Drawer & Backdrop */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={closeCart}>
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="cart-header">
              <div className="header-title-group">
                <span className="section-tag">03 — CART</span>
                <h2>YOUR CART ({cartCount})</h2>
              </div>
              <button
                className="cart-close-btn"
                onClick={closeCart}
                aria-label="Close Cart"
              >
                ✕
              </button>
            </div>

            {/* Items List or Empty State */}
            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="empty-icon">🛒</div>
                  <h3>YOUR CART IS EMPTY</h3>
                  <p>
                    Fuel your performance with scientifically formulated whey
                    proteins, gainers, and elite supplements.
                  </p>
                  <button
                    className="browse-store-btn"
                    onClick={() => {
                      closeCart();
                      navigate("/nutrition");
                    }}
                  >
                    EXPLORE NUTRITION STORE
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const fallback = getProductFallbackImage(
                      item.name,
                      item.brand,
                      item.category
                    );
                    const imageSrc = resolveImageUrl(item.image, fallback);

                    return (
                      <div key={item._id} className="cart-item-card">
                        <div className="item-image-wrapper">
                          <img
                            src={imageSrc}
                            alt={item.name}
                            onError={(e) => onImageError(e, fallback)}
                            className="item-thumbnail"
                          />
                        </div>

                        <div className="item-info">
                          <div className="item-meta">
                            <span className="item-brand">{item.brand}</span>
                            <button
                              className="item-remove-btn"
                              onClick={() => removeFromCart(item._id)}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          <h4 className="item-name">{item.name}</h4>
                          <span className="item-unit-price">
                            ${Number(item.price).toFixed(2)} each
                          </span>

                          <div className="item-controls-row">
                            <div className="quantity-selector">
                              <button
                                className="qty-btn"
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity + 1)
                                }
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <div className="item-line-total">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer with Calculations */}
            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${cartSubtotal.toFixed(2)}</strong>
                </div>

                <div className="summary-row">
                  <span>Shipping &amp; Handling</span>
                  <span className="free-shipping">FREE (ALPHA ATHLETE)</span>
                </div>

                <div className="summary-row total-row">
                  <span>Total Due</span>
                  <span className="total-amount">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="cart-action-buttons">
                  <button className="checkout-btn" onClick={handleCheckout}>
                    PROCEED TO CHECKOUT (${cartSubtotal.toFixed(2)}) →
                  </button>
                  <button className="continue-btn" onClick={closeCart}>
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

