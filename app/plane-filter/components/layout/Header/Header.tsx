'use client'

import { Spinner } from '../../ui/Spinner/Spinner'
import styles from './Header.module.css'
import type { HeaderProps } from './Header.types'

export function Header({ filtered, totalCount, selectedProject, syncing, loadingProject, onSync }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          <span>plane<span className={styles.logoAccent}>filter</span></span>
        </div>
        <div className={styles.headerStats}>
          {filtered !== null && (
            <>
              <span className={styles.statChip}>
                <span className={styles.statNum}>{filtered.length}</span>
                <span className={styles.statLabel}>shown</span>
              </span>
              <span className={styles.statDivider} />
              <span className={styles.statChip}>
                <span className={styles.statNum}>{totalCount - filtered.length}</span>
                <span className={styles.statLabel}>excluded</span>
              </span>
              <span className={styles.statDivider} />
            </>
          )}
          {selectedProject && (
            <button
              className={styles.syncBtn}
              onClick={onSync}
              disabled={syncing || loadingProject}
            >
              {syncing ? <><Spinner variant="dark" /> Syncing...</> : 'Sync'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
