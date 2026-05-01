import { getAuthStatus } from '@/app/actions/auth'
import { PlaneFilterContent } from './PlaneFilterContent'

export default async function PlaneFilterPage() {
  const { configured } = await getAuthStatus()
  return <PlaneFilterContent initialConfigured={configured} />
}
