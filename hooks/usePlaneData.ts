import { useEffect, useState } from 'react'
import { planeApi } from '@/lib/api'
import type { PlaneLabel, PlaneMember, PlaneProject, PlaneState } from '@/lib/types'

export interface UsePlaneDataReturn {
  projects: PlaneProject[]
  members: PlaneMember[]
  labels: PlaneLabel[]
  states: PlaneState[]
  loadingProject: boolean
  error: string
  loadProject: (id: string) => Promise<void>
}

export function usePlaneData(): UsePlaneDataReturn {
  const [projects, setProjects] = useState<PlaneProject[]>([])
  const [members, setMembers] = useState<PlaneMember[]>([])
  const [labels, setLabels] = useState<PlaneLabel[]>([])
  const [states, setStates] = useState<PlaneState[]>([])
  const [loadingProject, setLoadingProject] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    planeApi<PlaneProject[]>('projects')
      .then(setProjects)
      .catch((e: unknown) => setError((e as Error).message))
  }, [])

  async function loadProject(id: string): Promise<void> {
    setLoadingProject(true)
    setError('')
    try {
      const [m, l, s] = await Promise.all([
        planeApi<PlaneMember[]>('members', id),
        planeApi<PlaneLabel[]>('labels', id),
        planeApi<PlaneState[]>('states', id),
      ])
      setMembers(m)
      setLabels(l)
      setStates(s)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoadingProject(false)
  }

  return { projects, members, labels, states, loadingProject, error, loadProject }
}
