import type { ActivityFilter, FilterSet, PlaneMember, PlaneLabel, PlaneState, PlanePriority } from './types'
import { PRIORITY_ITEMS } from './constants'
import type { SearchField } from './filterUtils'

const K = {
  project:    'project',
  incA:       'inc_a',
  incL:       'inc_l',
  incS:       'inc_s',
  incP:       'inc_p',
  incCB:      'inc_cb',
  excA:       'exc_a',
  excL:       'exc_l',
  excS:       'exc_s',
  excP:       'exc_p',
  excCB:      'exc_cb',
  activity:   'act',
  search:     'q',
  searchField: 'qf',
} as const

function toIds(items: { id: string }[]): string {
  return items.map(i => i.id).join(',')
}

function splitIds(value: string | null): string[] {
  if (!value) return []
  return value.split(',').filter(Boolean)
}

export function buildUrlParams(
  project: string,
  include: FilterSet,
  exclude: FilterSet,
  activityFilter: ActivityFilter,
  searchQuery: string,
  searchField: SearchField,
): URLSearchParams {
  const p = new URLSearchParams()

  if (project) p.set(K.project, project)

  const set = (key: string, items: { id: string }[]) => {
    if (items.length > 0) p.set(key, toIds(items))
  }

  set(K.incA,  include.assignees)
  set(K.incL,  include.labels)
  set(K.incS,  include.states)
  set(K.incP,  include.priorities)
  set(K.incCB, include.createdBy ?? [])
  set(K.excA,  exclude.assignees)
  set(K.excL,  exclude.labels)
  set(K.excS,  exclude.states)
  set(K.excP,  exclude.priorities)
  set(K.excCB, exclude.createdBy ?? [])

  if (activityFilter.enabled) {
    p.set(K.activity, activityFilter.showNewOnly ? 'new' : 'updated')
  }

  if (searchQuery) p.set(K.search, searchQuery)
  if (searchField !== 'code') p.set(K.searchField, searchField)

  return p
}

export function readProjectFromParams(params: URLSearchParams): string {
  return params.get(K.project) || ''
}

export function readSearchFromParams(params: URLSearchParams): { query: string; field: SearchField } {
  return {
    query: params.get(K.search) || '',
    field: (params.get(K.searchField) as SearchField) || 'code',
  }
}

export function readActivityFromParams(params: URLSearchParams): ActivityFilter {
  const act = params.get(K.activity)
  if (!act) return { showNewOnly: false, showUpdatedOnly: false, enabled: false }
  return {
    enabled: true,
    showNewOnly: act === 'new',
    showUpdatedOnly: act === 'updated',
  }
}

export function readFiltersFromParams(
  params: URLSearchParams,
  members: PlaneMember[],
  labels: PlaneLabel[],
  states: PlaneState[],
): { include: FilterSet; exclude: FilterSet } {
  const findMember   = (id: string) => members.find(m => m.id === id)
  const findLabel    = (id: string) => labels.find(l => l.id === id)
  const findState    = (id: string) => states.find(s => s.id === id)
  const findPriority = (id: string) => PRIORITY_ITEMS.find(p => p.id === id)

  function resolveSet(aKey: string, lKey: string, sKey: string, pKey: string, cbKey: string): FilterSet {
    return {
      assignees:  splitIds(params.get(aKey)).map(findMember).filter(Boolean)   as PlaneMember[],
      labels:     splitIds(params.get(lKey)).map(findLabel).filter(Boolean)    as PlaneLabel[],
      states:     splitIds(params.get(sKey)).map(findState).filter(Boolean)    as PlaneState[],
      priorities: splitIds(params.get(pKey)).map(findPriority).filter(Boolean) as PlanePriority[],
      createdBy:  splitIds(params.get(cbKey)).map(findMember).filter(Boolean)  as PlaneMember[],
    }
  }

  return {
    include: resolveSet(K.incA, K.incL, K.incS, K.incP, K.incCB),
    exclude: resolveSet(K.excA, K.excL, K.excS, K.excP, K.excCB),
  }
}

export function hasFilterParams(params: URLSearchParams): boolean {
  return [K.incA, K.incL, K.incS, K.incP, K.incCB, K.excA, K.excL, K.excS, K.excP, K.excCB, K.activity].some(
    k => !!params.get(k)
  )
}
