import uuid
from typing import Any, Dict

from .execution_flow import build_execution_payload
from .model_selector import select_model
from .provider_router import route_request


class TrinityOrchestrator:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def start_session(self):
        sid = str(uuid.uuid4())
        self.sessions[sid] = {"messages": []}
        return sid

    async def run(self, provider: str, prompt: str, model: str | None = None):
        model_to_use = model or select_model(provider)
        payload = build_execution_payload(prompt, model_to_use)

        response = await route_request(provider, payload)

        return {
            "provider": provider,
            "model": model_to_use,
            "response": response,
        }


orchestrator = TrinityOrchestrator()
