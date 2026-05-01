import { NextRequest, NextResponse } from 'next/server'

const PLANE_BASE = process.env.PLANE_BASE_URL || 'https://api.plane.so'

export async function POST(req: NextRequest) {
  const { planeApiKey, workspaceSlug, geminiApiKey } = await req.json()

  if (!planeApiKey || !workspaceSlug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const test = await fetch(
    `${PLANE_BASE}/api/v1/workspaces/${workspaceSlug}/projects/?per_page=1`,
    {
      headers: { 'X-API-Key': planeApiKey, 'X-API-Token': planeApiKey },
      cache: 'no-store',
    }
  )
  if (!test.ok) {
    return NextResponse.json(
      { error: 'Invalid Plane API key or workspace slug' },
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
  res.cookies.set('plane_workspace_slug', workspaceSlug, cookieOptions)
  if (geminiApiKey) {
    res.cookies.set('gemini_api_key', geminiApiKey, cookieOptions)
  }

  return res
}
