def select_model(intent: str):
    mapping = {
        "legal": "gpt-4.1",
        "construction": "gemini-pro",
        "finance": "claude-3-sonnet",
        "general": "gpt-4.1-mini",
    }
    return mapping.get(intent, "gpt-4.1-mini")
