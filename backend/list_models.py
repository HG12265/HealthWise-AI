#!/usr/bin/env python3
"""
List available Gemini models
"""
import json
import urllib.request
import sys

API_KEY = "AIzaSyDsgrIKU2ks4Yv2tCMgdyYIIDMQ7m_Uu1U"

print("Fetching available Gemini models...\n")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=10) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        
        print("✅ Available Models:\n")
        models = res_json.get("models", [])
        
        for model in models:
            model_name = model.get("name", "").replace("models/", "")
            supported_methods = model.get("supportedGenerationMethods", [])
            
            if "generateContent" in supported_methods:
                print(f"✅ {model_name}")
                print(f"   Supported methods: {', '.join(supported_methods)}\n")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
