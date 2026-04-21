'use client'

import { FilterPanel } from '../filter/FilterPanel'
import { IssueList } from '../issue/IssueList'
import { Spinner } from '../ui/Spinner'
import type { RawIssue, FilterSet, PlaneMember, PlaneLabel, PlaneState, PlaneProject } from '@/lib/types'
import styles from './MainContent.module.css'

interface MainContentProps {
  error: string | null | undefined
  projects: PlaneProject[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  loadingProject: boolean
  selectedProject: string
  filtered: RawIssue[] | null
  include: FilterSet
  exclude: FilterSet
  onProjectChange: (id: string) => void
  onIncludeChange: (filter: FilterSet) => void
  onExcludeChange: (filter: FilterSet) => void
  onFilterReset: () => void
  getIssueUrl: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}

export function MainContent({
  error,
  projects,
  states,
  labels,
  members,
  loadingProject,
  selectedProject,
  filtered,
  include,
  exclude,
  onProjectChange,
  onIncludeChange,
  onExcludeChange,
  onFilterReset,
  getIssueUrl,
  onSelectIssue,
}: MainContentProps) {
  return (
    <main className={styles.main}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.projectPanel}>
        <div className={styles.projectPanelHeader}>
          <span className={styles.projectPanelTitle}>PROJECT</span>
          {loadingProject && <Spinner />}
        </div>
        <select
          className={styles.select}
          value={selectedProject}
          onChange={e => onProjectChange(e.target.value)}
          disabled={projects.length === 0}
        >
          <option value="">— Select project —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProject && !loadingProject && (
        <>
          <FilterPanel
            variant="include"
            members={members}
            labels={labels}
            states={states}
            filter={include}
            onChange={onIncludeChange}
            onClear={onFilterReset}
          />
          <FilterPanel
            variant="exclude"
            members={members}
            labels={labels}
            states={states}
            filter={exclude}
            onChange={onExcludeChange}
            onClear={() => onExcludeChange({ assignees: [], labels: [], states: [], priorities: [] })}
          />
        </>
      )}

      {filtered !== null && (
        <IssueList
          issues={filtered}
          states={states}
          labels={labels}
          members={members}
          getIssueUrl={getIssueUrl}
          onSelectIssue={onSelectIssue}
        />
      )}
    </main>
  )
}
