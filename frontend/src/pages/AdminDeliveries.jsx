import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .ad-page { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
  .ad-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .ad-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .ad-empty { text-align: center; padding: 4rem; color: ${COLORS.gray}; }
  .ad-card { background: #fff; border: 1px solid ${COLORS.border}; border-radius: 14px; padding: 1.3rem; margin-top: 1.2rem; }
  .ad-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .4rem; margin-bottom: .5rem; }
  .ad-ref { font-weight: 700; color: ${COLORS.greenDeep}; }
  .ad-meta { font-size: .85rem; color: ${COLORS.gray}; margin-bottom: .4rem; }
  .ad-address { font-size: .88rem; margin-bottom: .9rem; }
  .ad-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
  .ad-btn { padding: 8px 14px; border-radius: 8px; border: 1.5px solid ${COLORS.border}; background: #fff; font-size: .82rem; font-weight: 600; cursor: pointer; }
  .ad-btn.delivered:hover { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; color: ${COLORS.greenDark}; }
  .ad-btn.cancelled:hover { border-color: ${COLORS.red}; background: #FEE2E2; color: ${COLORS.red}; }
  .ad-count { display: inline-block; background: ${COLORS.gold}; color: #fff; padding: 2px 10px; border-radius: 20px; font-size: .8rem; margin-left: .5rem; }
`;

export default function AdminDeliveries() {
  const [orders, setOrders] = useState([]);

  const load = () => apiFetch("/orders/pending-deliveries").then(setOrders);
  useEffect(() => { load(); }, []);

  const setDelivery = async (orderId, delivery_status) => {
    await apiFetch(`/orders/${orderId}/delivery`, { method: "PUT", body: { delivery_status } });
    load();
  };

  return (
    <>
      <style>{css}</style>
      <div className="ad-page">
        <div className="ad-head">
          <h1>🚚 Pending Deliveries <span className="ad-count">{orders.length}</span></h1>
          <p>Paid orders that haven't been marked delivered or cancelled yet, oldest first.</p>
        </div>

        {orders.length === 0 && <div className="ad-empty">Nothing pending — every paid order has been actioned. 🎉</div>}

        {orders.map((o) => (
          <div className="ad-card" key={o.id}>
            <div className="ad-top">
              <span className="ad-ref">Order {o.ref}</span>
              <strong>KSh {o.total.toLocaleString()}</strong>
            </div>
            <div className="ad-meta">{o.name} · {o.phone} · {o.items}</div>
            <div className="ad-address">📍 {o.address || "No address given"}</div>
            <div className="ad-actions">
              <button className="ad-btn delivered" onClick={() => setDelivery(o.id, "delivered")}>✅ Mark Delivered</button>
              <button className="ad-btn cancelled" onClick={() => setDelivery(o.id, "cancelled")}>🚫 Mark Cancelled</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}