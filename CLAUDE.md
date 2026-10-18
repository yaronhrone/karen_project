# CLAUDE.md — karen_project

Rules adopted from the workspace CLAUDE.md (Agent/CLAUDE.md) and from lessons learned on this repo.

## Hard rules
- **Never push to `main`.** `.github/workflows/deploy.yml` builds images and deploys to EC2 on every push to `main`. A merge to `main` IS a deploy, and only Yaron does it.
- **Outward writes need explicit approval every time**: push, WhatsApp/GreenAPI messages (these reach Keren, not Yaron), emails, edits to the Google Form/Sheet, anything on EC2.
- **Secrets only in `.env`** — never in chat, code, docs, or git.
- **Sources are not edited.** Feedback responses are read-only; record corrections as dated notes in `docs/feedback/`.
- **Propose, don't improvise.** New projects, services or dependencies are suggested, not added.
- Tone with Yaron: short, direct, no flattery; disagree in the first line when a plan will not work.

## Stack quick reference
- `frontend/` React (CRA). Tests: `cd frontend && CI=true npm test -- --watchAll=false`. Build check: `npm run build`.
- `items-service/` (Spring Boot, port 8080) and `security/` (users-service, port 8081). Tests: `./mvnw test` in each.
- Local run: `docker compose up -d --build postgres redis items-service users-service`, then `npm start` in `frontend/`.
- The `.wrapper/.container/.bottom` card CSS is shared; Header.css has a global `.icon` rule that leaks — scope overrides.

## Feedback loop
`/feedback-loop` runs the automated process (read feedback -> triage -> plan -> **wait for approval** -> fix -> independent verification -> local commit on a `feedback/*` branch -> notify). See `docs/feedback/PLAN.md`. Lessons from each run go in `docs/feedback/LESSONS.md` and are read at the start of the next run.
