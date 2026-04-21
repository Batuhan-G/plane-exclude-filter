'use client'

import { useState } from 'react'
import { FilterPanel } from '../filter/FilterPanel'
import { IssueList } from '../issue/IssueList'
import { BoardView } from '../issue/BoardView'
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

type ViewMode = 'list' | 'board'

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
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}

      {/* ─── Left Sidebar ─── */}
      <aside className={styles.sidebar}>
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
      </aside>

      {/* ─── Right Content ─── */}
      <div className={styles.content}>
        {filtered !== null && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.viewSwitch}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="3" y1="4" x2="13" y2="4" />
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <line x1="3" y1="12" x2="13" y2="12" />
                  </svg>
                  Liste
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'board' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('board')}
                  title="Board view"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="2" width="4" height="12" rx="1" />
                    <rect x="6" y="2" width="4" height="12" rx="1" />
                    <rect x="11" y="2" width="4" height="12" rx="1" />
                  </svg>
                  Tablo
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <IssueList
                issues={filtered}
                states={states}
                labels={labels}
                members={members}
                getIssueUrl={getIssueUrl}
                onSelectIssue={onSelectIssue}
              />
            ) : (
              <BoardView
                issues={filtered}
                states={states}
                labels={labels}
                members={members}
                getIssueUrl={getIssueUrl}
                onSelectIssue={onSelectIssue}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
