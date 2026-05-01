'use server'

import { cookies } from 'next/headers'
import { parsePlaneUrl } from '@/lib/parsePlaneUrl'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
}

export async function setupAuth(data: {
  planeApiKey: string
  planeUrl: string
}): Promise<{ ok: true } | { error: string }> {
  const { planeApiKey, planeUrl } = data

  const parsed = parsePlaneUrl(planeUrl)
  if (!parsed) return { error: 'Invalid Plane URL. Example: https://plane.company.com/my-workspace' }

  const { apiBaseUrl, workspaceSlug } = parsed

  const test = await fetch(
    `${apiBaseUrl}/api/v1/workspaces/${workspaceSlug}/projects/?per_page=1`,
    {
      headers: { 'X-API-Key': planeApiKey, 'X-API-Token': planeApiKey },
      cache: 'no-store',
    }
  )
  if (!test.ok) {
    return { error: 'Invalid Plane API key or workspace URL' }
  }

  const cookieStore = await cookies()
  cookieStore.set('plane_api_key', planeApiKey, COOKIE_OPTS)
  cookieStore.set('plane_url', planeUrl.trim().replace(/\/$/, ''), COOKIE_OPTS)

  return { ok: true }
}

export async function resetAuth(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('plane_api_key')
  cookieStore.delete('plane_url')
}

export async function getAuthStatus(): Promise<{
  configured: boolean
  planeUrl: string | null
}> {
  if (process.env.NODE_ENV === 'development') {
    return {
      configured: true,
      planeUrl: process.env.NEXT_PUBLIC_PLANE_URL ?? null,
    }
  }
  const cookieStore = await cookies()
  const planeKey = cookieStore.get('plane_api_key')?.value
  const planeUrl = cookieStore.get('plane_url')?.value ?? null
  return {
    configured: !!(planeKey && planeUrl),
    planeUrl,
  }
}
