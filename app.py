import os
import subprocess
import requests
import time
import json
from flask import Flask, request, jsonify, send_from_directory, render_template

MODEL_FALLBACK = 'mistral'
OLLAMA_HOST = 'http://localhost:11434'

app = Flask(__name__, static_folder='static', template_folder='templates')

# D&D 5e statblock JSON schema updated for better structure and UI alignment
STATBLOCK_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "size_type": {"type": "string"},
        "alignment": {"type": "string"},
        "armor_class": {"type": "string"},
        "hit_points": {"type": "string"},
        "speed": {"type": "string"},
        "strength": {"type": "integer"},
        "dexterity": {"type": "integer"},
        "constitution": {"type": "integer"},
        "intelligence": {"type": "integer"},
        "wisdom": {"type": "integer"},
        "charisma": {"type": "integer"},
        "skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "desc": {"type": "string"}
                },
                "required": ["name", "desc"]
            }
        },
        "saving_throws": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "desc": {"type": "string"}
                },
                "required": ["name", "desc"]
            }
        },
        "senses": {"type": "string"},
        "languages": {"type": "string"},
        "challenge": {"type": "string"},
        "damage_vulnerabilities": {"type": "string"},
        "damage_resistances": {"type": "string"},
        "damage_immunities": {"type": "string"},
        "condition_immunities": {"type": "string"},
        "abilities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "desc": {"type": "string"}
                },
                "required": ["name", "desc"]
            }
        },
        "actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "desc": {"type": "string"}
                },
                "required": ["name", "desc"]
            }
        }
    },
    "required": [
        "name", "size_type", "alignment", "armor_class", "hit_points", "speed",
        "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma",
        "skills", "saving_throws", "senses", "languages", "challenge",
        "damage_vulnerabilities", "damage_resistances", "damage_immunities",
        "condition_immunities", "abilities", "actions"
    ]
}


def ensure_ollama_server():
    try:
        requests.get(OLLAMA_HOST + "/api/tags", timeout=1)
        print("Ollama backend already running.")
        return None
    except Exception:
        print("Ollama not running. Starting ollama serve...")
        proc = subprocess.Popen(["ollama", "serve"])
        for _ in range(30):
            try:
                requests.get(OLLAMA_HOST + "/api/tags", timeout=1)
                print("Ollama started successfully.")
                return proc
            except Exception:
                time.sleep(1)
        raise RuntimeError("Ollama did not start in time.")

ollama_proc = ensure_ollama_server()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def staticfiles(filename):
    return send_from_directory('static', filename)

@app.route('/generate', methods=['POST'])
def generate():
    data   = request.json
    prompt = data.get('prompt', '').strip()
    model  = data.get('model', MODEL_FALLBACK)
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Ensure the prompt guides the AI towards the desired JSON structure
    full_prompt = (
        f"Generate a D&D 5e statblock for the following creature concept: '{prompt}'. "
        "The output must be a single JSON object that strictly adheres to the provided schema. "
        "For 'skills' and 'saving_throws', provide the proficiency bonus (e.g., '+5'). "
        "For 'abilities' and 'actions', the 'name' is the title and the 'desc' is the full description. "
        "For damage and condition immunities/resistances/vulnerabilities, provide a comma-separated string (e.g., 'fire, poison'). "
        "If a field is not applicable, provide an empty string or empty list."
    )

    ollama_payload = {
        "model": model,
        "messages": [{"role": "user", "content": full_prompt}],
        "stream": False,
        "format": STATBLOCK_SCHEMA
    }

    try:
        resp = requests.post(f"{OLLAMA_HOST}/api/chat", json=ollama_payload, timeout=120)
        resp.raise_for_status()
        
        result = resp.json()
        content = result.get("message", {}).get("content", "")

        if isinstance(content, str):
            try:
                # The content should already be a JSON string, so parse it
                statblock = json.loads(content)
            except json.JSONDecodeError as e:
                # If parsing fails, it's a generation error
                error_message = f"Ollama returned malformed JSON. Error: {e}. Raw content: {content}"
                print(error_message)
                return jsonify({'error': error_message}), 500
        else:
             # If it's already a dict, which is unexpected but possible
            statblock = content

        if not isinstance(statblock, dict) or 'name' not in statblock:
             return jsonify({'error': 'AI failed to generate a valid statblock dictionary.'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f"An unexpected error occurred: {e}"}), 500

    return jsonify({
        "statblock": statblock
    })

if __name__ == "__main__":
    app.run(port=5000, host='0.0.0.0')