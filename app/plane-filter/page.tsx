'use client'

import { useEffect, useRef, useState } from 'react'
import type { PlaneLabel, PlaneMember, PlaneProject, PlaneState } from '@/lib/types'
import styles from './page.module.css'

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ff4d4d' },
  high:   { label: 'High',   color: '#ff8c42' },
  medium: { label: 'Medium', color: '#f5c518' },
  low:    { label: 'Low',    color: '#4caf7d' },
  none:   { label: 'None',   color: '#505050' },
}

async function api<T>(action: string, project?: string, bust = false): Promise<T> {
  const params = new URLSearchParams({ action })
  if (project) params.set('project', project)
  if (bust) params.set('bust', Date.now().toString())
  const res = await fetch(`/api/plane?${params}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},45%,35%)`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600,
      color: `hsl(${hue},60%,85%)`, fontFamily: 'var(--mono)',
    }}>
      {initials}
    </div>
  )
}

function Tag({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) {
  return (
    <span className={styles.tag} style={color ? { background: color + '22', borderColor: color + '55', color } : {}}>
      {color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />}
      {label}
      <button className={styles.tagRemove} onClick={onRemove} aria-label="Remove">×</button>
    </span>
  )
}

function FilterInput<T extends { id: string; name: string; color?: string }>({
  label,
  items,
  selected,
  onAdd,
  onRemove,
  renderItem,
}: {
  label: string
  items: T[]
  selected: T[]
  onAdd: (item: T) => void
  onRemove: (id: string) => void
  renderItem?: (item: T) => React.ReactNode
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = items.filter(
    i => i.name.toLowerCase().includes(query.toLowerCase()) && !selected.find(s => s.id === i.id)
  )

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.filterRow}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.filterRight} ref={wrapRef}>
        <div className={styles.tagInput} onClick={() => { setOpen(true); inputRef.current?.focus() }}>
          {selected.map(s => (
            <Tag
              key={s.id}
              label={s.name}
              color={s.color}
              onRemove={() => onRemove(s.id)}
            />
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? 'Select...' : ''}
            className={styles.tagInputField}
          />
        </div>
        {open && filtered.length > 0 && (
          <div className={styles.dropdown}>
            {filtered.map(item => (
              <button
                key={item.id}
                className={styles.dropdownItem}
                onMouseDown={e => { e.preventDefault(); onAdd(item); setQuery('') }}
              >
                {renderItem ? renderItem(item) : item.name}
              </button>
            ))}
          </div>
        )}
        {open && filtered.length === 0 && query && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownEmpty}>No results</div>
          </div>
        )}
      </div>
    </div>
  )
}

type RawIssue = Record<string, unknown>

type FilterSet<A, L, S> = {
  assignees: A[]
  labels: L[]
  states: S[]
}

const EMPTY_FILTER = { assignees: [], labels: [], states: [] }

export default function PlaneFilterPage() {
  const [projects, setProjects] = useState<PlaneProject[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [members, setMembers] = useState<PlaneMember[]>([])
  const [labels, setLabels] = useState<PlaneLabel[]>([])
  const [states, setStates] = useState<PlaneState[]>([])

  const [include, setInclude] = useState<FilterSet<PlaneMember, PlaneLabel, PlaneState>>(EMPTY_FILTER)
  const [exclude, setExclude] = useState<FilterSet<PlaneMember, PlaneLabel, PlaneState>>(EMPTY_FILTER)

  const [syncing, setSyncing] = useState(false)
  const [loadingProject, setLoadingProject] = useState(false)
  const [error, setError] = useState('')
  const [allIssues, setAllIssues] = useState<RawIssue[]>([])
  const [filtered, setFiltered] = useState<RawIssue[] | null>(null)

  useEffect(() => {
    api<PlaneProject[]>('projects')
      .then(setProjects)
      .catch(e => setError(e.message))
  }, [])

  async function fetchIssues(id: string, bust = false) {
    try {
      const all = await api<RawIssue[]>('issues', id, bust)
      setAllIssues(all)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function handleProjectChange(id: string) {
    setSelectedProject(id)
    setAllIssues([])
    setFiltered(null)
    setInclude(EMPTY_FILTER)
    setExclude(EMPTY_FILTER)
    setError('')
    if (!id) return
    setLoadingProject(true)
    try {
      const [m, l, s] = await Promise.all([
        api<PlaneMember[]>('members', id),
        api<PlaneLabel[]>('labels', id),
        api<PlaneState[]>('states', id),
      ])
      setMembers(m)
      setLabels(l)
      setStates(s)
      await fetchIssues(id)
    } catch (e) {
      setError((e as Error).message)
    }
    setLoadingProject(false)
  }

  async function handleSync() {
    if (!selectedProject) return
    setSyncing(true)
    setError('')
    await fetchIssues(selectedProject, true)
    setSyncing(false)
  }

  useEffect(() => {
    if (allIssues.length === 0) {
      setFiltered(null)
      return
    }
    const inAssigneeIds = new Set(include.assignees.map(a => a.id))
    const inLabelIds    = new Set(include.labels.map(l => l.id))
    const inStateIds    = new Set(include.states.map(s => s.id))
    const exAssigneeIds = new Set(exclude.assignees.map(a => a.id))
    const exLabelIds    = new Set(exclude.labels.map(l => l.id))
    const exStateIds    = new Set(exclude.states.map(s => s.id))

    setFiltered(allIssues.filter(issue => {
      const assigneeIds = (issue.assignees as string[]) ?? []
      const labelIds    = (issue.labels as string[]) ?? []
      const stateId     = (issue.state as string) ?? ''

      if (inAssigneeIds.size > 0 && !assigneeIds.some(id => inAssigneeIds.has(id))) return false
      if (inLabelIds.size > 0    && !labelIds.some(id => inLabelIds.has(id)))        return false
      if (inStateIds.size > 0    && !inStateIds.has(stateId))                        return false

      if (exAssigneeIds.size > 0 && assigneeIds.some(id => exAssigneeIds.has(id))) return false
      if (exLabelIds.size > 0    && labelIds.some(id => exLabelIds.has(id)))        return false
      if (exStateIds.size > 0    && exStateIds.has(stateId))                        return false

      return true
    }))
  }, [allIssues, include, exclude])

  function clearAll() {
    setInclude(EMPTY_FILTER)
    setExclude(EMPTY_FILTER)
  }

  const hasFilters =
    include.assignees.length > 0 || include.labels.length > 0 || include.states.length > 0 ||
    exclude.assignees.length > 0 || exclude.labels.length > 0 || exclude.states.length > 0

  const priorityConfig = PRIORITY_CONFIG as Record<string, { label: string; color: string }>

  const memberRenderer = (item: PlaneMember) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar name={item.name} size={20} />
      <span>{item.name}</span>
    </div>
  )

  const coloredItemRenderer = (item: PlaneLabel | PlaneState) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
      <span>{item.name}</span>
    </div>
  )

  return (
    <div className={styles.page}>
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
                  <span className={styles.statNum}>{allIssues.length - filtered.length}</span>
                  <span className={styles.statLabel}>excluded</span>
                </span>
                <span className={styles.statDivider} />
              </>
            )}
            {selectedProject && (
              <button
                className={styles.syncBtn}
                onClick={handleSync}
                disabled={syncing || loadingProject}
              >
                {syncing ? <><span className={styles.spinnerDark} /> Syncing...</> : 'Sync'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>PROJECT</span>
            {loadingProject && <span className={styles.spinner} />}
          </div>
          <select
            className={styles.select}
            value={selectedProject}
            onChange={e => handleProjectChange(e.target.value)}
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
            <div className={`${styles.panel} ${styles.panelInclude}`}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <span className={`${styles.panelTitleDot} ${styles.panelTitleDotInclude}`} />
                  INCLUDE FILTERS
                </span>
              </div>

              <FilterInput
                label="Assignee"
                items={members}
                selected={include.assignees}
                onAdd={item => setInclude(prev => ({ ...prev, assignees: [...prev.assignees, item] }))}
                onRemove={id => setInclude(prev => ({ ...prev, assignees: prev.assignees.filter(a => a.id !== id) }))}
                renderItem={memberRenderer}
              />
              <FilterInput
                label="Label"
                items={labels}
                selected={include.labels}
                onAdd={item => setInclude(prev => ({ ...prev, labels: [...prev.labels, item] }))}
                onRemove={id => setInclude(prev => ({ ...prev, labels: prev.labels.filter(l => l.id !== id) }))}
                renderItem={coloredItemRenderer}
              />
              <FilterInput
                label="State"
                items={states}
                selected={include.states}
                onAdd={item => setInclude(prev => ({ ...prev, states: [...prev.states, item] }))}
                onRemove={id => setInclude(prev => ({ ...prev, states: prev.states.filter(s => s.id !== id) }))}
                renderItem={coloredItemRenderer}
              />
            </div>

            <div className={`${styles.panel} ${styles.panelExclude}`}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <span className={`${styles.panelTitleDot} ${styles.panelTitleDotExclude}`} />
                  EXCLUDE FILTERS
                </span>
                {hasFilters && (
                  <button className={styles.clearBtn} onClick={clearAll}>Clear</button>
                )}
              </div>

              <FilterInput
                label="Assignee"
                items={members}
                selected={exclude.assignees}
                onAdd={item => setExclude(prev => ({ ...prev, assignees: [...prev.assignees, item] }))}
                onRemove={id => setExclude(prev => ({ ...prev, assignees: prev.assignees.filter(a => a.id !== id) }))}
                renderItem={memberRenderer}
              />
              <FilterInput
                label="Label"
                items={labels}
                selected={exclude.labels}
                onAdd={item => setExclude(prev => ({ ...prev, labels: [...prev.labels, item] }))}
                onRemove={id => setExclude(prev => ({ ...prev, labels: prev.labels.filter(l => l.id !== id) }))}
                renderItem={coloredItemRenderer}
              />
              <FilterInput
                label="State"
                items={states}
                selected={exclude.states}
                onAdd={item => setExclude(prev => ({ ...prev, states: [...prev.states, item] }))}
                onRemove={id => setExclude(prev => ({ ...prev, states: prev.states.filter(s => s.id !== id) }))}
                renderItem={coloredItemRenderer}
              />

            </div>
          </>
        )}

        {filtered !== null && (
          <div className={styles.results}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>◎</span>
                <p>No matching issues found</p>
              </div>
            ) : (
              <div className={styles.issueList}>
                {filtered.map(issue => {
                  const priority = (issue.priority as string) ?? 'none'
                  const p = priorityConfig[priority] ?? priorityConfig.none
                  const stateId = issue.state as string
                  const stateObj = states.find(s => s.id === stateId)
                  const labelIds = (issue.labels as string[]) ?? []
                  const assigneeIds = (issue.assignees as string[]) ?? []

                  return (
                    <div key={issue.id as string} className={styles.issueRow}>
                      <span
                        className={styles.priorityDot}
                        style={{ background: p.color }}
                        title={p.label}
                      />
                      <div className={styles.issueMain}>
                        <div className={styles.issueTitle}>
                          <span className={styles.issueId}>#{issue.sequence_id as number}</span>
                          {issue.name as string}
                        </div>
                        <div className={styles.issueMeta}>
                          {stateObj && (
                            <span
                              className={styles.stateBadge}
                              style={{ borderColor: stateObj.color + '55', color: stateObj.color }}
                            >
                              {stateObj.name}
                            </span>
                          )}
                          {labelIds.map(lid => {
                            const lObj = labels.find(l => l.id === lid)
                            if (!lObj) return null
                            return (
                              <span
                                key={lid}
                                className={styles.labelBadge}
                                style={{ background: lObj.color + '1a', borderColor: lObj.color + '44', color: lObj.color }}
                              >
                                {lObj.name}
                              </span>
                            )
                          })}
                          <div className={styles.assigneeGroup}>
                            {assigneeIds.map(aid => {
                              const mObj = members.find(m => m.id === aid)
                              if (!mObj) return null
                              return <Avatar key={aid} name={mObj.name} size={20} />
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
