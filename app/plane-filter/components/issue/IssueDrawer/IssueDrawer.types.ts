import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'

export interface IssueDrawerProps {
  issue: RawIssue | null
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  onClose: () => void
}
