/* global Buffer, URL, console, process, structuredClone */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const taskStatuses = ["idea", "ready_for_implementation", "to_do", "in_progress", "feedback_required", "in_review", "done"];
const taskPriorities = ["low", "medium", "high"];
const activityEventTypes = ["info", "success", "warning", "error", "agent"];
const agents = ["Claude", "Codex", "GPT-4.1", "Gemini 1.5 Pro"];

const clone = (value) => structuredClone(value);
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value) => typeof value === "string";
const isNonEmptyString = (value) => isString(value) && value.trim().length > 0;
const isStringArray = (value) => Array.isArray(value) && value.every(isString);
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const oneOf = (values, value) => isString(value) && values.includes(value);
const isTaskStatus = (value) => oneOf(taskStatuses, value);
const isTaskPriority = (value) => oneOf(taskPriorities, value);
const isActivityEventType = (value) => oneOf(activityEventTypes, value);
const isAgent = (value) => oneOf(agents, value);
const hasPosition = (value) => isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
const hasReviewIteration = (value) =>
  isRecord(value) && isFiniteNumber(value.current) && isFiniteNumber(value.max);
const optional = (body, key, guard, label = key) => {
  if (body[key] !== undefined && !guard(body[key])) return `${label} is invalid`;
  return null;
};

const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept",
  });
  res.end(JSON.stringify(body));
};
const badRequest = (res, message) => json(res, 400, { message });
const methodNotAllowed = (res) => json(res, 405, { message: "Method not allowed" });
const notFound = (res, message = "Route not found") => json(res, 404, { message });
const readJson = async (name) => JSON.parse(await readFile(join(root, "fixtures", name), "utf8"));

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return { __invalidJson: true };
  }
};

const readBodyRecord = async (req, res) => {
  const body = await parseBody(req);
  if (body?.__invalidJson) {
    badRequest(res, "Request body must be valid JSON");
    return null;
  }
  if (!isRecord(body)) {
    badRequest(res, "Request body must be a JSON object");
    return null;
  }
  return body;
};

const taskBodyError = (body, { requireTitle = false, requireStatus = false } = {}) => {
  if (requireTitle && !isNonEmptyString(body.title)) return "Task title is required";
  if (body.title !== undefined && !isString(body.title)) return "Task title must be a string";
  if (requireStatus && !isTaskStatus(body.status)) return "Task status is required and must be valid";
  if (body.status !== undefined && !isTaskStatus(body.status)) return "Task status must be valid";
  return (
    optional(body, "priority", isTaskPriority, "Task priority") ??
    optional(body, "labels", isStringArray, "Task labels") ??
    optional(body, "dependencies", isStringArray, "Task dependencies") ??
    optional(body, "blockedBy", isStringArray, "Task blockedBy") ??
    optional(body, "progress", isFiniteNumber, "Task progress") ??
    optional(body, "comments", isFiniteNumber, "Task comments") ??
    optional(body, "agent", isAgent, "Task agent") ??
    optional(body, "reviewIteration", hasReviewIteration, "Task reviewIteration") ??
    optional(body, "id", isString, "Task id") ??
    optional(body, "description", isString, "Task description") ??
    optional(body, "branch", isString, "Task branch") ??
    optional(body, "dueDate", isString, "Task dueDate") ??
    optional(body, "assigneeAvatar", isString, "Task assigneeAvatar") ??
    optional(body, "elapsed", isString, "Task elapsed")
  );
};

const eventBodyError = (body) => {
  if (!isString(body.time)) return "Activity event time is required";
  if (!isActivityEventType(body.type)) return "Activity event type is required and must be valid";
  if (!isNonEmptyString(body.message)) return "Activity event message is required";
  return optional(body, "detail", isString, "Activity event detail") ?? optional(body, "agent", isString, "Activity event agent");
};

const workflowNodePatchError = (body) =>
  optional(body, "label", isString, "Workflow node label") ??
  optional(body, "subtitle", isString, "Workflow node subtitle") ??
  optional(body, "position", hasPosition, "Workflow node position") ??
  optional(body, "config", isRecord, "Workflow node config");

export async function createFixtureServer() {
  const state = {
    tasks: await readJson("tasks.json"),
    events: await readJson("activity-events.json"),
    nodes: await readJson("workflow-nodes.json"),
    edges: await readJson("workflow-edges.json"),
    taskSequence: 1000,
    eventSequence: 1000,
    publishSequence: 1,
  };

  return createServer(async (req, res) => {
    const method = req.method ?? "GET";
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Accept",
      });
      res.end();
      return;
    }

    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const path = url.pathname;

      if (path === "/api/tasks") {
        if (method === "GET") return json(res, 200, clone(state.tasks));
        if (method !== "POST") return methodNotAllowed(res);
        const body = await readBodyRecord(req, res);
        if (!body) return;
        const error = taskBodyError(body, { requireTitle: true, requireStatus: true });
        if (error) return badRequest(res, error);
        const task = {
          id: body.id ?? `task-${++state.taskSequence}`,
          title: body.title,
          description: body.description ?? "",
          priority: body.priority ?? "medium",
          labels: body.labels ?? [],
          ...body,
        };
        state.tasks.push(task);
        return json(res, 201, clone(task));
      }

      const taskMove = path.match(/^\/api\/tasks\/([^/]+)\/move$/);
      if (taskMove) {
        if (method !== "POST") return methodNotAllowed(res);
        const index = state.tasks.findIndex((task) => task.id === decodeURIComponent(taskMove[1]));
        if (index === -1) return notFound(res, "Task not found");
        const body = await readBodyRecord(req, res);
        if (!body) return;
        if (!isTaskStatus(body.status)) return badRequest(res, "Task status is required and must be valid");
        state.tasks[index] = { ...state.tasks[index], status: body.status };
        return json(res, 200, clone(state.tasks[index]));
      }

      const taskPatch = path.match(/^\/api\/tasks\/([^/]+)$/);
      if (taskPatch) {
        if (method !== "PATCH") return methodNotAllowed(res);
        const id = decodeURIComponent(taskPatch[1]);
        const index = state.tasks.findIndex((task) => task.id === id);
        if (index === -1) return notFound(res, "Task not found");
        const body = await readBodyRecord(req, res);
        if (!body) return;
        const error = taskBodyError(body);
        if (error) return badRequest(res, error);
        const patch = { ...body };
        delete patch.id;
        state.tasks[index] = { ...state.tasks[index], ...patch, id };
        return json(res, 200, clone(state.tasks[index]));
      }

      if (path === "/api/activity-events") {
        if (method === "GET") return json(res, 200, clone(state.events));
        if (method !== "POST") return methodNotAllowed(res);
        const body = await readBodyRecord(req, res);
        if (!body) return;
        const error = eventBodyError(body);
        if (error) return badRequest(res, error);
        const event = { id: body.id ?? `evt-${++state.eventSequence}`, ...body };
        state.events.unshift(event);
        return json(res, 201, clone(event));
      }

      if (path === "/api/workflow/nodes") {
        if (method === "GET") return json(res, 200, clone(state.nodes));
        return methodNotAllowed(res);
      }
      if (path === "/api/workflow/edges") {
        if (method === "GET") return json(res, 200, clone(state.edges));
        return methodNotAllowed(res);
      }

      const nodePatch = path.match(/^\/api\/workflow\/nodes\/([^/]+)$/);
      if (nodePatch) {
        if (method !== "PATCH") return methodNotAllowed(res);
        const id = decodeURIComponent(nodePatch[1]);
        const index = state.nodes.findIndex((node) => node.id === id);
        if (index === -1) return notFound(res, "Workflow node not found");
        const body = await readBodyRecord(req, res);
        if (!body) return;
        const error = workflowNodePatchError(body);
        if (error) return badRequest(res, error);
        const patch = { ...body };
        delete patch.id;
        state.nodes[index] = {
          ...state.nodes[index],
          ...patch,
          id,
          config: patch.config
            ? { ...state.nodes[index].config, ...patch.config }
            : state.nodes[index].config,
        };
        return json(res, 200, clone(state.nodes[index]));
      }

      if (path === "/api/workflow/validate") {
        if (method !== "POST") return methodNotAllowed(res);
        const errors = [];
        if (!state.nodes.some((node) => node.type === "start")) errors.push("Missing a Start node in the workflow.");
        if (!state.nodes.some((node) => node.type === "end")) errors.push("Missing an End node in the workflow.");
        return json(res, 200, { success: errors.length === 0, errors });
      }
      if (path === "/api/workflow/simulate") {
        if (method !== "POST") return methodNotAllowed(res);
        return json(res, 200, { success: true, log: ["Starting simulation...", "Activated [Start] node.", "Successfully ran [Analyze Idea] with Gemini 1.5 Pro.", "Simulation completed successfully with no blocks."] });
      }
      if (path === "/api/workflow/publish") {
        if (method !== "POST") return methodNotAllowed(res);
        return json(res, 200, { success: true, version: `v1.${state.publishSequence++}.0` });
      }
      return notFound(res);
    } catch (error) {
      console.error(error);
      return json(res, 500, { message: "Fixture server error" });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 5174);
  const server = await createFixtureServer();
  server.listen(port, "localhost", () => console.log(`Fixture API server listening on http://localhost:${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
