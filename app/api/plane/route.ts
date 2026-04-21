import { NextRequest, NextResponse } from 'next/server'

const PLANE_API = (process.env.PLANE_BASE_URL || 'https://api.plane.so') + '/api/v1'
const API_KEY = process.env.PLANE_API_KEY!
const WORKSPACE = process.env.PLANE_WORKSPACE_SLUG!


async function planeGet(urlOrPath: string, noCache = false) {
  const url = urlOrPath.startsWith('http') ? urlOrPath : `${PLANE_API}${urlOrPath}`
  const res = await fetch(url, {
    headers: { 'X-API-Key': API_KEY, 'X-API-Token': API_KEY },
    ...(noCache ? { cache: 'no-store' } : { next: { revalidate: 30 } }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Plane API ${res.status}: ${text}`)
  }
  return res.json()
}

async function getAllPages(path: string, noCache = false) {
  const results: unknown[] = []
  let cursor: string | null = null
  while (true) {
    const url = `${PLANE_API}${path}?per_page=100${cursor ? `&cursor=${cursor}` : ''}`
    const data = await planeGet(url, noCache)
    results.push(...(data.results ?? []))
    if (!data.next_page_results) break
    cursor = data.next_cursor
  }
  return results
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')
  const projectId = searchParams.get('project')

  try {
    if (action === 'projects') {
      const projects = await getAllPages(`/workspaces/${WORKSPACE}/projects/`)
      return NextResponse.json(projects)
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
      const labels = await getAllPages(`/workspaces/${WORKSPACE}/projects/${projectId}/labels/`)
      return NextResponse.json(labels.map((l: unknown) => {
        const label = l as Record<string, unknown>
        return { id: label.id, name: label.name, color: label.color ?? '#888' }
      }))
    }

    if (action === 'issues' && projectId) {
      const bust = searchParams.has('bust')
      const issues = await getAllPages(
        `/workspaces/${WORKSPACE}/projects/${projectId}/issues/`,
        bust
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