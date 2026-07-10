import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .sl-page { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; min-height: calc(100vh - 64px); }
  .sl-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .sl-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .sl-selects { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
  .sl-selects select {
    padding: 12px 16px; border: 1.5px solid ${COLORS.border}; border-radius: 10px;
    font-size: .95rem; min-width: 220px; background: #fff;
  }
  .sl-items { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1.5rem; }
  .sl-item {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: .9rem 1.2rem;
  }
  .sl-item-left { display: flex; align-items: center; gap: .8rem; }
  .sl-item-icon { font-size: 1.4rem; }
  .sl-item-title { font-weight: 600; color: ${COLORS.dark}; }
  .sl-item-meta { font-size: .82rem; color: ${COLORS.gray}; }
  .sl-item-qty { font-size: .85rem; color: ${COLORS.greenDark}; font-weight: 600; }
  .sl-total {
    display: flex; justify-content: space-between; align-items: center;
    background: ${COLORS.greenPale}; border-radius: 12px; padding: 1rem 1.4rem; margin-bottom: 1.2rem;
  }
  .sl-add-btn {
    padding: 13px 22px; background: ${COLORS.green}; color: #fff; border: none;
    border-radius: 10px; font-weight: 600; cursor: pointer; font-size: .95rem;
  }
  .sl-add-btn:hover { background: ${COLORS.greenDark}; }
  .sl-empty { text-align: center; padding: 3rem; color: ${COLORS.gray}; }
`;

export default function SchoolLists({ onNavigate }) {
  const { user } = useAuth();
  const { replaceCart } = useCart();
  const { notify } = useNotifications();
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [grades, setGrades] = useState([]);
  const [grade, setGrade] = useState("");
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => { apiFetch("/schools", { auth: false }).then(setSchools); }, []);

  useEffect(() => {
    if (!schoolId) { setGrades([]); setGrade(""); return; }
    apiFetch(`/schools/${schoolId}/grades`, { auth: false }).then((g) => { setGrades(g); setGrade(g[0] || ""); });
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !grade) { setItems([]); return; }
    apiFetch(`/schools/${schoolId}/lists/${encodeURIComponent(grade)}`, { auth: false }).then(setItems);
  }, [schoolId, grade]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const handleAdd = async () => {
    if (!user) { onNavigate("login"); return; }
    setAdding(true);
    try {
      const cart = await apiFetch(`/schools/${schoolId}/lists/${encodeURIComponent(grade)}/add-to-cart`, { method: "POST" });
      replaceCart(cart);
      notify({ type: "order", icon: "🎒", title: "List added to cart", body: `All ${items.length} items for ${grade} are now in your cart.`, duration: 6000 });
    } catch (e) {
      notify({ type: "order", icon: "⚠️", title: "Couldn't add list", body: e.message, duration: 6000 });
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="sl-page">
        <div className="sl-head">
          <h1>🎒 School Shopping Lists</h1>
          <p>Pick your child's school and grade — we'll add everything on their official list to your cart in one click.</p>
        </div>

        <div className="sl-selects">
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
            <option value="">Select a school…</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.county})</option>)}
          </select>
          {grades.length > 0 && (
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
        </div>

        {schoolId && grade && items.length === 0 && (
          <div className="sl-empty">No published list yet for this school &amp; grade.</div>
        )}

        {items.length > 0 && (
          <>
            <div className="sl-items">
              {items.map((it) => (
                <div className="sl-item" key={it.id}>
                  <div className="sl-item-left">
                    <span className="sl-item-icon">{it.img}</span>
                    <div>
                      <div className="sl-item-title">{it.title}</div>
                      <div className="sl-item-meta">{it.category} · KSh {it.price.toLocaleString()} each</div>
                    </div>
                  </div>
                  <div className="sl-item-qty">×{it.qty}</div>
                </div>
              ))}
            </div>
            <div className="sl-total">
              <span>Total for {grade}</span>
              <strong>KSh {total.toLocaleString()}</strong>
            </div>
            <button className="sl-add-btn" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding…" : user ? "Add Full List to Cart" : "🔒 Login to add list"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
