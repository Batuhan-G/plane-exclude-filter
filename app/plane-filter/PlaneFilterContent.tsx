'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePlaneData } from '@/hooks/usePlaneData'
import { useIssues } from '@/hooks/useIssues'
import { useFilter } from '@/hooks/useFilter'
import { isNewIssue, isUpdatedIssue, applySearch, type SearchField } from '@/lib/filterUtils'
import {
  buildUrlParams,
  readProjectFromParams,
  readSearchFromParams,
  readActivityFromParams,
  readFiltersFromParams,
  hasFilterParams,
} from '@/lib/filterUrlUtils'
import { Header } from './components/layout/Header/Header'
import { MainContent } from './components/layout/MainContent/MainContent'
import { IssueDrawer } from './components/issue/IssueDrawer/IssueDrawer'
import { OnboardingModal } from './components/ui/OnboardingModal/OnboardingModal'
import type { RawIssue } from '@/lib/types'
import styles from './page.module.css'

const PLANE_APP_URL = process.env.NEXT_PUBLIC_PLANE_APP_URL || 'https://app.plane.so'
const PLANE_WORKSPACE = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG || ''

interface PlaneFilterContentProps {
  initialConfigured: boolean
}

function PlaneFilterInner({ initialConfigured }: PlaneFilterContentProps) {
  const searchParams = useSearchParams()

  const initialParams = useRef(new URLSearchParams(searchParams.toString()))

  const initialProject = readProjectFromParams(initialParams.current)
  const initialSearch  = readSearchFromParams(initialParams.current)

  const [selectedProject, setSelectedProject] = useState(initialProject)
  const [selectedIssue,   setSelectedIssue]   = useState<RawIssue | null>(null)
  const [searchQuery,     setSearchQuery]      = useState(initialSearch.query)
  const [searchField,     setSearchField]      = useState<SearchField>(initialSearch.field)
  const [showOnboarding,  setShowOnboarding]   = useState(!initialConfigured)

  const planeData = usePlaneData()
  const issues    = useIssues()
  const filter    = useFilter(issues.allIssues)

  const urlRestoredRef = useRef(false)

  useEffect(() => {
    if (initialProject) {
      planeData.loadProject(initialProject)
      issues.fetchIssues(initialProject)
    }
  }, [])

  useEffect(() => {
    if (urlRestoredRef.current) return
    if (!planeData.members.length && !planeData.labels.length && !planeData.states.length) return
    if (!hasFilterParams(initialParams.current)) return

    urlRestoredRef.current = true

    const { include, exclude } = readFiltersFromParams(
      initialParams.current,
      planeData.members,
      planeData.labels,
      planeData.states,
    )
    const activity = readActivityFromParams(initialParams.current)

    filter.setInclude(include)
    filter.setExclude(exclude)
    filter.setActivityFilter(activity)
  }, [planeData.members, planeData.labels, planeData.states])

  useEffect(() => {
    const params = buildUrlParams(
      selectedProject,
      filter.include,
      filter.exclude,
      filter.activityFilter,
      searchQuery,
      searchField,
    )
    const qs = params.toString()
    const newUrl = qs ? `?${qs}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [selectedProject, filter.include, filter.exclude, filter.activityFilter, searchQuery, searchField])

  const displayIssues = useMemo(
    () => filter.filtered !== null ? applySearch(filter.filtered, searchQuery, searchField) : null,
    [filter.filtered, searchQuery, searchField]
  )

  const selectedProjectObj = planeData.projects.find(p => p.id === selectedProject)

  const newCount = useMemo(
    () => issues.allIssues.filter(i => isNewIssue(i.created_at)).length,
    [issues.allIssues]
  )
  const updatedCount = useMemo(
    () => issues.allIssues.filter(i => isUpdatedIssue(i.created_at, i.updated_at)).length,
    [issues.allIssues]
  )

  function handleSearchFieldChange(field: SearchField) {
    setSearchField(field)
    setSearchQuery('')
  }

  function getIssueUrl(issue: RawIssue): string {
    if (!PLANE_WORKSPACE || !selectedProjectObj) return ''
    return `${PLANE_APP_URL}/${PLANE_WORKSPACE}/projects/${selectedProjectObj.id}/issues/${issue.id}/`
  }

  async function handleProjectChange(id: string) {
    setSelectedProject(id)
    issues.reset()
    filter.reset()
    urlRestoredRef.current = true
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
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

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
        onReset={() => setShowOnboarding(true)}
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
        getIssueUrl={getIssueUrl}
        onSelectIssue={setSelectedIssue}
      />
    </div>
  )
}

export function PlaneFilterContent({ initialConfigured }: PlaneFilterContentProps) {
  return (
    <Suspense>
      <PlaneFilterInner initialConfigured={initialConfigured} />
    </Suspense>
  )
}
