



import { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS, CATEGORIES, GRADES } from "../theme";

const EMOJI_OPTIONS = ["📐","📖","📚","🔬","🌍","🎨","💊","📓","📏","✏️","🎒","📦","🖊️","📋","🗂️"];

const css = `
  .admin-page { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
  .admin-banner {
    background: linear-gradient(135deg, ${COLORS.gold}, #B8880F);
    color: #fff;
    border-radius: 16px;
    padding: 1.25rem 1.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .admin-banner-icon { font-size: 2rem; }
  .admin-banner h2 { font-family: ${FONTS.display}; font-size: 1.3rem; }
  .admin-banner p  { font-size: .82rem; color: rgba(255,255,255,.82); margin-top: 2px; }

  .admin-grid {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 860px) { .admin-grid { grid-template-columns: 1fr; } }

  
  .form-card {
    background: #fff;
    border: 1px solid ${COLORS.border};
    border-radius: 18px;
    overflow: hidden;
    position: sticky;
    top: 80px;
  }
  .form-card-head {
    background: ${COLORS.green};
    color: #fff;
    padding: 1.1rem 1.5rem;
    font-family: ${FONTS.display};
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: .5rem;
  }
  .form-card-body { padding: 1.5rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; }
  .form-group { margin-bottom: 1.1rem; }
  .submit-btn {
    width: 100%;
    background: ${COLORS.green};
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s;
    margin-top: .4rem;
  }
  .submit-btn:hover { background: ${COLORS.greenDark}; }
  .submit-btn.editing { background: #1D4ED8; }
  .submit-btn.editing:hover { background: #1E40AF; }
  .cancel-edit-btn {
    width: 100%;
    background: #F3F4F6;
    color: #374151;
    border: none;
    border-radius: 10px;
    padding: 10px;
    font-size: .9rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: .5rem;
  }

  .emoji-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .emoji-btn {
    font-size: 1.5rem;
    border: 2px solid ${COLORS.border};
    border-radius: 8px;
    padding: 4px 6px;
    cursor: pointer;
    background: #fff;
    transition: border-color .15s;
    line-height: 1;
  }
  .emoji-btn:hover  { border-color: ${COLORS.green}; }
  .emoji-btn.active { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; }

  
  .mgmt-card {
    background: #fff;
    border: 1px solid ${COLORS.border};
    border-radius: 18px;
    overflow: hidden;
  }
  .mgmt-head {
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mgmt-head h3 { font-family: ${FONTS.display}; font-size: 1.1rem; }
  .mgmt-count {
    font-size: .8rem;
    background: ${COLORS.greenPale};
    color: ${COLORS.green};
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
  }
  .mgmt-search { width: 100%; padding: 10px 14px 10px 36px; border-bottom: 1px solid ${COLORS.border}; border-top: none; border-left: none; border-right: none; font-size: .9rem; outline: none; background: #FAFAF8; }
  .mgmt-search-wrap { position: relative; }
  .mgmt-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${COLORS.gray}; }

  .product-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 12px 1.5rem;
    border-bottom: 1px solid #F3F4F6;
    transition: background .15s;
  }
  .product-row:hover { background: #FAFAF8; }
  .product-row:last-child { border-bottom: none; }
  .row-emoji { font-size: 1.75rem; width: 40px; text-align: center; flex-shrink: 0; }
  .row-info  { flex: 1; min-width: 0; }
  .row-title { font-weight: 600; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-meta  { font-size: .76rem; color: ${COLORS.gray}; margin-top: 2px; }
  .row-price { font-family: ${FONTS.display}; font-size: 1rem; font-weight: 700; color: ${COLORS.green}; width: 90px; text-align: right; flex-shrink: 0; }
  .row-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .row-edit-btn {
    background: #EFF6FF; color: #1D4ED8; border: none; border-radius: 6px;
    padding: 5px 10px; font-size: .78rem; font-weight: 600; cursor: pointer;
  }
  .row-del-btn {
    background: #FEF2F2; color: ${COLORS.red}; border: none; border-radius: 6px;
    padding: 5px 10px; font-size: .78rem; font-weight: 600; cursor: pointer;
  }
  .success-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${COLORS.green};
    color: #fff;
    border-radius: 12px;
    padding: 14px 22px;
    font-weight: 600;
    font-size: .9rem;
    box-shadow: 0 8px 24px rgba(0,0,0,.2);
    z-index: 999;
    animation: fadeIn .3s ease both;
  }
`;

const BLANK = { title:"", category:"Mathematics", grade:"Grade 4", price:"", stock:"", publisher:"", img:"📚" };

export default function AddProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user }  = useAuth();
  const [form,    setForm]    = useState(BLANK);
  const [editing, setEditing] = useState(null);   
  const [toast,   setToast]   = useState("");
  const [mgmtQ,   setMgmtQ]   = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title:p.title, category:p.category, grade:p.grade||"", price:String(p.price), stock:String(p.stock), publisher:p.publisher||"", img:p.img||"📚" });
    window.scrollTo({ top: 0, behavior:"smooth" });
  };

  const cancelEdit = () => { setEditing(null); setForm(BLANK); };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.stock) { showToast("⚠️ Title, price, and stock are required."); return; }
    try {
      if (editing) {
        await updateProduct(editing, form);
        showToast("✅ Product updated!");
        cancelEdit();
      } else {
        await addProduct(form);
        showToast("✅ Product added successfully!");
        setForm(BLANK);
      }
    } catch (e) {
      showToast(`⚠️ ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteProduct(id);
        showToast("🗑️ Product deleted.");
        if (editing === id) cancelEdit();
      } catch (e) {
        showToast(`⚠️ ${e.message}`);
      }
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(mgmtQ.toLowerCase()) ||
    p.category.toLowerCase().includes(mgmtQ.toLowerCase())
  );

  return (
    <>
      <style>{css}</style>
      <div className="admin-page">

        
        <div className="admin-banner">
          <div className="admin-banner-icon">👑</div>
          <div>
            <h2>Admin — Product Management</h2>
            <p>Logged in as <strong>{user?.name}</strong> · Add, edit, or remove CBC products from the catalog.</p>
          </div>
        </div>

        <div className="admin-grid">
          
          <div className="form-card">
            <div className="form-card-head">
              {editing ? "✏️ Edit Product" : "➕ Add New Product"}
            </div>
            <div className="form-card-body">

              
              <div className="form-group">
                <label className="form-label">Product Icon</label>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                  <span style={{ fontSize:"2rem" }}>{form.img}</span>
                  <span style={{ fontSize:".82rem", color:COLORS.gray }}>Select below</span>
                </div>
                <div className="emoji-picker">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} className={`emoji-btn ${form.img === e ? "active" : ""}`} onClick={() => set("img", e)}>{e}</button>
                  ))}
                </div>
              </div>

              {}
              <div className="form-group">
                <label className="form-label">Product Title *</label>
                <input className="form-input" placeholder="e.g. CBC Mathematics Grade 4" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>

              {}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-input" value={form.grade} onChange={(e) => set("grade", e.target.value)}>
                    <option value="">N/A</option>
                    {GRADES.filter((g) => g !== "All Grades").map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (KSh) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 450" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Qty *</label>
                  <input className="form-input" type="number" placeholder="e.g. 25" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </div>
              </div>

              {}
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input className="form-input" placeholder="e.g. KICD, Oxford, Longhorn" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} />
              </div>

              <button className={`submit-btn ${editing ? "editing" : ""}`} onClick={handleSubmit}>
                {editing ? "💾 Save Changes" : "➕ Add Product"}
              </button>
              {editing && <button className="cancel-edit-btn" onClick={cancelEdit}>✕ Cancel Edit</button>}
            </div>
          </div>

          {}
          <div className="mgmt-card">
            <div className="mgmt-head">
              <h3>All Products</h3>
              <span className="mgmt-count">{products.length} total</span>
            </div>
            <div className="mgmt-search-wrap">
              <span className="mgmt-search-icon">🔍</span>
              <input
                className="mgmt-search"
                placeholder="Search products…"
                value={mgmtQ}
                onChange={(e) => setMgmtQ(e.target.value)}
              />
            </div>
            <div style={{ maxHeight:"620px", overflowY:"auto" }}>
              {filtered.map((p) => (
                <div className="product-row" key={p.id}>
                  <div className="row-emoji">{p.img || "📦"}</div>
                  <div className="row-info">
                    <div className="row-title">{p.title}</div>
                    <div className="row-meta">
                      {p.category}{p.grade ? ` · ${p.grade}` : ""} · Stock: {p.stock}
                    </div>
                  </div>
                  <div className="row-price">KSh {p.price.toLocaleString()}</div>
                  <div className="row-actions">
                    <button className="row-edit-btn" onClick={() => startEdit(p)}>✏️</button>
                    <button className="row-del-btn"  onClick={() => handleDelete(p.id)}>🗑</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign:"center", padding:"3rem", color:COLORS.gray }}>No products match your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="success-toast">{toast}</div>}
    </>
  );
}