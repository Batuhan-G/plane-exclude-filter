export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export interface RawIssue {
  id: string
  sequence_id: number
  name: string
  priority: Priority
  state: string
  assignees: string[]
  labels: string[]
  project: string
  description_html?: string
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface PlanePriority {
  id: Priority
  name: string
  color: string
}

export interface FilterSet {
  assignees: PlaneMember[]
  labels: PlaneLabel[]
  states: PlaneState[]
  priorities: PlanePriority[]
  createdBy: PlaneMember[]
}

export interface PlaneProject {
  id: string
  name: string
  identifier: string
}

export interface PlaneMember {
  id: string
  name: string
  avatar?: string
}

export interface PlaneLabel {
  id: string
  name: string
  color: string
}

export interface PlaneState {
  id: string
  name: string
  color: string
  group: 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled'
}

export interface ActivityFilter {
  showNewOnly: boolean
  showUpdatedOnly: boolean
  enabled: boolean
}

export const DEFAULT_ACTIVITY_FILTER: ActivityFilter = {
  showNewOnly: false,
  showUpdatedOnly: false,
  enabled: false,
}

export interface PlaneAttachment {
  id: string
  asset: string
  attributes: {
    name: string
    size: number
    type: string
  }
}

export interface PlaneComment {
  id: string
  comment_html: string
  actor: string
  actor_detail: { id: string; display_name: string; avatar?: string }
  created_at: string
}

export interface PlaneActivity {
  id: string
  actor: string
  actor_detail?: { id?: string; display_name?: string; avatar?: string } | null
  created_at: string
  field: string | null
  old_value: string | null
  new_value: string | null
  verb: string
}

export type TimelineEntry =
  | { type: 'activity'; data: PlaneActivity }
  | { type: 'comment'; data: PlaneComment }
