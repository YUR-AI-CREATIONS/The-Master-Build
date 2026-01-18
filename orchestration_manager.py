class OrchestrationManager:
    async def run(self, task: str, intent: str, file):
        result = {
            "task": task,
            "intent": intent,
            "file_received": file.filename if file else None,
            "message": "Orchestration pipeline triggered successfully.",
        }
        return result
