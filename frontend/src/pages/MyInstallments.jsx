import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .mi-page { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem 5rem; min-height: calc(100vh - 64px); }
  .mi-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .mi-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .mi-empty { text-align: center; padding: 4rem; color: ${COLORS.gray}; }
  .mi-plan { background: #fff; border: 1px solid ${COLORS.border}; border-radius: 14px; padding: 1.4rem; margin-top: 1.4rem; }
  .mi-plan-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; flex-wrap: wrap; gap: .4rem; }
  .mi-plan-ref { font-weight: 700; color: ${COLORS.greenDeep}; }
  .mi-plan-total { font-weight: 700; }
  .mi-progress-bg { background: ${COLORS.grayLight}; border-radius: 8px; height: 10px; overflow: hidden; margin-bottom: 1rem; }
  .mi-progress-fill { background: ${COLORS.green}; height: 100%; transition: width .4s ease; }
  .mi-installments { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1rem; }
  .mi-row { display: flex; justify-content: space-between; align-items: center; padding: .6rem .9rem; border-radius: 8px; font-size: .88rem; }
  .mi-row.paid { background: ${COLORS.successBg}; color: ${COLORS.success}; }
  .mi-row.due { background: ${COLORS.grayLight}; color: ${COLORS.gray}; }
  .mi-row.pending { background: ${COLORS.warningBg}; color: ${COLORS.warning}; }
  .mi-pay-btn { padding: 11px 18px; background: ${COLORS.green}; color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: .88rem; }
  .mi-pay-btn:hover { background: ${COLORS.greenDark}; }
  .mi-status-note { font-size: .85rem; color: ${COLORS.gray}; margin-top: .5rem; }
`;

export default function MyInstallments({ onNavigate }) {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const [plans, setPlans] = useState([]);
  const [payingPlan, setPayingPlan] = useState(null);
  const [statusNote, setStatusNote] = useState({});

  const load = () => apiFetch("/installments").then(setPlans);
  useEffect(() => { if (user) load(); }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2>Please log in to view your installment plans</h2>
        <button className="btn-green" style={{ marginTop: "1.2rem" }} onClick={() => onNavigate("login")}>Go to Login</button>
      </div>
    );
  }

  const payNext = async (planId) => {
    setPayingPlan(planId);
    setStatusNote((s) => ({ ...s, [planId]: "Sending STK push…" }));
    try {
      const res = await apiFetch(`/installments/${planId}/pay-next`, { method: "POST" });
      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        const r = await apiFetch(`/mpesa/status/${res.checkout_id}`, { auth: false });
        if (r.status === "paid") {
          clearInterval(poll);
          setStatusNote((s) => ({ ...s, [planId]: "✅ Installment paid!" }));
          setPayingPlan(null);
          notify({ type: "order", icon: "✅", title: "Installment Paid", body: `Installment ${res.seq} (KSh ${res.amount.toLocaleString()}) confirmed.`, duration: 6000 });
          load();
        } else if (r.status === "failed" || tries > 20) {
          clearInterval(poll);
          setStatusNote((s) => ({ ...s, [planId]: r.message || "Payment not completed. Try again." }));
          setPayingPlan(null);
        }
      }, 3000);
    } catch (e) {
      setStatusNote((s) => ({ ...s, [planId]: e.message }));
      setPayingPlan(null);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="mi-page">
        <div className="mi-head">
          <h1>💳 My Installment Plans</h1>
          <p>Track and complete your Lipa Mdogo Mdogo orders here.</p>
        </div>

        {plans.length === 0 && <div className="mi-empty">You have no installment plans yet — choose "Lipa Mdogo Mdogo" at checkout to start one.</div>}

        {plans.map((plan) => {
          const nextDue = plan.payments.find((p) => p.status === "due");
          const pct = (plan.paid_count / plan.payments.length) * 100;
          return (
            <div className="mi-plan" key={plan.id}>
              <div className="mi-plan-top">
                <span className="mi-plan-ref">Order {plan.order_ref}</span>
                <span className="mi-plan-total">KSh {plan.amount_paid.toLocaleString()} / {plan.total.toLocaleString()} paid</span>
              </div>
              <div className="mi-progress-bg"><div className="mi-progress-fill" style={{ width: `${pct}%` }} /></div>
              <div className="mi-installments">
                {plan.payments.map((p) => (
                  <div className={`mi-row ${p.status}`} key={p.id}>
                    <span>Installment {p.seq} — KSh {p.amount.toLocaleString()}</span>
                    <span>{p.status === "paid" ? "✅ Paid" : p.status === "pending" ? "⏳ Awaiting confirmation" : "Due"}</span>
                  </div>
                ))}
              </div>
              {nextDue && (
                <button className="mi-pay-btn" onClick={() => payNext(plan.id)} disabled={payingPlan === plan.id}>
                  {payingPlan === plan.id ? "Processing…" : `Pay Installment ${nextDue.seq} Now`}
                </button>
              )}
              {!nextDue && <div className="mi-status-note">🎉 Fully paid — this order is complete.</div>}
              {statusNote[plan.id] && <div className="mi-status-note">{statusNote[plan.id]}</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}