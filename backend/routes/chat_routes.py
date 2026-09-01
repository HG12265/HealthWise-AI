import json
import urllib.request
import urllib.error
import ssl
import socket
from flask import Blueprint, request, jsonify
from config import Config

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

# System prompt to restrict chatbot to health/nutrition topics
SYSTEM_PROMPT = """You are a knowledgeable and friendly health and nutrition assistant. 
You specialize in providing educational information about:
- Health and wellness
- Nutrition and diet
- Dietetics and meal planning
- Exercise and physical activity
- Healthy lifestyle habits
- Food and calorie information
- Vitamins, minerals, and supplements
- Common health conditions and dietary management

IMPORTANT RESTRICTIONS:
1. You ONLY answer questions related to health, nutrition, and dietetics.
2. If someone asks about topics unrelated to health/nutrition (like sports, movies, technology, politics, etc.), politely decline and redirect to health topics.
3. Do NOT provide medical diagnosis or prescription of medications.
4. Always include disclaimers that you are providing educational information, not professional medical advice.
5. Advise users to consult healthcare professionals for serious health concerns.
6. Keep responses concise and informative (2-3 paragraphs max).

Example responses:
- Health question: Provide detailed, educational information
- Unrelated question: "I appreciate the question, but I'm specifically designed to help with health and nutrition topics. Is there anything about your diet or health I can help you with?"
"""

@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint that processes user messages through Gemini AI.
    Restricts responses to health and nutrition topics only.
    """
    api_key = Config.GEMINI_API_KEY
    model = Config.GEMINI_MODEL

    if not api_key or api_key == "":
        return jsonify({
            "success": False,
            "message": "Gemini API key is not configured on the server."
        }), 500

    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({
            "success": False,
            "message": "Please provide a message."
        }), 400

    # Construct prompt with system instructions
    prompt = f"""{SYSTEM_PROMPT}

User: {user_message}

Assistant (provide a helpful, health-focused response):\n"""

    request_body = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "topK": 40
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = json.dumps(request_body).encode("utf-8")

    print(f"[CHAT] Sending request to Gemini API: {model}")
    print(f"[CHAT] User message: {user_message[:100]}...")

    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "HealthWise-AI/1.0"
            },
            method="POST"
        )

        # Create SSL context with proper verification
        ssl_context = ssl.create_default_context()
        
        with urllib.request.urlopen(req, timeout=30, context=ssl_context) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)

            print(f"[CHAT] Received response from Gemini API")

            # Extract text response from candidates
            candidates = res_json.get("candidates", [])
            if not candidates:
                print("[CHAT] No candidates in response")
                return jsonify({
                    "success": False,
                    "message": "No response from Gemini API."
                }), 502

            try:
                part_text = candidates[0].get("content", {}).get("parts", [])[0].get("text", "")
            except (IndexError, KeyError) as e:
                print(f"[CHAT] Error parsing response: {e}")
                return jsonify({
                    "success": False,
                    "message": "Failed to parse Gemini response."
                }), 502

            if not part_text:
                print("[CHAT] Empty response from API")
                return jsonify({
                    "success": False,
                    "message": "Empty response from Gemini API."
                }), 502

            print(f"[CHAT] Successfully generated response ({len(part_text)} chars)")
            return jsonify({
                "success": True,
                "reply": part_text.strip()
            }), 200

    except urllib.error.HTTPError as http_err:
        error_msg = f"HTTP {http_err.code}"
        try:
            error_body = http_err.read().decode("utf-8")
            error_json = json.loads(error_body)
            error_msg = error_json.get("error", {}).get("message", error_msg)
        except Exception as e:
            error_msg = f"HTTP {http_err.code}: {str(http_err)}"

        print(f"[CHAT] HTTP Error: {error_msg}")
        return jsonify({
            "success": False,
            "message": f"API Error: {error_msg}"
        }), 502

    except urllib.error.URLError as url_err:
        print(f"[CHAT] URL Error: {url_err.reason}")
        if isinstance(url_err.reason, socket.timeout):
            return jsonify({
                "success": False,
                "message": "Request timed out. The API is taking too long to respond."
            }), 504
        else:
            return jsonify({
                "success": False,
                "message": f"Connection error: {str(url_err.reason)}"
            }), 503

    except socket.timeout:
        print("[CHAT] Socket timeout")
        return jsonify({
            "success": False,
            "message": "Request timed out. Please try again."
        }), 504

    except ssl.SSLError as ssl_err:
        print(f"[CHAT] SSL Error: {ssl_err}")
        return jsonify({
            "success": False,
            "message": "SSL connection error. Please try again."
        }), 503

    except json.JSONDecodeError as json_err:
        print(f"[CHAT] JSON Decode Error: {json_err}")
        return jsonify({
            "success": False,
            "message": "Failed to parse response from API."
        }), 502

    except Exception as err:
        print(f"[CHAT] Unexpected error: {type(err).__name__}: {err}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Unexpected error: {str(err)}"
        }), 500


    except urllib.error.URLError as url_err:
        print(f"Gemini API URL Error: {url_err}")
        return jsonify({
            "success": False,
            "message": "Network error. Please try again."
        }), 503

    except json.JSONDecodeError as json_err:
        print(f"JSON Decode Error: {json_err}")
        return jsonify({
            "success": False,
            "message": "Failed to parse response from API."
        }), 502

    except Exception as err:
        print(f"Unexpected error in chat endpoint: {err}")
        return jsonify({
            "success": False,
            "message": f"Unexpected error: {str(err)}"
        }), 500
