// src/App.jsx
// ─── Root Application ─────────────────────────────────────────────────────────
// • Provides AuthProvider, CartProvider, ProductsProvider to the whole tree
// • Manages routing via a `page` state (no react-router needed for this SPA)
// • Injects global CSS once
// • Mounts Navbar, pages, Footer, and the Cart slide-over

import { useState } from "react";
import { AuthProvider }     from "./context/AuthContext";
import { CartProvider }     from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { ThemeProvider }    from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

import Navbar    from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import Footer    from "./components/Footer";
import SomaChatbot from "./components/SomaChatbot";
import NotificationFeed from "./components/NotificationFeed";

import Home        from "./pages/Home";
import Shop        from "./pages/Shop";
import About       from "./pages/About";
import Login       from "./pages/Login";
import AddProducts from "./pages/AddProducts";
import Cart        from "./pages/Cart";
import SchoolLists from "./pages/SchoolLists";
import Savings     from "./pages/Savings";
import Resale      from "./pages/Resale";
import AdminAnalytics from "./pages/AdminAnalytics";
import SchoolAdmin from "./pages/SchoolAdmin";
import MyInstallments from "./pages/MyInstallments";
import MyOrders from "./pages/MyOrders";
import AdminDeliveries from "./pages/AdminDeliveries";

import { GLOBAL_STYLES } from "./theme";

// ─── Valid routes ─────────────────────────────────────────────────────────────
// Each entry: { path, component, requiresAuth?, requiresAdmin?, hideNav?, hideFooter? }
// We resolve these manually — no external router library needed.
// ─────────────────────────────────────────────────────────────────────────────

function AppShell() {
  const [page,     setPage]     = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  // Optional pre-selected filters for the Shop page, set when navigating
  // there from Soma the chatbot (e.g. { category: "English" } or { grade: "Grade 1" })
  const [shopFilters, setShopFilters] = useState(null);

  const navigate = (p, options) => {
    setPage(p);
    setCartOpen(false);
    if (p === "shop") setShopFilters(options?.category || options?.grade ? options : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pages that don't show the normal navbar/footer chrome
  const isBarePage = page === "login";

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home onNavigate={navigate} />;

      case "shop":
        return <Shop onNavigate={navigate} initialFilters={shopFilters} />;

      case "about":
        return <About onNavigate={navigate} />;

      case "login":
        return <Login onNavigate={navigate} />;

      case "add-products":
        // Double-guarded: AuthGuard checks login + admin role at render time.
        // Navbar already hides the link for non-admins, but the guard is the
        // real security boundary (someone could manually call navigate("add-products")).
        return (
          <AuthGuard requireAdmin onNavigate={navigate}>
            <AddProducts onNavigate={navigate} />
          </AuthGuard>
        );

      case "school-lists":
        return <SchoolLists onNavigate={navigate} />;

      case "savings":
        return <Savings onNavigate={navigate} />;

      case "resale":
        return <Resale onNavigate={navigate} />;

      case "analytics":
        return (
          <AuthGuard requireAdmin onNavigate={navigate}>
            <AdminAnalytics />
          </AuthGuard>
        );

      case "school-admin":
        return (
          <AuthGuard requireAdmin onNavigate={navigate}>
            <SchoolAdmin />
          </AuthGuard>
        );

      case "my-installments":
        return <MyInstallments onNavigate={navigate} />;

      case "my-orders":
        return <MyOrders onNavigate={navigate} />;

      case "deliveries":
        return (
          <AuthGuard requireAdmin onNavigate={navigate}>
            <AdminDeliveries />
          </AuthGuard>
        );

      default:
        return (
          <div style={{ textAlign:"center", padding:"6rem 2rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
            <h2>Page not found</h2>
            <p style={{ color:"#6B7280", marginTop:".5rem", marginBottom:"1.5rem" }}>The page "{page}" doesn't exist.</p>
            <button className="btn-green" onClick={() => navigate("home")}>← Back to Home</button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Global CSS */}
      <style>{GLOBAL_STYLES}</style>

      {/* Navbar — hidden on login page */}
      {!isBarePage && (
        <Navbar
          currentPage={page}
          onNavigate={navigate}
          onCartOpen={() => setCartOpen(true)}
        />
      )}

      {/* Page content */}
      <main>
        {renderPage()}
      </main>

      {/* Footer — hidden on login & add-products pages */}
      {!isBarePage && page !== "add-products" && (
        <Footer onNavigate={navigate} />
      )}

      {/* Cart slide-over — always mounted, controlled by isOpen */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} onNavigate={navigate} />

      {/* Soma — floating shopping assistant, always mounted */}
      <SomaChatbot onNavigate={navigate} />

      {/* Real-time notification toasts — always mounted */}
      <NotificationFeed />
    </>
  );
}

// ─── Root export: wrap everything in providers ────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <NotificationProvider>
              <AppShell />
            </NotificationProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}