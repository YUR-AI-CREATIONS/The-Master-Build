import os
import google.generativeai as genai
import anthropic
from openai import OpenAI

# ✅ Detect API keys
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
CLAUDE_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# ✅ Configure clients
genai.configure(api_key=GEMINI_KEY)
claude = anthropic.Anthropic(api_key=CLAUDE_KEY)
openai_client = OpenAI(api_key=OPENAI_KEY)

# ✅ Smart router logic
def choose_model(prompt: str):
    prompt_lower = prompt.lower()
    if any(word in prompt_lower for word in ["code", "python", "analyze", "explain", "data", "debug", "engineering"]):
        return "chatgpt"
    elif any(word in prompt_lower for word in ["story", "poem", "design", "art", "vision", "create", "future"]):
        return "gemini"
    else:
        return "claude"

# ✅ Unified response handler
def run_ai(prompt):
    model_choice = choose_model(prompt)
    print(f"\n🧭 Router selected: {model_choice.upper()}\n")

    if model_choice == "gemini":
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        print(f"🤖 Gemini says:\n{response.text}")

    elif model_choice == "claude":
        response = claude.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        print(f"🦉 Claude says:\n{response.content[0].text}")

    elif model_choice == "chatgpt":
        response = openai_client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400
        )
        print(f"💬 ChatGPT says:\n{response.choices[0].message.content}")

# ✅ Run once
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        prompt = input("Enter your prompt: ")
    else:
        prompt = " ".join(sys.argv[1:])
    run_ai(prompt)
