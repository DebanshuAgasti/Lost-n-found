---
name: zenith
description: Run a long-running software engineering mission using the Zenith continuous-improvement harness via MCP/ACP.
---

# Zenith Mission Skill

First read .claude/orchestrator_prompt.md (or .codex/orchestrator_prompt.md when running in Codex, or .hermes/orchestrator_prompt.md when in Hermes) and treat it as your primary role, then use Zenith to run this mission.

---

## About the Zenith Harness

**Zenith** is a continuous-improvement agent harness engineered by Intelligent Internet for long-horizon software engineering tasks that span hours, days, or weeks.

### Why Zenith?
Long-running AI agents rarely fail because they lack coding capability; their dominant failure mode is **premature completion**—declaring victory and stopping before all corner cases, regressions, integration details, and contract criteria are verified.

* **Contrast with RALPH**:
  - The RALPH baseline reopens the gap between the current state and original requirement by looping fresh sessions.
  - However, RALPH is prohibitively expensive (averaging \$407.58/task) and lacks a principled stopping rule.
* **The Zenith Advantage**:
  - Replaces brute-force restarts with **adaptive orchestration**.
  - A single orchestrator coordinates workers, independent adversarial validators, dynamic skill registration, and formal contract evaluation over MCP/ACP.
  - Achieves **#1 overall ranking** on the Frontier SWE benchmark (GPT-5.5 / Zenith with 92% dominance) and reduces per-task execution costs by more than 50% (\$175.68/task).

---

## Zenith Architecture & Core Mechanisms

1. **Investigation Before Planning**:
   - Builds a thorough mission model from primary evidence (existing code, tests, runtime environment, constraints, and non-goals) before drafting contracts.
2. **Falsifiable Contracts**:
   - Turns user intent into strict, verifiable contracts (`VAL-*`, `EXP-*`) before tasks run.
3. **Independent Adversarial Validation**:
   - Workers implement solutions, but separate validators independently probe the changes for subtle regressions, edge cases, and shortcut passes.
4. **Adaptive Lifecycle**:
   - `start_project`: Initializes project bucket.
   - `submit_plan`: Registers contract and task DAG.
   - `advance_project`: Dispatches runnable tasks and evaluates gates.
   - `decide_attention`: Addresses runtime bottlenecks, unexpected errors, or plan divergences.
   - `end_mission`: Requests closure only after all acceptance gates pass terminal review.

---

## How to Start / Check Zenith

If Zenith is not already running or needs to be re-initialized:

### 1. Verify Zenith MCP Server
Zenith runs as an MCP stdio server configured in `.mcp.json` or `.codex/config.toml`:
```bash
uv run --project D:\Lost-n-found\zenith_repo\zenith zenith-server --mode orchestrator
```

### 2. Inspecting Projects via CLI
From the Zenith checkout (`D:\Lost-n-found\zenith_repo\zenith`):
```bash
# List all active and past projects
uv run zenith list-projects

# Inspect tasks for an active project
uv run zenith inspect-tasks <project-id>

# Show project envelope and execution status
uv run zenith show-project <project-id>
```

### 3. Re-initializing a Workspace
To re-stage the orchestrator prompt, agents, and bundled skills:
```bash
uv run zenith init --workspace-dir . --agent claude
# Or for Codex:
uv run zenith init --workspace-dir . --agent codex
# Or for Hermes:
uv run zenith init --workspace-dir . --agent hermes
```
