/* global Buffer, URL, console, process, structuredClone */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const clone = (value) => structuredClone(value);
const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept",
  });
  res.end(JSON.stringify(body));
};
const readJson = async (name) => JSON.parse(await readFile(join(root, "fixtures", name), "utf8"));
const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

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
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname;
    try {
      if (path === "/api/tasks") {
        if (method === "GET") return json(res, 200, clone(state.tasks));
        if (method === "POST") {
          const body = await parseBody(req);
          if (!body.title || !body.status) return json(res, 400, { message: "Task title and status are required" });
          const task = { id: body.id ?? `task-${++state.taskSequence}`, title: body.title, description: body.description ?? "", priority: body.priority ?? "medium", labels: body.labels ?? [], ...body };
          state.tasks.push(task); return json(res, 201, clone(task));
        }
        return json(res, 405, { message: "Method not allowed" });
      }
      const taskMove = path.match(/^\/api\/tasks\/([^/]+)\/move$/);
      if (taskMove) {
        if (method !== "POST") return json(res, 405, { message: "Method not allowed" });
        const index = state.tasks.findIndex((task) => task.id === decodeURIComponent(taskMove[1]));
        if (index === -1) return json(res, 404, { message: "Task not found" });
        const body = await parseBody(req); state.tasks[index] = { ...state.tasks[index], status: body.status };
        return json(res, 200, clone(state.tasks[index]));
      }
      const taskPatch = path.match(/^\/api\/tasks\/([^/]+)$/);
      if (taskPatch) {
        if (method !== "PATCH") return json(res, 405, { message: "Method not allowed" });
        const index = state.tasks.findIndex((task) => task.id === decodeURIComponent(taskPatch[1]));
        if (index === -1) return json(res, 404, { message: "Task not found" });
        state.tasks[index] = { ...state.tasks[index], ...(await parseBody(req)) };
        return json(res, 200, clone(state.tasks[index]));
      }
      if (path === "/api/activity-events") {
        if (method === "GET") return json(res, 200, clone(state.events));
        if (method === "POST") { const body = await parseBody(req); const event = { id: body.id ?? `evt-${++state.eventSequence}`, ...body }; state.events.unshift(event); return json(res, 201, clone(event)); }
        return json(res, 405, { message: "Method not allowed" });
      }
      if (path === "/api/workflow/nodes") {
        if (method === "GET") return json(res, 200, clone(state.nodes));
        return json(res, 405, { message: "Method not allowed" });
      }
      if (path === "/api/workflow/edges") {
        if (method === "GET") return json(res, 200, clone(state.edges));
        return json(res, 405, { message: "Method not allowed" });
      }
      const nodePatch = path.match(/^\/api\/workflow\/nodes\/([^/]+)$/);
      if (nodePatch) {
        if (method !== "PATCH") return json(res, 405, { message: "Method not allowed" });
        const index = state.nodes.findIndex((node) => node.id === decodeURIComponent(nodePatch[1]));
        if (index === -1) return json(res, 404, { message: "Workflow node not found" });
        const body = await parseBody(req);
        state.nodes[index] = { ...state.nodes[index], ...body, config: body.config ? { ...state.nodes[index].config, ...body.config } : state.nodes[index].config };
        return json(res, 200, clone(state.nodes[index]));
      }
      if (path === "/api/workflow/validate") {
        if (method !== "POST") return json(res, 405, { message: "Method not allowed" });
        const errors = [];
        if (!state.nodes.some((node) => node.type === "start")) errors.push("Missing a Start node in the workflow.");
        if (!state.nodes.some((node) => node.type === "end")) errors.push("Missing an End node in the workflow.");
        return json(res, 200, { success: errors.length === 0, errors });
      }
      if (path === "/api/workflow/simulate") {
        if (method !== "POST") return json(res, 405, { message: "Method not allowed" });
        return json(res, 200, { success: true, log: ["Starting simulation...", "Activated [Start] node.", "Successfully ran [Analyze Idea] with Gemini 1.5 Pro.", "Simulation completed successfully with no blocks."] });
      }
      if (path === "/api/workflow/publish") {
        if (method !== "POST") return json(res, 405, { message: "Method not allowed" });
        return json(res, 200, { success: true, version: `v1.${state.publishSequence++}.0` });
      }
      return json(res, 404, { message: "Route not found" });
    } catch {
      return json(res, 400, { message: "Invalid request body" });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 5174);
  const server = await createFixtureServer();
  server.listen(port, "localhost", () => console.log(`Fixture API server listening on http://localhost:${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
}
