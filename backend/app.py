import os
import re
import json
import sqlite3
import random
import string
import base64
from datetime import datetime
from functools import wraps

import requests
from flask import Flask, g, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "stasho.db")
SECRET_KEY = "stasho-dev-secret-change-me"

# ── M-Pesa Daraja (sandbox) config ──────────────────────────────────────────
# Consumer key/secret belong to your Daraja app. Shortcode/Passkey below are
# Safaricom's shared public sandbox test values (used whenever an app's own
# Short Code/Passkey shows "N/A") — replace with your own once Safaricom
# issues you dedicated ones, and with production values when you go live.
MPESA_BASE_URL = os.environ.get("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
MPESA_CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY", "6duGzrokrKmsoLW8GGKBAADnC0DoC39D5NNsY2AjG4oo4Xv2")
MPESA_CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET", "as49cbgyvL5H0rO5ljrLNEpXTf9tvM29uIS7q8IZ77ADPLAwpEue10A3S2Ragb1n")
MPESA_SHORTCODE = os.environ.get("MPESA_SHORTCODE", "174379")
MPESA_PASSKEY = os.environ.get("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")
MPESA_CALLBACK_URL = os.environ.get("MPESA_CALLBACK_URL", "https://example.com/api/mpesa/callback")

app = Flask(__name__)
serializer = URLSafeTimedSerializer(SECRET_KEY)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


@app.route("/api/<path:_p>", methods=["OPTIONS"])
def cors_preflight(_p):
    return "", 204

SEED_PRODUCTS = [
    (1, "CBC Mathematics Grade 4", "Mathematics", "Grade 4", 450, 25, "KICD", "📐"),
    (2, "English Activity Book Grade 3", "English", "Grade 3", 380, 15, "Oxford", "📖"),
    (3, "Kiswahili Darasa la 5", "Kiswahili", "Grade 5", 420, 30, "KICD", "📚"),
    (4, "Science & Technology Grade 6", "Science", "Grade 6", 510, 8, "Longhorn", "🔬"),
    (5, "Social Studies Grade 2", "Social Studies", "Grade 2", 350, 20, "Oxford", "🌍"),
    (6, "Creative Arts Grade 5", "Arts", "Grade 5", 390, 12, "KICD", "🎨"),
    (7, "Hygiene & Nutrition Grade 4", "Health", "Grade 4", 330, 18, "Longhorn", "💊"),
    (8, "Mathematics Grade 7 (JSS)", "Mathematics", "Grade 7", 580, 22, "KICD", "📐"),
    (101, "Exercise Books (10 Pack)", "Stationery", "", 200, 50, "", "📓"),
    (102, "Geometry Set", "Stationery", "", 250, 35, "", "📏"),
    (103, "Coloring Pencils (24 Set)", "Stationery", "", 350, 28, "", "✏️"),
    (104, "School Bag (Junior)", "Stationery", "", 1800, 10, "", "🎒"),
    (105, "Plasticine (10 Colours)", "Stationery", "", 180, 40, "", "🧱"),
    (106, "Drawing Book A4", "Stationery", "", 150, 45, "", "🖍️"),
    (107, "Crayons (12 Set)", "Stationery", "", 200, 38, "", "🖌️"),
    (108, "Manila Paper (10 Sheets)", "Stationery", "", 120, 60, "", "📄"),
    (109, "Pencils (HB, Pack of 6)", "Stationery", "", 90, 80, "", "✏️"),
    (110, "Ruler (30cm)", "Stationery", "", 50, 70, "", "📏"),
    (111, "Eraser & Sharpener Set", "Stationery", "", 70, 65, "", "🩹"),
    (112, "Counters & Number Cards Set", "Stationery", "", 280, 25, "", "🔢"),
    (113, "Story Book Collection (Grade 1)", "English", "Grade 1", 320, 20, "Longhorn", "📖"),
    (201, "CBC Mathematics Grade 1", "Mathematics", "Grade 1", 380, 30, "KICD", "📐"),
    (202, "English Activity Book Grade 1", "English", "Grade 1", 350, 26, "Oxford", "📖"),
    (203, "Kiswahili Darasa la 1", "Kiswahili", "Grade 1", 350, 24, "KICD", "📚"),
    (301, "KCSE Set Book: The River and the Source", "English", "", 650, 14, "East African Educational Publishers", "📕"),
    (302, "KCSE Set Book: A Doll's House", "English", "", 600, 12, "Heinemann", "📗"),
    (303, "KCSE Set Book: Inheritance", "English", "", 580, 10, "Target Publications", "📘"),
    (304, "KCSE Set Book: Fasihi Simulizi (Kiswahili)", "Kiswahili", "", 560, 11, "KLB", "📙"),
]

SEED_USERS = [
    ("Admin User", "admin@stasho.co.ke", "admin123", "admin"),
    ("Jane Wanjiku", "jane@gmail.com", "user123", "user"),
]


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    fresh = not os.path.exists(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        grade TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        publisher TEXT,
        img TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        name TEXT,
        phone TEXT,
        address TEXT,
        total REAL,
        items TEXT,
        status TEXT DEFAULT 'pending',
        mpesa_checkout_id TEXT,
        mpesa_merchant_id TEXT,
        created_at TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS carts (
        user_id INTEGER PRIMARY KEY,
        items TEXT NOT NULL DEFAULT '[]'
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        county TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS school_list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        grade TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL DEFAULT 1
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS installment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        total REAL NOT NULL,
        num_installments INTEGER NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS installment_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        seq INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'due',
        mpesa_checkout_id TEXT,
        paid_at TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS savings (
        user_id INTEGER PRIMARY KEY,
        balance REAL NOT NULL DEFAULT 0,
        goal_amount REAL DEFAULT 0,
        goal_label TEXT DEFAULT ''
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS savings_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        mpesa_checkout_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS resale_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        grade TEXT,
        condition TEXT,
        price REAL NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS resale_threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        buyer_id INTEGER NOT NULL,
        UNIQUE(listing_id, buyer_id)
    )""")
    cur.execute("""CREATE TABLE IF NOT EXISTS resale_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT
    )""")
    conn.commit()

    existing_user_cols = [r[1] for r in cur.execute("PRAGMA table_info(users)").fetchall()]
    if "phone" not in existing_user_cols:
        cur.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        conn.commit()

    existing_order_cols = [r[1] for r in cur.execute("PRAGMA table_info(orders)").fetchall()]
    if "delivery_status" not in existing_order_cols:
        cur.execute("ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'pending'")
        conn.commit()

    if fresh:
        for name, email, password, role in SEED_USERS:
            cur.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
                (name, email, generate_password_hash(password), role),
            )
        for row in SEED_PRODUCTS:
            cur.execute(
                "INSERT INTO products (id, title, category, grade, price, stock, publisher, img) VALUES (?,?,?,?,?,?,?,?)",
                row,
            )
        cur.execute("INSERT INTO schools (id, name, county) VALUES (1, 'Greenview Primary School', 'Nairobi')")
        cur.execute("INSERT INTO schools (id, name, county) VALUES (2, 'Riverside Academy', 'Kiambu')")
        for school_id, grade, product_id, qty in [
            (1, "Grade 4", 1, 1), (1, "Grade 4", 101, 1), (1, "Grade 4", 102, 1), (1, "Grade 4", 109, 2),
            (1, "Grade 1", 201, 1), (1, "Grade 1", 202, 1), (1, "Grade 1", 203, 1), (1, "Grade 1", 106, 1),
            (2, "Grade 6", 4, 1), (2, "Grade 6", 108, 1), (2, "Grade 6", 110, 1), (2, "Grade 6", 111, 1),
        ]:
            cur.execute(
                "INSERT INTO school_list_items (school_id, grade, product_id, qty) VALUES (?,?,?,?)",
                (school_id, grade, product_id, qty),
            )
        conn.commit()
    conn.close()


def user_to_json(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"], "phone": row["phone"] if "phone" in row.keys() else None}


def product_to_json(row):
    return {
        "id": row["id"], "title": row["title"], "category": row["category"],
        "grade": row["grade"] or "", "price": row["price"], "stock": row["stock"],
        "publisher": row["publisher"] or "", "img": row["img"] or "📦",
    }


def make_token(user_id):
    return serializer.dumps({"uid": user_id})


def current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    try:
        data = serializer.loads(token, max_age=60 * 60 * 24 * 7)
    except BadSignature:
        return None
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (data["uid"],)).fetchone()
    return row


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "Authentication required."}), 401
        return f(user, *args, **kwargs)
    return wrapper


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "Authentication required."}), 401
        if user["role"] != "admin":
            return jsonify({"error": "Admin access required."}), 403
        return f(user, *args, **kwargs)
    return wrapper


# ── M-Pesa helpers ───────────────────────────────────────────────────────────
# MOCK MODE: while Safaricom credentials are unresolved, set MPESA_MOCK_MODE=true
# (it's the default) so checkout / installments / savings all work end-to-end
# using a fake, always-succeeds STK flow instead of calling Safaricom at all.
# Flip it to "false" once real credentials are confirmed working via curl.
MPESA_MOCK_MODE = os.environ.get("MPESA_MOCK_MODE", "true").lower() == "true"
MOCK_CONFIRM_DELAY_SECONDS = int(os.environ.get("MPESA_MOCK_DELAY", "5"))
_mock_checkouts = {}


def normalize_phone(phone):
    p = re.sub(r"\D", "", phone or "")
    if p.startswith("254"):
        return p
    if p.startswith("0"):
        return "254" + p[1:]
    if p.startswith("7") or p.startswith("1"):
        return "254" + p
    return p


def get_mpesa_token():
    resp = requests.get(
        f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
        auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET),
        timeout=15,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Safaricom rejected the Consumer Key/Secret ({resp.status_code}): {resp.text}")
    return resp.json()["access_token"]


def mpesa_password(timestamp):
    raw = f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
    return base64.b64encode(raw.encode()).decode()


def initiate_stk(phone, amount, account_ref, description):
    if MPESA_MOCK_MODE:
        checkout_id = "MOCK" + "".join(random.choices(string.digits, k=10))
        _mock_checkouts[checkout_id] = datetime.now()
        return checkout_id, "MOCK-MERCHANT"

    token = get_mpesa_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": mpesa_password(timestamp),
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(round(amount)),
        "PartyA": phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": account_ref,
        "TransactionDesc": description,
    }
    r = requests.post(
        f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
        json=payload, headers={"Authorization": f"Bearer {token}"}, timeout=20,
    )
    res = r.json()
    checkout_id = res.get("CheckoutRequestID")
    if not checkout_id:
        raise RuntimeError(res.get("errorMessage") or res.get("ResponseDescription") or "STK push failed.")
    return checkout_id, res.get("MerchantRequestID")


def query_stk_result(checkout_id):
    if MPESA_MOCK_MODE or checkout_id.startswith("MOCK"):
        started = _mock_checkouts.get(checkout_id)
        if started and (datetime.now() - started).total_seconds() >= MOCK_CONFIRM_DELAY_SECONDS:
            return {"ResultCode": "0", "ResultDesc": "Mock payment confirmed."}
        return {"ResultCode": "1032", "ResultDesc": "Request is still being processed (mock)."}

    token = get_mpesa_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": mpesa_password(timestamp),
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_id,
    }
    r = requests.post(
        f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
        json=payload, headers={"Authorization": f"Bearer {token}"}, timeout=15,
    )
    return r.json()


@app.post("/api/auth/signup")
def signup():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = normalize_phone(data.get("phone", "")) if data.get("phone") else None
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required."}), 400
    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "An account with that email already exists."}), 409
    cur = db.execute(
        "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?,?,?,?,?)",
        (name, email, generate_password_hash(password), "user", phone),
    )
    db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify({"token": make_token(user["id"]), "user": user_to_json(user)}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401
    return jsonify({"token": make_token(user["id"]), "user": user_to_json(user)})


@app.get("/api/auth/me")
@login_required
def me(user):
    return jsonify({"user": user_to_json(user)})


@app.get("/api/products")
def list_products():
    db = get_db()
    rows = db.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
    return jsonify([product_to_json(r) for r in rows])


@app.post("/api/products")
@admin_required
def create_product(user):
    data = request.get_json(force=True) or {}
    if not data.get("title") or data.get("price") is None or data.get("stock") is None:
        return jsonify({"error": "Title, price, and stock are required."}), 400
    db = get_db()
    cur = db.execute(
        "INSERT INTO products (title, category, grade, price, stock, publisher, img) VALUES (?,?,?,?,?,?,?)",
        (data["title"], data.get("category", ""), data.get("grade", ""),
         float(data["price"]), int(data["stock"]), data.get("publisher", ""), data.get("img", "📦")),
    )
    db.commit()
    row = db.execute("SELECT * FROM products WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(product_to_json(row)), 201


@app.put("/api/products/<int:product_id>")
@admin_required
def update_product(user, product_id):
    db = get_db()
    row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        return jsonify({"error": "Product not found."}), 404
    data = request.get_json(force=True) or {}
    updated = {
        "title": data.get("title", row["title"]),
        "category": data.get("category", row["category"]),
        "grade": data.get("grade", row["grade"]),
        "price": float(data.get("price", row["price"])),
        "stock": int(data.get("stock", row["stock"])),
        "publisher": data.get("publisher", row["publisher"]),
        "img": data.get("img", row["img"]),
    }
    db.execute(
        "UPDATE products SET title=?, category=?, grade=?, price=?, stock=?, publisher=?, img=? WHERE id=?",
        (*updated.values(), product_id),
    )
    db.commit()
    row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    return jsonify(product_to_json(row))


@app.delete("/api/products/<int:product_id>")
@admin_required
def delete_product(user, product_id):
    db = get_db()
    db.execute("DELETE FROM products WHERE id = ?", (product_id,))
    db.commit()
    return jsonify({"ok": True})


# ── Cart (persisted per account so it survives logout/login) ───────────────
@app.get("/api/cart")
@login_required
def get_cart(user):
    db = get_db()
    row = db.execute("SELECT items FROM carts WHERE user_id = ?", (user["id"],)).fetchone()
    return jsonify(json.loads(row["items"]) if row else [])


@app.put("/api/cart")
@login_required
def save_cart(user):
    data = request.get_json(force=True) or {}
    items = data.get("items", [])
    db = get_db()
    db.execute(
        "INSERT INTO carts (user_id, items) VALUES (?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET items = excluded.items",
        (user["id"], json.dumps(items)),
    )
    db.commit()
    return jsonify({"ok": True})


# ── Orders + M-Pesa STK push ─────────────────────────────────────────────────
@app.post("/api/mpesa/stkpush")
@login_required
def mpesa_stkpush(user):
    data = request.get_json(force=True) or {}
    items = data.get("items") or []
    name = data.get("name", user["name"])
    phone_raw = data.get("phone", "")
    address = data.get("address", "")
    phone = normalize_phone(phone_raw)
    if not items or not phone or not re.match(r"^254(7|1)\d{8}$", phone):
        return jsonify({"error": "A valid phone number and cart items are required."}), 400

    db = get_db()
    total = 0
    for item in items:
        row = db.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
        if row:
            qty = min(int(item.get("qty", 1)), row["stock"]) if row["stock"] > 0 else 0
            total += row["price"] * qty
    total = int(round(total))
    if total <= 0:
        return jsonify({"error": "Cart total must be greater than zero."}), 400

    ref = "STB" + "".join(random.choices(string.digits, k=6))
    items_str = ",".join(f'{i["id"]}x{i.get("qty",1)}' for i in items)
    cur = db.execute(
        "INSERT INTO orders (ref, user_id, name, phone, address, total, items, status, created_at) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (ref, user["id"], name, phone, address, total, items_str, "pending", datetime.utcnow().isoformat()),
    )
    order_id = cur.lastrowid
    db.commit()

    try:
        checkout_id, merchant_id = initiate_stk(phone, total, ref, f"Stasho order {ref}")
    except Exception as e:
        db.execute("UPDATE orders SET status='failed' WHERE id=?", (order_id,))
        db.commit()
        return jsonify({"error": f"Could not reach M-Pesa: {e}"}), 502

    db.execute(
        "UPDATE orders SET mpesa_checkout_id=?, mpesa_merchant_id=? WHERE id=?",
        (checkout_id, merchant_id, order_id),
    )
    for item in items:
        db.execute("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?", (item.get("qty", 1), item["id"]))
    db.commit()

    return jsonify({"ref": ref, "checkout_id": checkout_id, "total": total}), 201


def complete_installment_order_if_done(db, plan_id):
    remaining = db.execute(
        "SELECT COUNT(*) AS c FROM installment_payments WHERE plan_id = ? AND status != 'paid'", (plan_id,)
    ).fetchone()["c"]
    if remaining == 0:
        plan = db.execute("SELECT * FROM installment_plans WHERE id = ?", (plan_id,)).fetchone()
        if plan:
            db.execute("UPDATE orders SET status = 'paid' WHERE id = ?", (plan["order_id"],))
            db.execute("UPDATE installment_plans SET status = 'completed' WHERE id = ?", (plan_id,))


@app.get("/api/mpesa/status/<checkout_id>")
def mpesa_status(checkout_id):
    db = get_db()

    order = db.execute("SELECT * FROM orders WHERE mpesa_checkout_id = ?", (checkout_id,)).fetchone()
    if order:
        return resolve_stk_status(checkout_id, order["status"], lambda s: db.execute(
            "UPDATE orders SET status=? WHERE id=?", (s, order["id"])), order["ref"], order["total"])

    inst = db.execute("SELECT * FROM installment_payments WHERE mpesa_checkout_id = ?", (checkout_id,)).fetchone()
    if inst:
        def on_result(s):
            db.execute("UPDATE installment_payments SET status=?, paid_at=? WHERE id=?",
                       (s, datetime.utcnow().isoformat() if s == "paid" else None, inst["id"]))
            if s == "paid":
                complete_installment_order_if_done(db, inst["plan_id"])
        return resolve_stk_status(checkout_id, inst["status"], on_result, f"installment #{inst['seq']}", inst["amount"])

    sav = db.execute("SELECT * FROM savings_transactions WHERE mpesa_checkout_id = ?", (checkout_id,)).fetchone()
    if sav:
        def on_result(s):
            db.execute("UPDATE savings_transactions SET status=? WHERE id=?", (s, sav["id"]))
            if s == "paid":
                db.execute(
                    "INSERT INTO savings (user_id, balance) VALUES (?, ?) "
                    "ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance",
                    (sav["user_id"], sav["amount"]),
                )
        return resolve_stk_status(checkout_id, sav["status"], on_result, "savings deposit", sav["amount"])

    return jsonify({"error": "Payment not found."}), 404


def resolve_stk_status(checkout_id, current_status, on_result, ref_label, amount):
    db = get_db()
    if current_status in ("paid", "failed"):
        return jsonify({"status": current_status, "ref": ref_label, "total": amount})
    try:
        res = query_stk_result(checkout_id)
    except Exception:
        return jsonify({"status": "pending", "ref": ref_label})

    code = str(res.get("ResultCode", ""))
    if code == "0":
        on_result("paid")
        db.commit()
        return jsonify({"status": "paid", "ref": ref_label, "total": amount})
    if code and code != "1032":
        on_result("failed")
        db.commit()
        return jsonify({"status": "failed", "ref": ref_label, "message": res.get("ResultDesc")})
    return jsonify({"status": "pending", "ref": ref_label})


@app.post("/api/mpesa/callback")
def mpesa_callback():
    payload = request.get_json(force=True) or {}
    stk = payload.get("Body", {}).get("stkCallback", {})
    checkout_id = stk.get("CheckoutRequestID")
    if checkout_id:
        status = "paid" if stk.get("ResultCode") == 0 else "failed"
        db = get_db()
        db.execute("UPDATE orders SET status=? WHERE mpesa_checkout_id=?", (status, checkout_id))
        inst = db.execute("SELECT * FROM installment_payments WHERE mpesa_checkout_id=?", (checkout_id,)).fetchone()
        if inst:
            db.execute("UPDATE installment_payments SET status=?, paid_at=? WHERE id=?",
                       (status, datetime.utcnow().isoformat() if status == "paid" else None, inst["id"]))
            if status == "paid":
                complete_installment_order_if_done(db, inst["plan_id"])
        sav = db.execute("SELECT * FROM savings_transactions WHERE mpesa_checkout_id=?", (checkout_id,)).fetchone()
        if sav and sav["status"] not in ("paid", "failed"):
            db.execute("UPDATE savings_transactions SET status=? WHERE id=?", (status, sav["id"]))
            if status == "paid":
                db.execute(
                    "INSERT INTO savings (user_id, balance) VALUES (?, ?) "
                    "ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance",
                    (sav["user_id"], sav["amount"]),
                )
        db.commit()
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"})


@app.get("/api/orders")
@login_required
def list_orders(user):
    db = get_db()
    if user["role"] == "admin":
        rows = db.execute("SELECT * FROM orders ORDER BY id DESC").fetchall()
    else:
        rows = db.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", (user["id"],)).fetchall()
    return jsonify([dict(r) for r in rows])


VALID_DELIVERY_STATUSES = {"pending", "delivered", "cancelled"}


@app.put("/api/orders/<int:order_id>/delivery")
@login_required
def update_delivery_status(user, order_id):
    db = get_db()
    order = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if not order:
        return jsonify({"error": "Order not found."}), 404
    if order["user_id"] != user["id"] and user["role"] != "admin":
        return jsonify({"error": "Not allowed."}), 403
    data = request.get_json(force=True) or {}
    new_status = data.get("delivery_status")
    if new_status not in VALID_DELIVERY_STATUSES:
        return jsonify({"error": f"delivery_status must be one of {sorted(VALID_DELIVERY_STATUSES)}."}), 400
    db.execute("UPDATE orders SET delivery_status = ? WHERE id = ?", (new_status, order_id))
    db.commit()
    return jsonify({"ok": True, "delivery_status": new_status})


@app.get("/api/orders/pending-deliveries")
@admin_required
def pending_deliveries(user):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM orders WHERE status IN ('paid','placed') AND delivery_status = 'pending' ORDER BY created_at",
    ).fetchall()
    return jsonify([dict(r) for r in rows])


# ── Feature 1: School shopping lists ────────────────────────────────────────
@app.get("/api/schools")
def list_schools():
    db = get_db()
    rows = db.execute("SELECT * FROM schools ORDER BY name").fetchall()
    return jsonify([dict(r) for r in rows])


@app.post("/api/schools")
@admin_required
def create_school(user):
    data = request.get_json(force=True) or {}
    if not data.get("name"):
        return jsonify({"error": "School name is required."}), 400
    db = get_db()
    cur = db.execute("INSERT INTO schools (name, county) VALUES (?,?)", (data["name"], data.get("county", "")))
    db.commit()
    return jsonify({"id": cur.lastrowid, "name": data["name"], "county": data.get("county", "")}), 201


@app.get("/api/schools/<int:school_id>/grades")
def school_grades(school_id):
    db = get_db()
    rows = db.execute(
        "SELECT DISTINCT grade FROM school_list_items WHERE school_id = ? ORDER BY grade", (school_id,)
    ).fetchall()
    return jsonify([r["grade"] for r in rows])


@app.get("/api/schools/<int:school_id>/lists/<grade>")
def school_list_for_grade(school_id, grade):
    db = get_db()
    rows = db.execute(
        "SELECT sli.qty, p.* FROM school_list_items sli JOIN products p ON p.id = sli.product_id "
        "WHERE sli.school_id = ? AND sli.grade = ?", (school_id, grade),
    ).fetchall()
    return jsonify([{**product_to_json(r), "qty": r["qty"]} for r in rows])


@app.put("/api/schools/<int:school_id>/lists/<grade>")
@admin_required
def set_school_list(user, school_id, grade):
    data = request.get_json(force=True) or {}
    items = data.get("items") or []
    db = get_db()
    db.execute("DELETE FROM school_list_items WHERE school_id = ? AND grade = ?", (school_id, grade))
    for item in items:
        db.execute(
            "INSERT INTO school_list_items (school_id, grade, product_id, qty) VALUES (?,?,?,?)",
            (school_id, grade, item["product_id"], item.get("qty", 1)),
        )
    db.commit()
    return jsonify({"ok": True})


@app.post("/api/schools/<int:school_id>/lists/<grade>/add-to-cart")
@login_required
def add_school_list_to_cart(user, school_id, grade):
    db = get_db()
    list_rows = db.execute(
        "SELECT sli.qty, p.* FROM school_list_items sli JOIN products p ON p.id = sli.product_id "
        "WHERE sli.school_id = ? AND sli.grade = ?", (school_id, grade),
    ).fetchall()
    if not list_rows:
        return jsonify({"error": "No list found for that school and grade."}), 404
    cart_row = db.execute("SELECT items FROM carts WHERE user_id = ?", (user["id"],)).fetchone()
    cart = json.loads(cart_row["items"]) if cart_row else []
    for r in list_rows:
        existing = next((c for c in cart if c["id"] == r["id"]), None)
        if existing:
            existing["qty"] += r["qty"]
        else:
            cart.append({**product_to_json(r), "qty": r["qty"]})
    db.execute(
        "INSERT INTO carts (user_id, items) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET items = excluded.items",
        (user["id"], json.dumps(cart)),
    )
    db.commit()
    return jsonify(cart)


# ── Feature 2: Lipa Mdogo Mdogo (M-Pesa installments) ───────────────────────
@app.post("/api/installments")
@login_required
def create_installment_plan(user):
    data = request.get_json(force=True) or {}
    items = data.get("items") or []
    num = int(data.get("num_installments", 2))
    phone = normalize_phone(data.get("phone", ""))
    name = data.get("name", user["name"])
    address = data.get("address", "")
    if num < 2 or num > 4:
        return jsonify({"error": "Installments must be between 2 and 4."}), 400
    if not items or not phone or not re.match(r"^254(7|1)\d{8}$", phone):
        return jsonify({"error": "A valid phone number and cart items are required."}), 400

    db = get_db()
    total = 0
    for item in items:
        row = db.execute("SELECT * FROM products WHERE id = ?", (item["id"],)).fetchone()
        if row:
            qty = min(int(item.get("qty", 1)), row["stock"]) if row["stock"] > 0 else 0
            total += row["price"] * qty
    total = int(round(total))
    if total <= 0:
        return jsonify({"error": "Cart total must be greater than zero."}), 400

    ref = "STBI" + "".join(random.choices(string.digits, k=6))
    items_str = ",".join(f'{i["id"]}x{i.get("qty",1)}' for i in items)
    cur = db.execute(
        "INSERT INTO orders (ref, user_id, name, phone, address, total, items, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (ref, user["id"], name, phone, address, total, items_str, "pending_installments", datetime.utcnow().isoformat()),
    )
    order_id = cur.lastrowid

    plan_cur = db.execute(
        "INSERT INTO installment_plans (user_id, order_id, total, num_installments, phone, status, created_at) VALUES (?,?,?,?,?,?,?)",
        (user["id"], order_id, total, num, phone, "active", datetime.utcnow().isoformat()),
    )
    plan_id = plan_cur.lastrowid

    base_amount = total // num
    amounts = [base_amount] * num
    amounts[-1] += total - base_amount * num
    for seq, amount in enumerate(amounts, start=1):
        db.execute(
            "INSERT INTO installment_payments (plan_id, seq, amount, status) VALUES (?,?,?, 'due')",
            (plan_id, seq, amount),
        )
    db.commit()

    for item in items:
        db.execute("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?", (item.get("qty", 1), item["id"]))
    db.commit()

    return jsonify({"plan_id": plan_id, "order_ref": ref, "total": total, "installments": amounts}), 201


@app.get("/api/installments")
@login_required
def list_installment_plans(user):
    db = get_db()
    plans = db.execute("SELECT * FROM installment_plans WHERE user_id = ? ORDER BY id DESC", (user["id"],)).fetchall()
    result = []
    for plan in plans:
        payments = db.execute("SELECT * FROM installment_payments WHERE plan_id = ? ORDER BY seq", (plan["id"],)).fetchall()
        order = db.execute("SELECT ref, items, status AS order_status FROM orders WHERE id = ?", (plan["order_id"],)).fetchone()
        result.append({
            **dict(plan),
            "order_ref": order["ref"] if order else None,
            "payments": [dict(p) for p in payments],
            "paid_count": sum(1 for p in payments if p["status"] == "paid"),
            "amount_paid": sum(p["amount"] for p in payments if p["status"] == "paid"),
        })
    return jsonify(result)


@app.get("/api/installments/<int:plan_id>")
@login_required
def get_installment_plan(user, plan_id):
    db = get_db()
    plan = db.execute("SELECT * FROM installment_plans WHERE id = ?", (plan_id,)).fetchone()
    if not plan or (plan["user_id"] != user["id"] and user["role"] != "admin"):
        return jsonify({"error": "Plan not found."}), 404
    payments = db.execute("SELECT * FROM installment_payments WHERE plan_id = ? ORDER BY seq", (plan_id,)).fetchall()
    return jsonify({**dict(plan), "payments": [dict(p) for p in payments]})


@app.post("/api/installments/<int:plan_id>/pay-next")
@login_required
def pay_next_installment(user, plan_id):
    db = get_db()
    plan = db.execute("SELECT * FROM installment_plans WHERE id = ?", (plan_id,)).fetchone()
    if not plan or plan["user_id"] != user["id"]:
        return jsonify({"error": "Plan not found."}), 404
    next_due = db.execute(
        "SELECT * FROM installment_payments WHERE plan_id = ? AND status = 'due' ORDER BY seq LIMIT 1", (plan_id,)
    ).fetchone()
    if not next_due:
        return jsonify({"error": "All installments are already paid."}), 400
    try:
        checkout_id, _ = initiate_stk(
            plan["phone"], next_due["amount"], f"STBI{plan_id}-{next_due['seq']}",
            f"Installment {next_due['seq']} for order #{plan['order_id']}",
        )
    except Exception as e:
        return jsonify({"error": f"Could not reach M-Pesa: {e}"}), 502
    db.execute("UPDATE installment_payments SET status='pending', mpesa_checkout_id=? WHERE id=?",
               (checkout_id, next_due["id"]))
    db.commit()
    return jsonify({"checkout_id": checkout_id, "seq": next_due["seq"], "amount": next_due["amount"]}), 201


# ── Feature 3: School Fund savings ───────────────────────────────────────────
@app.get("/api/savings")
@login_required
def get_savings(user):
    db = get_db()
    row = db.execute("SELECT * FROM savings WHERE user_id = ?", (user["id"],)).fetchone()
    if not row:
        return jsonify({"balance": 0, "goal_amount": 0, "goal_label": ""})
    return jsonify(dict(row))


@app.put("/api/savings/goal")
@login_required
def set_savings_goal(user):
    data = request.get_json(force=True) or {}
    db = get_db()
    db.execute(
        "INSERT INTO savings (user_id, balance, goal_amount, goal_label) VALUES (?, 0, ?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET goal_amount = excluded.goal_amount, goal_label = excluded.goal_label",
        (user["id"], float(data.get("goal_amount", 0)), data.get("goal_label", "")),
    )
    db.commit()
    return jsonify({"ok": True})


@app.post("/api/savings/deposit")
@login_required
def savings_deposit(user):
    data = request.get_json(force=True) or {}
    phone = normalize_phone(data.get("phone", ""))
    amount = float(data.get("amount", 0))
    if amount <= 0 or not re.match(r"^254(7|1)\d{8}$", phone):
        return jsonify({"error": "A valid phone number and a positive amount are required."}), 400
    db = get_db()
    cur = db.execute(
        "INSERT INTO savings_transactions (user_id, amount, status, created_at) VALUES (?,?, 'pending', ?)",
        (user["id"], amount, datetime.utcnow().isoformat()),
    )
    tx_id = cur.lastrowid
    db.commit()
    try:
        checkout_id, _ = initiate_stk(phone, amount, f"SAVE{user['id']}", "Stasho School Fund deposit")
    except Exception as e:
        db.execute("UPDATE savings_transactions SET status='failed' WHERE id=?", (tx_id,))
        db.commit()
        return jsonify({"error": f"Could not reach M-Pesa: {e}"}), 502
    db.execute("UPDATE savings_transactions SET mpesa_checkout_id=? WHERE id=?", (checkout_id, tx_id))
    db.commit()
    return jsonify({"checkout_id": checkout_id}), 201


# ── Feature 6: Book buyback / resale marketplace ─────────────────────────────
@app.get("/api/resale")
def list_resale():
    db = get_db()
    rows = db.execute("SELECT * FROM resale_listings WHERE status = 'active' ORDER BY id DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.post("/api/resale")
@login_required
def create_resale_listing(user):
    data = request.get_json(force=True) or {}
    if not data.get("title") or data.get("price") is None:
        return jsonify({"error": "Title and price are required."}), 400
    db = get_db()
    cur = db.execute(
        "INSERT INTO resale_listings (seller_id, title, category, grade, condition, price, status, created_at) "
        "VALUES (?,?,?,?,?,?, 'active', ?)",
        (user["id"], data["title"], data.get("category", ""), data.get("grade", ""),
         data.get("condition", "Good"), float(data["price"]), datetime.utcnow().isoformat()),
    )
    db.commit()
    row = db.execute("SELECT * FROM resale_listings WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.put("/api/resale/<int:listing_id>")
@login_required
def update_resale_listing(user, listing_id):
    db = get_db()
    row = db.execute("SELECT * FROM resale_listings WHERE id = ?", (listing_id,)).fetchone()
    if not row:
        return jsonify({"error": "Listing not found."}), 404
    if row["seller_id"] != user["id"] and user["role"] != "admin":
        return jsonify({"error": "Not allowed."}), 403
    data = request.get_json(force=True) or {}
    db.execute("UPDATE resale_listings SET status = ? WHERE id = ?", (data.get("status", row["status"]), listing_id))
    db.commit()
    return jsonify({"ok": True})


@app.get("/api/resale/mine")
@login_required
def my_resale_listings(user):
    db = get_db()
    rows = db.execute("SELECT * FROM resale_listings WHERE seller_id = ? ORDER BY id DESC", (user["id"],)).fetchall()
    return jsonify([dict(r) for r in rows])


# ── Buyer <-> seller messaging on a resale listing ──────────────────────────
@app.post("/api/resale/<int:listing_id>/contact")
@login_required
def start_resale_thread(user, listing_id):
    db = get_db()
    listing = db.execute("SELECT * FROM resale_listings WHERE id = ?", (listing_id,)).fetchone()
    if not listing:
        return jsonify({"error": "Listing not found."}), 404
    if listing["seller_id"] == user["id"]:
        return jsonify({"error": "You can't message yourself about your own listing."}), 400
    row = db.execute("SELECT * FROM resale_threads WHERE listing_id = ? AND buyer_id = ?", (listing_id, user["id"])).fetchone()
    if not row:
        cur = db.execute("INSERT INTO resale_threads (listing_id, buyer_id) VALUES (?,?)", (listing_id, user["id"]))
        db.commit()
        thread_id = cur.lastrowid
    else:
        thread_id = row["id"]
    data = request.get_json(silent=True) or {}
    if data.get("message"):
        db.execute(
            "INSERT INTO resale_messages (thread_id, sender_id, body, created_at) VALUES (?,?,?,?)",
            (thread_id, user["id"], data["message"], datetime.utcnow().isoformat()),
        )
        db.commit()
    return jsonify({"thread_id": thread_id}), 201


@app.get("/api/resale/threads")
@login_required
def list_resale_threads(user):
    db = get_db()
    rows = db.execute(
        "SELECT t.*, l.title AS listing_title, l.price AS listing_price, l.seller_id AS seller_id, "
        "l.status AS listing_status FROM resale_threads t JOIN resale_listings l ON l.id = t.listing_id "
        "WHERE t.buyer_id = ? OR l.seller_id = ? ORDER BY t.id DESC", (user["id"], user["id"]),
    ).fetchall()
    result = []
    for r in rows:
        other_id = r["seller_id"] if r["buyer_id"] == user["id"] else r["buyer_id"]
        other = db.execute("SELECT name FROM users WHERE id = ?", (other_id,)).fetchone()
        last = db.execute(
            "SELECT body, created_at FROM resale_messages WHERE thread_id = ? ORDER BY id DESC LIMIT 1", (r["id"],)
        ).fetchone()
        result.append({
            "thread_id": r["id"], "listing_id": r["listing_id"], "listing_title": r["listing_title"],
            "listing_price": r["listing_price"], "listing_status": r["listing_status"],
            "role": "buyer" if r["buyer_id"] == user["id"] else "seller",
            "other_party": other["name"] if other else "Unknown",
            "last_message": last["body"] if last else None, "last_at": last["created_at"] if last else None,
        })
    return jsonify(result)


def _resale_thread_participant(db, thread_id, user):
    thread = db.execute(
        "SELECT t.*, l.seller_id FROM resale_threads t JOIN resale_listings l ON l.id = t.listing_id WHERE t.id = ?",
        (thread_id,),
    ).fetchone()
    if not thread or (thread["buyer_id"] != user["id"] and thread["seller_id"] != user["id"]):
        return None
    return thread


@app.get("/api/resale/threads/<int:thread_id>/messages")
@login_required
def get_resale_messages(user, thread_id):
    db = get_db()
    if not _resale_thread_participant(db, thread_id, user):
        return jsonify({"error": "Thread not found."}), 404
    rows = db.execute("SELECT * FROM resale_messages WHERE thread_id = ? ORDER BY id", (thread_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@app.post("/api/resale/threads/<int:thread_id>/messages")
@login_required
def send_resale_message(user, thread_id):
    db = get_db()
    if not _resale_thread_participant(db, thread_id, user):
        return jsonify({"error": "Thread not found."}), 404
    data = request.get_json(force=True) or {}
    if not data.get("body", "").strip():
        return jsonify({"error": "Message cannot be empty."}), 400
    db.execute(
        "INSERT INTO resale_messages (thread_id, sender_id, body, created_at) VALUES (?,?,?,?)",
        (thread_id, user["id"], data["body"].strip(), datetime.utcnow().isoformat()),
    )
    db.commit()
    return jsonify({"ok": True}), 201


# ── Feature 7: Demand analytics (admin) ──────────────────────────────────────
@app.get("/api/analytics/demand")
@admin_required
def demand_analytics(user):
    db = get_db()
    orders = db.execute("SELECT items FROM orders WHERE status IN ('paid','placed')").fetchall()
    counts = {}
    for o in orders:
        for part in (o["items"] or "").split(","):
            if "x" not in part:
                continue
            pid_str, qty_str = part.rsplit("x", 1)
            try:
                pid, qty = int(pid_str), int(qty_str)
            except ValueError:
                continue
            counts[pid] = counts.get(pid, 0) + qty
    results = []
    for pid, qty in counts.items():
        p = db.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
        if p:
            results.append({"category": p["category"], "grade": p["grade"], "title": p["title"],
                             "qty_sold": qty, "revenue": qty * p["price"]})
    results.sort(key=lambda r: r["qty_sold"], reverse=True)
    return jsonify(results)


# ── Feature 8: Smart list matching for the Soma chatbot ──────────────────────
def match_line_to_product(line, products):
    words = set(re.findall(r"[a-zA-Z0-9]+", line.lower()))
    words -= {"a", "the", "and", "of", "for", "book", "books"}
    if not words:
        return None, 0
    best, best_score = None, 0
    for p in products:
        title_words = set(re.findall(r"[a-zA-Z0-9]+", p["title"].lower()))
        score = len(words & title_words)
        if score > best_score:
            best_score, best = score, p
    return (best, best_score) if best_score >= 1 else (None, 0)


@app.post("/api/lists/match")
@login_required
def match_school_list(user):
    data = request.get_json(force=True) or {}
    text = data.get("text", "")
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()
    matched, unmatched = [], []
    for line in [l.strip(" -•\t") for l in text.splitlines() if l.strip()]:
        product, score = match_line_to_product(line, products)
        if product:
            matched.append(product_to_json(product))
        else:
            unmatched.append(line)
    return jsonify({"matched": matched, "unmatched": unmatched})


try:
    import pytesseract
    from PIL import Image
    import io
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


@app.post("/api/lists/match-image")
@login_required
def match_school_list_image(user):
    if not OCR_AVAILABLE:
        return jsonify({"error": "OCR isn't installed on this server. Install pytesseract, Pillow, and the "
                                 "tesseract-ocr system package, or paste the list as text instead."}), 501
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded."}), 400
    try:
        text = pytesseract.image_to_string(Image.open(io.BytesIO(file.read())))
    except Exception as e:
        return jsonify({"error": f"Could not read the image: {e}"}), 400
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()
    matched, unmatched = [], []
    for line in [l.strip(" -•\t") for l in text.splitlines() if l.strip()]:
        product, score = match_line_to_product(line, products)
        if product:
            matched.append(product_to_json(product))
        else:
            unmatched.append(line)
    return jsonify({"matched": matched, "unmatched": unmatched, "raw_text": text})


# ── Feature 4: USSD channel (Africa's Talking webhook format) ──────────────
# Register this endpoint's public URL as your USSD callback in the Africa's
# Talking dashboard, using an ngrok tunnel in development. Requires an
# Africa's Talking account + a leased/sandbox USSD code to actually dial —
# the logic itself is complete and ready to receive their callback format.
@app.post("/api/ussd")
def ussd():
    session_id = request.form.get("sessionId", "")
    phone_number = normalize_phone(request.form.get("phoneNumber", ""))
    text = request.form.get("text", "")
    parts = text.split("*") if text else []
    db = get_db()

    if text == "":
        response = "CON Welcome to Stasho\n1. Check last order status\n2. Check savings balance\n3. Deposit to savings"
    elif parts[0] == "1":
        order = db.execute("SELECT * FROM orders WHERE phone = ? ORDER BY id DESC LIMIT 1", (phone_number,)).fetchone()
        if order:
            response = f"END Order {order['ref']}: {order['status']}. Total KSh {int(order['total'])}."
        else:
            response = "END No orders found for this number."
    elif parts[0] == "2":
        user = db.execute("SELECT * FROM users WHERE phone = ?", (phone_number,)).fetchone()
        sav = db.execute("SELECT * FROM savings WHERE user_id = ?", (user["id"],)).fetchone() if user else None
        response = f"END School Fund balance: KSh {int(sav['balance']) if sav else 0}."
    elif parts[0] == "3" and len(parts) == 1:
        response = "CON Enter amount to deposit (KSh):"
    elif parts[0] == "3" and len(parts) == 2:
        user = db.execute("SELECT * FROM users WHERE phone = ?", (phone_number,)).fetchone()
        if not user:
            response = "END No Stasho account found for this number. Register on the app first."
        else:
            try:
                amount = float(parts[1])
                checkout_id, _ = initiate_stk(phone_number, amount, f"SAVE{user['id']}", "Stasho School Fund deposit")
                cur = db.execute(
                    "INSERT INTO savings_transactions (user_id, amount, mpesa_checkout_id, status, created_at) "
                    "VALUES (?,?,?, 'pending', ?)",
                    (user["id"], amount, checkout_id, datetime.utcnow().isoformat()),
                )
                db.commit()
                response = "END An M-Pesa prompt has been sent to your phone. Enter your PIN to complete the deposit."
            except Exception:
                response = "END Could not start the deposit. Please try again later."
    else:
        response = "END Invalid option."

    return response, 200, {"Content-Type": "text/plain"}


if __name__ == "__main__":
    init_db()
    print(f"M-Pesa mode: {'MOCK (simulated, no Safaricom calls)' if MPESA_MOCK_MODE else 'LIVE (real Daraja sandbox/production calls)'}")
    app.run(debug=True, port=5000)
else:
    init_db()