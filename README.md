# Stasho Bookstore — Full Stack

React frontend + Flask/SQLite backend, with real M-Pesa Daraja (sandbox) STK push.

## Backend

```
cd backend
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5000. Creates `stasho.db` on first run (delete it to
reset/reseed), with the demo catalog and two accounts:

- admin@stasho.co.ke / admin123 (admin)
- jane@gmail.com / user123 (user)

### M-Pesa setup

`app.py` already contains your Daraja **Consumer Key/Secret** as defaults.
Your app's Short Code and Passkey were "N/A", so it falls back to
Safaricom's shared **sandbox** test Short Code (`174379`) and public test
Passkey — fine for testing, but STK pushes only work against Safaricom's
official sandbox test phone numbers/PINs, not real numbers.

To override any value without editing code, set environment variables
before running `python app.py`:

```
export MPESA_CONSUMER_KEY=...
export MPESA_CONSUMER_SECRET=...
export MPESA_SHORTCODE=...
export MPESA_PASSKEY=...
export MPESA_CALLBACK_URL=https://<your-ngrok-id>.ngrok-free.app/api/mpesa/callback
```

`MPESA_CALLBACK_URL` must be a public HTTPS URL (e.g. via `ngrok http 5000`)
for Safaricom's sandbox to reach it — otherwise it's fine to leave the
default, since the frontend also **polls** `/api/mpesa/status/<id>` every
few seconds and doesn't strictly depend on the callback arriving.

Remember: these are sandbox credentials for testing. Rotate/replace them
with your production Daraja app credentials before going live.

## Frontend

```
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173 and talks to the backend at
`http://localhost:5000/api` (override with `VITE_API_URL`, see `.env.example`).

## What changed in this update

- **Cart now requires login.** "Add to cart" (product cards and CBC kit
  banner) redirects to the login page if no one is signed in.
- **Cart is persisted server-side per account** (`carts` table). Add items,
  log out, log back in (even on another device) — your cart is still there.
  Logging out only clears the cart from view, not from your account.
- **Demo credentials and the role picker were removed from the login page.**
  It's now a plain sign in / sign up form.
- **Checkout now sends a real M-Pesa STK push** via Safaricom's Daraja API
  (`/api/mpesa/stkpush`), instead of a simulated 4-second timer. The
  frontend polls `/api/mpesa/status/<checkout_id>` until Safaricom reports
  the payment as paid/failed, or times out after 60 seconds.
- Stock is decremented once the STK push is successfully sent (order marked
  "pending" until payment confirms).

## Investor-pitch features added

1. **School shopping lists** (`/api/schools`, page: "School Lists") — pick a school + grade, add the whole official list to cart in one click. Two demo schools/lists are seeded; admins can publish more via `PUT /api/schools/<id>/lists/<grade>`.
2. **Lipa Mdogo Mdogo installments** — checkout now offers "Pay in Full" or split into 2–4 M-Pesa charges. Each installment is a real STK push; `pay-next` triggers the next one. There's no automatic reminder/scheduler yet (no cron in this simple app) — paying the next installment is a manual action for now.
3. **School Fund savings** (page: "Savings") — parents set a goal and deposit via M-Pesa STK push; balance grows on confirmed payment.
4. **USSD channel** (`POST /api/ussd`) — implements Africa's Talking's callback format (session-based menu: check order, check savings, deposit). **This needs an Africa's Talking account and a leased/sandbox USSD code to actually dial** — the code is complete and ready, but I can't provision a real USSD number for you. Point their dashboard's callback URL at this endpoint (via ngrok in dev).
5. **B2B school lists** are the same data model as #1 — schools are first-class, admin-manageable.
6. **Buyback/resale marketplace** (page: "Resell") — parents list used books, browse others' listings, mark sold. No payment integration on resale yet — it's a listings board, buyer/seller arrange payment themselves.
7. **Demand analytics** (page: "Insights", admin only) — aggregates paid-order line items into units sold/revenue per product.
8. **Smarter Soma chatbot** — "📋 Paste my school's book list" lets a parent paste a plain-text list; the backend does keyword matching against the product catalog and offers to add matched items to cart. There's also `POST /api/lists/match-image` for photographed lists, but it requires `pytesseract` **and** the `tesseract-ocr` system package installed (`sudo apt install tesseract-ocr` on Linux) — without that it returns a clear "not installed" error rather than failing silently.

None of this touches the existing shop/cart/login flow — it's additive.
