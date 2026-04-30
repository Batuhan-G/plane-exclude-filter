import type { SearchField } from '@/lib/filterUtils'
import type { RawIssue } from '@/lib/types'

export interface HeaderProps {
  filtered: RawIssue[] | null
  totalCount: number
  selectedProject: string
  syncing: boolean
  loadingProject: boolean
  searchQuery: string
  searchField: SearchField
  onSearchChange: (q: string) => void
  onSearchFieldChange: (field: SearchField) => void
  onSync: () => void
}
