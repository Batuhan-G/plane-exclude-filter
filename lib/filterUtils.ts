import type { FilterSet, RawIssue } from './types'

export function applyFilter(
  issues: RawIssue[],
  include: FilterSet,
  exclude: FilterSet,
): RawIssue[] {
  const inAssigneeIds  = new Set(include.assignees.map(a => a.id))
  const inLabelIds     = new Set(include.labels.map(l => l.id))
  const inStateIds     = new Set(include.states.map(s => s.id))
  const inPriorityIds  = new Set(include.priorities.map(p => p.id))
  const exAssigneeIds  = new Set(exclude.assignees.map(a => a.id))
  const exLabelIds     = new Set(exclude.labels.map(l => l.id))
  const exStateIds     = new Set(exclude.states.map(s => s.id))
  const exPriorityIds  = new Set(exclude.priorities.map(p => p.id))

  return issues.filter(issue => {
    if (inAssigneeIds.size > 0  && !issue.assignees.some(id => inAssigneeIds.has(id))) return false
    if (inLabelIds.size > 0     && !issue.labels.some(id => inLabelIds.has(id)))        return false
    if (inStateIds.size > 0     && !inStateIds.has(issue.state))                        return false
    if (inPriorityIds.size > 0  && !inPriorityIds.has(issue.priority))                 return false

    if (exAssigneeIds.size > 0  && issue.assignees.some(id => exAssigneeIds.has(id))) return false
    if (exLabelIds.size > 0     && issue.labels.some(id => exLabelIds.has(id)))        return false
    if (exStateIds.size > 0     && exStateIds.has(issue.state))                        return false
    if (exPriorityIds.size > 0  && exPriorityIds.has(issue.priority))                  return false

    return true
  })
}
