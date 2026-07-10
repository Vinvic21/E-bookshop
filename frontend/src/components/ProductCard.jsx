
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS } from "../theme";

const css = `
  .product-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    overflow: hidden;
    transition: transform .2s, box-shadow .2s, border-color .2s;
  }
  .product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(27,107,58,.13);
    border-color: ${COLORS.green};
  }
  .product-card.disabled { opacity: .5; pointer-events: none; }
  .product-img {
    background: ${COLORS.greenPale};
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.6rem;
  }
  .product-body { padding: 1rem; }
  .product-cat {
    font-size: .72rem;
    font-weight: 700;
    color: ${COLORS.green};
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 5px;
  }
  .product-title {
    font-weight: 600;
    font-size: .93rem;
    line-height: 1.4;
    margin-bottom: 3px;
    color: #111827;
  }
  .product-meta {
    font-size: .78rem;
    color: ${COLORS.gray};
    margin-bottom: 10px;
  }
  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  }
  .product-price {
    font-family: ${FONTS.display};
    font-size: 1.15rem;
    font-weight: 700;
    color: ${COLORS.green};
  }
  .add-btn {
    background: ${COLORS.green};
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: .83rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .add-btn:hover { background: ${COLORS.greenDark}; }
  .in-cart-badge {
    font-size: .75rem;
    font-weight: 600;
    background: ${COLORS.greenPale};
    color: ${COLORS.green};
    border-radius: 12px;
    padding: 4px 10px;
  }
`;

export default function ProductCard({ product, showAdminActions, onEdit, onDelete, onNavigate }) {
  const { cartItems, addToCart } = useCart();
  const { user } = useAuth();
  const cartQty = cartItems.find((i) => i.id === product.id)?.qty ?? 0;

  const handleAdd = () => {
    if (!user) { onNavigate?.("login"); return; }
    addToCart(product);
  };

  const stockBadge = () => {
    if (product.stock === 0) return <span className="badge badge-out">Out of Stock</span>;
    if (product.stock < 10)  return <span className="badge badge-low">Only {product.stock} left</span>;
    return <span className="badge badge-ok">{product.stock} in stock</span>;
  };

  return (
    <>
      <style>{css}</style>
      <div className={`product-card ${product.stock === 0 ? "disabled" : ""}`}>
        <div className="product-img">{product.img || "📦"}</div>
        <div className="product-body">
          <div className="product-cat">{product.category}</div>
          <div className="product-title">{product.title}</div>
          <div className="product-meta">
            {[product.grade, product.publisher].filter(Boolean).join(" • ")}
          </div>
          {stockBadge()}

          <div className="product-footer">
            <div className="product-price">KSh {product.price.toLocaleString()}</div>
            {cartQty > 0 ? (
              <span className="in-cart-badge">✓ {cartQty} in cart</span>
            ) : (
              <button className="add-btn" onClick={handleAdd}>
                {user ? "+ Add" : "🔒 Login to add"}
              </button>
            )}
          </div>

          {showAdminActions && (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                style={{ flex:1, background:"#EFF6FF", color:"#1D4ED8", border:"none", borderRadius:"8px", padding:"6px", fontSize:".8rem", fontWeight:600, cursor:"pointer" }}
                onClick={() => onEdit(product)}
              >✏️ Edit</button>
              <button
                style={{ flex:1, background:"#FEF2F2", color:COLORS.red, border:"none", borderRadius:"8px", padding:"6px", fontSize:".8rem", fontWeight:600, cursor:"pointer" }}
                onClick={() => onDelete(product.id)}
              >🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}