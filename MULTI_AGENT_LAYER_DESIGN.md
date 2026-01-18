# Multi-Agent Mission Layer – Detailed Design

## Goals
- Coordinate specialized AI + human agents through a governed mission lifecycle.
- Provide transparent timelines, provenance, and replayable reasoning paths.
- Enforce safety/compliance via Critic + Risk Officer checkpoints.
- Make collaboration assets reusable across missions via the cognitive memory graph.

---

## Agent Roster (Phase 1)
| Agent | Core Responsibilities | Inputs | Outputs |
|-------|-----------------------|--------|---------|
| **Planner** | Decompose user intent into mission plan (DAG), determine graph queries, assign agents, define acceptance criteria. | User request, policy context, knowledge graph snapshot. | Mission DAG, task briefs, resource requirements. |
| **Researcher** | Retrieve facts from graph + external APIs, generate evidence packets with citations. | Planner briefs, graph queries, tools (web, data connectors). | Evidence bundle, link to observations, confidence metrics. |
| **Analyst** | Perform reasoning, calculations, or simulations over evidence; produce structured findings. | Evidence bundles, numeric/data contexts. | Findings JSON, metrics tables, scenario analyses. |
| **Builder** (optional) | Generate artifacts (code, visuals, presentations) based on Analyst guidance. | Findings, design specs. | Artifacts stored in object storage + references. |
| **Synthesizer** | Compose final narrative or report, referencing evidence; adds citations + disclaimers. | Findings, artifacts, policy notes. | Final deliverable, summary, call-to-action. |
| **Critic** | Evaluate outputs for factual accuracy, bias, and hallucinations; request revisions. | Intermediate outputs, evidence bundles. | Review notes, pass/fail flags, hallucination report. |
| **Risk Officer** | Check compliance with policies (jurisdiction, sensitivity), escalate to humans when thresholds hit. | Critic reports, mission metadata, policies. | Approval decision, escalation ticket. |
| **Coordinator** (runtime service) | Maintains mission timeline, routes messages, handles retries/timeouts. | All agent states. | Timeline log, notifications, state machine updates. |

---

## Mission Lifecycle
1. **Intake**
   - User request hits `/missions` endpoint.
   - Authentication & scope validation.
   - Planner receives normalized intent + policy context.

2. **Planning**
   - Planner queries cognitive memory graph for relevant entities.
   - Outputs DAG: nodes = tasks with `agent_role`, `dependencies`, `success_criteria`, `priority`, `sla`.
   - Coordinator persists plan (Postgres `missions`, `tasks` tables) and publishes `mission.created` event.

3. **Execution Loop**
   - Coordinator activates tasks whose dependencies satisfied.
   - Role-specific agents fetch briefs via `/tasks/{id}`.
   - Agents stream intermediate thoughts to `mission_timeline` log for replay.
   - Outputs stored in object storage; metadata recorded in knowledge graph as Observations.

4. **Validation**
   - Critic automatically reviews each major deliverable using rulebook (`critique_prompts.yaml`).
   - Failures reroute task to originating agent with Critic notes.
   - After Critic pass, Risk Officer verifies compliance; may trigger human sign-off for `risk_level >= high`.

5. **Synthesis & Handoff**
   - Synthesizer assembles final deliverable referencing graph IDs + artifacts.
   - Coordinator packages final response (JSON + attachments) and updates mission status.
   - Knowledge graph ingestion pipeline merges new facts/observations; mission summary stored for retrieval.

6. **Retrospective**
   - Telemetry + user rating recorded.
   - Mission replay available: timeline of agent states, decisions, Critic/Risk outcomes.

---

## Collaboration Primitives
- **Mission Timeline Log** (`missions_timeline`): append-only events with `{mission_id, actor, event_type, payload, timestamp}` used for replay/visualization.
- **Artifact Registry**: S3/GCS bucket with metadata table linking to tasks + agents; includes checksum + access scope.
- **Conversation Channel**: WebSocket/Redis stream mixing human + agent messages; supports human override or injection.
- **Decision Tickets**: Structured objects used by Critic/Risk Officer to request clarifications or escalate.

---

## Governance & Policy
- **Policy Packs**: YAML files describing constraints (e.g., "medical" missions require human approval before delivery).
- **Guardrails**:
  - Planner cannot assign Analyst tasks without at least one evidence source.
  - Critic must run before Risk Officer; failure to respond within SLA triggers auto-escalation.
  - Certain agent roles (Builder) disabled if customer lacks consent for generative outputs.
- **Human Control Points**:
  - Manual approval step after Risk Officer for `critical` missions.
  - Humans can inject corrections at any timeline event; Coordinator reroutes tasks accordingly.
- **Auditability**: Every agent decision stored with prompt, model, parameters, and citations for post-mortems.

---

## Technical Architecture
```
+-------------------+        +-------------------+
| Mission API       |        | Mission Timeline  |
| (FastAPI)         |        | (Postgres/Redis)  |
+---------+---------+        +---------+---------+
          |                             |
          v                             v
+-------------------+        +-------------------+
| Coordinator       | <----> | Agent Runtime Bus |
| (state machine)   |        | (Redis streams)   |
+---------+---------+        +---------+---------+
          |                             |
          v                             v
   +------+-------+          +-------------------+
   | Agents (LLM) | <------> | Engine Mesh / SDK |
   +--------------+          +-------------------+
```
- Agents run as orchestrator plugins calling heavy endpoint + engine mesh routing.
- Coordinator ensures retries, backoff, and dependency tracking.
- Mission data persisted for analytics + replay.

---

## Data Model Highlights
- `missions`: `{id, title, requester, scope, status, risk_level, created_at}`
- `mission_tasks`: `{id, mission_id, role, state, inputs, outputs_uri, attempts, sla_deadline}`
- `mission_events`: timeline log (JSONB payload).
- `decision_tickets`: `{id, mission_id, task_id, raised_by, status, notes}`

---

## Failure Handling
- **Timeouts**: Coordinator detects if agent exceeds SLA; auto-reassigns or escalates to human.
- **Conflicts**: If Critic detects contradictory evidence, spawn `validation_task` in graph and pause mission until resolved.
- **Engine Failures**: Leveraging engine mesh cooldown—Coordinator receives `engine.degraded` events and reschedules tasks with alternate engines.

---

## Security Considerations
- Strict scoping on mission data access; tokens include `mission_scope` to prevent cross-project leaks.
- Secrets (API keys) injected per agent via Vault-like service.
- Logging pipeline redacts PII before storing timeline events.

---

## Implementation Roadmap
1. **Week 1**: Build mission data models + Coordinator skeleton; implement Planner + Researcher agents calling existing orchestrator endpoints.
2. **Week 2**: Add Critic + Synthesizer roles; wire mission timeline UI stub.
3. **Week 3**: Introduce Risk Officer + human approval workflows; connect to policy packs.
4. **Week 4**: Ship replay viewer + artifact registry integration; beta-test with internal missions.

---

## Open Questions
1. Should Coordinator be event-driven (Temporal/Temporal.io) or custom state machine? (Current plan: lightweight custom service.)
2. What’s the minimum artifact retention window for compliance (30 vs 90 days)?
3. Do we allow agent self-promotion (Analyst requesting additional Researcher tasks) in Phase 1, or keep strict Planner control?
