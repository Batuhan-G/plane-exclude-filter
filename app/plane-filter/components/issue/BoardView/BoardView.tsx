'use client'

import { useState } from 'react'
import { Avatar } from '../../ui/Avatar/Avatar'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { isNewIssue, isUpdatedIssue } from '@/lib/filterUtils'
import { useDragScroll } from '@/hooks/useDragScroll'
import styles from './BoardView.module.css'
import type { BoardViewProps, BoardCardProps } from './BoardView.types'

export function BoardView({ issues, states, labels, members, getIssueUrl, onSelectIssue }: BoardViewProps) {
  const { ref: boardRef, handlers } = useDragScroll()

  if (issues.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◎</span>
        <p>No matching issues found</p>
      </div>
    )
  }

  const statesWithIssues = states
    .map(state => ({ state, issues: issues.filter(i => i.state === state.id) }))
    .filter(col => col.issues.length > 0)

  const unknownIssues = issues.filter(i => !states.find(s => s.id === i.state))

  return (
    <div ref={boardRef} className={styles.board} {...handlers}>
      {statesWithIssues.map(({ state, issues: colIssues }) => (
        <div key={state.id} className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnDot} style={{ background: state.color }} />
            <span className={styles.columnName}>{state.name}</span>
            <span className={styles.columnCount}>{colIssues.length}</span>
          </div>
          <div className={styles.cards}>
            {colIssues.map(issue => (
              <BoardCard
                key={issue.id}
                issue={issue}
                states={states}
                labels={labels}
                members={members}
                issueUrl={getIssueUrl?.(issue)}
                isNew={isNewIssue(issue.created_at)}
                isUpdated={isUpdatedIssue(issue.created_at, issue.updated_at)}
                onClick={() => onSelectIssue(issue)}
              />
            ))}
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
            {unknownIssues.map(issue => (
              <BoardCard
                key={issue.id}
                issue={issue}
                states={states}
                labels={labels}
                members={members}
                issueUrl={getIssueUrl?.(issue)}
                isNew={isNewIssue(issue.created_at)}
                isUpdated={isUpdatedIssue(issue.created_at, issue.updated_at)}
                onClick={() => onSelectIssue(issue)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BoardCard({ issue, labels, members, issueUrl, isNew, isUpdated, onClick }: BoardCardProps) {
  const [copied, setCopied] = useState(false)
  const p = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.none
  const activityColor = isNew ? '#22c55e' : isUpdated ? '#3b82f6' : undefined

  function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    if (!issueUrl) return
    navigator.clipboard.writeText(issueUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      className={`${styles.card} ${activityColor ? styles.activityBorder : ''}`}
      style={activityColor ? { '--activity-color': activityColor } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTopLeft}>
          <span className={styles.cardId}>#{issue.sequence_id}</span>
          <span className={styles.priorityBadge} style={{ borderColor: p.color + '55', color: p.color }}>
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
