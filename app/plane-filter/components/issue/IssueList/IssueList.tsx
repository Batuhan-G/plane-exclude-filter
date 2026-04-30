import { IssueRow } from '../IssueRow/IssueRow'
import { isNewIssue, isUpdatedIssue } from '@/lib/filterUtils'
import styles from './IssueList.module.css'
import type { IssueListProps } from './IssueList.types'

export function IssueList({ issues, states, labels, members, searchQuery, getIssueUrl, onSelectIssue }: IssueListProps) {
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
        {issues.map(issue => {
          const isNew = isNewIssue(issue.created_at)
          const isUpdated = isUpdatedIssue(issue.created_at, issue.updated_at)
          return (
            <IssueRow
              key={issue.id}
              issue={issue}
              states={states}
              labels={labels}
              members={members}
              issueUrl={getIssueUrl?.(issue)}
              isNew={isNew}
              isUpdated={isUpdated}
              searchQuery={searchQuery}
              onClick={() => onSelectIssue(issue)}
            />
          )
        })}
      </div>
    </div>
  )
}
