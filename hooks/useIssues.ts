import { useState } from 'react'
import { planeApi } from '@/lib/api'
import type { RawIssue } from '@/lib/types'

export interface UseIssuesReturn {
  allIssues: RawIssue[]
  syncing: boolean
  error: string
  fetchIssues: (projectId: string, bust?: boolean) => Promise<void>
  sync: (projectId: string) => Promise<void>
  reset: () => void
}

export function useIssues(): UseIssuesReturn {
  const [allIssues, setAllIssues] = useState<RawIssue[]>([])
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  async function fetchIssues(projectId: string, bust = false): Promise<void> {
    setError('')
    try {
      const issues = await planeApi<RawIssue[]>('issues', projectId, bust)
      setAllIssues(issues)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  async function sync(projectId: string): Promise<void> {
    setSyncing(true)
    await fetchIssues(projectId, true)
    setSyncing(false)
  }

  function reset(): void {
    setAllIssues([])
  }

  return { allIssues, syncing, error, fetchIssues, sync, reset }
}
