import { NextRequest, NextResponse } from 'next/server'
import { parsePlaneUrl } from '@/lib/parsePlaneUrl'

export async function POST(req: NextRequest) {
  const { planeApiKey, planeUrl } = await req.json()

  if (!planeApiKey || !planeUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const parsed = parsePlaneUrl(planeUrl)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid Plane URL' }, { status: 400 })
  }

  const { apiBaseUrl, workspaceSlug } = parsed

  const test = await fetch(
    `${apiBaseUrl}/api/v1/workspaces/${workspaceSlug}/projects/?per_page=1`,
    {
      headers: { 'X-API-Key': planeApiKey, 'X-API-Token': planeApiKey },
      cache: 'no-store',
    }
  )
  if (!test.ok) {
    return NextResponse.json(
      { error: 'Invalid Plane API key or workspace URL' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true })
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  }

  res.cookies.set('plane_api_key', planeApiKey, cookieOptions)
  res.cookies.set('plane_url', planeUrl.trim().replace(/\/$/, ''), cookieOptions)

  return res
}
