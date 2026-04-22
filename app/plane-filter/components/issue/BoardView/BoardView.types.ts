import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'

export interface BoardViewProps {
  issues: RawIssue[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  getIssueUrl?: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}

export interface BoardCardProps {
  issue: RawIssue
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  issueUrl?: string
  isNew?: boolean
  isUpdated?: boolean
  onClick: () => void
}
