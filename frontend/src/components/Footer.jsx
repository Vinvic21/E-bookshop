
import { COLORS, FONTS } from "../theme";

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      background: COLORS.greenDeep,
      color: "rgba(255,255,255,.65)",
      padding: "2.5rem 2rem",
      marginTop: "4rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "2rem" }}>
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: "1.4rem", color: "#fff", fontWeight: 700, marginBottom: ".75rem" }}>
            📚 Stasho
          </div>
          <p style={{ fontSize: ".85rem", lineHeight: 1.7 }}>
            Kenya's dedicated CBC learning materials marketplace. Order online, pay via M-Pesa.
          </p>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: ".9rem", fontWeight: 600, marginBottom: ".75rem" }}>Quick Links</h4>
          {[["home","Home"],["shop","Shop"],["about","About"]].map(([p,l]) => (
            <button key={p}
              style={{ display:"block", background:"none", border:"none", color:"rgba(255,255,255,.6)", fontSize:".85rem", cursor:"pointer", padding:"3px 0", transition:"color .2s" }}
              onClick={() => onNavigate(p)}
              onMouseEnter={e => e.target.style.color="#fff"}
              onMouseLeave={e => e.target.style.color="rgba(255,255,255,.6)"}
            >{l}</button>
          ))}
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: ".9rem", fontWeight: 600, marginBottom: ".75rem" }}>Contact</h4>
          <p style={{ fontSize: ".85rem", lineHeight: 1.8 }}>
            📍 Nairobi, Kenya<br />
            📧 hello@stasho.co.ke<br />
            📞 +254 700 000 000
          </p>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: ".9rem", fontWeight: 600, marginBottom: ".75rem" }}>Payment</h4>
          <div style={{ background:"rgba(255,255,255,.08)", borderRadius:"10px", padding:"12px", fontSize:".83rem", lineHeight:1.7 }}>
            📱 M-Pesa Express<br />
            <span style={{ color:"rgba(255,255,255,.5)", fontSize:".78rem" }}>Secure · Instant · Trusted</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,.12)", marginTop:"2rem", paddingTop:"1.25rem", textAlign:"center", fontSize:".8rem" }}>
        © {new Date().getFullYear()} <strong style={{ color:"#fff" }}>Stasho Bookstore</strong> — CBC Materials Specialist · All rights reserved
      </div>
    </footer>
  );
}