
import { COLORS, FONTS } from "../theme";

const css = `
  .about-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
    animation: fadeIn .4s ease both;
  }
  .about-hero {
    background: linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark});
    color: #fff;
    border-radius: 20px;
    padding: 3rem 2.5rem;
    margin-bottom: 2.5rem;
    text-align: center;
  }
  .about-hero h1 {
    font-family: ${FONTS.display};
    font-size: 2.2rem;
    margin-bottom: .75rem;
  }
  .about-hero p { font-size: 1rem; color: rgba(255,255,255,.82); max-width: 520px; margin: 0 auto; line-height: 1.75; }

  .about-body { display: grid; gap: 1.5rem; }
  .about-card {
    background: #fff;
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 1.75rem;
  }
  .about-card h2 {
    font-family: ${FONTS.display};
    font-size: 1.3rem;
    margin-bottom: .75rem;
    color: ${COLORS.green};
    display: flex;
    align-items: center;
    gap: .5rem;
  }
  .about-card p { color: ${COLORS.gray}; line-height: 1.8; font-size: .95rem; }

  .mission-box {
    background: ${COLORS.greenPale};
    border: 1px solid #6EE7A8;
    border-radius: 14px;
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  .mission-box h3 {
    font-family: ${FONTS.display};
    color: ${COLORS.success};
    margin-bottom: .6rem;
    font-size: 1.15rem;
  }
  .mission-box p { color: #047857; line-height: 1.75; font-size: .93rem; }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  .team-card {
    text-align: center;
    background: ${COLORS.grayLight};
    border-radius: 12px;
    padding: 1.25rem 1rem;
  }
  .team-avatar {
    font-size: 2.5rem;
    margin-bottom: .5rem;
  }
  .team-name { font-weight: 700; font-size: .93rem; }
  .team-role { font-size: .78rem; color: ${COLORS.gray}; }

  .values-list { list-style: none; display: grid; gap: .75rem; margin-top: 1rem; }
  .values-list li {
    display: flex;
    gap: .75rem;
    align-items: flex-start;
    font-size: .92rem;
    color: #374151;
    line-height: 1.6;
  }
  .values-list li span { font-size: 1.2rem; flex-shrink: 0; }
`;

export default function About({ onNavigate }) {
  return (
    <>
      <style>{css}</style>
      <div className="about-page">
        <div className="about-hero">
          <div style={{ fontSize:"3rem", marginBottom:".75rem" }}>📚</div>
          <h1>About Stasho Bookstore</h1>
          <p>Modernizing how Kenyan parents access CBC learning materials — one order at a time.</p>
        </div>

        <div className="about-body">
          
          <div className="about-card">
            <h2>📖 Our Story</h2>
            <p>
              Stasho Bookstore was born from a simple frustration: parents spending hours in queues at bookstores,
              only to find the CBC materials they need are out of stock. With Kenya's Competency-Based Curriculum
              requiring specialized learning resources, we set out to build a better way.
            </p>
            <p style={{ marginTop:".75rem" }}>
              Founded in 2025 and based in Nairobi, Stasho connects parents directly with verified CBC material
              suppliers, enabling online ordering, real-time stock visibility, and M-Pesa payments — all in one place.
            </p>
            <div className="mission-box">
              <h3>Our Mission</h3>
              <p>
                To ensure every Kenyan child has timely, affordable access to the right learning materials —
                regardless of where their parents live or what hours a bookstore is open.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="about-card">
            <h2>💎 Our Values</h2>
            <ul className="values-list">
              <li><span>✅</span> <div><strong>Accessibility</strong> — Every parent, every county, every budget.</div></li>
              <li><span>🛡️</span> <div><strong>Trust</strong> — Only KICD-approved CBC materials on our platform.</div></li>
              <li><span>⚡</span> <div><strong>Efficiency</strong> — From order to doorstep in under 48 hours.</div></li>
              <li><span>🤝</span> <div><strong>Partnership</strong> — We grow when suppliers and parents succeed.</div></li>
            </ul>
          </div>

          {/* Team */}
          <div className="about-card">
            <h2>👥 The Team</h2>
            <div className="team-grid">
              {[
                { avatar:"👨‍💻", name:"Brian Stasho",    role:"Founder & Developer" },
                { avatar:"👩‍🏫", name:"Mrs. Ondiba Ann", role:"Academic Supervisor"  },
                { avatar:"👨‍💼", name:"Logistics Team",  role:"Delivery & Ops"       },
                { avatar:"👩‍💻", name:"Dev Team",         role:"Engineering"          },
              ].map((t) => (
                <div className="team-card" key={t.name}>
                  <div className="team-avatar">{t.avatar}</div>
                  <div className="team-name">{t.name}</div>
                  <div className="team-role">{t.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <p style={{ color:COLORS.gray, marginBottom:"1rem" }}>Ready to make CBC shopping easy?</p>
            <button className="btn-green" onClick={() => onNavigate("shop")}>Start Shopping →</button>
            &nbsp;&nbsp;
            <button className="btn-primary" onClick={() => onNavigate("login")}>Create Account</button>
          </div>
        </div>
      </div>
    </>
  );
}