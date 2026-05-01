'use server'

import { cookies } from 'next/headers'

const PLANE_BASE = process.env.PLANE_BASE_URL || 'https://api.plane.so'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
}

export async function setupAuth(data: {
  planeApiKey: string
  workspaceSlug: string
  geminiApiKey?: string
}): Promise<{ ok: true } | { error: string }> {
  const { planeApiKey, workspaceSlug, geminiApiKey } = data

  const test = await fetch(
    `${PLANE_BASE}/api/v1/workspaces/${workspaceSlug}/projects/?per_page=1`,
    {
      headers: { 'X-API-Key': planeApiKey, 'X-API-Token': planeApiKey },
      cache: 'no-store',
    }
  )
  if (!test.ok) {
    return { error: 'Invalid Plane API key or workspace slug' }
  }

  const cookieStore = await cookies()
  cookieStore.set('plane_api_key', planeApiKey, COOKIE_OPTS)
  cookieStore.set('plane_workspace_slug', workspaceSlug, COOKIE_OPTS)
  if (geminiApiKey) cookieStore.set('gemini_api_key', geminiApiKey, COOKIE_OPTS)

  return { ok: true }
}

export async function resetAuth(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('plane_api_key')
  cookieStore.delete('plane_workspace_slug')
  cookieStore.delete('gemini_api_key')
}

export async function getAuthStatus(): Promise<{ configured: boolean; hasGemini: boolean }> {
  if (process.env.NODE_ENV === 'development') {
    return { configured: true, hasGemini: !!process.env.GEMINI_API_KEY }
  }
  const cookieStore = await cookies()
  const planeKey      = cookieStore.get('plane_api_key')?.value
  const workspaceSlug = cookieStore.get('plane_workspace_slug')?.value
  const geminiKey     = cookieStore.get('gemini_api_key')?.value
  return {
    configured: !!(planeKey && workspaceSlug),
    hasGemini:  !!geminiKey,
  }
}
