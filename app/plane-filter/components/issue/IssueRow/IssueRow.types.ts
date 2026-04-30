import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'

export interface IssueRowProps {
  issue: RawIssue
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  issueUrl?: string
  isNew?: boolean
  isUpdated?: boolean
  searchQuery?: string
  onClick: () => void
}
