<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project context

- **Rules:** `.cursor/rules/` — always-on project facts (stack, `src/` layout, domain vocabulary).
- **Agent context:** `agent-context/` — product and design notes; `@`-mention when deep detail is needed.
- **Task log workflow:** project skill `task-log` (`.cursor/skills/task-log/SKILL.md`) when recording confirmed changes under `docs/task-log/`.
- **API client layer:** project skill `apis-layer` (`.cursor/skills/apis-layer/SKILL.md`) when adding or editing HTTP wrappers under `src/apis/` or related types under `src/types/api/`.
