"""Quick standalone check: are the M-Pesa Consumer Key/Secret valid?
Run: python test_mpesa_auth.py
"""
from app import get_mpesa_token, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_BASE_URL

print("Base URL:", MPESA_BASE_URL)
print("Consumer Key:", MPESA_CONSUMER_KEY)
print("Consumer Secret:", MPESA_CONSUMER_SECRET[:6] + "..." + MPESA_CONSUMER_SECRET[-4:])

try:
    token = get_mpesa_token()
    print("SUCCESS — access token:", token)
except Exception as e:
    print("FAILED:", e)
