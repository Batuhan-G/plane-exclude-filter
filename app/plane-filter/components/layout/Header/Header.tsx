'use client'

import { useRef, useState, useEffect } from 'react'
import { Spinner } from '../../ui/Spinner/Spinner'
import styles from './Header.module.css'
import type { HeaderProps } from './Header.types'
import type { SearchField } from '@/lib/filterUtils'

const FIELD_CONFIG: { value: SearchField; label: string; placeholder: string }[] = [
  { value: 'code',    label: 'Code',    placeholder: 'e.g. 42 or PROJ-42' },
  { value: 'title',   label: 'Title',   placeholder: 'Search by title...' },
  { value: 'content', label: 'Content', placeholder: 'Search title & description...' },
]

export function Header({ filtered, totalCount, selectedProject, syncing, loadingProject, searchQuery, searchField, onSearchChange, onSearchFieldChange, onSync }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const current = FIELD_CONFIG.find(f => f.value === searchField) ?? FIELD_CONFIG[0]

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          <span>plane<span className={styles.logoAccent}>filter</span></span>
        </div>
        <div className={styles.searchWrap}>
          <div className={styles.fieldSelector} ref={dropdownRef}>
            <button
              className={styles.fieldBtn}
              onClick={() => setDropdownOpen(o => !o)}
              type="button"
            >
              {current.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className={styles.fieldDropdown}>
                {FIELD_CONFIG.map(f => (
                  <button
                    key={f.value}
                    className={`${styles.fieldOption} ${f.value === searchField ? styles.fieldOptionActive : ''}`}
                    onClick={() => { onSearchFieldChange(f.value); setDropdownOpen(false) }}
                    type="button"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.fieldDivider} />
          <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={current.placeholder}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.searchClear} onClick={() => onSearchChange('')} aria-label="Clear search">
              ✕
            </button>
          )}
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
