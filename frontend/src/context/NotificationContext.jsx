// src/context/NotificationContext.jsx
// ─── Notification Context ──────────────────────────────────────────────────
// Provides a lightweight "real-time" toast notification system, fully mocked
// client-side (no backend/websocket). Two sources of notifications:
//
//   1. Ambient feed: every ~12-25s, a randomly-picked mock event fires
//      (low stock alerts, "X people just bought Y", restock alerts) drawn
//      from SEED_PRODUCTS so it stays relevant to the catalog.
//   2. Order-flow events: other parts of the app (e.g. Cart checkout) call
//      `notify()` directly to push order-status updates ("STK sent",
//      "Payment confirmed", "Order is being packed", etc.)
//
// Toasts auto-dismiss after a few seconds and can be dismissed manually.

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { SEED_PRODUCTS } from "../theme";

const NotificationContext = createContext(null);

const NAIROBI_AREAS = [
  "Westlands", "Kilimani", "Embakasi", "Ruaka", "Kasarani", "Rongai",
  "Ngong Road", "South B", "Kahawa Sukari", "Donholm", "Roysambu", "Thika Road",
];

// Pre-build a pool of light, low-priced stationery items for "social proof" toasts
const SOCIAL_PRODUCTS = SEED_PRODUCTS.filter((p) => p.category === "Stationery" || p.price < 450);
// Items used for "low stock" alerts — anything already low or mid stock
const STOCK_ALERT_PRODUCTS = SEED_PRODUCTS.filter((p) => p.stock < 30);

let nextId = 1;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  /**
   * notify({ type, icon, title, body, duration })
   * type: "order" | "stock" | "social" — controls the toast's accent color
   * duration: ms before auto-dismiss (default 6000)
   */
  const notify = useCallback(({ type = "social", icon = "🔔", title, body, duration = 6000 }) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, icon, title, body }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // ── Ambient mock "real-time" feed ──────────────────────────────────────
  useEffect(() => {
    const fireAmbient = () => {
      const r = Math.random();

      if (r < 0.45 && SOCIAL_PRODUCTS.length) {
        const product = SOCIAL_PRODUCTS[Math.floor(Math.random() * SOCIAL_PRODUCTS.length)];
        const area = NAIROBI_AREAS[Math.floor(Math.random() * NAIROBI_AREAS.length)];
        const count = Math.floor(Math.random() * 4) + 1;
        notify({
          type: "social",
          icon: product.img || "🛒",
          title: `${count} ${count === 1 ? "person" : "people"} just bought this`,
          body: `${product.title} — purchased from ${area}, Nairobi`,
        });
      } else if (r < 0.8 && STOCK_ALERT_PRODUCTS.length) {
        const product = STOCK_ALERT_PRODUCTS[Math.floor(Math.random() * STOCK_ALERT_PRODUCTS.length)];
        notify({
          type: "stock",
          icon: "⚠️",
          title: "Stock running low",
          body: `Only ${product.stock} left of "${product.title}". Order soon!`,
        });
      } else {
        notify({
          type: "stock",
          icon: "📦",
          title: "Restocked!",
          body: "Exercise Books (10 Pack) and Geometry Sets just got restocked.",
        });
      }
    };

    // First ambient toast appears after a short delay so it doesn't fire on page load
    const initial = setTimeout(fireAmbient, 6000);
    // Then repeats on a random interval between 15s and 28s
    let interval;
    const schedule = () => {
      interval = setTimeout(() => {
        fireAmbient();
        schedule();
      }, 15000 + Math.random() * 13000);
    };
    schedule();

    return () => {
      clearTimeout(initial);
      clearTimeout(interval);
    };
  }, [notify]);

  // Clean up any pending dismiss timers on unmount
  useEffect(() => () => {
    Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}