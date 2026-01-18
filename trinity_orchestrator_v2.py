from .trinity_orchestrator import orchestrator


async def unified(prompt: str):
    # simple autorouter: claude for analysis, gpt4 for creative, gemini for reasoning
    if any(x in prompt.lower() for x in ["analyze", "explain", "break down"]):
        return await orchestrator.run("anthropic", prompt)

    if any(x in prompt.lower() for x in ["write", "create", "story", "generate"]):
        return await orchestrator.run("openai", prompt)

    return await orchestrator.run("google", prompt)
