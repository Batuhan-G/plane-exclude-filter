export interface PlaneUrlParts {
  apiBaseUrl: string
  appBaseUrl: string
  workspaceSlug: string
}

/**
 * Parses a Plane URL like https://plane.company.com/my-workspace
 * into its constituent parts.
 *
 * Plane Cloud special case: app.plane.so (UI) → api.plane.so (API)
 */
export function parsePlaneUrl(input: string): PlaneUrlParts | null {
  try {
    const url = new URL(input.trim().replace(/\/$/, ''))
    const workspaceSlug = url.pathname.split('/').filter(Boolean)[0]
    if (!workspaceSlug) return null
    const appBaseUrl = `${url.protocol}//${url.host}`
    const apiBaseUrl = url.host === 'app.plane.so' ? 'https://api.plane.so' : appBaseUrl
    return { apiBaseUrl, appBaseUrl, workspaceSlug }
  } catch {
    return null
  }
}
