import type { ActivityFilter } from '@/lib/types'

export interface ActivityFilterPanelProps {
  filter: ActivityFilter
  newCount: number
  updatedCount: number
  onChange: (filter: ActivityFilter) => void
}
