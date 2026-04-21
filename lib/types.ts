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

export interface PlaneIssue {
  id: string
  sequence_id: number
  name: string
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none'
  state_detail: PlaneState
  assignee_details: PlaneMember[]
  label_details: PlaneLabel[]
}
