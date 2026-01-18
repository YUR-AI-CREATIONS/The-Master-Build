from franklin_backend.agents.agent_manager import AgentManager
from fastapi import APIRouter

router = APIRouter(prefix="/agents", tags=["agents"])
manager = AgentManager()


@router.get("/")
async def list_agents():
    return {"agents": manager.list_agents()}


@router.post("/run")
async def run_agent(agent_name: str, input_data: dict):
    return await manager.run_agent(agent_name, input_data)
