# Plane Exclude Filter

A minimal Next.js tool that brings the **exclude filter** feature missing from Plane's free plan.

Filter out issues from your view by assignee, label, or state.

## Setup

```bash
bun install
cp .env.local.example .env.local
```

Edit `.env.local`:

```
PLANE_API_KEY=plane_api_...                  # Profile → Personal Access Tokens
PLANE_WORKSPACE_SLUG=my-workspace            # Slug from the URL: plane.so/MY-SLUG/...
PLANE_BASE_URL=https://api.plane.so          # Optional — defaults to https://api.plane.so (override for self-hosted instances)
```

```bash
bun dev
# http://localhost:3000
```
