import type { FilterSet, PlanePriority, Priority } from './types'

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#ff4d4d' },
  high:   { label: 'High',   color: '#ff8c42' },
  medium: { label: 'Medium', color: '#f5c518' },
  low:    { label: 'Low',    color: '#4caf7d' },
  none:   { label: 'None',   color: '#505050' },
}

export const PRIORITY_ITEMS: PlanePriority[] = (
  ['urgent', 'high', 'medium', 'low', 'none'] as Priority[]
).map(p => ({ id: p, name: PRIORITY_CONFIG[p].label, color: PRIORITY_CONFIG[p].color }))

export const EMPTY_FILTER: FilterSet = { assignees: [], labels: [], states: [], priorities: [] }
