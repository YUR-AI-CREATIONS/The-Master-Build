"""
Run a set of smoke prompts against the unified orchestrator and write a human-readable integration report.
"""
import json
import time
import os
from trinity_orchestrator_unified import classify_prompt, trinity_engine

PROMPTS = [
    "Generate an image of a serene sunset over mountains",
    "Analyze sales data for quarterly trends and suggest improvements",
    "Discuss the ethics of artificial general intelligence in law and policy",
]

report = {"runs": [], "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')}

for p in PROMPTS:
    entry = {"prompt": p, "classification": classify_prompt(p)}
    try:
        start = time.time()
        # Support mocked mode to avoid external API calls in CI
        if os.getenv("TRINITY_MOCK"):
            # simple deterministic fake responses
            fake = {
                PROMPTS[0]: {"engine": "Gemini", "text": "<FAKE IMAGE OUTPUT>", "latency": 0.1, "confidence": 0.9},
                PROMPTS[1]: {"engine": "OpenAI", "text": "<FAKE ANALYSIS OUTPUT>", "latency": 0.1, "confidence": 0.92},
                PROMPTS[2]: {"engine": "Anthropic", "text": "<FAKE ETHICS OUTPUT>", "latency": 0.1, "confidence": 0.88},
            }
            res = fake.get(p, {"engine": "OpenAI", "text": "<FAKE>", "latency": 0.1, "confidence": 0.9})
        else:
            res = trinity_engine(p)
        entry["result"] = {"engine": res.get('engine'), "latency": res.get('latency'), "confidence": res.get('confidence'), "text_preview": (res.get('text') or '')[:400]}
        entry["ok"] = True
    except Exception as e:
        entry["ok"] = False
        entry["error"] = str(e)
    entry["duration"] = round(time.time() - start, 2)
    report["runs"].append(entry)

with open('trinity_integration_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

# Also write a short markdown summary
with open('trinity_integration_report.md', 'w', encoding='utf-8') as f:
    f.write('# Trinity Integration Report\n\n')
    f.write(f'Generated: {report["timestamp"]}\n\n')
    for r in report['runs']:
        f.write(f'## Prompt: {r["prompt"]}\n')
        f.write(f'- Classification: {r["classification"]}\n')
        if r.get('ok'):
                f.write(f'- Engine: {r["result"]["engine"]} | Latency: {r["result"]["latency"]}s | Confidence: {r["result"].get("confidence")}\n')
                f.write('- Preview:\n\n')
                f.write('```\n')
                f.write(r["result"]["text_preview"] or "")
                f.write('\n```\n')
        else:
            f.write(f'- Error: {r.get("error")}\n')
        f.write('\n')

print('Smoke test complete. Reports: trinity_integration_report.json, trinity_integration_report.md')
