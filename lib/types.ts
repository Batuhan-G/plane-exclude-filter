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
}

export interface FilterSet {
  assignees: PlaneMember[]
  labels: PlaneLabel[]
  states: PlaneState[]
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
