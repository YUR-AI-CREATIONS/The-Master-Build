from typing import Any, Dict, List


def build_execution_payload(
    prompt: str,
    provider: str = "openai",
    model: str = None,
    steps: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:

    return {
        "prompt": prompt,
        "provider": provider,
        "model": model,
        "steps": steps or [],
        "metadata": {"engine": "FranklinOS ExecutionFlow v1", "status": "ok"},
    }
