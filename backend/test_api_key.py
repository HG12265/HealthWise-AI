#!/usr/bin/env python3
"""
Test script to verify Gemini API key is working
"""
import json
import urllib.request
import urllib.error
import sys

# Your API key from .env
API_KEY = "AIzaSyDsgrIKU2ks4Yv2tCMgdyYIIDMQ7m_Uu1U"
MODEL = "gemini-3.6-flash"

print(f"Testing Gemini API...")
print(f"API Key: {API_KEY[:20]}...{API_KEY[-5:]}")
print(f"Model: {MODEL}\n")

# Simple test prompt
request_body = {
    "contents": [{
        "parts": [{
            "text": "What is the capital of France?"
        }]
    }]
}

url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
payload = json.dumps(request_body).encode("utf-8")

try:
    print("Sending request to Gemini API...")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        
        print("✅ SUCCESS! API key is working!\n")
        
        # Extract response
        if "candidates" in res_json:
            text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            print(f"API Response:\n{text}")
        else:
            print(f"Full response:\n{json.dumps(res_json, indent=2)}")

except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}")
    try:
        error_body = e.read().decode("utf-8")
        error_json = json.loads(error_body)
        print(f"Error details: {error_json}")
    except:
        print(f"Error: {e}")
    print("\n⚠️ Your API key might be invalid or inactive!")
    sys.exit(1)

except urllib.error.URLError as e:
    print(f"❌ Connection Error: {e.reason}")
    print("⚠️ Network error - check your internet connection")
    sys.exit(1)

except Exception as e:
    print(f"❌ Unexpected error: {type(e).__name__}: {e}")
    sys.exit(1)
