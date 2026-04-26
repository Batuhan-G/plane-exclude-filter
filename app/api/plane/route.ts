import { NextRequest, NextResponse } from 'next/server'

const PLANE_BASE = process.env.PLANE_BASE_URL || 'https://api.plane.so'
const PLANE_API = PLANE_BASE + '/api/v1'
const API_KEY = process.env.PLANE_API_KEY!
const WORKSPACE = process.env.PLANE_WORKSPACE_SLUG!


async function planePatch(path: string, body: unknown) {
  const url = `${PLANE_API}${path}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'X-API-Key': API_KEY, 'X-API-Token': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Plane API ${res.status}: ${text}`)
  }
  return res.json()
}

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
  const issueId = searchParams.get('issue')

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

    if (action === 'attachments' && projectId && issueId) {
      const data = await planeGet(
        `/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/issue-attachments/`
      )
      return NextResponse.json(data.results ?? data)
    }

    if (action === 'asset') {
      const url = searchParams.get('url')
      const filename = searchParams.get('name')
      if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

      const encodedPath = url.startsWith('http')
        ? url
        : url.split('/').map(encodeURIComponent).join('/')
      const resolvedUrl = url.startsWith('http')
        ? url
        : `${PLANE_API}/workspaces/${WORKSPACE}/file-assets/${encodedPath}/`

      const upstream = await fetch(resolvedUrl, {
        headers: { 'X-API-Key': API_KEY, 'X-API-Token': API_KEY },
        cache: 'no-store',
      })
      if (!upstream.ok) {
        const body = await upstream.text()
        return NextResponse.json({ error: `Asset fetch failed: ${upstream.status}`, resolvedUrl, body }, { status: upstream.status })
      }

      const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

      if (contentType.startsWith('text/html')) {
        return NextResponse.json({ error: 'Got HTML — check PLANE_BASE_URL or asset path', resolvedUrl }, { status: 502 })
      }

      if (contentType.includes('application/json')) {
        const json = await upstream.json() as Record<string, unknown>
        const presignedUrl = (json.url ?? json.signed_url ?? json.asset_url) as string | undefined
        if (!presignedUrl) {
          return NextResponse.json({ error: 'JSON response had no url field', json, resolvedUrl }, { status: 502 })
        }
        const ps = await fetch(presignedUrl, { cache: 'no-store' })
        if (!ps.ok) {
          return NextResponse.json({ error: `Presigned fetch failed: ${ps.status}`, presignedUrl }, { status: ps.status })
        }
        const psHeaders: Record<string, string> = {
          'Content-Type': ps.headers.get('content-type') ?? 'application/octet-stream',
          'Cache-Control': 'private, max-age=300',
        }
        const psCl = ps.headers.get('content-length')
        if (psCl) psHeaders['Content-Length'] = psCl
        if (filename) psHeaders['Content-Disposition'] = `attachment; filename="${filename}"`
        return new NextResponse(ps.body, { headers: psHeaders })
      }

      const contentLength = upstream.headers.get('content-length')
      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      }
      if (contentLength) headers['Content-Length'] = contentLength
      if (filename) {
        headers['Content-Disposition'] = `attachment; filename="${filename}"`
      }
      return new NextResponse(upstream.body, { headers })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')
  const projectId = searchParams.get('project')
  const issueId = searchParams.get('issue')

  try {
    if (action === 'updateIssue' && projectId && issueId) {
      const body = await req.json()
      const res = await planePatch(
        `/workspaces/${WORKSPACE}/projects/${projectId}/issues/${issueId}/`,
        body
      )
      return NextResponse.json(res)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}