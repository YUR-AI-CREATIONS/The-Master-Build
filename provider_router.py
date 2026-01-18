# Deterministic provider routing
def route_request(provider: str) -> str:
    provider = provider.lower().strip()
    mapping = {
        "openai": "openai",
        "gpt": "openai",
        "anthropic": "anthropic",
        "claude": "anthropic",
        "google": "google",
        "gemini": "google",
        "stability": "stability",
    }
    return mapping.get(provider, "openai")
