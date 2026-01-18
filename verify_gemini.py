# verify_gemini.py
import os
from google import genai

# Check for key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: No GEMINI_API_KEY found. Run this in a new Command Prompt after setting it with setx.")
    exit(1)

print("✅ Found GEMINI_API_KEY")

try:
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Write a one-line poem about the dawn of AI."
    )
    print("\n✅ Gemini connection successful!\n")
    print("Gemini says:", response.text)
except Exception as e:
    print("\n❌ Error talking to Gemini:")
    print(e)
