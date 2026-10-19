# Feedback loop — plan

Goal: customer feedback from the Google Form turns into verified, reviewable fixes with as little manual work as possible — without ever deploying by itself.

## Decisions (Yaron, 2026-10-18)
| Question | Decision |
|---|---|
| Feedback source | Google Sheet linked to the form "היהלומים של קרן פידבקים" (read via Drive connector, read-only) |
| Notification | Message in Claude (+ PushNotification if available). No WhatsApp: the project's GreenAPI service messages Keren, not Yaron |
| Plan approval | Agent stops after writing the plan; fixes only what Yaron approves |

## Safety design
- `deploy.yml` deploys to EC2 on every push to `main`. So the loop works on `feedback/<date>` branches, **commits locally, never pushes**. Yaron reviews, pushes, merges to `main` = deploy.
- Fixer and verifier are different agents. The verifier writes the tests, runs the suites and the build, and checks the diff for scope creep (deploy files, `.env`).
- Max 2 fix/verify rounds, then stop and report — no forcing a green result.

## Stages
1. Prepare — read `CLAUDE.md` + `LESSONS.md`, clean working tree.
2. Read — new responses only (`processed.md` tracks handled ones).
3. Triage — bug / ux / content / praise / noise; reproduce; drop what is not real. `content` (products, prices, wording) goes to Keren, not code.
4. Plan — `docs/feedback/plans/<date>.md`: quote, root cause, fix, files, risk, verification.
5. **Approval gate.**
6. Fix — `feedback-fixer`, one item at a time, commit per item.
7. Verify — `feedback-verifier`: new tests + full suites + build + diff review.
8. Record — `processed.md`, `LESSONS.md`, final commit on the feedback branch.
9. Notify — branch, commits, fixed/skipped, verdict.

## Components
- `.claude/skills/feedback-loop/SKILL.md` — the orchestrator (`/feedback-loop`)
- `.claude/agents/feedback-fixer.md`, `.claude/agents/feedback-verifier.md`
- `CLAUDE.md` — rules; `docs/feedback/LESSONS.md` — what each run learned

## Prerequisites / limits
- The form must be linked to a Sheet (Form > Responses > Link to Sheets). Today only the form exists in Drive, so the first run will stop at stage 2 until it is linked.
- Fully hands-off is not possible by design: approval gate and the push/merge are Yaron's.
- Runs when invoked (`/feedback-loop`). A schedule can be added later with the `schedule`/`loop` skills once a manual run works end to end.
