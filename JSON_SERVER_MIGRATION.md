# JSON Server Demo Data Migration

This guide is for developers and coding agents moving the React dashboards from imported demo fixtures to JSON Server. Keep the migration limited to the existing **admin, client, and freelancer** roles.

## Target Behavior

- Store the dashboard demo records in the repository's `db.json`; expose them through JSON Server as REST data.
- Use a shared typed API client from the React app. Dashboard pages must fetch the selected role's data and show clear loading, empty, and error states. Do not silently fall back to importing fixture records in the browser.
- Keep TypeScript fixtures only if they are needed to seed or reset `db.json`. Make the seed operation deterministic and document how to run it.
- Provide one development command that starts Vite and JSON Server together, with Vite proxying `/api` requests to the JSON Server port. Document the API URL and reset command in `README.md`.
- Treat this as demo storage only. JSON Server does not authorize payments, update the smart contract, or represent production persistence. Keep demo actions labeled and behaviorally separate from real operations.

## Chunked Delivery

Implement and deliver the migration in small, independently reviewable chunks:

1. Add the JSON database, seed/reset command, server scripts, and Vite API proxy.
2. Add the typed API client and shared loading/error handling.
3. Migrate admin, client, and freelancer dashboards/pages to API data, one role at a time.
4. Update README and both changelog formats; remove obsolete runtime fixture imports.

For each chunk, run `npm run typecheck` and `npm run build`, inspect `git diff`, and stage only that chunk's files. Use a concise commit message describing the chunk, then push that commit before starting the next chunk when a remote is available. Never force-push. Check `git status` first and exclude unrelated pre-existing changes or user documents from every commit. If unrelated dirty work prevents safe chunking, stop before committing and report the blocking paths.

## Completion Check

Confirm all three dashboard roles load their data from the API, the documented development command starts both services, seed/reset reproduces the committed demo database, and no browser runtime imports fixture arrays. Report the commits pushed and any validation that could not run.
