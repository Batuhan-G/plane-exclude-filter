import { getAuthStatus } from '@/app/actions/auth'
import { parsePlaneUrl } from '@/lib/parsePlaneUrl'
import { PlaneFilterContent } from './PlaneFilterContent'

export default async function PlaneFilterPage() {
  const { configured, planeUrl } = await getAuthStatus()
  const parsed = planeUrl ? parsePlaneUrl(planeUrl) : null
  return (
    <PlaneFilterContent
      initialConfigured={configured}
      appBaseUrl={parsed?.appBaseUrl ?? ''}
      workspaceSlug={parsed?.workspaceSlug ?? ''}
    />
  )
}
