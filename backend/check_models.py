# check_models.py
# Run this to see which models YOUR API key can actually use
# Command: venv\Scripts\python.exe check_models.py

import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("=== Models available for your API key ===\n")

for m in client.models.list():
    for action in m.supported_actions:
        if action == "generateContent":
            print(m.name)