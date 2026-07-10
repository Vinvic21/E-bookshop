import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .sv-page { max-width: 640px; margin: 0 auto; padding: 3rem 1.5rem 5rem; min-height: calc(100vh - 64px); }
  .sv-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .sv-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .sv-card {
    background: linear-gradient(135deg, ${COLORS.greenDeep}, ${COLORS.greenDark});
    color: #fff; border-radius: 18px; padding: 2rem; margin: 2rem 0; text-align: center;
  }
  .sv-balance { font-size: 2.4rem; font-weight: 700; font-family: ${FONTS.display}; }
  .sv-goal-label { opacity: .85; margin-top: .3rem; font-size: .9rem; }
  .sv-progress { background: rgba(255,255,255,.25); border-radius: 8px; height: 10px; margin-top: 1rem; overflow: hidden; }
  .sv-progress-fill { background: ${COLORS.goldLight}; height: 100%; transition: width .4s ease; }
  .sv-form { background: #fff; border: 1px solid ${COLORS.border}; border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .sv-form h3 { margin-bottom: 1rem; font-size: 1.05rem; }
  .sv-row { display: flex; gap: .8rem; margin-bottom: .8rem; flex-wrap: wrap; }
  .sv-row input {
    flex: 1; min-width: 160px; padding: 11px 14px; border: 1.5px solid ${COLORS.border};
    border-radius: 10px; font-size: .95rem;
  }
  .sv-btn { padding: 12px 20px; background: ${COLORS.green}; color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
  .sv-btn:hover { background: ${COLORS.greenDark}; }
  .sv-btn-outline { background: #fff; border: 1.5px solid ${COLORS.green}; color: ${COLORS.greenDark}; }
  .sv-status { font-size: .88rem; margin-top: .6rem; }
`;

export default function Savings({ onNavigate }) {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const [savings, setSavings] = useState({ balance: 0, goal_amount: 0, goal_label: "" });
  const [goalAmount, setGoalAmount] = useState("");
  const [goalLabel, setGoalLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const load = () => apiFetch("/savings").then((s) => {
    setSavings(s);
    setGoalAmount(s.goal_amount || "");
    setGoalLabel(s.goal_label || "");
  });

  useEffect(() => { if (user) load(); }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2>Please log in to use the School Fund</h2>
        <button className="btn-green" style={{ marginTop: "1.2rem" }} onClick={() => onNavigate("login")}>Go to Login</button>
      </div>
    );
  }

  const saveGoal = async () => {
    await apiFetch("/savings/goal", { method: "PUT", body: { goal_amount: Number(goalAmount) || 0, goal_label: goalLabel } });
    load();
    notify({ type: "order", icon: "🎯", title: "Goal saved", body: "Your School Fund goal has been updated.", duration: 5000 });
  };

  const deposit = async () => {
    if (!phone || !amount) { setStatus("Enter a phone number and amount."); return; }
    setStatus("Sending STK push…");
    try {
      const res = await apiFetch("/savings/deposit", { method: "POST", body: { phone, amount: Number(amount) } });
      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        const r = await apiFetch(`/mpesa/status/${res.checkout_id}`, { auth: false });
        if (r.status === "paid") {
          clearInterval(poll);
          setStatus("✅ Deposit confirmed!");
          setAmount(""); load();
        } else if (r.status === "failed" || tries > 20) {
          clearInterval(poll);
          setStatus(r.message || "Deposit not completed. Try again.");
        }
      }, 3000);
    } catch (e) {
      setStatus(e.message);
    }
  };

  const pct = savings.goal_amount > 0 ? Math.min(100, (savings.balance / savings.goal_amount) * 100) : 0;

  return (
    <>
      <style>{css}</style>
      <div className="sv-page">
        <div className="sv-head">
          <h1>🐷 School Fund</h1>
          <p>Save toward next term's books and stationery via M-Pesa, a little at a time.</p>
        </div>

        <div className="sv-card">
          <div className="sv-balance">KSh {savings.balance.toLocaleString()}</div>
          {savings.goal_amount > 0 && (
            <>
              <div className="sv-goal-label">{savings.goal_label || "Savings goal"}: KSh {savings.goal_amount.toLocaleString()}</div>
              <div className="sv-progress"><div className="sv-progress-fill" style={{ width: `${pct}%` }} /></div>
            </>
          )}
        </div>

        <div className="sv-form">
          <h3>🎯 Set a goal</h3>
          <div className="sv-row">
            <input placeholder="Goal label, e.g. Term 2 fees" value={goalLabel} onChange={(e) => setGoalLabel(e.target.value)} />
            <input placeholder="Goal amount (KSh)" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
          </div>
          <button className="sv-btn sv-btn-outline" onClick={saveGoal}>Save Goal</button>
        </div>

        <div className="sv-form">
          <h3>📲 Deposit via M-Pesa</h3>
          <div className="sv-row">
            <input placeholder="M-Pesa phone, e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="Amount (KSh)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <button className="sv-btn" onClick={deposit}>Confirm & Deposit</button>
          {status && <div className="sv-status">{status}</div>}
        </div>
      </div>
    </>
  );
}
