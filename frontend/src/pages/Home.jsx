
import { COLORS, FONTS } from "../theme";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";

const css = `
  .hero {
    background: linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenDark} 60%, ${COLORS.greenDeep} 100%);
    color: #fff;
    padding: 5.5rem 2rem 4.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -40%;
    left: -20%;
    width: 140%;
    height: 200%;
    background: radial-gradient(ellipse, rgba(212,160,23,.12) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-block;
    background: rgba(212,160,23,.18);
    border: 1px solid rgba(212,160,23,.4);
    color: ${COLORS.goldLight};
    font-size: .78rem;
    font-weight: 700;
    padding: 6px 18px;
    border-radius: 20px;
    margin-bottom: 1.5rem;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .hero h1 {
    font-family: ${FONTS.display};
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 1rem;
  }
  .hero h1 em { color: ${COLORS.goldLight}; font-style: normal; }
  .hero p {
    font-size: 1.08rem;
    color: rgba(255,255,255,.8);
    max-width: 540px;
    margin: 0 auto 2.25rem;
    line-height: 1.75;
  }
  .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

  .stats-bar {
    background: #fff;
    border-bottom: 1px solid ${COLORS.border};
    padding: 1.75rem 2rem;
    display: flex;
    justify-content: center;
    gap: 4rem;
    flex-wrap: wrap;
  }
  .stat { text-align: center; }
  .stat-num {
    font-family: ${FONTS.display};
    font-size: 1.9rem;
    font-weight: 700;
    color: ${COLORS.green};
  }
  .stat-label { font-size: .78rem; color: ${COLORS.gray}; font-weight: 500; margin-top: 2px; }

  .home-section { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }

  .features-band { background: #fff; padding: 4rem 2rem; border-top: 1px solid ${COLORS.border}; }
  .features-inner { max-width: 1000px; margin: 0 auto; }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 2rem;
    margin-top: 2.5rem;
  }
  .feature { text-align: center; }
  .feature-icon { font-size: 2.4rem; margin-bottom: .9rem; }
  .feature h4 { font-weight: 700; font-size: 1rem; margin-bottom: .45rem; }
  .feature p { font-size: .88rem; color: ${COLORS.gray}; line-height: 1.65; }
`;

export default function Home({ onNavigate }) {
  const { products } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <style>{css}</style>

      
      <section className="hero">
        <div className="hero-tag">🇰🇪 Kenya's CBC Specialist</div>
        <h1>CBC Learning Materials<br /><em>Delivered to Your Door</em></h1>
        <p>Browse CBC-approved books and stationery. Order online, pay via M-Pesa. No queues, no hassle — delivered anywhere in Kenya.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => onNavigate("shop")}>Shop Now →</button>
          <button className="btn-outline" onClick={() => onNavigate("about")}>Learn More</button>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        {[["500+","CBC Titles"],["12K+","Parents Served"],["48hr","Delivery"],["100%","M-Pesa Secure"]].map(([n,l]) => (
          <div className="stat" key={l}>
            <div className="stat-num">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Featured */}
      <div className="home-section">
        <h2 className="section-title">Featured Books</h2>
        <p className="section-sub">Hand-picked CBC-approved materials for every grade</p>
        <div className="products-grid">
          {featured.map((p) => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
        <div style={{ textAlign:"center", marginTop:"2.5rem" }}>
          <button className="btn-green" onClick={() => onNavigate("shop")}>View All Products →</button>
        </div>
      </div>

      {/* Features */}
      <div className="features-band">
        <div className="features-inner">
          <h2 className="section-title" style={{ textAlign:"center" }}>Why Choose Stasho?</h2>
          <div className="features-grid">
            {[
              { icon:"📱", title:"M-Pesa Payments",       desc:"Secure, instant payments via M-Pesa Express. No bank account needed." },
              { icon:"🚚", title:"Nationwide Delivery",    desc:"We deliver to all 47 counties within 48 hours of order confirmation." },
              { icon:"✅", title:"CBC Approved",           desc:"All materials are approved by KICD and aligned with the CBC curriculum." },
              { icon:"📦", title:"Live Stock Updates",     desc:"Real-time inventory so you always know what's available before you order." },
            ].map((f) => (
              <div className="feature" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}