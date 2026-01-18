import os
import google.generativeai as genai
import anthropic
from openai import OpenAI

# Load API keys
gemini_key = os.getenv("GEMINI_API_KEY")
claude_key = os.getenv("ANTHROPIC_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

# Check which keys are active
print("✅ API key status:")
print(f"Gemini active:  {bool(gemini_key)}")
print(f"Claude active:  {bool(claude_key)}")
print(f"ChatGPT active: {bool(openai_key)}")

# Initialize each client
genai.configure(api_key=gemini_key)
claude = anthropic.Anthropic(api_key=claude_key)
gpt = OpenAI(api_key=openai_key)

# Shared test prompt
prompt = "Describe the future of AI and human collaboration in two sentences."

print("\n🤖 Gemini says:")
gemini_model = genai.GenerativeModel("gemini-2.0-flash")
print(gemini_model.generate_content(prompt).text)

print("\n🦉 Claude says:")
response = claude.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=300,
    messages=[{"role": "user", "content": prompt}]
)
print(response.content[0].text)

print("\n💬 ChatGPT says:")
completion = gpt.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}]
)
print(completion.choices[0].message.content)
