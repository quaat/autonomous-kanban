# API Contract

The frontend has a typed API boundary shared by three implementation phases:

- **Current mock client**: `src/api/mockApiClient.ts` runs fully in memory from `src/data` seeds.
- **Current fixture HTTP server**: `scripts/fixture-server.mjs` exposes the same DTO contract over local HTTP using cloned `fixtures/*.json` state for a single server session.
- **Future production backend**: a FastAPI or production service can replace the fixture server without changing UI components, hooks, or services.

No current implementation performs real worker execution, LLM calls, authentication, database writes, or GitHub/repository automation.

| Method | Path | Request DTO | Response DTO | Current mock client behavior | Current fixture HTTP behavior | Future backend expectation |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/tasks` | None | `TaskDto[]` | Returns cloned seeded board tasks. | Returns cloned in-memory tasks from `fixtures/tasks.json`. | Add auth scoping, pagination, and server-side filters if needed. |
| POST | `/api/tasks` | `CreateTaskRequestDto` | `TaskDto` | Appends a task with supplied or generated `task-*` ID. | Appends a session-local task and returns `201`; invalid bodies return `400`. | Validate required fields, status, workflow rules, and project scope. |
| PATCH | `/api/tasks/{id}` | `UpdateTaskRequestDto` without `id` in body | `TaskDto` | Shallow-merges task metadata or throws `TASK_NOT_FOUND`. | Shallow-merges task metadata; unknown IDs return `404`. | Return typed 404s and enforce editable field/schema constraints. |
| POST | `/api/tasks/{id}/move` | `{ "status": TaskStatusDto }` | `TaskDto` | Updates task status or throws `TASK_NOT_FOUND`. | Updates task status; unknown IDs return `404`. | Enforce workflow transitions and emit durable audit events. |
| GET | `/api/activity-events` | None | `ActivityEventDto[]` | Returns cloned seeded activity feed. | Returns cloned in-memory events from `fixtures/activity-events.json`. | Add cursor pagination and workspace scoping. |
| POST | `/api/activity-events` | `CreateActivityEventRequestDto` | `ActivityEventDto` | Prepends a supplied or generated `evt-*` event. | Prepends a session-local event and returns `201`. | Derive system events from domain actions where appropriate. |
| GET | `/api/workflow/nodes` | None | `WorkflowNodeDto[]` | Returns cloned seeded workflow nodes. | Returns cloned in-memory nodes from `fixtures/workflow-nodes.json`. | Version workflows and scope by project/workspace. |
| GET | `/api/workflow/edges` | None | `WorkflowEdgeDto[]` | Returns cloned seeded workflow edges. | Returns cloned in-memory edges from `fixtures/workflow-edges.json`. | Validate references and graph invariants. |
| PATCH | `/api/workflow/nodes/{id}` | `UpdateWorkflowNodeRequestDto` without `id` in body | `WorkflowNodeDto` | Shallow-merges node fields and merges `config`. | Shallow-merges node fields and merges `config`; unknown IDs return `404`. | Persist coordinates and validate per-node config schemas. |
| POST | `/api/workflow/validate` | None | `WorkflowValidationResultDto` | Checks for start and end nodes. | Checks for start and end nodes. | Add DAG, reachability, transition, and policy validation. |
| POST | `/api/workflow/simulate` | None | `WorkflowSimulationResultDto` | Returns canned successful simulation logs. | Returns canned successful simulation logs. | Run deterministic dry-runs without invoking real agents. |
| POST | `/api/workflow/publish` | None | `PublishWorkflowResultDto` | Returns a mock version string. | Returns a deterministic session-local mock version string. | Create immutable workflow versions and deployment audit records. |

DTO definitions live in `src/api/dto.ts`. UI/domain models remain in `src/types` and are bridged through `src/api/mappers.ts`.


## Validation and Error Behavior

The fixture server validates mutation request bodies before changing in-memory state:

- `400 Bad Request`: malformed JSON, non-object mutation bodies, missing required create fields, invalid task status/priority values, invalid activity event types, invalid numeric fields, invalid string-array fields, invalid workflow node positions, or invalid workflow node config objects.
- `404 Not Found`: unknown route, unknown task ID for task update/move, or unknown workflow node ID for node update.
- `405 Method Not Allowed`: recognized endpoint path with an unsupported HTTP method.
- `500 Internal Server Error`: unexpected fixture server failures only; invalid user payloads are reported as `400`, not collapsed into generic server errors.

Patch endpoints treat the path ID as authoritative. If a task or workflow-node patch body includes `id`, the fixture server ignores that body field and preserves the path ID.

The HTTP client validates response shapes at runtime before returning DTOs to services. Invalid enum/union values, missing required fields, or incorrectly typed optional fields cause `ApiError("HTTP_RESPONSE_INVALID", ...)`. Non-2xx HTTP responses are converted into typed `ApiError` instances such as `HTTP_NOT_FOUND` or `HTTP_SERVER_ERROR`.

Request timeout behavior is client-side. `HttpAutonomousDevelopmentApiClient` uses `AbortController`, defaults to `10000ms`, can be configured with `VITE_API_TIMEOUT_MS`, and throws `ApiError("HTTP_TIMEOUT", ...)` when a request exceeds the configured timeout.
