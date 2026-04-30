'use client'

import { useState, useMemo } from 'react'
import { usePlaneData } from '@/hooks/usePlaneData'
import { useIssues } from '@/hooks/useIssues'
import { useFilter } from '@/hooks/useFilter'
import { isNewIssue, isUpdatedIssue, applySearch, type SearchField } from '@/lib/filterUtils'
import { Header } from './components/layout/Header/Header'
import { MainContent } from './components/layout/MainContent/MainContent'
import { IssueDrawer } from './components/issue/IssueDrawer/IssueDrawer'
import { ScrollToTop } from './components/ui/ScrollToTop/ScrollToTop'
import type { RawIssue } from '@/lib/types'
import styles from './page.module.css'

const PLANE_APP_URL = process.env.NEXT_PUBLIC_PLANE_APP_URL || 'https://app.plane.so'
const PLANE_WORKSPACE = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG || ''

export default function PlaneFilterPage() {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<RawIssue | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<SearchField>('code')

  const planeData = usePlaneData()
  const issues = useIssues()
  const filter = useFilter(issues.allIssues)

  const displayIssues = useMemo(
    () => filter.filtered !== null ? applySearch(filter.filtered, searchQuery, searchField) : null,
    [filter.filtered, searchQuery, searchField]
  )

  function handleSearchFieldChange(field: SearchField) {
    setSearchField(field)
    setSearchQuery('')
  }

  const selectedProjectObj = planeData.projects.find(p => p.id === selectedProject)

  const newCount = useMemo(
    () => issues.allIssues.filter(i => isNewIssue(i.created_at)).length,
    [issues.allIssues]
  )
  const updatedCount = useMemo(
    () => issues.allIssues.filter(i => isUpdatedIssue(i.created_at, i.updated_at)).length,
    [issues.allIssues]
  )

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

  function handleIssueUpdate(updated: RawIssue) {
    issues.updateIssue(updated)
    setSelectedIssue(updated)
  }

  return (
    <div className={styles.page}>
      <ScrollToTop />
      <IssueDrawer
        issue={selectedIssue}
        states={planeData.states}
        labels={planeData.labels}
        members={planeData.members}
        onClose={() => setSelectedIssue(null)}
        onIssueUpdate={handleIssueUpdate}
      />

      <Header
        filtered={displayIssues}
        totalCount={issues.allIssues.length}
        selectedProject={selectedProject}
        syncing={issues.syncing}
        loadingProject={planeData.loadingProject}
        searchQuery={searchQuery}
        searchField={searchField}
        onSearchChange={setSearchQuery}
        onSearchFieldChange={handleSearchFieldChange}
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
        filtered={displayIssues}
        searchQuery={searchQuery}
        include={filter.include}
        exclude={filter.exclude}
        activityFilter={filter.activityFilter}
        newCount={newCount}
        updatedCount={updatedCount}
        onProjectChange={handleProjectChange}
        onIncludeChange={filter.setInclude}
        onExcludeChange={filter.setExclude}
        onActivityFilterChange={filter.setActivityFilter}
        onFilterReset={filter.reset}
        getIssueUrl={getIssueUrl}
        onSelectIssue={setSelectedIssue}
      />
    </div>
  )
}
