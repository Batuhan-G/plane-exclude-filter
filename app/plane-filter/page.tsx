'use client'

import { useState } from 'react'
import { usePlaneData } from '@/hooks/usePlaneData'
import { useIssues } from '@/hooks/useIssues'
import { useFilter } from '@/hooks/useFilter'
import { FilterPanel } from './components/filter/FilterPanel'
import { IssueList } from './components/issue/IssueList'
import { IssueDrawer } from './components/issue/IssueDrawer'
import { Spinner } from './components/ui/Spinner'
import type { RawIssue } from '@/lib/types'
import styles from './page.module.css'

export default function PlaneFilterPage() {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<RawIssue | null>(null)

  const planeData = usePlaneData()
  const issues = useIssues()
  const filter = useFilter(issues.allIssues)

  const error = planeData.error || issues.error

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

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span>plane<span className={styles.logoAccent}>filter</span></span>
          </div>
          <div className={styles.headerStats}>
            {filter.filtered !== null && (
              <>
                <span className={styles.statChip}>
                  <span className={styles.statNum}>{filter.filtered.length}</span>
                  <span className={styles.statLabel}>shown</span>
                </span>
                <span className={styles.statDivider} />
                <span className={styles.statChip}>
                  <span className={styles.statNum}>{issues.allIssues.length - filter.filtered.length}</span>
                  <span className={styles.statLabel}>excluded</span>
                </span>
                <span className={styles.statDivider} />
              </>
            )}
            {selectedProject && (
              <button
                className={styles.syncBtn}
                onClick={handleSync}
                disabled={issues.syncing || planeData.loadingProject}
              >
                {issues.syncing ? <><Spinner variant="dark" /> Syncing...</> : 'Sync'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.projectPanel}>
          <div className={styles.projectPanelHeader}>
            <span className={styles.projectPanelTitle}>PROJECT</span>
            {planeData.loadingProject && <Spinner />}
          </div>
          <select
            className={styles.select}
            value={selectedProject}
            onChange={e => handleProjectChange(e.target.value)}
            disabled={planeData.projects.length === 0}
          >
            <option value="">— Select project —</option>
            {planeData.projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProject && !planeData.loadingProject && (
          <>
            <FilterPanel
              variant="include"
              members={planeData.members}
              labels={planeData.labels}
              states={planeData.states}
              filter={filter.include}
              onChange={filter.setInclude}
              onClear={filter.reset}
            />
            <FilterPanel
              variant="exclude"
              members={planeData.members}
              labels={planeData.labels}
              states={planeData.states}
              filter={filter.exclude}
              onChange={filter.setExclude}
              onClear={() => filter.setExclude({ assignees: [], labels: [], states: [] })}
            />
          </>
        )}

        {filter.filtered !== null && (
          <IssueList
            issues={filter.filtered}
            states={planeData.states}
            labels={planeData.labels}
            members={planeData.members}
            onSelectIssue={setSelectedIssue}
          />
        )}
      </main>
    </div>
  )
}
