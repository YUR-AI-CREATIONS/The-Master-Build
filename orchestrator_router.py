from fastapi import APIRouter, File, Form, UploadFile
from franklin_backend.services.intent_classifier import classify_intent

from franklin_backend.orchestrator.orchestration_manager import OrchestrationManager

router = APIRouter(prefix="/orchestrator", tags=["orchestrator"])
manager = OrchestrationManager()


@router.post("/execute")
async def orchestrate(task: str = Form(...), file: UploadFile = File(None)):
    intent = classify_intent(task)
    return await manager.run(task, intent, file)
