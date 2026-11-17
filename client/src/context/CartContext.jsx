import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CART_STORAGE_KEY = "alphafit_cart_items";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to persist cart to localStorage", e);
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    if (product.inStock === false) {
      showToast({ type: "error", text: "This item is currently out of stock." });
      return;
    }

    const qtyToAdd = Math.max(1, parseInt(quantity) || 1);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item._id === product._id
      );

      if (existingIndex > -1) {
        // Item exists, increment quantity
        const updated = [...prevItems];
        const newQty = Math.min(10, updated[existingIndex].quantity + qtyToAdd);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        showToast({
          type: "success",
          text: `Updated "${product.name}" quantity to ${newQty} in cart!`,
        });
        return updated;
      } else {
        // New item
        const newItem = {
          _id: product._id,
          name: product.name,
          brand: product.brand || "AlphaFit Nutrition",
          category: product.category || product.brand || "Supplements",
          price: Number(product.price) || 0,
          image: product.image,
          inStock: product.inStock !== false,
          quantity: qtyToAdd,
        };
        showToast({
          type: "success",
          text: `Added "${product.name}" to cart!`,
        });
        return [...prevItems, newItem];
      }
    });
  };

  // Remove item completely
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    showToast({ type: "info", text: "Item removed from cart." });
  };

  // Update specific quantity
  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity: Math.min(10, qty) } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Derived metrics
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        cartCount,
        cartSubtotal,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

