'use client'

import { useState, useMemo } from 'react'
import { FilterPanel } from '../../filter/FilterPanel/FilterPanel'
import { ActivityFilterPanel } from '../../filter/ActivityFilterPanel/ActivityFilterPanel'
import { IssueList } from '../../issue/IssueList/IssueList'
import { BoardView } from '../../issue/BoardView/BoardView'
import { Spinner } from '../../ui/Spinner/Spinner'
import type { Priority } from '@/lib/types'
import styles from './MainContent.module.css'
import type { MainContentProps, ViewMode, SortField, SortDir } from './MainContent.types'

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0, high: 1, medium: 2, low: 3, none: 4,
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
  onProjectChange,
  onIncludeChange,
  onExcludeChange,
  onActivityFilterChange,
  onFilterReset,
  getIssueUrl,
  onSelectIssue,
}: MainContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
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
    if (!filtered) return null
    return [...filtered].sort((a, b) => {
      if (sortField === 'created') {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0
        return sortDir === 'desc' ? tb - ta : ta - tb
      } else {
        const pa = PRIORITY_ORDER[a.priority] ?? 4
        const pb = PRIORITY_ORDER[b.priority] ?? 4
        return sortDir === 'asc' ? pa - pb : pb - pa
      }
    })
  }, [filtered, sortField, sortDir])

  const DirArrow = ({ field }: { field: SortField }) => {
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
            <ActivityFilterPanel
              filter={activityFilter}
              newCount={newCount}
              updatedCount={updatedCount}
              onChange={onActivityFilterChange}
            />
          </>
        )}
      </aside>

      {/* ─── Right Content ─── */}
      <div className={styles.content}>
        {sorted !== null && (
          <>
            <div className={styles.toolbar}>
              {/* Sort controls */}
              <div className={styles.sortControls}>
                <span className={styles.sortLabel}>Sort</span>
                <button
                  className={`${styles.sortBtn} ${sortField === 'created' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortField('created')}
                >
                  Created <DirArrow field="created" />
                </button>
                <button
                  className={`${styles.sortBtn} ${sortField === 'priority' ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSortField('priority')}
                >
                  Priority <DirArrow field="priority" />
                </button>
              </div>

              {/* View switch */}
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
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
