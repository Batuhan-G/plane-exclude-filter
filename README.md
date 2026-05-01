# Plane Exclude Filter

A minimal Next.js tool that brings the **exclude filter** feature missing from Plane's free plan.

**Live demo:** [plane-exclude-filter.vercel.app](https://plane-exclude-filter.vercel.app)

---

## Features

**Filters** — include or exclude issues by assignee, label, state, priority, and creator. All filters support both include and exclude modes.

**Search** — search by issue code (e.g. `PROJ-42`), title only, or across title and description.

**Views** — switch between Board (Kanban by state) and List layouts.

**Sorting** — sort by created date or priority, ascending or descending.

**Saved filters** — save named filter presets per project; double-click to rename. Active preset is auto-detected. Stored in localStorage.

**URL state** — filters, search, and sort are encoded in the URL, making views shareable.

**Issue drawer** — click any issue to open a side panel with full editing: title, state, priority, assignees, labels, description, comments, activity, and attachments.

**Activity panel** — toggle to see issues created or updated in the last 24h, with visual "new" / "updated" badges.

**Multi-project** — switch between projects from a dropdown; filters and saved presets are scoped per project.

**Self-hosted support** — all Plane API and app URLs are configurable via environment variables.

---

## Setup

```bash
bun install
cp .env.local.example .env.local
```

Edit `.env.local`:

```
PLANE_API_KEY=plane_api_...                       # Profile → Personal Access Tokens
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=my-workspace     # Slug from the URL: plane.so/MY-SLUG/...

# Self-hosted Plane instances only:
PLANE_BASE_URL=https://your-plane-instance.com
NEXT_PUBLIC_PLANE_APP_URL=https://your-plane-instance.com
```

```bash
bun dev
# http://localhost:3010
```
