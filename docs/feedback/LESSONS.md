# Feedback loop — lessons

Read at the start of every run. Add a line after each run: what broke, what was surprising, what to do differently.

- 2026-10-18 (manual UI work): a push to `main` auto-deploys to EC2 — never push `main` from the loop.
- 2026-10-18: `Header.css` defines a global `.icon` (130px round logo with border) that leaks into any element with class `icon`; scope overrides under `.wrapper`.
- 2026-10-18: percent heights and `margin:auto` inside the card's flex layout leave blank strips; check cards with a short name (Cookie 1) and a very long name.
- 2026-10-18: headless Chrome screenshots work for UI checks: `chrome.exe --headless --window-size=700,700 --force-device-scale-factor=2 --virtual-time-budget=10000 --screenshot=... http://localhost:3000/<page>`.
