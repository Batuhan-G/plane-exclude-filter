import type { ActivityFilter, RawIssue, FilterSet, PlaneMember, PlaneLabel, PlaneState, PlaneProject } from '@/lib/types'

export type ViewMode = 'list' | 'board'

export interface MainContentProps {
  error: string | null | undefined
  projects: PlaneProject[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  loadingProject: boolean
  selectedProject: string
  filtered: RawIssue[] | null
  include: FilterSet
  exclude: FilterSet
  activityFilter: ActivityFilter
  newCount: number
  updatedCount: number
  onProjectChange: (id: string) => void
  onIncludeChange: React.Dispatch<React.SetStateAction<FilterSet>>
  onExcludeChange: React.Dispatch<React.SetStateAction<FilterSet>>
  onActivityFilterChange: React.Dispatch<React.SetStateAction<ActivityFilter>>
  searchQuery: string
  getIssueUrl: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}
