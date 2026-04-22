import type { RawIssue } from '@/lib/types'

export interface HeaderProps {
  filtered: RawIssue[] | null
  totalCount: number
  selectedProject: string
  syncing: boolean
  loadingProject: boolean
  onSync: () => void
}
