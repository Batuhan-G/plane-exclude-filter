import type { FilterSet } from '@/lib/types'
import type { SavedFilter } from './SavedFilters.types'

export const STORAGE_KEY = 'plane_saved_filters'
export const MAX_FILTERS = 10

// ─── Filter state helpers ────────────────────────────────

export function isFilterEmpty(f: FilterSet): boolean {
  return (
    f.assignees.length  === 0 &&
    f.labels.length     === 0 &&
    f.states.length     === 0 &&
    f.priorities.length === 0
  )
}

export function hasActiveFilter(include: FilterSet, exclude: FilterSet): boolean {
  return !isFilterEmpty(include) || !isFilterEmpty(exclude)
}

export function filterSetsEqual(a: FilterSet, b: FilterSet): boolean {
  const toSortedIds = (arr: { id: string }[]) => arr.map(x => x.id).sort().join(',')
  return (
    toSortedIds(a.assignees)  === toSortedIds(b.assignees)  &&
    toSortedIds(a.labels)     === toSortedIds(b.labels)     &&
    toSortedIds(a.states)     === toSortedIds(b.states)     &&
    toSortedIds(a.priorities) === toSortedIds(b.priorities)
  )
}

export function findActivePresetId(
  filters: SavedFilter[],
  include: FilterSet,
  exclude: FilterSet,
): string | null {
  return filters.find(
    f => filterSetsEqual(f.include, include) && filterSetsEqual(f.exclude, exclude)
  )?.id ?? null
}

// ─── Preset list mutations (return new arrays, no side-effects) ──

export function appendFilter(saved: SavedFilter[], entry: SavedFilter): SavedFilter[] {
  const updated = [...saved, entry]
  return updated.length > MAX_FILTERS ? updated.slice(updated.length - MAX_FILTERS) : updated
}

export function removeFilter(saved: SavedFilter[], id: string): SavedFilter[] {
  return saved.filter(f => f.id !== id)
}

export function renameFilter(saved: SavedFilter[], id: string, name: string): SavedFilter[] {
  return saved.map(f => (f.id === id ? { ...f, name } : f))
}

export function buildNewFilter(
  name: string,
  projectId: string,
  include: FilterSet,
  exclude: FilterSet,
): SavedFilter {
  return {
    id: String(Date.now()),
    name,
    projectId,
    include,
    exclude,
    createdAt: new Date().toISOString(),
  }
}

// ─── localStorage ────────────────────────────────────────

export function readStorage(): SavedFilter[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function writeStorage(filters: SavedFilter[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
}
