import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .an-page { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
  .an-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .an-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .an-table { width: 100%; border-collapse: collapse; margin-top: 2rem; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid ${COLORS.border}; }
  .an-table th { text-align: left; background: ${COLORS.greenPale}; color: ${COLORS.greenDark}; padding: 12px 16px; font-size: .82rem; text-transform: uppercase; letter-spacing: .03em; }
  .an-table td { padding: 12px 16px; border-top: 1px solid ${COLORS.border}; font-size: .93rem; }
  .an-bar-bg { background: ${COLORS.grayLight}; border-radius: 6px; height: 8px; width: 100%; overflow: hidden; }
  .an-bar-fill { background: ${COLORS.green}; height: 100%; }
  .an-empty { text-align: center; padding: 3rem; color: ${COLORS.gray}; }
`;

export default function AdminAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => { apiFetch("/analytics/demand").then(setData); }, []);

  const maxQty = Math.max(1, ...data.map((d) => d.qty_sold));
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <>
      <style>{css}</style>
      <div className="an-page">
        <div className="an-head">
          <h1>📊 Demand Insights</h1>
          <p>What parents are actually buying — {data.length} products sold, KSh {totalRevenue.toLocaleString()} in tracked revenue.</p>
        </div>

        {data.length === 0 ? (
          <div className="an-empty">No paid orders yet — insights will appear here once sales come in.</div>
        ) : (
          <table className="an-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Grade</th><th>Units Sold</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{d.title}</td>
                  <td>{d.category}</td>
                  <td>{d.grade || "—"}</td>
                  <td style={{ minWidth: 140 }}>
                    <div>{d.qty_sold}</div>
                    <div className="an-bar-bg"><div className="an-bar-fill" style={{ width: `${(d.qty_sold / maxQty) * 100}%` }} /></div>
                  </td>
                  <td>KSh {d.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
