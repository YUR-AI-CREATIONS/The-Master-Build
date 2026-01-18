"""
Small runner for Trinity unified orchestrator.
Usage:
    python run_trinity.py --prompt "Tell me a story" [--dry-run] [--max-tokens 200] [--report report.json]

Dry-run will only classify and show routing order without calling APIs.
"""
import argparse
import json
from trinity_orchestrator_unified import classify_prompt, trinity_engine

p = argparse.ArgumentParser()
p.add_argument("--prompt", "-p", type=str, required=True)
p.add_argument("--dry-run", action="store_true")
p.add_argument("--max-tokens", type=int, default=600)
p.add_argument("--report", type=str, default="trinity_run_report.json")
args = p.parse_args()

report = {"prompt": args.prompt, "dry_run": args.dry_run, "results": [], "timestamp": __import__('time').strftime('%Y-%m-%d %H:%M:%S')}

if args.dry_run:
    primary = classify_prompt(args.prompt)
    ordered = [primary] + [e for e in ["Gemini","OpenAI","Anthropic"] if e != primary]
    print("Dry run routing order:", ordered)
    report["ordered"] = ordered
    with open(args.report, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"Report written to {args.report}")
else:
    try:
        res = trinity_engine(args.prompt, max_tokens=args.max_tokens)
        print("--- FINAL OUTPUT ---")
        print(f"Source: {res.get('engine')} | Latency: {res.get('latency')}s | Confidence: {res.get('confidence')}")
        print(res.get('text'))
        report["results"].append(res)
    except Exception as e:
        print("Engine error:", e)
        report["error"] = str(e)
    with open(args.report, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"Report written to {args.report}")
