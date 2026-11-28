# Changelog

## 2026-11-28 — Dedicated role page modules

### Added

- Dedicated TypeScript page components and role-specific page data for every Organization Admin, Client, and Freelancer dashboard route in the sitemap.
- Separate Admin Payments route alongside Escrow.

### Changed

- Replaced the shared role-and-page conditional view with page components that reuse a presentation frame.
- Kept the sitemap's Super Admin and restricted operations consoles out of the three-role scope.

### Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.

## 2026-11-28 — Role-based TypeScript frontend

### Added

- Separate Organization Admin, Client, and Freelancer applications under `src/roles/`, with direct role routes and role-specific section URLs.
- TypeScript configuration, frontend typecheck command, typed role navigation, and role workspace views based on the dashboard sitemap.
- A visible demo-data label and preview-only workflow actions.

### Changed

- Migrated frontend source files and local dashboard data from JavaScript/JSX to TypeScript/TSX.
- Removed dashboard role-switch controls.
- Expanded role navigation for projects, agreements, milestones, reviews or submissions, funding and earnings, disputes, records, and settings.
- Clarified that client milestone approval is separate from settlement authorization.

### Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- Live browser verification could not run because the sandbox denied the Vite local port bind and no Reticle browser session was connected.
