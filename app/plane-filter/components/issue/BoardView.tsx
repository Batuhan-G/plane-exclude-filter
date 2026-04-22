'use client'

import { useState, useRef } from 'react'
import { Avatar } from '../ui/Avatar'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { isNewIssue, isUpdatedIssue } from '@/lib/filterUtils'
import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'
import styles from './BoardView.module.css'

interface BoardViewProps {
  issues: RawIssue[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  getIssueUrl?: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}

export function BoardView({ issues, states, labels, members, getIssueUrl, onSelectIssue }: BoardViewProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - (boardRef.current?.offsetLeft ?? 0)
    scrollLeft.current = boardRef.current?.scrollLeft ?? 0
    boardRef.current!.style.cursor = 'grabbing'
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !boardRef.current) return
    e.preventDefault()
    const x = e.pageX - boardRef.current.offsetLeft
    const diff = x - startX.current
    if (Math.abs(diff) > 4) hasDragged.current = true
    boardRef.current.scrollLeft = scrollLeft.current - diff
  }

  function onMouseUp() {
    isDragging.current = false
    if (boardRef.current) boardRef.current.style.cursor = 'grab'
  }

  function onClickCapture(e: React.MouseEvent) {
    if (hasDragged.current) {
      e.stopPropagation()
      hasDragged.current = false
    }
  }

  if (issues.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◎</span>
        <p>No matching issues found</p>
      </div>
    )
  }

  // Group issues by state, preserving state order from states array
  const statesWithIssues = states
    .map(state => ({
      state,
      issues: issues.filter(i => i.state === state.id),
    }))
    .filter(col => col.issues.length > 0)

  // Issues with unknown/missing state
  const unknownIssues = issues.filter(i => !states.find(s => s.id === i.state))

  return (
    <div
      ref={boardRef}
      className={styles.board}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
    >
      {statesWithIssues.map(({ state, issues: colIssues }) => (
        <div key={state.id} className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnDot} style={{ background: state.color }} />
            <span className={styles.columnName}>{state.name}</span>
            <span className={styles.columnCount}>{colIssues.length}</span>
          </div>
          <div className={styles.cards}>
            {colIssues.map(issue => {
              const isNew = isNewIssue(issue.created_at)
              const isUpdated = isUpdatedIssue(issue.created_at, issue.updated_at)
              return (
                <BoardCard
                  key={issue.id}
                  issue={issue}
                  states={states}
                  labels={labels}
                  members={members}
                  issueUrl={getIssueUrl?.(issue)}
                  isNew={isNew}
                  isUpdated={isUpdated}
                  onClick={() => onSelectIssue(issue)}
                />
              )
            })}
          </div>
        </div>
      ))}

      {unknownIssues.length > 0 && (
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnDot} style={{ background: 'var(--text3)' }} />
            <span className={styles.columnName}>Unknown</span>
            <span className={styles.columnCount}>{unknownIssues.length}</span>
          </div>
          <div className={styles.cards}>
            {unknownIssues.map(issue => {
              const isNew = isNewIssue(issue.created_at)
              const isUpdated = isUpdatedIssue(issue.created_at, issue.updated_at)
              return (
                <BoardCard
                  key={issue.id}
                  issue={issue}
                  states={states}
                  labels={labels}
                  members={members}
                  issueUrl={getIssueUrl?.(issue)}
                  isNew={isNew}
                  isUpdated={isUpdated}
                  onClick={() => onSelectIssue(issue)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface BoardCardProps {
  issue: RawIssue
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  issueUrl?: string
  isNew?: boolean
  isUpdated?: boolean
  onClick: () => void
}

function BoardCard({ issue, labels, members, issueUrl, isNew, isUpdated, onClick }: BoardCardProps) {
  const [copied, setCopied] = useState(false)
  const p = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.none

  function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    if (!issueUrl) return
    navigator.clipboard.writeText(issueUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const activityColor = isNew ? '#22c55e' : isUpdated ? '#3b82f6' : undefined

  return (
    <div
      className={`${styles.card} ${activityColor ? styles.activityBorder : ''}`}
      style={activityColor ? { '--activity-color': activityColor } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          <span className={styles.cardId}>#{issue.sequence_id}</span>
          <span
            className={styles.priorityBadge}
            style={{ borderColor: p.color + '55', color: p.color }}
          >
            {p.label}
          </span>
        </div>
        <div className={styles.cardTopRight}>
          {issueUrl && (
            <button className={styles.copyLinkBtn} onClick={handleCopyLink} title="Copy link">
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          )}
          {issue.assignees.map(aid => {
            const mObj = members.find(m => m.id === aid)
            if (!mObj) return null
            return <Avatar key={aid} name={mObj.name} size={20} />
          })}
         
        </div>
      </div>
      <div className={styles.cardTitle}>{issue.name}</div>
      {issue.labels.length > 0 && (
        <div className={styles.cardLabels}>
          {issue.labels.map(lid => {
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
        </div>
      )}
    </div>
  )
}
