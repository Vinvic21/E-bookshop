







import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS } from "../theme";

export default function AuthGuard({ children, requireAdmin = false, onNavigate }) {
  const { user, isAdmin } = useAuth();

  
  if (!user) {
    return (
      <AccessDenied
        title="Please Log In"
        message="You need to be logged in to access this page."
        icon="🔒"
        btnLabel="Go to Login"
        onBtn={() => onNavigate("login")}
        onNavigate={onNavigate}
      />
    );
  }

  
  if (requireAdmin && !isAdmin) {
    return (
      <AccessDenied
        title="Admin Only"
        message="This page is restricted to administrators. You are logged in as a regular user."
        icon="🚫"
        btnLabel="Go to Shop"
        onBtn={() => onNavigate("shop")}
        onNavigate={onNavigate}
      />
    );
  }

  return children;
}

function AccessDenied({ title, message, icon, btnLabel, onBtn }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FAFAF8", padding: "2rem",
    }}>
      <div style={{
        background: "#fff", border: `1px solid ${COLORS.border}`,
        borderRadius: "22px", padding: "3rem 2.5rem", maxWidth: "420px",
        width: "100%", textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,.07)",
      }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{icon}</div>
        <h2 style={{ fontFamily: FONTS.display, fontSize: "1.5rem", marginBottom: ".75rem" }}>{title}</h2>
        <p style={{ color: COLORS.gray, lineHeight: 1.7, marginBottom: "1.75rem", fontSize: ".93rem" }}>{message}</p>
        <button className="btn-green" style={{ padding: "11px 28px" }} onClick={onBtn}>{btnLabel}</button>
      </div>
    </div>
  );
}