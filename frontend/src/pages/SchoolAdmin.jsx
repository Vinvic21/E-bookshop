import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductsContext";
import { useNotifications } from "../context/NotificationContext";
import { apiFetch } from "../api";
import { COLORS, FONTS } from "../theme";

const css = `
  .sa-page { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
  .sa-head h1 { font-family: ${FONTS.display}; font-size: 2rem; color: ${COLORS.greenDeep}; }
  .sa-head p { color: ${COLORS.gray}; margin-top: .4rem; }
  .sa-section { background: #fff; border: 1px solid ${COLORS.border}; border-radius: 14px; padding: 1.5rem; margin: 1.5rem 0; }
  .sa-section h3 { margin-bottom: 1rem; font-size: 1.05rem; }
  .sa-row { display: flex; gap: .8rem; margin-bottom: .8rem; flex-wrap: wrap; }
  .sa-row input, .sa-row select {
    flex: 1; min-width: 160px; padding: 11px 14px; border: 1.5px solid ${COLORS.border};
    border-radius: 10px; font-size: .93rem;
  }
  .sa-btn { padding: 12px 20px; background: ${COLORS.green}; color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
  .sa-btn:hover { background: ${COLORS.greenDark}; }
  .sa-btn-outline { background: #fff; border: 1.5px solid ${COLORS.green}; color: ${COLORS.greenDark}; }
  .sa-item-picker { display: flex; gap: .6rem; align-items: center; margin-bottom: .6rem; }
  .sa-item-picker select { flex: 2; }
  .sa-item-picker input { flex: 1; max-width: 90px; }
  .sa-list { display: flex; flex-direction: column; gap: .5rem; margin: 1rem 0; }
  .sa-list-item { display: flex; justify-content: space-between; align-items: center; background: ${COLORS.greenPale}; border-radius: 8px; padding: .6rem 1rem; font-size: .88rem; }
  .sa-list-item button { background: none; border: none; color: ${COLORS.red}; cursor: pointer; font-size: .85rem; }
`;

export default function SchoolAdmin() {
  const { products } = useProducts();
  const { notify } = useNotifications();
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCounty, setSchoolCounty] = useState("");

  const [schoolId, setSchoolId] = useState("");
  const [grade, setGrade] = useState("");
  const [pickerProduct, setPickerProduct] = useState("");
  const [pickerQty, setPickerQty] = useState(1);
  const [listItems, setListItems] = useState([]);

  const loadSchools = () => apiFetch("/schools", { auth: false }).then(setSchools);
  useEffect(() => { loadSchools(); }, []);

  useEffect(() => {
    if (!schoolId || !grade) { setListItems([]); return; }
    apiFetch(`/schools/${schoolId}/lists/${encodeURIComponent(grade)}`, { auth: false }).then(setListItems);
  }, [schoolId, grade]);

  const addSchool = async () => {
    if (!schoolName) return;
    await apiFetch("/schools", { method: "POST", body: { name: schoolName, county: schoolCounty } });
    setSchoolName(""); setSchoolCounty("");
    loadSchools();
    notify({ type: "order", icon: "🏫", title: "School added", body: `${schoolName} is now available for parents to pick.`, duration: 5000 });
  };

  const addItemToList = () => {
    if (!pickerProduct) return;
    const product = products.find((p) => p.id === Number(pickerProduct));
    if (!product) return;
    const existing = listItems.find((i) => i.id === product.id);
    if (existing) {
      setListItems(listItems.map((i) => i.id === product.id ? { ...i, qty: i.qty + Number(pickerQty) } : i));
    } else {
      setListItems([...listItems, { ...product, qty: Number(pickerQty) }]);
    }
    setPickerProduct(""); setPickerQty(1);
  };

  const removeItem = (id) => setListItems(listItems.filter((i) => i.id !== id));

  const saveList = async () => {
    if (!schoolId || !grade) return;
    await apiFetch(`/schools/${schoolId}/lists/${encodeURIComponent(grade)}`, {
      method: "PUT",
      body: { items: listItems.map((i) => ({ product_id: i.id, qty: i.qty })) },
    });
    notify({ type: "order", icon: "✅", title: "List saved", body: `The ${grade} list for this school is now live.`, duration: 5000 });
  };

  return (
    <>
      <style>{css}</style>
      <div className="sa-page">
        <div className="sa-head">
          <h1>🏫 Manage Schools & Lists</h1>
          <p>Add schools and publish their official book/stationery list per grade — parents see this on the "School Lists" page.</p>
        </div>

        <div className="sa-section">
          <h3>Add a School</h3>
          <div className="sa-row">
            <input placeholder="School name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
            <input placeholder="County" value={schoolCounty} onChange={(e) => setSchoolCounty(e.target.value)} />
            <button className="sa-btn" onClick={addSchool}>Add School</button>
          </div>
        </div>

        <div className="sa-section">
          <h3>Build a Grade's List</h3>
          <div className="sa-row">
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
              <option value="">Select school…</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Grade, e.g. Grade 4" value={grade} onChange={(e) => setGrade(e.target.value)} />
          </div>

          {schoolId && grade && (
            <>
              <div className="sa-item-picker">
                <select value={pickerProduct} onChange={(e) => setPickerProduct(e.target.value)}>
                  <option value="">Select a product to add…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.title} — KSh {p.price}</option>)}
                </select>
                <input type="number" min="1" value={pickerQty} onChange={(e) => setPickerQty(e.target.value)} />
                <button className="sa-btn sa-btn-outline" onClick={addItemToList}>+ Add</button>
              </div>

              <div className="sa-list">
                {listItems.length === 0 && <div style={{ color: COLORS.gray, fontSize: ".88rem" }}>No items yet — add some above.</div>}
                {listItems.map((i) => (
                  <div className="sa-list-item" key={i.id}>
                    <span>{i.img} {i.title} × {i.qty}</span>
                    <button onClick={() => removeItem(i.id)}>Remove</button>
                  </div>
                ))}
              </div>

              <button className="sa-btn" onClick={saveList}>Save List for {grade}</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}