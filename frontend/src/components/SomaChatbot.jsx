












import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";
import { SET_BOOK_IDS, BASIC_STATIONERY_IDS, CBC_KITS } from "../theme";

const QUICK_REPLIES = [
  { id: "setbooks", label: "📚 What are the current high school Set Books?" },
  { id: "grade1",   label: "🎒 Help me find Grade 1 CBC materials" },
  { id: "basics",   label: "✏️ What basic stationery do I need?" },
  { id: "pastelist", label: "📋 Paste my school's book list" },
];

const WELCOME = {
  from: "bot",
  text: "Habari! 👋 I'm Soma, your Stasho shopping assistant. Pick a question below and I'll help you find what you need.",
};

export default function SomaChatbot({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [addedNote, setAddedNote] = useState("");
  const [listMode, setListMode] = useState(false);
  const [listText, setListText] = useState("");
  const [matching, setMatching] = useState(false);
  const { addManyToCart } = useCart();
  const { products } = useProducts();
  const { user } = useAuth();

  const getProducts = (ids) => products.filter((p) => ids.includes(p.id));

  const pushMessages = (newMsgs) => setMessages((prev) => [...prev, ...newMsgs]);

  const handleQuickReply = (id) => {
    const replyLabel = QUICK_REPLIES.find((q) => q.id === id)?.label || "";
    const userMsg = { from: "user", text: replyLabel };

    let botMsg;

    switch (id) {
      case "setbooks": {
        const books = getProducts(SET_BOOK_IDS);
        const names = books.map((b) => b.title.replace("KCSE Set Book: ", "")).join(", ");
        botMsg = {
          from: "bot",
          text: `Here are the current KCSE English & Kiswahili set books we stock: ${names}. Tap below to see them in the shop.`,
          action: {
            label: "📖 View Set Books in Shop",
            type: "filter",
            category: "English",
          },
        };
        break;
      }

      case "grade1": {
        const kit = CBC_KITS["Grade 1"];
        botMsg = {
          from: "bot",
          text: `${kit.label}: ${kit.blurb} It includes Grade 1 Maths, English & Kiswahili books plus plasticine, drawing books, crayons and more — ${kit.productIds.length} items in total. Want me to add the full kit to your cart?`,
          action: {
            label: "🎒 Add Grade 1 Kit to Cart",
            type: "addKit",
            grade: "Grade 1",
          },
        };
        break;
      }

      case "basics": {
        const basics = getProducts(BASIC_STATIONERY_IDS);
        const names = basics.map((b) => b.title).join(", ");
        botMsg = {
          from: "bot",
          text: `Every learner needs the essentials: ${names}. I can add this basic stationery set straight to your cart.`,
          action: {
            label: "✏️ Add Basic Stationery to Cart",
            type: "addList",
            ids: BASIC_STATIONERY_IDS,
          },
        };
        break;
      }

      case "pastelist": {
        botMsg = {
          from: "bot",
          text: "Sure! Paste your school's book list below (one item per line) and I'll match each line to a product we stock.",
        };
        setListMode(true);
        break;
      }

      default:
        botMsg = { from: "bot", text: "Sorry, I didn't catch that. Try one of the options below!" };
    }

    pushMessages([userMsg, botMsg]);
  };

  const submitList = async () => {
    if (!listText.trim()) return;
    if (!user) { pushMessages([{ from: "bot", text: "You'll need to log in first so I can save the matched items to your cart." }]); onNavigate("login"); return; }
    setMatching(true);
    pushMessages([{ from: "user", text: listText }]);
    try {
      const res = await apiFetch("/lists/match", { method: "POST", body: { text: listText } });
      const matchedText = res.matched.length
        ? `I matched ${res.matched.length} item${res.matched.length !== 1 ? "s" : ""}: ${res.matched.map((p) => p.title).join(", ")}.`
        : "I couldn't match any items on that list to our catalog.";
      const unmatchedText = res.unmatched.length ? ` I couldn't find: ${res.unmatched.join(", ")}.` : "";
      pushMessages([{
        from: "bot",
        text: matchedText + unmatchedText,
        action: res.matched.length ? { label: `🛒 Add ${res.matched.length} matched items to cart`, type: "addMatched", products: res.matched } : null,
      }]);
    } catch (e) {
      pushMessages([{ from: "bot", text: `Sorry, I couldn't process that list: ${e.message}` }]);
    } finally {
      setMatching(false);
      setListText("");
      setListMode(false);
    }
  };

  const handleAction = (action) => {
    if (action.type === "filter") {
      onNavigate("shop", { category: action.category });
      setOpen(false);
    } else if (action.type === "addKit") {
      const kit = CBC_KITS[action.grade];
      const items = getProducts(kit.productIds);
      addManyToCart(items);
      setAddedNote(`✅ Added all ${items.length} items from the ${kit.label} to your cart!`);
      pushMessages([{ from: "bot", text: `Done! I've added the ${kit.label} (${items.length} items) to your cart. 🛒` }]);
    } else if (action.type === "addList") {
      const items = getProducts(action.ids);
      addManyToCart(items);
      setAddedNote(`✅ Added ${items.length} basic stationery items to your cart!`);
      pushMessages([{ from: "bot", text: `Added ${items.length} basic stationery items to your cart. ✏️🛒` }]);
    } else if (action.type === "addMatched") {
      addManyToCart(action.products);
      setAddedNote(`✅ Added ${action.products.length} matched items to your cart!`);
      pushMessages([{ from: "bot", text: `Added ${action.products.length} items from your list to the cart. 🛒` }]);
    }
  };

  const restart = () => {
    setMessages([WELCOME]);
    setAddedNote("");
    setListMode(false);
    setListText("");
  };

  return (
    <>
      
      <button className="soma-fab" onClick={() => setOpen((o) => !o)} aria-label="Open Soma chat assistant">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="soma-window fade-in">
          <div className="soma-header">
            <div className="soma-header-title">🤖 Soma — Shop Assistant</div>
            <button className="soma-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="soma-body">
            {messages.map((m, i) => (
              <div className={`soma-msg ${m.from}`} key={i}>
                <div className="soma-avatar">{m.from === "bot" ? "🤖" : "🙂"}</div>
                <div>
                  <div className="soma-bubble">{m.text}</div>
                  {m.action && (
                    <button className="soma-action-btn" onClick={() => handleAction(m.action)}>
                      {m.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {addedNote && (
              <div className="kit-added-toast" style={{ margin: 0 }}>{addedNote}</div>
            )}
          </div>

          <div className="soma-quick">
            {listMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                <textarea
                  value={listText}
                  onChange={(e) => setListText(e.target.value)}
                  placeholder={"e.g.\nCBC Mathematics Grade 4\nExercise books\nGeometry set"}
                  rows={4}
                  style={{ padding: "10px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: ".85rem", resize: "vertical" }}
                />
                <button className="soma-action-btn" onClick={submitList} disabled={matching}>
                  {matching ? "Matching…" : "Match my list"}
                </button>
              </div>
            ) : (
              QUICK_REPLIES.map((q) => (
                <button key={q.id} className="soma-quick-btn" onClick={() => handleQuickReply(q.id)}>
                  {q.label}
                </button>
              ))
            )}
            <span className="soma-restart" onClick={restart}>↻ Restart conversation</span>
          </div>
        </div>
      )}
    </>
  );
}