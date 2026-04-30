import type { ActivityFilter, FilterSet, RawIssue } from './types'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export function isNewIssue(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < TWENTY_FOUR_HOURS
}

export function isUpdatedIssue(createdAt: string | undefined, updatedAt: string | undefined): boolean {
  if (!createdAt || !updatedAt) return false
  const created = new Date(createdAt).getTime()
  const updated = new Date(updatedAt).getTime()
  return (
    Date.now() - updated < TWENTY_FOUR_HOURS &&
    updated - created > 30_000
  )
}

export function applyFilter(
  issues: RawIssue[],
  include: FilterSet,
  exclude: FilterSet,
  activity?: ActivityFilter,
): RawIssue[] {
  const inAssigneeIds  = new Set(include.assignees.map(a => a.id))
  const inLabelIds     = new Set(include.labels.map(l => l.id))
  const inStateIds     = new Set(include.states.map(s => s.id))
  const inPriorityIds  = new Set(include.priorities.map(p => p.id))
  const exAssigneeIds  = new Set(exclude.assignees.map(a => a.id))
  const exLabelIds     = new Set(exclude.labels.map(l => l.id))
  const exStateIds     = new Set(exclude.states.map(s => s.id))
  const exPriorityIds  = new Set(exclude.priorities.map(p => p.id))

  let result = issues.filter(issue => {
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

  if (activity && activity.enabled && (activity.showNewOnly || activity.showUpdatedOnly)) {
    result = result.filter(issue => {
      const isNew = isNewIssue(issue.created_at)
      const isUpd = isUpdatedIssue(issue.created_at, issue.updated_at)
      if (activity.showNewOnly && activity.showUpdatedOnly) return isNew || isUpd
      if (activity.showNewOnly) return isNew
      if (activity.showUpdatedOnly) return isUpd
      return true
    })
  }

  return result
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export type SearchField = 'code' | 'title' | 'content'

export function applySearch(issues: RawIssue[], query: string, field: SearchField = 'code'): RawIssue[] {
  const q = query.trim()
  if (!q) return issues

  if (field === 'code') {
    const numStr = q.replace(/^[a-z]+-/i, '').replace(/^#/, '')
    const num = parseInt(numStr, 10)
    if (isNaN(num)) return []
    return issues.filter(issue => issue.sequence_id === num)
  }

  const lower = q.toLowerCase()

  if (field === 'title') {
    return issues.filter(issue => issue.name.toLowerCase().includes(lower))
  }

  return issues.filter(issue =>
    issue.name.toLowerCase().includes(lower) ||
    (issue.description_html ? stripHtml(issue.description_html).toLowerCase().includes(lower) : false)
  )
}
