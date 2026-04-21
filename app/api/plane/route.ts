import { NextRequest, NextResponse } from 'next/server'

const PLANE_API = (process.env.PLANE_BASE_URL || 'https://api.plane.so') + '/api/v1'
const API_KEY = process.env.PLANE_API_KEY!
const WORKSPACE = process.env.PLANE_WORKSPACE_SLUG!

if (!API_KEY || !WORKSPACE) {
  console.error('Missing PLANE_API_KEY or PLANE_WORKSPACE_SLUG env vars')
}

async function planeGet(path: string) {
  const res = await fetch(`${PLANE_API}${path}`, {
    headers: { 'X-API-Key': API_KEY, 'X-API-Token': API_KEY },
    next: { revalidate: 30 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Plane API ${res.status}: ${text}`)
  }
  return res.json()
}

async function getAllPages(path: string) {
  const results: unknown[] = []
  const data = await planeGet(`${path}?per_page=250`)
  results.push(...(data.results ?? []))
  return results
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')
  const projectId = searchParams.get('project')

  try {
    if (action === 'projects') {
      const data = await planeGet(`/workspaces/${WORKSPACE}/projects/?per_page=100`)
      return NextResponse.json(data.results ?? [])
    }

    if (action === 'members' && projectId) {
      const data = await planeGet(`/workspaces/${WORKSPACE}/projects/${projectId}/members/`)
      const members = (data.results ?? data).map((m: Record<string, unknown>) => {
        const member = (m.member ?? m) as Record<string, unknown>
        return {
          id: member.id,
          name: (member.display_name ?? `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() ?? 'Unknown') as string,
          avatar: member.avatar ?? '',
        }
      })
      return NextResponse.json(members)
    }

    if (action === 'labels' && projectId) {
      const data = await planeGet(`/workspaces/${WORKSPACE}/projects/${projectId}/labels/?per_page=100`)
      const labels = (data.results ?? []).map((l: Record<string, unknown>) => ({
        id: l.id,
        name: l.name,
        color: l.color ?? '#888',
      }))
      return NextResponse.json(labels)
    }

    if (action === 'issues' && projectId) {
      const issues = await getAllPages(
        `/workspaces/${WORKSPACE}/projects/${projectId}/issues/`
      )
      return NextResponse.json(issues)
    }
    
    if (action === 'states' && projectId) {
  const data = await planeGet(`/workspaces/${WORKSPACE}/projects/${projectId}/states/`)
  const states = (data.results ?? []).map((s: Record<string, unknown>) => ({
    id: s.id,
    name: s.name,
    color: s.color ?? '#888',
  }))
  return NextResponse.json(states)
}

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}