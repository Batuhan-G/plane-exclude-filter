import { useMemo, useState } from 'react'
import { applyFilter } from '@/lib/filterUtils'
import { EMPTY_FILTER } from '@/lib/constants'
import type { FilterSet, RawIssue } from '@/lib/types'

export interface UseFilterReturn {
  include: FilterSet
  exclude: FilterSet
  filtered: RawIssue[] | null
  setInclude: React.Dispatch<React.SetStateAction<FilterSet>>
  setExclude: React.Dispatch<React.SetStateAction<FilterSet>>
  reset: () => void
}

export function useFilter(allIssues: RawIssue[]): UseFilterReturn {
  const [include, setInclude] = useState<FilterSet>(EMPTY_FILTER)
  const [exclude, setExclude] = useState<FilterSet>(EMPTY_FILTER)

  const filtered = useMemo<RawIssue[] | null>(() => {
    if (allIssues.length === 0) return null
    return applyFilter(allIssues, include, exclude)
  }, [allIssues, include, exclude])

  function reset(): void {
    setInclude(EMPTY_FILTER)
    setExclude(EMPTY_FILTER)
  }

  return { include, exclude, filtered, setInclude, setExclude, reset }
}
