'use client'

import { useState } from 'react'
import { usePlaneData } from '@/hooks/usePlaneData'
import { useIssues } from '@/hooks/useIssues'
import { useFilter } from '@/hooks/useFilter'
import { Header } from './components/layout/Header'
import { MainContent } from './components/layout/MainContent'
import { IssueDrawer } from './components/issue/IssueDrawer'
import type { RawIssue } from '@/lib/types'
import styles from './page.module.css'

const PLANE_APP_URL = process.env.NEXT_PUBLIC_PLANE_APP_URL || 'https://app.plane.so'
const PLANE_WORKSPACE = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG || ''

export default function PlaneFilterPage() {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<RawIssue | null>(null)

  const planeData = usePlaneData()
  const issues = useIssues()
  const filter = useFilter(issues.allIssues)

  const selectedProjectObj = planeData.projects.find(p => p.id === selectedProject)

  function getIssueUrl(issue: RawIssue): string {
    if (!PLANE_WORKSPACE || !selectedProjectObj) return ''
    return `${PLANE_APP_URL}/${PLANE_WORKSPACE}/projects/${selectedProjectObj.id}/issues/${issue.id}/`
  }

  async function handleProjectChange(id: string) {
    setSelectedProject(id)
    issues.reset()
    filter.reset()
    if (!id) return
    await planeData.loadProject(id)
    await issues.fetchIssues(id)
  }

  async function handleSync() {
    if (!selectedProject) return
    await issues.sync(selectedProject)
  }

  return (
    <div className={styles.page}>
      <IssueDrawer
        issue={selectedIssue}
        states={planeData.states}
        labels={planeData.labels}
        members={planeData.members}
        onClose={() => setSelectedIssue(null)}
      />

      <Header
        filtered={filter.filtered}
        totalCount={issues.allIssues.length}
        selectedProject={selectedProject}
        syncing={issues.syncing}
        loadingProject={planeData.loadingProject}
        onSync={handleSync}
      />

      <MainContent
        error={planeData.error || issues.error}
        projects={planeData.projects}
        states={planeData.states}
        labels={planeData.labels}
        members={planeData.members}
        loadingProject={planeData.loadingProject}
        selectedProject={selectedProject}
        filtered={filter.filtered}
        include={filter.include}
        exclude={filter.exclude}
        onProjectChange={handleProjectChange}
        onIncludeChange={filter.setInclude}
        onExcludeChange={filter.setExclude}
        onFilterReset={filter.reset}
        getIssueUrl={getIssueUrl}
        onSelectIssue={setSelectedIssue}
      />
    </div>
  )
}
