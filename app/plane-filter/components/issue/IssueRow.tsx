import { Avatar } from '../ui/Avatar'
import { PRIORITY_CONFIG } from '@/lib/constants'
import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'
import styles from './IssueRow.module.css'

export interface IssueRowProps {
  issue: RawIssue
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  onClick: () => void
}

export function IssueRow({ issue, states, labels, members, onClick }: IssueRowProps) {
  const p = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.none
  const stateObj = states.find(s => s.id === issue.state)

  return (
    <div className={styles.issueRow} onClick={onClick} style={{ cursor: 'pointer' }}>
      <span className={styles.priorityDot} style={{ background: p.color }} title={p.label} />
      <div className={styles.issueMain}>
        <div className={styles.issueTitle}>
          <span className={styles.issueId}>#{issue.sequence_id}</span>
          {issue.name}
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
    </div>
  )
}
