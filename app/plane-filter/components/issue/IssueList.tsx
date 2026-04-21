import { IssueRow } from './IssueRow'
import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'
import styles from './IssueList.module.css'

export interface IssueListProps {
  issues: RawIssue[]
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  getIssueUrl?: (issue: RawIssue) => string
  onSelectIssue: (issue: RawIssue) => void
}

export function IssueList({ issues, states, labels, members, getIssueUrl, onSelectIssue }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className={styles.results}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>◎</span>
          <p>No matching issues found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.results}>
      <div className={styles.issueList}>
        {issues.map(issue => (
          <IssueRow
            key={issue.id}
            issue={issue}
            states={states}
            labels={labels}
            members={members}
            issueUrl={getIssueUrl?.(issue)}
            onClick={() => onSelectIssue(issue)}
          />
        ))}
      </div>
    </div>
  )
}
