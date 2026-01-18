# Cognitive Memory Graph – Detailed Design

## 1. Objectives
- Persist Trinity knowledge with provenance, confidence, and temporal context.
- Serve low-latency context retrieval for the orchestrator and mission agents.
- Provide review + correction workflows to keep facts trustworthy.
- Remain storage-pluggable (Neo4j or Postgres/pgvector) without API changes.

---

## 2. Functional Requirements
1. **Unified Knowledge Base**: ingest uploads, chat logs, telemetry, external APIs.
2. **Bidirectional Querying**: graph traversals + semantic similarity search.
3. **Temporal Diffing**: compare entity state across versions.
4. **Human-in-the-loop Validation**: queue for low-confidence or conflicting facts.
5. **Access Control**: project/org level scopes for missions.
6. **Observability**: metrics for ingest latency, graph size, retrieval hit rate.

---

## 3. High-Level Architecture
```
          +--------------------+
Uploads → | Ingestion Workers  | --+--> Normalizers --> Fact Extractors
Chats   → |  (FastAPI/Celery)  |   |
APIs    → +--------------------+   |
                                   v
                          +-------------------+
                          | Validation Queue  |---(approve/reject)--> Graph API
                          +-------------------+
                                   |
                                   v
                            +--------------+
                            | Graph Store  |
                            +--------------+
                                   |
                          +-------------------+
                          | Graph API / SDK   |
                          +-------------------+
                             |            |
              Mission Agents |            | Analytics
```

---

## 4. Storage Strategy
| Option | Pros | Cons | Status |
|--------|------|------|--------|
| **Neo4j Aura** | First-class graph queries, APOC procedures, managed service | Extra cost, dual persistence for embeddings | Recommended for pilot |
| **Postgres + pgvector** | Existing stack familiarity, single infra | Complex recursive queries, harder path analytics | Backup / fallback |

**Decision**: Start with Neo4j Aura Free/Professional tier. Keep repository adapters to allow Postgres implementation via repository pattern.

---

## 5. Data Model
### Core Entities
- `entity_node`
  - `id` (ULID), `type`, `name`, `properties` (JSONB), `embedding` (vector), `confidence` (0–1), `scope` (org/project/global), `created_at`, `updated_at`.
- `relation_edge`
  - `id`, `source_id`, `target_id`, `relation_type`, `weight`, `direction`, `citation_id`, `confidence`, `created_at`.
- `observation`
  - `id`, `source_type` (upload/chat/api/manual), `payload_uri`, `chunk_text`, `embedding`, `tokens`, `extracted_by`, `timestamp`.
- `timeline_event`
  - `id`, `entity_id`, `change_type` (create/update/delete/merge), `diff_blob`, `actor` (agent/human), `timestamp`.
- `validation_task`
  - `id`, `related_entity_ids`, `status` (pending/approved/rejected/escalated), `assigned_to`, `notes`.

### Neo4j Labels/Relationships
```
(:Entity {id, type, ...})
(:Observation {id, ...})
(:TimelineEvent {id, ...})
(:ValidationTask {id, ...})

(:Entity)-[:REL {id, type, weight}]->(:Entity)
(:Observation)-[:SUPPORTS]->(:Entity)
(:Observation)-[:EVIDENCES]->[:REL]
(:ValidationTask)-[:TARGETS]->(:Entity)
(:TimelineEvent)-[:APPLIES_TO]->(:Entity)
```

### Indexes
- `INDEX Entity.id UNIQUE`
- `INDEX Entity.type`
- `INDEX RelationEdge.id UNIQUE`
- `BTREE timeline_event.timestamp`
- `VECTOR INDEX Entity.embedding` (Aura vector index or external Milvus/PGV).

---

## 6. Ingestion Pipeline
1. **Source Registration**: metadata stored in `ingestion_sources` table (Postgres) for auditing.
2. **Chunking + Classification**
   - Text chunker (800 tokens overlap 200).
   - Media routed through Whisper / Gemini Audio for transcripts.
3. **Fact Extraction**
   - Prompt LLM to output JSON schema: `{entities: [...], relations: [...], observations: [...]}`.
   - Validate via Pydantic schemas; reject malformed outputs.
4. **Confidence Scoring**
   - Start with LLM-provided `confidence`; adjust via heuristics (source trust, duplication, alignment with existing data).
5. **Dedup/Merge**
   - Use embedding similarity + symbolic keys to match existing entities.
   - Auto-merge if similarity > 0.92 and no conflicting attributes; else create `validation_task`.
6. **Write Path**
   - Wrap graph writes in transaction + timeline events per change.
7. **Post-Write Hooks**
   - Trigger `graph_event` bus (Redis stream) to notify missions or caches.

---

## 7. Graph API Surface
| Method | Description |
|--------|-------------|
| `POST /graph/entities` | Create or update entity; optional merge strategy flag |
| `GET /graph/entities/{id}` | Fetch entity with neighbors, timeline snapshot |
| `POST /graph/query/semantic` | Body: `embedding`, `filters`; returns top-K nodes |
| `POST /graph/query/subgraph` | Accepts Cypher + guardrails, returns typed response |
| `POST /graph/validate/{task_id}/decision` | Approve/reject/clarify |
| `GET /graph/timeline` | Time-bounded events filtered by scope |

All responses include `provenance` arrays for downstream citation rendering.

### SDK Helpers
- `GraphClient.upsert_entity(entity: EntityNode)`
- `GraphClient.find_related(entity_id, relation_type, depth=2)`
- `GraphClient.semantic_search(query_text, scope, k=10)`
- `GraphClient.record_observation(observation: Observation)`

---

## 8. Caching & Retrieval
- Hot entities cached in Redis with 5-minute TTL; invalidated on `graph_event`.
- Embedding search served by vector index (Aura) or fallback to pgvector; caching query results by `(query_hash, scope)` for 60 seconds to reduce duplicate lookups during multi-agent missions.

---

## 9. Validation & Review Loop
- `validation_task` records auto-created when:
  - Confidence < 0.6
  - Conflicting attribute detected
  - Merge heuristic uncertain (0.75–0.92 similarity)
- Review UI (Phase 1 simple FastAPI + React page) allows human or Risk Officer agent to resolve.
- Decisions propagate to `timeline_event` and update entity confidence weights.

---

## 10. Security & Access Control
- Every entity & relation tagged with `scope` and optional `acl` array.
- Middleware injects `principal_scope` into Graph API; Cypher queries templated to enforce `scope IN $scopes`.
- Sensitive data flagged with `classification` (public/internal/confidential/restricted); retrieval requests must include matching clearance level.

---

## 11. Observability
- Metrics exported via Prometheus (`graph_ingest_latency_ms`, `graph_nodes_total`, `graph_relations_total`, `validation_queue_depth`).
- Structured logs for each ingestion batch with `source_id`, `entity_count`, `conflict_count`.
- Weekly job to snapshot graph stats → S3 for trend analysis.

---

## 12. Migration & Rollout Plan
1. **Week 1**: Provision Neo4j Aura, create schema, build FastAPI `graph` router with adapters.
2. **Week 2**: Implement ingestion worker + fact extraction pipeline for document uploads.
3. **Week 3**: Add validation queue + minimal reviewer UI.
4. **Week 4**: Wire orchestrator planner to query graph for mission context; enable semantic search caching.

---

## 13. Open Questions
1. Do we need per-entity encryption-at-rest beyond Aura default? (If yes → client-side field crypto.)
2. Should we keep Observations in object storage only (S3 + pointer) to reduce graph bloat?
3. What retention policy for low-confidence facts that remain unresolved >30 days?
