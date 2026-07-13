// src/components/Navbar.jsx
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS, FONTS } from "../theme";

const css = `
  .navbar {
    background: ${COLORS.green};
    color: #fff;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(27,107,58,.35);
  }
  .nav-logo {
    font-family: ${FONTS.display};
    font-size: 1.6rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    border: none;
    background: none;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .nav-link {
    color: rgba(255,255,255,.82);
    font-size: .9rem;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    transition: background .2s, color .2s;
  }
  .nav-link:hover        { background: rgba(255,255,255,.12); color: #fff; }
  .nav-link.active       { color: ${COLORS.goldLight}; }
  .nav-link.admin-link   { color: ${COLORS.goldLight}; font-weight: 600; }
  .nav-right {
    display: flex;
    align-items: center;
    gap: .75rem;
  }
  .user-chip {
    font-size: .8rem;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.3);
    color: rgba(255,255,255,.9);
  }
  .cart-btn {
    background: ${COLORS.gold};
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background .2s;
  }
  .cart-btn:hover { background: #B8880F; }
  .cart-badge {
    background: #fff;
    color: ${COLORS.gold};
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .72rem;
    font-weight: 700;
  }
  .logout-btn {
    background: rgba(255,255,255,.15);
    color: #fff;
    border: 1px solid rgba(255,255,255,.3);
    border-radius: 8px;
    padding: 7px 14px;
    font-size: .82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .logout-btn:hover { background: rgba(255,255,255,.25); }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .user-chip { display: none; }
    .navbar { padding: 0 1rem; }
  }
`;

export default function Navbar({ currentPage, onNavigate, onCartOpen }) {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const link = (page, label, extraClass = "") => (
    <button
      className={`nav-link ${currentPage === page ? "active" : ""} ${extraClass}`}
      onClick={() => onNavigate(page)}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{css}</style>
      <nav className="navbar">
        <button className="nav-logo" onClick={() => onNavigate("home")}>
          📚 Stasho
        </button>

        <div className="nav-links">
          {link("home",     "Home")}
          {link("shop",     "Shop")}
          {link("school-lists", "🎒 School Lists")}
          {link("savings",  "🐷 Savings")}
          {link("resale",   "♻️ Resell")}
          {user && link("my-installments", "💳 Installments")}
          {user && link("my-orders", "📬 My Orders")}
          {link("about",    "About")}
          {isAdmin && link("add-products", "➕ Add Products", "admin-link")}
          {isAdmin && link("school-admin", "🏫 Manage Schools", "admin-link")}
          {isAdmin && link("analytics", "📊 Insights", "admin-link")}
          {isAdmin && link("deliveries", "🚚 Deliveries", "admin-link")}
        </div>

        <div className="nav-right">
          {user && (
            <span className="user-chip">
              {isAdmin ? "👑 " : "👤 "}{user.name.split(" ")[0]}
            </span>
          )}

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button className="cart-btn" onClick={onCartOpen}>
            🛒 Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {user ? (
            <button className="logout-btn" onClick={logout}>Logout</button>
          ) : (
            <button className="logout-btn" onClick={() => onNavigate("login")}>Login</button>
          )}
        </div>
      </nav>
    </>
  );
}