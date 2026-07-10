// src/pages/Cart.jsx
// ─── Cart Slide-over Panel + Checkout Modal ───────────────────────────────────

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  /* Overlay */
  .cart-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.42);
    z-index: 150;
    opacity: 0; pointer-events: none;
    transition: opacity .3s;
  }
  .cart-overlay.open { opacity: 1; pointer-events: all; }

  /* Panel */
  .cart-panel {
    position: fixed; right: 0; top: 0;
    height: 100vh; width: 380px;
    background: #fff;
    box-shadow: -4px 0 32px rgba(0,0,0,.14);
    z-index: 200;
    display: flex; flex-direction: column;
    transform: translateX(100%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .cart-panel.open { transform: translateX(0); }

  .cart-header {
    background: ${COLORS.green};
    color: #fff;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .cart-header h3 { font-family: ${FONTS.display}; font-size: 1.2rem; }
  .close-btn {
    background: rgba(255,255,255,.18); border: none; color: #fff;
    width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
    font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
    transition: background .2s;
  }
  .close-btn:hover { background: rgba(255,255,255,.3); }

  .cart-items { flex: 1; overflow-y: auto; padding: 1rem; }

  .cart-item {
    display: flex; gap: 12px;
    padding: 13px 0; border-bottom: 1px solid #F3F4F6;
  }
  .ci-img {
    font-size: 1.9rem; width: 50px; height: 50px;
    background: ${COLORS.greenPale}; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ci-info { flex: 1; }
  .ci-title { font-size: .88rem; font-weight: 600; line-height: 1.35; margin-bottom: 4px; }
  .ci-price { font-size: .88rem; color: ${COLORS.green}; font-weight: 700; }
  .ci-sub   { font-size: .76rem; color: ${COLORS.gray}; }
  .qty-ctrl { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
  .qty-btn  {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1px solid ${COLORS.border}; background: #fff;
    font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color .15s, background .15s;
  }
  .qty-btn:hover { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; }
  .qty-num { font-size: .92rem; font-weight: 700; min-width: 22px; text-align: center; }

  .empty-cart { text-align: center; padding: 3.5rem 1rem; color: ${COLORS.gray}; }
  .empty-cart div { font-size: 3.5rem; margin-bottom: 1rem; }
  .empty-cart p { line-height: 1.6; }

  .cart-footer { padding: 1.25rem; border-top: 1.5px solid ${COLORS.border}; flex-shrink: 0; }
  .cart-summary { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: .88rem; color: ${COLORS.gray}; }
  .cart-total   { display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
  .cart-total-num { font-family: ${FONTS.display}; font-size: 1.3rem; color: ${COLORS.green}; }
  .checkout-btn {
    width: 100%; background: ${COLORS.gold}; color: #fff; border: none;
    border-radius: 10px; padding: 14px; font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background .2s;
  }
  .checkout-btn:hover { background: #B8880F; }
  .clear-btn {
    width: 100%; background: none; color: ${COLORS.gray}; border: none;
    font-size: .83rem; cursor: pointer; margin-top: 8px;
    text-decoration: underline; padding: 4px;
  }

  /* ── Checkout Modal ── */
  .co-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 300;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .co-box {
    background: #fff; border-radius: 22px;
    width: 100%; max-width: 460px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,.22);
    animation: fadeIn .3s ease both;
  }
  .co-head { background: ${COLORS.green}; color: #fff; padding: 1.5rem; }
  .co-head h2 { font-family: ${FONTS.display}; font-size: 1.4rem; }
  .co-head p  { font-size: .85rem; color: rgba(255,255,255,.75); margin-top: 4px; }
  .co-body { padding: 1.5rem; }
  .mpesa-note {
    background: ${COLORS.greenPale}; border: 1px solid #6EE7A8;
    border-radius: 10px; padding: 12px 14px;
    font-size: .83rem; color: ${COLORS.success};
    margin-bottom: 1.25rem;
    display: flex; gap: 8px; align-items: flex-start; line-height: 1.6;
  }
  .pay-btn {
    width: 100%; background: ${COLORS.green}; color: #fff; border: none;
    border-radius: 10px; padding: 14px; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: background .2s;
  }
  .pay-btn:hover { background: ${COLORS.greenDark}; }
  .back-link {
    display: block; text-align: center; margin-top: 12px;
    font-size: .88rem; color: ${COLORS.gray}; cursor: pointer;
  }
  .back-link:hover { color: #374151; }

  /* Success */
  .success-screen { text-align: center; padding: 2.5rem 1.5rem; }
  .success-icon { font-size: 4rem; margin-bottom: 1rem; }
  .success-screen h2 { font-family: ${FONTS.display}; font-size: 1.6rem; color: ${COLORS.green}; margin-bottom: .75rem; }
  .success-screen p  { color: ${COLORS.gray}; line-height: 1.65; margin-bottom: 1.25rem; font-size: .93rem; }
  .order-ref {
    background: ${COLORS.greenPale}; border-radius: 10px;
    padding: 12px; font-size: .9rem; color: ${COLORS.success};
    font-weight: 700; margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    .cart-panel { width: 100vw; }
  }
`;

export default function Cart({ isOpen, onClose, onNavigate }) {
  const { cartItems, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const { notify } = useNotifications();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // stage: "form" | "stk" | "success"
  const [stage,         setStage]         = useState("form");
  const [form,          setForm]          = useState({ name: user?.name || "", phone: "", address: "" });
  const [error,         setError]         = useState("");
  const [elapsed,       setElapsed]       = useState(0);
  const [orderRef,      setOrderRef]      = useState("");
  const [orderSummary,  setOrderSummary]  = useState({ total: 0, items: 0 });
  const [checkoutId,    setCheckoutId]    = useState(null);
  const [payMethod,     setPayMethod]     = useState("full");
  const [numInstallments, setNumInstallments] = useState(2);
  const [installmentInfo, setInstallmentInfo] = useState(null);

  const openCheckout = () => { onClose(); setCheckoutOpen(true); };

  // Basic Kenyan phone validation: 07XXXXXXXX / 01XXXXXXXX / 2547XXXXXXXX etc.
  const isValidPhone = (phone) => /^(?:\+?254|0)?7\d{8}$|^(?:\+?254|0)?1\d{8}$/.test(phone.replace(/\s/g, ""));

  const handlePay = async () => {
    if (!form.name || !form.phone) { setError("Name and phone are required."); return; }
    if (!isValidPhone(form.phone))  { setError("Enter a valid M-Pesa number, e.g. 0712345678."); return; }
    setError("");
    setElapsed(0);
    try {
      if (payMethod === "installments") {
        const plan = await apiFetch("/installments", {
          method: "POST",
          body: {
            name: form.name, phone: form.phone, address: form.address, num_installments: numInstallments,
            items: cartItems.map((i) => ({ id: i.id, qty: i.qty })),
          },
        });
        const first = await apiFetch(`/installments/${plan.plan_id}/pay-next`, { method: "POST" });
        setInstallmentInfo({ planId: plan.plan_id, total: plan.total, installments: plan.installments, seq: first.seq });
        setOrderRef(plan.order_ref);
        setOrderSummary({ total: first.amount, items: totalItems });
        setCheckoutId(first.checkout_id);
      } else {
        const res = await apiFetch("/mpesa/stkpush", {
          method: "POST",
          body: {
            name: form.name, phone: form.phone, address: form.address,
            items: cartItems.map((i) => ({ id: i.id, qty: i.qty })),
          },
        });
        setInstallmentInfo(null);
        setOrderRef(res.ref);
        setOrderSummary({ total: res.total, items: totalItems });
        setCheckoutId(res.checkout_id);
      }
      setStage("stk");
      notify({
        type: "order",
        icon: "📲",
        title: "STK Push Sent",
        body: `Check your phone ${form.phone} and enter your M-Pesa PIN to complete the order.`,
        duration: 5000,
      });
    } catch (e) {
      setError(e.message);
    }
  };

  // Poll Safaricom (via our backend) for the real STK push result every 3s.
  useEffect(() => {
    if (stage !== "stk" || !checkoutId) return;
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await apiFetch(`/mpesa/status/${checkoutId}`, { auth: false });
        if (res.status === "paid") {
          clearInterval(poll); clearInterval(tick);
          setStage("success");
          clearCart();
          if (installmentInfo) {
            const remaining = installmentInfo.installments.length - installmentInfo.seq;
            notify({ type: "order", icon: "✅", title: `Installment ${installmentInfo.seq} Paid`, body: remaining > 0
              ? `KSh ${orderSummary.total.toLocaleString()} received. ${remaining} installment${remaining > 1 ? "s" : ""} left on order ${orderRef} — pay them anytime from your account.`
              : `Final installment received — order ${orderRef} is fully paid and being prepared for delivery.`, duration: 8000 });
          } else {
            notify({ type: "order", icon: "✅", title: "Payment Confirmed", body: `M-Pesa payment received. Order ${orderRef} is now being prepared for delivery.`, duration: 7000 });
            setTimeout(() => notify({ type: "order", icon: "📦", title: "Order Update", body: `Order ${orderRef} is being packed at our Nairobi warehouse.`, duration: 7000 }), 4000);
          }
        } else if (res.status === "failed") {
          clearInterval(poll); clearInterval(tick);
          setStage("form");
          setError(res.message || "Payment was not completed. Please try again.");
        }
      } catch { /* keep polling on transient network errors */ }
    }, 3000);
    const timeout = setTimeout(() => {
      clearInterval(poll); clearInterval(tick);
      if (stage === "stk") { setStage("form"); setError("We didn't receive confirmation in time. Check your phone or try again."); }
    }, 60000);
    return () => { clearInterval(poll); clearInterval(tick); clearTimeout(timeout); };
  }, [stage, checkoutId]);

  const resetAll = () => {
    setCheckoutOpen(false);
    setStage("form");
    setForm({ name: user?.name || "", phone: "", address: "" });
    setError("");
    setElapsed(0);
    setCheckoutId(null);
    setPayMethod("full");
    setNumInstallments(2);
    setInstallmentInfo(null);
  };

  // QR encodes a small JSON payload — used by the "Track Order" QR on the success screen.
  // Rendered via a free QR image API (no extra dependency needed).
  const qrData = orderRef
    ? encodeURIComponent(JSON.stringify({ ref: orderRef, total: orderSummary.total, items: orderSummary.items }))
    : "";
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}`
    : "";

  return (
    <>
      <style>{css}</style>

      {/* Overlay */}
      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />

      {/* Panel */}
      <div className={`cart-panel ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>🛒 Cart ({totalItems})</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div>🛒</div>
              <p>Your cart is empty.<br />Head to the shop to add CBC materials!</p>
            </div>
          ) : cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="ci-img">{item.img || "📦"}</div>
              <div className="ci-info">
                <div className="ci-title">{item.title}</div>
                <div className="ci-price">KSh {item.price.toLocaleString()}</div>
                <div className="ci-sub">Subtotal: KSh {(item.price * item.qty).toLocaleString()}</div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              <span>Delivery: FREE</span>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-num">KSh {totalPrice.toLocaleString()}</span>
            </div>
            <button className="checkout-btn" onClick={openCheckout}>
              📱 Pay with M-Pesa
            </button>
            <button className="clear-btn" onClick={clearCart}>Clear cart</button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="co-backdrop">
          <div className="co-box">
            {stage === "success" ? (
              <div className="success-screen">
                <div className="success-icon">✅</div>
                <h2>{installmentInfo ? `Installment ${installmentInfo.seq} Paid!` : "Payment Received!"}</h2>
                <p>
                  M-Pesa confirmation received from <strong>{form.phone}</strong>.
                  {installmentInfo
                    ? installmentInfo.seq < installmentInfo.installments.length
                      ? ` ${installmentInfo.installments.length - installmentInfo.seq} installment(s) remaining — you can pay them anytime from "My Installments".`
                      : " This order is now fully paid and will be delivered within 48 hours."
                    : " Your order will be delivered within 48 hours."}
                </p>
                <div className="order-ref">Order Reference: {orderRef}</div>
                {qrUrl && (
                  <div className="qr-block">
                    <img src={qrUrl} alt={`QR code for order ${orderRef}`} />
                    <div className="qr-caption">
                      📱 Scan to track your order — show this code to the delivery rider as proof of purchase.
                    </div>
                  </div>
                )}
                {installmentInfo && installmentInfo.seq < installmentInfo.installments.length ? (
                  <button className="pay-btn" onClick={() => { resetAll(); onNavigate("my-installments"); }}>View My Installments</button>
                ) : (
                  <button className="pay-btn" onClick={resetAll}>Continue Shopping</button>
                )}
              </div>
            ) : stage === "stk" ? (
              <div className="stk-screen">
                <div className="mpesa-logo-row">📱 M-Pesa</div>
                <div className="stk-spinner" />
                <div className="stk-status-title">Waiting for confirmation on {form.phone}…</div>
                <div className="stk-countdown">{elapsed}s</div>
                <p className="stk-status-sub">
                  Check your phone and enter your M-Pesa PIN to pay{" "}
                  <strong>KSh {orderSummary.total.toLocaleString()}</strong>
                  {installmentInfo ? ` (installment ${installmentInfo.seq} of ${installmentInfo.installments.length})` : ""}.
                </p>
              </div>
            ) : (
              <>
                <div className="co-head">
                  <h2>Checkout</h2>
                  <p>Total: KSh {totalPrice.toLocaleString()} · {totalItems} item{totalItems !== 1 ? "s" : ""}</p>
                </div>
                <div className="co-body">
                  {error && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"8px", padding:"10px 14px", fontSize:".84rem", color:COLORS.red, marginBottom:"1rem" }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <div style={{ marginBottom:"1rem" }}>
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="e.g. Jane Wanjiku" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="stk-phone-row">
                    <label className="form-label">M-Pesa Phone *</label>
                    <input className="form-input" placeholder="07XXXXXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom:"1.25rem" }}>
                    <label className="form-label">Delivery Address</label>
                    <input className="form-input" placeholder="e.g. Nairobi, Westlands" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label className="form-label">Payment Plan</label>
                    <div style={{ display: "flex", gap: ".6rem", marginTop: ".4rem" }}>
                      <button type="button" onClick={() => setPayMethod("full")}
                        style={{ flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
                          border: `1.5px solid ${payMethod === "full" ? COLORS.green : COLORS.border}`,
                          background: payMethod === "full" ? COLORS.greenPale : "#fff",
                          color: payMethod === "full" ? COLORS.greenDark : COLORS.gray, fontWeight: 600, fontSize: ".85rem" }}>
                        Pay in Full
                      </button>
                      <button type="button" onClick={() => setPayMethod("installments")}
                        style={{ flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
                          border: `1.5px solid ${payMethod === "installments" ? COLORS.green : COLORS.border}`,
                          background: payMethod === "installments" ? COLORS.greenPale : "#fff",
                          color: payMethod === "installments" ? COLORS.greenDark : COLORS.gray, fontWeight: 600, fontSize: ".85rem" }}>
                        Lipa Mdogo Mdogo
                      </button>
                    </div>
                    {payMethod === "installments" && (
                      <div style={{ marginTop: ".8rem" }}>
                        <label className="form-label">Number of installments</label>
                        <select className="form-input" value={numInstallments} onChange={(e) => setNumInstallments(Number(e.target.value))}>
                          <option value={2}>2 installments — KSh {Math.ceil(totalPrice / 2).toLocaleString()} each</option>
                          <option value={3}>3 installments — KSh {Math.ceil(totalPrice / 3).toLocaleString()} each</option>
                          <option value={4}>4 installments — KSh {Math.ceil(totalPrice / 4).toLocaleString()} each</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="mpesa-note">
                    📱 <span>An M-Pesa STK push will be sent to your number. Enter your PIN to confirm payment of{" "}
                    <strong>KSh {(payMethod === "installments" ? Math.ceil(totalPrice / numInstallments) : totalPrice).toLocaleString()}</strong>
                    {payMethod === "installments" ? ` (installment 1 of ${numInstallments})` : ""}.</span>
                  </div>
                  <button className="pay-btn" onClick={handlePay}>
                    Confirm & Pay via M-Pesa
                  </button>
                  <span className="back-link" onClick={resetAll}>← Cancel</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}