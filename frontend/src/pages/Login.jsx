




import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS } from "../theme";

const css = `
  .login-page {
    min-height: calc(100vh - 64px);
    background: linear-gradient(145deg, ${COLORS.greenDeep} 0%, ${COLORS.greenDark} 55%, #0F3D22 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }
  .login-box {
    background: #fff;
    border-radius: 22px;
    width: 100%;
    max-width: 440px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,.25);
    animation: fadeIn .4s ease both;
  }
  .login-head {
    background: ${COLORS.green};
    padding: 2rem 2rem 1.5rem;
    text-align: center;
    color: #fff;
  }
  .login-head h1 {
    font-family: ${FONTS.display};
    font-size: 1.7rem;
    margin-bottom: .35rem;
  }
  .login-head p { font-size: .88rem; color: rgba(255,255,255,.75); }
  .login-body { padding: 2rem; }

  
  .role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .role-card {
    border: 2px solid ${COLORS.border};
    border-radius: 14px;
    padding: 1.25rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: border-color .2s, background .2s;
    background: #fff;
  }
  .role-card:hover { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; }
  .role-card.selected { border-color: ${COLORS.green}; background: ${COLORS.greenPale}; }
  .role-icon { font-size: 2.2rem; margin-bottom: .5rem; display: block; }
  .role-title { font-weight: 700; font-size: .95rem; color: #111827; margin-bottom: 4px; }
  .role-hint  { font-size: .73rem; color: ${COLORS.gray}; line-height: 1.4; }

  .form-group { margin-bottom: 1.1rem; }
  .login-btn {
    width: 100%;
    background: ${COLORS.green};
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: .5rem;
    transition: background .2s, transform .15s;
  }
  .login-btn:hover { background: ${COLORS.greenDark}; transform: translateY(-1px); }
  .error-msg {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: .85rem;
    color: ${COLORS.red};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .divider {
    text-align: center;
    color: ${COLORS.gray};
    font-size: .8rem;
    margin: 1.25rem 0;
    position: relative;
  }
  .divider::before, .divider::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 38%;
    height: 1px;
    background: ${COLORS.border};
  }
  .divider::before { left: 0; }
  .divider::after  { right: 0; }
  .demo-creds {
    background: #F0FFF4;
    border: 1px solid #6EE7A8;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: .8rem;
    color: ${COLORS.success};
    line-height: 1.7;
  }
  .signup-link {
    text-align: center;
    margin-top: 1.25rem;
    font-size: .85rem;
    color: ${COLORS.gray};
  }
  .signup-link span {
    color: ${COLORS.green};
    font-weight: 600;
    cursor: pointer;
  }
  .signup-link span:hover { text-decoration: underline; }
`;

export default function Login({ onNavigate }) {
  const { login, signup } = useAuth();
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setName(""); setEmail(""); setPassword("");
  };

  const handleSubmit = async () => {
    setError("");
    if (mode === "signup" && !name) { setError("Please enter your full name."); return; }
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    const result = mode === "signup" ? await signup(name, email, password) : await login(email, password);
    setLoading(false);
    if (result.ok) onNavigate("home");
    else setError(result.error);
  };

  return (
    <>
      <style>{css}</style>
      <div className="login-page">
        <div className="login-box">
          <div className="login-head">
            <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>📚</div>
            <h1>{mode === "signup" ? "Create Account" : "Welcome Back"}</h1>
            <p>{mode === "signup" ? "Sign up for a new Stasho account" : "Sign in to your Stasho account"}</p>
          </div>

          <div className="login-body">

            {error && <div className="error-msg">⚠️ {error}</div>}

            {mode === "signup" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Jane Wanjiku"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="e.g. jane@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button className="login-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? (mode === "signup" ? "Creating account…" : "Signing in…")
                : mode === "signup" ? "Create Account" : "Sign In"}
            </button>

            <div className="signup-link">
              {mode === "login" ? (
                <>Don't have an account? <span onClick={() => switchMode("signup")}>Sign up →</span></>
              ) : (
                <>Already have an account? <span onClick={() => switchMode("login")}>Sign in →</span></>
              )}
            </div>
            <div className="signup-link">
              <span onClick={() => onNavigate("home")}>Shop as guest →</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}