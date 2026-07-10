import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const loadedFor = useRef(null);

  // Load the saved cart whenever someone logs in; clear it locally on logout
  // (the server keeps it, so it comes back on the next login).
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      loadedFor.current = null;
      return;
    }
    apiFetch("/cart").then((items) => {
      loadedFor.current = user.id;
      setCartItems(items);
    }).catch(() => {});
  }, [user]);

  // Persist any cart change back to the account, once it's finished loading.
  useEffect(() => {
    if (!user || loadedFor.current !== user.id) return;
    apiFetch("/cart", { method: "PUT", body: { items: cartItems } }).catch(() => {});
  }, [cartItems, user]);

  const addToCart = (product) => {
    if (!user) return false;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    return true;
  };

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const replaceCart = (items) => setCartItems(items);

  const addManyToCart = (products) => {
    if (!user) return false;
    setCartItems((prev) => {
      const next = [...prev];
      products.forEach((product) => {
        const idx = next.findIndex((i) => i.id === product.id);
        if (idx !== -1) next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        else next.push({ ...product, qty: 1 });
      });
      return next;
    });
    return true;
  };

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, addManyToCart, updateQty, clearCart, replaceCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
