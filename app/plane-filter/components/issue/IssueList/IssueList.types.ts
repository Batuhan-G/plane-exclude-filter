import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'

export interface IssueListProps {
  issues: RawIssue[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  getIssueUrl?: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}
