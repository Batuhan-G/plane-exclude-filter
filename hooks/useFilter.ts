import { useMemo, useState } from 'react'
import { applyFilter } from '@/lib/filterUtils'
import { EMPTY_FILTER } from '@/lib/constants'
import type { ActivityFilter, FilterSet, RawIssue } from '@/lib/types'
import { DEFAULT_ACTIVITY_FILTER } from '@/lib/types'

export interface UseFilterReturn {
  include: FilterSet
  exclude: FilterSet
  activityFilter: ActivityFilter
  filtered: RawIssue[] | null
  setInclude: React.Dispatch<React.SetStateAction<FilterSet>>
  setExclude: React.Dispatch<React.SetStateAction<FilterSet>>
  setActivityFilter: React.Dispatch<React.SetStateAction<ActivityFilter>>
  reset: () => void
}

export function useFilter(allIssues: RawIssue[]): UseFilterReturn {
  const [include, setInclude] = useState<FilterSet>(EMPTY_FILTER)
  const [exclude, setExclude] = useState<FilterSet>(EMPTY_FILTER)
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>(DEFAULT_ACTIVITY_FILTER)

  const filtered = useMemo<RawIssue[] | null>(() => {
    if (allIssues.length === 0) return null
    return applyFilter(allIssues, include, exclude, activityFilter)
  }, [allIssues, include, exclude, activityFilter])

  function reset(): void {
    setInclude(EMPTY_FILTER)
    setExclude(EMPTY_FILTER)
    setActivityFilter(DEFAULT_ACTIVITY_FILTER)
  }

  return { include, exclude, activityFilter, filtered, setInclude, setExclude, setActivityFilter, reset }
}
