import { useMemo, useState } from 'react'
import type { Priority, RawIssue } from '@/lib/types'

export type SortField = 'created' | 'priority'
export type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0, high: 1, medium: 2, low: 3, none: 4,
}

export function useIssueSort(issues: RawIssue[] | null) {
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSortField(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    if (!issues) return null
    return [...issues].sort((a, b) => {
      if (sortField === 'created') {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0
        return sortDir === 'desc' ? tb - ta : ta - tb
      }
      const pa = PRIORITY_ORDER[a.priority] ?? 4
      const pb = PRIORITY_ORDER[b.priority] ?? 4
      return sortDir === 'asc' ? pa - pb : pb - pa
    })
  }, [issues, sortField, sortDir])

  return { sorted, sortField, sortDir, handleSortField }
}
