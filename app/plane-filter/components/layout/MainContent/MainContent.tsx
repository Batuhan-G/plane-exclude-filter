'use client'

import { useState, useRef, useEffect } from 'react'
import { FilterPanel } from '../../filter/FilterPanel/FilterPanel'
import { ActivityFilterPanel } from '../../filter/ActivityFilterPanel/ActivityFilterPanel'
import { SavedFilters } from '../../filter/SavedFilters/SavedFilters'
import { IssueList } from '../../issue/IssueList/IssueList'
import { BoardView } from '../../issue/BoardView/BoardView'
import { Spinner } from '../../ui/Spinner/Spinner'
import { ScrollToTop } from '../../ui/ScrollToTop/ScrollToTop'
import { useIssueSort } from '@/hooks/useIssueSort'
import type { SortField } from '@/hooks/useIssueSort'
import styles from './MainContent.module.css'
import type { MainContentProps, ViewMode } from './MainContent.types'

function DirArrow({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: 'asc' | 'desc' }) {
  if (sortField !== field) return null
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {sortDir === 'desc'
        ? <><line x1="5" y1="1" x2="5" y2="9" /><polyline points="2,6 5,9 8,6" /></>
        : <><line x1="5" y1="9" x2="5" y2="1" /><polyline points="2,4 5,1 8,4" /></>
      }
    </svg>
  )
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
  activityFilter,
  newCount,
  updatedCount,
  searchQuery,
  onProjectChange,
  onIncludeChange,
  onExcludeChange,
  onActivityFilterChange,
  getIssueUrl,
  onSelectIssue,
}: MainContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const { sorted, sortField, sortDir, handleSortField } = useIssueSort(filtered)

  function handleIncludeClear() {
    onIncludeChange({ assignees: [], labels: [], states: [], priorities: [], createdBy: [] })
  }
  function handlerExcludeClear() {
    onExcludeChange({ assignees: [], labels: [], states: [], priorities: [], createdBy: [] })
  }

  const contentRef = useRef<HTMLDivElement>(null)
  const isMountRef = useRef(true)
  const [boardScrollReset, setBoardScrollReset] = useState(0)

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false
      return
    }
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setBoardScrollReset(k => k + 1)
  }, [include, exclude, activityFilter])

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
              onClear={handleIncludeClear}
            />
            <FilterPanel
              variant="exclude"
              members={members}
              labels={labels}
              states={states}
              filter={exclude}
              onChange={onExcludeChange}
              onClear={handlerExcludeClear}
            />
            <ActivityFilterPanel
              filter={activityFilter}
              newCount={newCount}
              updatedCount={updatedCount}
              onChange={onActivityFilterChange}
            />
            <SavedFilters
              include={include}
              exclude={exclude}
              selectedProject={selectedProject}
              onLoad={(inc, exc) => { onIncludeChange(inc); onExcludeChange(exc) }}
            />
          </>
        )}
      </aside>

      {/* ─── Right Content ─── */}
      <div className={styles.content} ref={contentRef}>
        <ScrollToTop containerRef={contentRef} />
        {sorted !== null && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.sortControls}>
                <span className={styles.sortLabel}>Sort</span>
                <button
                  className={`${styles.sortBtn} ${sortField === 'created' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortField('created')}
                >
                  Created <DirArrow field="created" sortField={sortField} sortDir={sortDir} />
                </button>
                <button
                  className={`${styles.sortBtn} ${sortField === 'priority' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortField('priority')}
                >
                  Priority <DirArrow field="priority" sortField={sortField} sortDir={sortDir} />
                </button>
              </div>

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
                  List
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
                  Board
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <IssueList
                issues={sorted}
                states={states}
                labels={labels}
                members={members}
                searchQuery={searchQuery}
                getIssueUrl={getIssueUrl}
                onSelectIssue={onSelectIssue}
              />
            ) : (
              <BoardView
                issues={sorted}
                states={states}
                labels={labels}
                members={members}
                getIssueUrl={getIssueUrl}
                onSelectIssue={onSelectIssue}
                scrollResetKey={boardScrollReset}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
