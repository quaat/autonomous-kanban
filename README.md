# Autonomous Development Workbench

An autonomous development productivity platform mockup featuring interactive, high-fidelity replicas of the **Kanban Board Dashboard** and the **Visual Workflow Editor**. It represents a state-of-the-art SaaS workspace designed for monitoring, configuring, and executing recursive multi-agent software engineering pipelines.

---

## 🔒 Scope & Local State Engine

This application is a **pure frontend-only client-side mockup**.
- **No Real Backend/API Integrations**: The workspace operates completely client-side. No real database (PostgreSQL, Firestore), user authentication servers, nor LLM endpoints (Gemini, Claude, OpenAI) are accessed.
- **High-Fidelity Mock Datasets**: Pre-populated datasets simulate real-world developer agents, multi-agent code compilation loops, automated testing runs, and active verification pipelines.
- **Local Reactive State**: State modifications (e.g., adding task comments, changing node thresholds, dragging-and-dropping task cards) are managed via React hooks. Transitions between board and workflow views are immediate and preserve local memory changes during the session.

---

## 🛠️ Architecture and Layout Choices

The application is structured as a modular, strictly type-safe React + TypeScript + Vite SPA, adhering to modern design practices:

1. **Unified Application Shell (`src/components/shell/AppShell.tsx`)**: Controls visual navigation, layout headers, and real-time status indicators (such as active worker metrics). Navigation uses zero-reload tab triggers.
2. **Interactive Kanban Board (`src/components/board/BoardPage.tsx`)**: Displays tasks across 7 columns (`Idea`, `Ready for Implementation`, `To Do`, `In Progress`, `Feedback Required`, `In Review`, `Done`). Handles native HTML5 drag-and-drop mechanics with live audit event logs generated dynamically in response to user actions.
3. **Rich Task Detail Drawer (`src/components/board/TaskDetailDrawer.tsx`)**: Click any card to slide out a details panel with:
   - An interactive, checklist-based acceptance criteria tracker.
   - Live context logs showing downstream/upstream task dependency lines.
   - An active comment threat where user submissions append immediately to the local thread.
   - Detailed assignee worker cards and technical metadata.
4. **Interactive Visual Canvas (`src/components/workflow/WorkflowCanvas.tsx`)**: Custom SVGs render clean bezier curves with arrow heads and custom tags ("Yes", "No", "On Pass") connecting draggable workflow nodes. Dragging nodes updates coordinates dynamically in real-time.
5. **Node Configuration Inspector (`src/components/workflow/WorkflowInspector.tsx`)**: Reveals properties, comment feeds, and transitions for the selected node. Configuration inputs (such as reviewer models, iterations, and severity thresholds) update the active workflow structure instantly.

---

## 🧭 Navigation and Routes

The application utilizes `react-router-dom` for route-based rendering and bookmarkable states:
- **`/`**: Renders the **Kanban Board Dashboard** with active status rails and interactive cards.
- **`/workflow`**: Directly launches the **Visual Workflow Designer** with the SVG dotted canvas and node inspectors.
- *Wildcard route fallback (`*`)* automatically handles routing gracefully back to the main Kanban Board.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: Version **20.19+** or **22.12+** is recommended for modern TypeScript feature stripping and compilation.
- **npm**: Package manager (pre-installed with Node.js).

### 1. Install Dependencies
To perform a clean production-grade package installation:
```bash
npm ci
```

### 2. Start Local Development Server
To launch the developer dev server:
```bash
npm run dev
```
By default, the server is configured to run on port `3000`. In the AI Studio sandbox development environment, Hot Module Replacement (HMR) is disabled by the platform config to guarantee maximum rendering consistency and memory state retention.

### 3. Build for Production
To bundle and optimize the static client SPA for production:
```bash
npm run build
```
Optimized assets will be output to the `/dist` directory.

### 4. Quality, Lint, and Test Checks
This project is configured with a rigorous verification pipeline to remain fully **PR-ready** at any time. You can run all verification checks in a single script:
```bash
npm run check
```
The check script executes the following sequence:
- **Type Checking (`npm run typecheck`)**: Compiles types under strict type-safety rules (`tsc --noEmit`).
- **Linting (`npm run lint`)**: Validates code quality and standards using ESLint (`eslint .`).
- **Unit & Integration Testing (`npm run test`)**: Executes Vitest specs (`vitest run`).
- **Bundling (`npm run build`)**: Bundles the application with Vite to verify production assets compile cleanly.

---

## 🎨 Visual Polish & Theme Pairings

This application leverages the **Professional Polish** design system:
- **Slate Light Aesthetic**: Low-fatigue off-whites paired with crisp charcoal typography and high-contrast blue/emerald accent branding.
- **Purposeful Motion**: Smooth transitions and micro-interactions are implemented with CSS/Tailwind utilities.
- **Accessibility & ARIA Standards**: Fully semantic markup utilizing explicit keyboard accessibility, tabbable elements, rich custom headings (`level: 3` and `level: 4`), and clear interactive tags (`aria-label`, `aria-hidden`, and element `id` selectors).
