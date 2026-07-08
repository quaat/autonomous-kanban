# Autonomous Development Workbench

An autonomous development productivity platform mockup featuring interactive, high-fidelity replicas of the **Kanban Board Dashboard** and the **Visual Workflow Editor**. It represents a SaaS-style workspace for monitoring and configuring recursive multi-agent software engineering pipelines without connecting to real external systems.

---

## 🔒 Scope & Mock API Boundary

This application is a **frontend-only client-side mockup**.

- **No real backend integrations**: no production APIs, databases, authentication, GitHub/repository access, LLM providers, workers, or coding agents are contacted.
- **Mock API client only**: UI components call hooks, hooks call services, services call the typed API client interface, and the current client implementation is `src/api/mockApiClient.ts`.
- **Typed API contract layer**: DTOs are defined separately from UI/domain types in `src/api/dto.ts`; mappers in `src/api/mappers.ts` keep the UI insulated from future backend DTO changes.
- **API contract documentation**: intended future HTTP endpoints are documented in `docs/api-contract.md`.
- **Local mock state**: the mock API uses seeded data from `src/data` and simulates network-compatible async calls with small latency.

### API mode

The supported mode today is mock mode:

```bash
VITE_API_MODE=mock npm run dev
```

`VITE_API_MODE` defaults to `mock` when unset. `VITE_API_MODE=http` is intentionally not implemented yet and fails clearly so a future backend integration can be added deliberately by replacing the factory branch in `src/api/client.ts` with a real HTTP client.

---

## 🛠️ Architecture and Layout Choices

The application is structured as a modular React + TypeScript + Vite SPA:

1. **Unified Application Shell (`src/components/shell/AppShell.tsx`)**: controls visual navigation, layout headers, and status indicators.
2. **Interactive Kanban Board (`src/components/board/BoardPage.tsx`)**: displays tasks across 7 columns (`Idea`, `Ready for Implementation`, `To Do`, `In Progress`, `Feedback Required`, `In Review`, `Done`) with native drag-and-drop and activity logs.
3. **Rich Task Detail Drawer (`src/components/board/TaskDetailDrawer.tsx`)**: exposes task metadata, dependency context, worker details, and local comment interactions.
4. **Interactive Visual Canvas (`src/components/workflow/WorkflowCanvas.tsx`)**: renders workflow nodes and SVG edges, with draggable node coordinates saved through the service/API boundary.
5. **Node Configuration Inspector (`src/components/workflow/WorkflowInspector.tsx`)**: updates selected node configuration locally through the mock API service path.
6. **Service/API boundary (`src/services`, `src/api`)**: prepares the frontend for a future backend while preserving current UI behavior.

---

## 🧭 Navigation and Routes

- **`/`**: renders the Kanban Board Dashboard.
- **`/workflow`**: renders the Visual Workflow Designer.
- **`*`**: falls back gracefully to the main Kanban Board.

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js**: version **20.19+** or **22.12+** is recommended.
- **npm**: package manager included with Node.js.

### Install dependencies

```bash
npm ci
```

### Start local development server

```bash
npm run dev
```

The Vite dev server is configured for port `3000`.

### Build for production

```bash
npm run build
```

Optimized assets are written to `/dist`.

### Quality, lint, and test checks

```bash
npm run check
```

This runs type checking, ESLint, Vitest, and the production build.

---

## 🎨 Visual Polish & Theme Pairings

- **Slate light aesthetic**: low-fatigue off-whites with crisp slate typography and blue/emerald accents.
- **Purposeful motion**: transitions and micro-interactions are implemented with CSS/Tailwind utilities; Framer Motion is not installed.
- **Accessibility & ARIA standards**: semantic markup, explicit labels, and keyboard-friendly controls are used throughout the mock UI.
