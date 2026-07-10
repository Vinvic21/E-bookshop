
import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { COLORS, CATEGORIES, GRADES, CBC_KITS } from "../theme";

const css = `
  .shop-page { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }
  .shop-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .filters {
    display: flex;
    gap: .85rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .search-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
  }
  .search-wrap input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1.5px solid ${COLORS.border};
    border-radius: 10px;
    font-size: .93rem;
    outline: none;
    transition: border-color .2s;
    background: #fff;
  }
  .search-wrap input:focus { border-color: ${COLORS.green}; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1.05rem; }
  .filter-select {
    padding: 10px 14px;
    border: 1.5px solid ${COLORS.border};
    border-radius: 10px;
    font-size: .88rem;
    outline: none;
    background: #fff;
    cursor: pointer;
  }
  .filter-select:focus { border-color: ${COLORS.green}; }

  .cat-chips { display: flex; gap: 8px; margin-bottom: 2rem; flex-wrap: wrap; }
  .chip {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1.5px solid ${COLORS.border};
    background: #fff;
    font-size: .83rem;
    font-weight: 500;
    cursor: pointer;
    transition: all .18s;
    color: #374151;
  }
  .chip:hover { border-color: ${COLORS.green}; color: ${COLORS.green}; }
  .chip.active { background: ${COLORS.green}; color: #fff; border-color: ${COLORS.green}; }

  .empty-state {
    text-align: center;
    padding: 5rem 1rem;
    color: ${COLORS.gray};
  }
  .empty-state div { font-size: 3.5rem; margin-bottom: 1rem; }

  .result-count {
    font-size: .85rem;
    color: ${COLORS.gray};
    font-weight: 500;
  }
`;

export default function Shop({ onNavigate, initialFilters }) {
  const { products, deleteProduct } = useProducts();
  const { addManyToCart } = useCart();
  const { isAdmin, user } = useAuth();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState(initialFilters?.category || "All");
  const [grade,    setGrade]    = useState(initialFilters?.grade || "All Grades");
  const [editItem, setEditItem] = useState(null);   

  
  const [kitGrade,   setKitGrade]   = useState(initialFilters?.grade && CBC_KITS[initialFilters.grade] ? initialFilters.grade : "Grade 1");
  const [kitAdded,   setKitAdded]   = useState(false);

  
  useEffect(() => {
    if (initialFilters?.category) setCategory(initialFilters.category);
    if (initialFilters?.grade)     setGrade(initialFilters.grade);
  }, [initialFilters]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (category === "All"       || p.category === category) &&
      (grade    === "All Grades" || p.grade === grade)
    );
  });

  const kit = CBC_KITS[kitGrade];
  const kitItems = kit ? products.filter((p) => kit.productIds.includes(p.id)) : [];
  const kitTotal = kitItems.reduce((s, p) => s + p.price, 0);

  const handleAddKit = () => {
    if (!user) { onNavigate("login"); return; }
    addManyToCart(kitItems);
    setKitAdded(true);
    setTimeout(() => setKitAdded(false), 3000);
  };

  return (
    <>
      <style>{css}</style>
      <div className="shop-page">
        <div className="shop-header">
          <div>
            <h1 className="section-title">Shop CBC Materials</h1>
            <p className="result-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => onNavigate("add-products")}>
              ➕ Add New Product
            </button>
          )}
        </div>

        
        <div className="kit-banner">
          <div className="kit-banner-text">
            <div className="kit-banner-title">🎒 Quick CBC Kits</div>
            <div className="kit-banner-sub">
              Pick a grade and add the full set of recommended books & stationery in one click.
            </div>
          </div>
          <div className="kit-controls">
            <select className="kit-select" value={kitGrade} onChange={(e) => setKitGrade(e.target.value)}>
              {Object.keys(CBC_KITS).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <button className="kit-add-btn" onClick={handleAddKit}>
              ➕ Add Full {kitGrade} Kit to Cart
            </button>
          </div>

          {kit && (
            <div className="kit-preview">
              {kitItems.map((p) => (
                <span className="kit-chip" key={p.id}>{p.img} {p.title}</span>
              ))}
              <span className="kit-total" style={{ marginLeft: "auto" }}>
                Total: KSh {kitTotal.toLocaleString()}
              </span>
            </div>
          )}

          {kitAdded && (
            <div className="kit-added-toast">
              ✅ {kit.label} added to your cart — {kitItems.length} items (KSh {kitTotal.toLocaleString()})!
            </div>
          )}
        </div>

        
        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search books, stationery…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        
        <div className="cat-chips">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>

        {}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div>🔍</div>
            <p>No products found.<br />Try a different search or filter.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showAdminActions={isAdmin}
                onEdit={setEditItem}
                onDelete={deleteProduct}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}