import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import App from "../App";

// Mock ResizeObserver for layout-dependent elements
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

describe("Autonomous Development Workbench UI - Comprehensive PR Test Suite", () => {
  it("renders the application shell successfully and waits for initial data load", async () => {
    render(<App />);

    // App shell check
    expect(screen.getByText("Autonomous Development")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument();

    // Wait for the specific task card (level 4 heading) to load to avoid act(...) warnings
    const taskCard = await screen.findByRole("heading", { name: "Worker claim and lease system", level: 4 });
    expect(taskCard).toBeInTheDocument();
  });

  it("renders the board view with all seven columns by default", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    // Wait for the data loading transition to complete
    await screen.findByRole("heading", { name: "Worker claim and lease system", level: 4 });

    // Verify all 7 columns exist on the Kanban Board as level 3 headings
    expect(screen.getByRole("heading", { name: "Idea", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ready for Implementation", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "To Do", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In Progress", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Feedback Required", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In Review", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done", level: 3 })).toBeInTheDocument();
  });

  it("renders key task cards under their respective columns", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    // Wait for load and check that the specific key cards exist as level 4 headings
    expect(await screen.findByRole("heading", { name: "Worker claim and lease system", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Configurable workflow builder", level: 4 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LLM review for verification pipeline", level: 4 })).toBeInTheDocument();
  });

  it("updates task detail drawer when clicking a task card", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    const card = await screen.findByRole("heading", { name: "Worker claim and lease system", level: 4 });
    fireEvent.click(card);

    // Verify drawer details are displayed
    expect(await screen.findByText("Task Thread Logs")).toBeInTheDocument();
    expect(screen.getByText("Assigned Agent")).toBeInTheDocument();
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0);
  });

  it("supports adding a comment in the task detail drawer to update local thread state", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    // Open task drawer by clicking task card level 4 heading
    const card = await screen.findByRole("heading", { name: "Worker claim and lease system", level: 4 });
    fireEvent.click(card);

    // Locate comment posting input
    const commentInput = await screen.findByPlaceholderText("Ask worker or append instruction...");
    expect(commentInput).toBeInTheDocument();

    // Type a comment
    fireEvent.change(commentInput, { target: { value: "Please verify database indexing" } });

    // Submit the comment
    const postButton = screen.getByRole("button", { name: "Post" });
    fireEvent.click(postButton);

    // Verify comment is rendered in the stream log
    expect(await screen.findByText("Please verify database indexing")).toBeInTheDocument();
  });

  it("navigates to the workflow view when clicking the visual editor navigation button", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    // Locate and click visual editor navigation
    const workflowLink = await screen.findByRole("button", { name: /switch to visual editor view/i });
    expect(workflowLink).toBeInTheDocument();

    fireEvent.click(workflowLink);

    // Check that we transitioned to the Workflow editor page
    expect(await screen.findByText("Workflow Builder")).toBeInTheDocument();
    expect(screen.getByText("Default Autonomous Delivery Flow")).toBeInTheDocument();
  });

  it("directly renders the workflow editor when accessing /workflow route", async () => {
    window.history.pushState({}, "", "/workflow");
    render(<App />);

    // Verify workflow elements load instantly
    expect(await screen.findByText("Workflow Builder")).toBeInTheDocument();
    
    // Verify core workflow nodes exist using unique ARIA labels
    expect(screen.getByLabelText("Select node: Analyze Idea")).toBeInTheDocument();
    expect(screen.getByLabelText("Select node: In Review")).toBeInTheDocument();
    expect(screen.getByLabelText("Select node: Blocked / Escalate")).toBeInTheDocument();
  });

  it("updates node inspector details when selecting a workflow node", async () => {
    window.history.pushState({}, "", "/workflow");
    render(<App />);

    // Select the "In Review" node
    const inReviewNode = await screen.findByLabelText("Select node: In Review");
    fireEvent.mouseDown(inReviewNode);

    // Verify Node Inspector has loaded the correct configuration fields
    expect(await screen.findByText("Transitions (3)")).toBeInTheDocument();
    expect(screen.getByText("REVIEW TASK")).toBeInTheDocument();
    
    // Check that config field inputs (like Reviewer) have correct initial values
    const reviewerInput = screen.getByLabelText("Reviewer Model");
    expect(reviewerInput).toHaveValue("GPT-4.1");
  });

  it("generates local UI toast feedback when clicking Validate, Simulation, and Publish on the workflow toolbar", async () => {
    window.history.pushState({}, "", "/workflow");
    render(<App />);

    // Wait for the workflow toolbar to load
    await screen.findByText("Default Autonomous Delivery Flow");

    // Click Validate
    const buttons = screen.getAllByRole("button");
    const validateBtn = buttons.find(btn => btn.textContent?.trim() === "Validate" || btn.textContent?.trim().startsWith("Validating"));
    expect(validateBtn).toBeDefined();
    fireEvent.click(validateBtn!);
    expect(await screen.findByText(/18 nodes validated successfully/i)).toBeInTheDocument();

    // Click Simulation
    const simulationBtn = buttons.find(btn => btn.textContent?.trim() === "Simulation" || btn.textContent?.trim().startsWith("Simulating"));
    expect(simulationBtn).toBeDefined();
    fireEvent.click(simulationBtn!);
    expect(await screen.findByText(/24 steps executed, 0 bottlenecks/i)).toBeInTheDocument();

    // Click Publish
    const publishBtn = buttons.find(btn => btn.textContent?.trim() === "Publish");
    expect(publishBtn).toBeDefined();
    fireEvent.click(publishBtn!);
    expect(await screen.findByText(/published as v/i)).toBeInTheDocument();
  });
});
