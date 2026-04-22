import { useState } from 'react'
import { Avatar } from '../../ui/Avatar/Avatar'
import { PRIORITY_CONFIG } from '@/lib/constants'
import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'
import styles from './IssueRow.module.css'
import type { IssueRowProps } from './IssueRow.types'

export function IssueRow({ issue, states, labels, members, issueUrl, isNew, isUpdated, onClick }: IssueRowProps) {
  const [copied, setCopied] = useState(false)
  const p = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.none
  const stateObj = states.find(s => s.id === issue.state)

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
      className={`${styles.issueRow} ${activityColor ? styles.activityBorder : ''}`}
      style={activityColor ? { '--activity-color': activityColor } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      <div className={styles.issueMain}>
        <div className={styles.issueTop}>
          <span className={styles.issueId}>#{issue.sequence_id}</span>
          <span
            className={styles.priorityBadge}
            style={{ borderColor: p.color + '55', color: p.color }}
          >
            {p.label}
          </span>
        </div>
        <div className={styles.issueTitle}>{issue.name}</div>
        <div className={styles.issueMeta}>
          {stateObj && (
            <span
              className={styles.stateBadge}
              style={{ borderColor: stateObj.color + '55', color: stateObj.color }}
            >
              {stateObj.name}
            </span>
          )}
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
          <div className={styles.assigneeGroup}>
            {issue.assignees.map(aid => {
              const mObj = members.find(m => m.id === aid)
              if (!mObj) return null
              return <Avatar key={aid} name={mObj.name} size={20} />
            })}
          </div>
        </div>
      </div>
      {issueUrl && (
        <button
          className={styles.copyLinkBtn}
          onClick={handleCopyLink}
          title="Copy link"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
