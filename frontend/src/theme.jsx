// ─── Stasho Design Tokens ───────────────────────────────────────────────────
export const COLORS = {
  green:      "#1B6B3A",
  greenDark:  "#0F4A28",
  greenDeep:  "#0A3320",
  greenPale:  "#E8F5EE",
  greenMid:   "#2E8B57",
  gold:       "#D4A017",
  goldLight:  "#F5C842",
  dark:       "#1A1A1A",
  gray:       "#6B7280",
  grayLight:  "#F3F4F6",
  border:     "#E5E7EB",
  white:      "#FFFFFF",
  red:        "#DC2626",
  amber:      "#F59E0B",
  success:    "#065F46",
  successBg:  "#D1FAE5",
  warning:    "#92400E",
  warningBg:  "#FEF3C7",
};

export const FONTS = {
  display: "'Playfair Display', serif",
  body:    "'DM Sans', sans-serif",
};

// Google Fonts import — add to index.html or inject once
export const FONT_IMPORT =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap";

// ─── Global CSS reset + utility classes ────────────────────────────────────
export const GLOBAL_STYLES = `
  @import url('${FONT_IMPORT}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${FONTS.body}; background: #FAFAF8; color: ${COLORS.dark}; }
  button { font-family: ${FONTS.body}; cursor: pointer; }
  input, select, textarea { font-family: ${FONTS.body}; }
  a { text-decoration: none; color: inherit; }

  /* ── Shared buttons ── */
  .btn-primary {
    background: ${COLORS.gold}; color: #fff; border: none;
    border-radius: 10px; padding: 12px 28px;
    font-size: 1rem; font-weight: 600;
    transition: background .2s, transform .15s;
  }
  .btn-primary:hover { background: #B8880F; transform: translateY(-1px); }

  .btn-green {
    background: ${COLORS.green}; color: #fff; border: none;
    border-radius: 10px; padding: 12px 28px;
    font-size: 1rem; font-weight: 600;
    transition: background .2s;
  }
  .btn-green:hover { background: ${COLORS.greenDark}; }

  .btn-outline {
    background: transparent; color: #fff;
    border: 2px solid rgba(255,255,255,.5);
    border-radius: 10px; padding: 12px 28px;
    font-size: 1rem; font-weight: 600;
    transition: border-color .2s, background .2s;
  }
  .btn-outline:hover { border-color: #fff; background: rgba(255,255,255,.1); }

  .btn-danger {
    background: ${COLORS.red}; color: #fff; border: none;
    border-radius: 8px; padding: 8px 16px;
    font-size: 0.85rem; font-weight: 600;
    transition: opacity .2s;
  }
  .btn-danger:hover { opacity: .85; }

  /* ── Card ── */
  .card {
    background: ${COLORS.white}; border-radius: 16px;
    border: 1px solid ${COLORS.border};
  }

  /* ── Form inputs ── */
  .form-input {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid ${COLORS.border}; border-radius: 10px;
    font-size: .95rem; outline: none;
    transition: border-color .2s; background: #fff;
  }
  .form-input:focus { border-color: ${COLORS.green}; }

  .form-label {
    font-size: .85rem; font-weight: 600;
    color: #374151; margin-bottom: 6px; display: block;
  }

  /* ── Stock badges ── */
  .badge {
    display: inline-block; font-size: .72rem; font-weight: 600;
    padding: 3px 10px; border-radius: 12px;
  }
  .badge-low  { background: ${COLORS.warningBg}; color: ${COLORS.warning}; }
  .badge-ok   { background: ${COLORS.successBg}; color: ${COLORS.success}; }
  .badge-out  { background: #FEE2E2; color: #991B1B; }
  .badge-admin{ background: ${COLORS.warningBg}; color: ${COLORS.warning}; }
  .badge-user { background: ${COLORS.greenPale};  color: ${COLORS.green};   }

  /* ── Section headings ── */
  .section-title {
    font-family: ${FONTS.display}; font-size: 1.8rem;
    font-weight: 700; margin-bottom: .4rem;
  }
  .section-sub { color: ${COLORS.gray}; margin-bottom: 2rem; }

  /* ── Product grid ── */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 1.4rem;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f1f1f1; }
  ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }

  /* ── Animations ── */
  @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes slideIn { from { transform:translateX(100%); }          to { transform:translateX(0); } }
  .fade-in  { animation: fadeIn  .35s ease both; }
  .slide-in { animation: slideIn .3s  ease both; }

  @media (max-width: 640px) {
    .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  }

  /* ── Quick CBC Kits banner ── */
  .kit-banner {
    background: linear-gradient(135deg, ${COLORS.greenPale} 0%, #fff 100%);
    border: 1.5px solid ${COLORS.green};
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    align-items: center;
  }
  .kit-banner-text { flex: 1; min-width: 220px; }
  .kit-banner-title {
    font-family: ${FONTS.display}; font-size: 1.25rem; font-weight: 700;
    color: ${COLORS.greenDark}; margin-bottom: .3rem;
  }
  .kit-banner-sub { font-size: .85rem; color: ${COLORS.gray}; }
  .kit-controls { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
  .kit-select {
    padding: 10px 14px; border: 1.5px solid ${COLORS.green}; border-radius: 10px;
    font-size: .9rem; outline: none; background: #fff; cursor: pointer; min-width: 160px;
  }
  .kit-preview {
    width: 100%; margin-top: 1rem; padding-top: 1rem;
    border-top: 1px dashed ${COLORS.border};
    display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;
  }
  .kit-chip {
    background: #fff; border: 1px solid ${COLORS.border}; border-radius: 20px;
    padding: 5px 12px; font-size: .78rem; color: #374151; display: flex; align-items: center; gap: 6px;
  }
  .kit-total {
    font-weight: 700; color: ${COLORS.green}; font-family: ${FONTS.display}; font-size: 1.1rem;
  }
  .kit-add-btn {
    background: ${COLORS.gold}; color: #fff; border: none; border-radius: 10px;
    padding: 12px 24px; font-size: .92rem; font-weight: 700; cursor: pointer;
    transition: background .2s; white-space: nowrap;
  }
  .kit-add-btn:hover { background: #B8880F; }
  .kit-added-toast {
    background: ${COLORS.successBg}; color: ${COLORS.success};
    border-radius: 8px; padding: 8px 14px; font-size: .82rem; font-weight: 600;
    margin-top: .75rem; width: 100%;
  }

  /* ── Soma chatbot ── */
  .soma-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 250;
    width: 60px; height: 60px; border-radius: 50%;
    background: ${COLORS.green}; color: #fff; border: none;
    font-size: 1.6rem; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(27,107,58,.35);
    cursor: pointer; transition: transform .2s, background .2s;
  }
  .soma-fab:hover { transform: scale(1.06); background: ${COLORS.greenDark}; }

  .soma-window {
    position: fixed; bottom: 96px; right: 24px; z-index: 250;
    width: 340px; max-height: 70vh;
    background: #fff; border-radius: 18px;
    box-shadow: 0 16px 48px rgba(0,0,0,.2);
    border: 1px solid ${COLORS.border};
    display: flex; flex-direction: column; overflow: hidden;
  }
  .soma-header {
    background: ${COLORS.green}; color: #fff; padding: 1rem 1.25rem;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .soma-header-title { display: flex; align-items: center; gap: 8px; font-family: ${FONTS.display}; font-weight: 700; font-size: 1.05rem; }
  .soma-close {
    background: rgba(255,255,255,.18); border: none; color: #fff;
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .soma-close:hover { background: rgba(255,255,255,.3); }
  .soma-body { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }

  .soma-msg { display: flex; gap: 8px; max-width: 100%; }
  .soma-msg.bot  { align-self: flex-start; }
  .soma-msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .soma-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: ${COLORS.greenPale}; display: flex; align-items: center; justify-content: center; font-size: .95rem;
  }
  .soma-bubble {
    padding: 10px 14px; border-radius: 14px; font-size: .87rem; line-height: 1.5;
    max-width: 220px;
  }
  .soma-msg.bot .soma-bubble  { background: ${COLORS.greenPale}; color: #1F2937; border-bottom-left-radius: 4px; }
  .soma-msg.user .soma-bubble { background: ${COLORS.green}; color: #fff; border-bottom-right-radius: 4px; }

  .soma-action-btn {
    margin-top: 6px; background: ${COLORS.gold}; color: #fff; border: none;
    border-radius: 8px; padding: 8px 12px; font-size: .8rem; font-weight: 700;
    cursor: pointer; transition: background .2s; align-self: flex-start;
  }
  .soma-action-btn:hover { background: #B8880F; }

  .soma-quick { display: flex; flex-direction: column; gap: 6px; padding: .75rem 1rem; border-top: 1px solid ${COLORS.border}; flex-shrink: 0; }
  .soma-quick-btn {
    background: #fff; border: 1.5px solid ${COLORS.green}; color: ${COLORS.greenDark};
    border-radius: 10px; padding: 9px 12px; font-size: .82rem; font-weight: 600;
    cursor: pointer; text-align: left; transition: background .2s;
  }
  .soma-quick-btn:hover { background: ${COLORS.greenPale}; }
  .soma-restart {
    text-align: center; font-size: .78rem; color: ${COLORS.gray};
    cursor: pointer; text-decoration: underline; padding: 4px 0 2px;
  }

  @media (max-width: 480px) {
    .soma-window { width: calc(100vw - 24px); right: 12px; bottom: 88px; max-height: 65vh; }
    .soma-fab { right: 16px; bottom: 16px; }
  }

  /* ── M-Pesa STK Push modal ── */
  .stk-screen { text-align: center; padding: 2.5rem 1.5rem; }
  .stk-phone-row { margin-bottom: 1.25rem; }
  .stk-spinner {
    width: 56px; height: 56px; border-radius: 50%;
    border: 5px solid ${COLORS.greenPale}; border-top-color: ${COLORS.green};
    margin: 0 auto 1.25rem; animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .stk-countdown {
    font-family: ${FONTS.display}; font-size: 2.2rem; font-weight: 700;
    color: ${COLORS.green}; margin-bottom: .5rem;
  }
  .stk-status-title { font-family: ${FONTS.display}; font-size: 1.25rem; font-weight: 700; margin-bottom: .5rem; }
  .stk-status-sub { color: ${COLORS.gray}; font-size: .9rem; line-height: 1.6; }
  .mpesa-logo-row {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 1.25rem; font-weight: 700; color: ${COLORS.success};
    font-size: .95rem;
  }

  /* ── QR Code (order tracking) ── */
  .qr-block {
    display: flex; flex-direction: column; align-items: center; gap: .6rem;
    margin: 1.25rem 0;
  }
  .qr-block img {
    width: 140px; height: 140px; border-radius: 12px;
    border: 1.5px solid ${COLORS.border}; padding: 8px; background: #fff;
  }
  .qr-caption { font-size: .78rem; color: ${COLORS.gray}; text-align: center; line-height: 1.5; }

  /* ── Real-time notification toasts ── */
  .notif-stack {
    position: fixed; top: 78px; right: 16px; z-index: 280;
    display: flex; flex-direction: column; gap: 10px;
    width: 300px; pointer-events: none;
  }
  .notif-toast {
    background: #fff; border: 1px solid ${COLORS.border}; border-left: 4px solid ${COLORS.green};
    border-radius: 12px; padding: 12px 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    display: flex; gap: 10px; align-items: flex-start;
    pointer-events: all; animation: slideIn .35s ease both;
  }
  .notif-toast.order   { border-left-color: ${COLORS.gold}; }
  .notif-toast.stock   { border-left-color: ${COLORS.warning}; }
  .notif-toast.social  { border-left-color: ${COLORS.greenMid}; }
  .notif-icon { font-size: 1.3rem; flex-shrink: 0; line-height: 1; }
  .notif-text { flex: 1; }
  .notif-title { font-size: .85rem; font-weight: 700; margin-bottom: 2px; }
  .notif-body  { font-size: .78rem; color: ${COLORS.gray}; line-height: 1.45; }
  .notif-dismiss {
    background: none; border: none; color: ${COLORS.gray}; cursor: pointer;
    font-size: .9rem; line-height: 1; flex-shrink: 0; padding: 2px;
  }
  .notif-dismiss:hover { color: #374151; }

  @media (max-width: 480px) {
    .notif-stack { right: 8px; left: 8px; width: auto; top: 72px; }
  }

  /* ── Dark mode toggle ── */
  .theme-toggle-btn {
    background: rgba(255,255,255,.15); color: #fff;
    border: 1px solid rgba(255,255,255,.3); border-radius: 8px;
    width: 36px; height: 32px; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s;
  }
  .theme-toggle-btn:hover { background: rgba(255,255,255,.28); }

  /* ════════════════════════════════════════════════════════════════════════
     DARK MODE OVERRIDES
     Toggled via <html data-theme="dark">. Re-skins surfaces while leaving
     brand accent colors (green/gold) intact for both themes.
     ════════════════════════════════════════════════════════════════════════ */
  [data-theme="dark"] body {
    background: #14181B;
    color: #ECEDEE;
  }
  [data-theme="dark"] .card,
  [data-theme="dark"] .product-card,
  [data-theme="dark"] .co-box,
  [data-theme="dark"] .cart-panel,
  [data-theme="dark"] .soma-window,
  [data-theme="dark"] .notif-toast,
  [data-theme="dark"] .kit-banner,
  [data-theme="dark"] .product-img {
    background: #1E2428;
    border-color: #2E363B;
    color: #ECEDEE;
  }
  [data-theme="dark"] .product-img,
  [data-theme="dark"] .ci-img,
  [data-theme="dark"] .soma-avatar {
    background: #243038;
  }
  [data-theme="dark"] .kit-banner {
    background: linear-gradient(135deg, #1B2A22 0%, #1E2428 100%);
  }
  [data-theme="dark"] .product-title,
  [data-theme="dark"] .section-title,
  [data-theme="dark"] .ci-title,
  [data-theme="dark"] .stk-status-title,
  [data-theme="dark"] .success-screen h2,
  [data-theme="dark"] .kit-banner-title {
    color: #F5F7F8;
  }
  [data-theme="dark"] .product-meta,
  [data-theme="dark"] .section-sub,
  [data-theme="dark"] .result-count,
  [data-theme="dark"] .ci-sub,
  [data-theme="dark"] .notif-body,
  [data-theme="dark"] .stk-status-sub,
  [data-theme="dark"] .empty-cart,
  [data-theme="dark"] .empty-state,
  [data-theme="dark"] .kit-banner-sub,
  [data-theme="dark"] .soma-restart {
    color: #9CA8AF;
  }
  [data-theme="dark"] .form-input,
  [data-theme="dark"] .filter-select,
  [data-theme="dark"] .kit-select,
  [data-theme="dark"] .search-wrap input,
  [data-theme="dark"] .chip,
  [data-theme="dark"] .qty-btn,
  [data-theme="dark"] .kit-chip,
  [data-theme="dark"] .soma-quick-btn {
    background: #1E2428;
    border-color: #2E363B;
    color: #ECEDEE;
  }
  [data-theme="dark"] .chip.active {
    background: ${COLORS.green}; color: #fff; border-color: ${COLORS.green};
  }
  [data-theme="dark"] .soma-msg.bot .soma-bubble {
    background: #243038; color: #ECEDEE;
  }
  [data-theme="dark"] .cart-footer,
  [data-theme="dark"] .cart-total,
  [data-theme="dark"] .cart-item,
  [data-theme="dark"] .kit-preview {
    border-color: #2E363B;
  }
  [data-theme="dark"] .cart-summary,
  [data-theme="dark"] .form-label {
    color: #9CA8AF;
  }
  [data-theme="dark"] .badge-ok    { background: #0F2E22; color: #6EE7A8; }
  [data-theme="dark"] .badge-low   { background: #3A2E10; color: ${COLORS.goldLight}; }
  [data-theme="dark"] .badge-out   { background: #3A1313; color: #FCA5A5; }
  [data-theme="dark"] .in-cart-badge,
  [data-theme="dark"] .badge-user  { background: #0F2E22; color: #6EE7A8; }
  [data-theme="dark"] .kit-added-toast { background: #0F2E22; color: #6EE7A8; }
  [data-theme="dark"] .mpesa-note  { background: #0F2E22; border-color: #1F4A36; color: #6EE7A8; }
  [data-theme="dark"] ::-webkit-scrollbar-track { background: #1E2428; }
  [data-theme="dark"] ::-webkit-scrollbar-thumb { background: #3A444B; }
  [data-theme="dark"] .qr-block img { background: #fff; } /* QR needs light bg to stay scannable */
`;

// ─── Seed products (used as initial state) ──────────────────────────────────
export const SEED_PRODUCTS = [
  { id:1,  title:"CBC Mathematics Grade 4",       grade:"Grade 4", price:450,  category:"Mathematics",   stock:25, img:"📐", publisher:"KICD"     },
  { id:2,  title:"English Activity Book Grade 3",  grade:"Grade 3", price:380,  category:"English",       stock:15, img:"📖", publisher:"Oxford"    },
  { id:3,  title:"Kiswahili Darasa la 5",          grade:"Grade 5", price:420,  category:"Kiswahili",     stock:30, img:"📚", publisher:"KICD"      },
  { id:4,  title:"Science & Technology Grade 6",   grade:"Grade 6", price:510,  category:"Science",       stock:8,  img:"🔬", publisher:"Longhorn"  },
  { id:5,  title:"Social Studies Grade 2",         grade:"Grade 2", price:350,  category:"Social Studies",stock:20, img:"🌍", publisher:"Oxford"    },
  { id:6,  title:"Creative Arts Grade 5",          grade:"Grade 5", price:390,  category:"Arts",          stock:12, img:"🎨", publisher:"KICD"      },
  { id:7,  title:"Hygiene & Nutrition Grade 4",    grade:"Grade 4", price:330,  category:"Health",        stock:18, img:"💊", publisher:"Longhorn"  },
  { id:8,  title:"Mathematics Grade 7 (JSS)",      grade:"Grade 7", price:580,  category:"Mathematics",   stock:22, img:"📐", publisher:"KICD"      },
  { id:101,title:"Exercise Books (10 Pack)",        grade:"",        price:200,  category:"Stationery",    stock:50, img:"📓", publisher:""          },
  { id:102,title:"Geometry Set",                   grade:"",        price:250,  category:"Stationery",    stock:35, img:"📏", publisher:""          },
  { id:103,title:"Coloring Pencils (24 Set)",       grade:"",        price:350,  category:"Stationery",    stock:28, img:"✏️", publisher:""         },
  { id:104,title:"School Bag (Junior)",             grade:"",        price:1800, category:"Stationery",    stock:10, img:"🎒", publisher:""          },
  { id:105,title:"Plasticine (10 Colours)",         grade:"",        price:180,  category:"Stationery",    stock:40, img:"🧱", publisher:""          },
  { id:106,title:"Drawing Book A4",                  grade:"",        price:150,  category:"Stationery",    stock:45, img:"🖍️", publisher:""         },
  { id:107,title:"Crayons (12 Set)",                 grade:"",        price:200,  category:"Stationery",    stock:38, img:"🖌️", publisher:""         },
  { id:108,title:"Manila Paper (10 Sheets)",         grade:"",        price:120,  category:"Stationery",    stock:60, img:"📄", publisher:""          },
  { id:109,title:"Pencils (HB, Pack of 6)",          grade:"",        price:90,   category:"Stationery",    stock:80, img:"✏️", publisher:""         },
  { id:110,title:"Ruler (30cm)",                     grade:"",        price:50,   category:"Stationery",    stock:70, img:"📏", publisher:""          },
  { id:111,title:"Eraser & Sharpener Set",           grade:"",        price:70,   category:"Stationery",    stock:65, img:"🩹", publisher:""          },
  { id:112,title:"Counters & Number Cards Set",      grade:"",        price:280,  category:"Stationery",    stock:25, img:"🔢", publisher:""          },
  { id:113,title:"Story Book Collection (Grade 1)",  grade:"Grade 1", price:320,  category:"English",       stock:20, img:"📖", publisher:"Longhorn"  },
  { id:201,title:"CBC Mathematics Grade 1",          grade:"Grade 1", price:380,  category:"Mathematics",   stock:30, img:"📐", publisher:"KICD"      },
  { id:202,title:"English Activity Book Grade 1",    grade:"Grade 1", price:350,  category:"English",       stock:26, img:"📖", publisher:"Oxford"    },
  { id:203,title:"Kiswahili Darasa la 1",            grade:"Grade 1", price:350,  category:"Kiswahili",     stock:24, img:"📚", publisher:"KICD"      },
  { id:301,title:"KCSE Set Book: The River and the Source", grade:"", price:650, category:"English",        stock:14, img:"📕", publisher:"East African Educational Publishers" },
  { id:302,title:"KCSE Set Book: A Doll's House",            grade:"", price:600, category:"English",        stock:12, img:"📗", publisher:"Heinemann" },
  { id:303,title:"KCSE Set Book: Inheritance",               grade:"", price:580, category:"English",        stock:10, img:"📘", publisher:"Target Publications" },
  { id:304,title:"KCSE Set Book: Fasihi Simulizi (Kiswahili)", grade:"", price:560, category:"Kiswahili",     stock:11, img:"📙", publisher:"KLB" },
];

// ─── Quick CBC Kits ─────────────────────────────────────────────────────────
// Each kit maps a grade to a curated list of product IDs from SEED_PRODUCTS.
// Used by the "Quick CBC Kits" banner on the Shop page and by Soma the chatbot.
export const CBC_KITS = {
  "Grade 1": {
    label: "Grade 1 Starter Kit",
    blurb: "Everything a Grade 1 learner needs to start the term.",
    productIds: [201, 202, 203, 105, 106, 107, 108, 109, 110, 111, 112, 104],
  },
  "Grade 2": {
    label: "Grade 2 Essentials Kit",
    blurb: "Core CBC books plus the stationery basics for Grade 2.",
    productIds: [5, 109, 110, 111, 101, 102, 106, 107, 104],
  },
  "Grade 3": {
    label: "Grade 3 Essentials Kit",
    blurb: "Core CBC books plus the stationery basics for Grade 3.",
    productIds: [2, 101, 102, 103, 109, 110, 111, 104],
  },
  "Grade 4": {
    label: "Grade 4 Essentials Kit",
    blurb: "Maths, Hygiene & Nutrition books with full stationery set.",
    productIds: [1, 7, 101, 102, 103, 109, 110, 111],
  },
  "Grade 5": {
    label: "Grade 5 Essentials Kit",
    blurb: "Kiswahili & Creative Arts books with full stationery set.",
    productIds: [3, 6, 101, 102, 103, 109, 110, 111],
  },
  "Grade 6": {
    label: "Grade 6 Essentials Kit",
    blurb: "Science & Technology book with full stationery set.",
    productIds: [4, 101, 102, 103, 109, 110, 111],
  },
  "Grade 7": {
    label: "Grade 7 (JSS) Essentials Kit",
    blurb: "JSS Mathematics with full stationery set for the new term.",
    productIds: [8, 101, 102, 103, 109, 110, 111],
  },
};

// ─── KCSE Set Books (used by Soma the chatbot) ──────────────────────────────
export const SET_BOOK_IDS = [301, 302, 303, 304];

// ─── Basic stationery starter pack (used by Soma the chatbot) ──────────────
export const BASIC_STATIONERY_IDS = [101, 102, 103, 109, 110, 111];

export const CATEGORIES = ["All","Mathematics","English","Kiswahili","Science","Social Studies","Arts","Health","Stationery"];
export const GRADES     = ["All Grades","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"];

// ─── Mock credentials ────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id:1, name:"Admin User",   email:"admin@stasho.co.ke",  password:"admin123",  role:"admin" },
  { id:2, name:"Jane Wanjiku", email:"jane@gmail.com",       password:"user123",   role:"user"  },
];