import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'

export interface IssueDrawerProps {
  issue: RawIssue | null
  appBaseUrl: string
  workspaceSlug: string
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  onClose: () => void
  onIssueUpdate: (updated: RawIssue) => void
}
