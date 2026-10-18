---
name: feedback-loop
description: Run the customer-feedback loop for karen_project - read the Google Form responses, triage real problems, write a fix plan, wait for Yaron's approval, fix, verify with an independent agent, commit locally on a feedback/* branch and notify. Use when Yaron says /feedback-loop, "go over the feedback", or "פידבק".
---

# Feedback loop

Full design: `docs/feedback/PLAN.md`. Follow it in order; do not skip a stage.

1. **Prepare.** Read `CLAUDE.md` and `docs/feedback/LESSONS.md`. `git status` must be clean; otherwise stop and tell Yaron.
2. **Read feedback.** Drive search for the form "היהלומים של קרן פידבקים" and its linked responses Sheet (mimeType spreadsheet). Read only. If no responses Sheet exists, tell Yaron to link it (Form > Responses > Link to Sheets) and stop. Read `docs/feedback/processed.md` and ignore responses already handled (match by timestamp + text).
3. **Triage.** Classify each new response: `bug` (something broken), `ux` (confusing/ugly), `content` (text/products/prices - Keren's call, not code), `praise`, `noise`. Only `bug` and clear `ux` are candidates. Check each against the code and reproduce if feasible; drop what is not real. Do not invent problems.
4. **Plan.** Write `docs/feedback/plans/<YYYY-MM-DD>.md`: per item - the feedback quote, root cause, proposed fix, files, risk, and how it will be verified. Mark items you recommend skipping, with a reason. Create branch `feedback/<YYYY-MM-DD>` from `main`.
5. **STOP for approval.** Show Yaron the plan (short) and wait. Fix only the items he approves. No approval = nothing is changed.
6. **Fix.** One `feedback-fixer` agent per approved item (sequential if they touch the same files). Commit per item on the feedback branch.
7. **Verify.** Hand the branch to the `feedback-verifier` agent (a separate agent, never the fixer). If FAIL: send the failures back to the fixer, at most 2 rounds, then stop and report instead of forcing it.
8. **Commit and record.** Append handled responses to `docs/feedback/processed.md`; add what went wrong or surprised you to `docs/feedback/LESSONS.md`; commit on the feedback branch. **Do not push and do not touch `main`.**
9. **Notify.** End with a message to Yaron: branch name, commit hash(es), items fixed/skipped, verifier verdict, and "ready to review; merge to main = deploy". Also send a PushNotification if that tool is available. No WhatsApp or other outward message unless Yaron explicitly asks for it that time.
