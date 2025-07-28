---
type: "always_apply"
---

---
type: "always_apply"---
Focus on the blog app project: Prioritize tasks and suggestions related to developing the note-taking app with task management.

Generate code snippets: Provide relevant code examples and suggestions for features (e.g., local storage, CSV/JSON export/import).

Suggest best practices: Offer advice on data structuring (e.g., "small 'database'"), UI/UX, and efficient coding.

Help with debugging: If I encounter errors, assist in identifying and resolving them.

Keep it simple: Provide solutions and explanations that are easy to understand and implement.

Ask for clarification: If a request is unclear, ask questions to get more details.

Inform about limitations: If a request is beyond the agent's current capabilities, clearly state it.

## 🎯 Task Structuring
- **Break tasks into small, actionable items.**
- Each step should include:
  1. **Objective** — What to achieve
  2. **Action** — Which tool to use (e.g. file editing, terminal, test)
  3. **Transition** — How to move to next step
- Use numbered lists for ordered workflows.

## ⚙️ Development & Quality
- Follow our **JavaScript/TypeScript style guide**:
  - Use ESLint / Prettier presets.
  - Preferred folder structure: `models/`, `controllers/`, `views/`, `routes/`, `tests/`.
  - Use descriptive names for files (e.g. `PostController.ts`, `postRoutes.ts`).
- Write **unit and integration tests** for every new endpoint or view.
- Validate input via schemas (e.g. Zod, Joi) and return proper error handling.

## 🧪 Testing & Guardrails
- Use **Test-Driven Development (TDD)** for business logic and APIs.
- Do not remove or modify **e2e test files** unless explicitly requested.
- Block dangerous terminal commands:
  - No `DROP TABLE`, `DELETE FROM`, `rm -rf`, `shutdown`, etc.
  - Any such suggestion must be flagged for manual review.

## 🔐 Security & Data Handling
- Never expose secrets (API keys, credentials) in code or prompts.
- Use environment variables (`.env`) for sensitive settings; mark these files as ignored.
- Follow least‑privilege: only expose the minimal dataset needed for a task (e.g. don't load full posts if only metadata is required).
- Sanitize inputs and outputs, prevent SQL/NoSQL injections.

## 📚 Context & Memory
- Read `memory.md` or `project_summary.md` before each task; update it after completing tasks.
- Use `plans/` directory for feature breakdowns—not for actual code.
- Do not modify `.augment/rules/*.md` files via agent edits—they are **immutable**.

## 🔄 Session Management
- Use new agent sessions for **distinct features or subsystems** (e.g. comments feature, authentication, admin UI).
- For manual mode: always **ask for confirmation** before running commands or making file edits.
- For auto‑mode: include **checkpoints** after key milestones (e.g. tests passing, manual review points).

## 🧪 Framework & Technology Rules
- For React + Next.js:
  - Use `getStaticProps`, `getServerSideProps` where appropriate.
  - Structure components under `components/`, pages under `pages/`.
  - Always include SEO metadata in page headers.
- For Node.js + Express + ORM:
  - Use controller-service-repository layering.
  - Name routes using RESTful conventions (`GET /posts`, `POST /posts`, etc.).
  - Use transaction safeguards for database updates.
- For Markdown content:
  - Use a library like `remark` with plugins to sanitize HTML.
  - Support code‑block syntax highlighting and YAML front‑matter.

## 📄 Documentation & Comments
- For every new feature:
  - Update or create README sections (e.g. database schema, API usage).
  - Include code comments explaining key business logic.
- Generated examples must show both **input and expected output** (e.g. sample request/response).

## 📦 Rule Maintenance
- Keep rules concise and grouped:
  - Workflow Rules
  - Code Quality Rules
  - Security Rules
  - Framework Rules
- Review rules **quarterly** to remove outdated items and resolve conflicts.