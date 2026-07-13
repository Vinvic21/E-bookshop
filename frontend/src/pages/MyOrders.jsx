import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .mo-page { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem 5rem; min-height: calc(100vh - 64px); }
  .mo-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .mo-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .mo-empty { text-align: center; padding: 4rem; color: ${COLORS.gray}; }
  .mo-card { background: #fff; border: 1px solid ${COLORS.border}; border-radius: 14px; padding: 1.3rem; margin-top: 1.2rem; }
  .mo-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .4rem; margin-bottom: .5rem; }
  .mo-ref { font-weight: 700; color: ${COLORS.greenDeep}; }
  .mo-meta { font-size: .85rem; color: ${COLORS.gray}; margin-bottom: .8rem; }
  .mo-badges { display: flex; gap: .5rem; margin-bottom: .9rem; flex-wrap: wrap; }
  .mo-badge { font-size: .75rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
  .mo-badge.paid, .mo-badge.delivered { background: ${COLORS.successBg}; color: ${COLORS.success}; }
  .mo-badge.pending, .mo-badge.pending_installments { background: ${COLORS.warningBg}; color: ${COLORS.warning}; }
  .mo-badge.failed, .mo-badge.cancelled { background: #FEE2E2; color: ${COLORS.red}; }
  .mo-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
  .mo-btn { padding: 8px 14px; border-radius: 8px; border: 1.5px solid ${COLORS.border}; background: #fff; font-size: .82rem; font-weight: 600; cursor: pointer; }
  .mo-btn.active { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; color: ${COLORS.greenDark}; }
`;

const DELIVERY_OPTIONS = [
  { value: "pending", label: "📦 Pending" },
  { value: "delivered", label: "✅ Delivered" },
  { value: "cancelled", label: "🚫 Cancelled" },
];

export default function MyOrders({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const load = () => apiFetch("/orders").then(setOrders);
  useEffect(() => { if (user) load(); }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2>Please log in to view your orders</h2>
        <button className="btn-green" style={{ marginTop: "1.2rem" }} onClick={() => onNavigate("login")}>Go to Login</button>
      </div>
    );
  }

  const setDelivery = async (orderId, delivery_status) => {
    await apiFetch(`/orders/${orderId}/delivery`, { method: "PUT", body: { delivery_status } });
    load();
  };

  return (
    <>
      <style>{css}</style>
      <div className="mo-page">
        <div className="mo-head">
          <h1>📬 My Orders & Deliveries</h1>
          <p>Track your payment and delivery status, and mark an order as delivered once it arrives.</p>
        </div>

        {orders.length === 0 && <div className="mo-empty">You haven't placed any orders yet.</div>}

        {orders.map((o) => (
          <div className="mo-card" key={o.id}>
            <div className="mo-top">
              <span className="mo-ref">Order {o.ref}</span>
              <strong>KSh {o.total.toLocaleString()}</strong>
            </div>
            <div className="mo-meta">{o.items} · {new Date(o.created_at).toLocaleDateString()}</div>
            <div className="mo-badges">
              <span className={`mo-badge ${o.status}`}>
                Payment: {o.status === "pending_installments" ? "paying in installments" : o.status}
              </span>
              <span className={`mo-badge ${o.delivery_status}`}>Delivery: {o.delivery_status}</span>
            </div>
            {o.status === "pending_installments" && (
              <div className="mo-meta">
                Delivery starts once every installment is paid.{" "}
                <span style={{ color: COLORS.greenDark, fontWeight: 600, cursor: "pointer" }} onClick={() => onNavigate("my-installments")}>
                  View installment plan →
                </span>
              </div>
            )}
            {o.status === "paid" && (
              <div className="mo-actions">
                {DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`mo-btn ${o.delivery_status === opt.value ? "active" : ""}`}
                    onClick={() => setDelivery(o.id, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}