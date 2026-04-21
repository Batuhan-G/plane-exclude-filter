'use client'

import { useEffect } from 'react'
import { Avatar } from '../ui/Avatar'
import { PRIORITY_CONFIG } from '@/lib/constants'
import type { PlaneLabel, PlaneMember, PlaneState, RawIssue } from '@/lib/types'
import styles from './IssueDrawer.module.css'

const APP_URL = process.env.NEXT_PUBLIC_PLANE_APP_URL
const WORKSPACE = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG

function sanitizeDescHtml(html: string, issueUrl: string | null): string {
  const placeholder = issueUrl
    ? `<a href="${issueUrl}" target="_blank" rel="noreferrer" class="planePlaceholderImg">&#128444; Image (view in Plane)</a>`
    : '<span class="planePlaceholderImg">&#128444; Image</span>'
  return html
    .replace(/<img[^>]*\/?>/gi, placeholder)
    .replace(/<image-component[^>]*>[\s\S]*?<\/image-component>/gi, placeholder)
    .replace(/<image-component[^/]*\/>/gi, placeholder)
}

export interface IssueDrawerProps {
  issue: RawIssue | null
  states: PlaneState[]
  labels: PlaneLabel[]
  members: PlaneMember[]
  onClose: () => void
}

export function IssueDrawer({ issue, states, labels, members, onClose }: IssueDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!issue) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [issue])

  if (!issue) return null

  const p = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.none
  const stateObj = states.find(s => s.id === issue.state)
  const issueUrl = APP_URL && WORKSPACE
    ? `${APP_URL}/${WORKSPACE}/projects/${issue.project}/issues/${issue.id}/`
    : null
  const descHtml = sanitizeDescHtml(issue.description_html ?? '', issueUrl)

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerIssueId}>#{issue.sequence_id}</span>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <h2 className={styles.drawerTitle}>{issue.name}</h2>

        <div className={styles.drawerMeta}>
          <span
            className={styles.drawerPriority}
            style={{ background: p.color + '22', borderColor: p.color + '55', color: p.color }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
            {p.label}
          </span>

          {stateObj && (
            <span className={styles.stateBadge} style={{ borderColor: stateObj.color + '55', color: stateObj.color }}>
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
        </div>

        {issue.assignees.length > 0 && (
          <div className={styles.drawerAssignees}>
            <span className={styles.drawerMetaLabel}>ASSIGNEES</span>
            <div className={styles.drawerAssigneeList}>
              {issue.assignees.map(aid => {
                const mObj = members.find(m => m.id === aid)
                if (!mObj) return null
                return (
                  <div key={aid} className={styles.drawerAssigneeItem}>
                    <Avatar name={mObj.name} size={22} />
                    <span>{mObj.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {descHtml && descHtml !== '<p></p>' ? (
          <div className={styles.drawerDescWrap}>
            <span className={styles.drawerMetaLabel}>DESCRIPTION</span>
            <div className={styles.drawerDescription} dangerouslySetInnerHTML={{ __html: descHtml }} />
          </div>
        ) : (
          <div className={styles.drawerNoDesc}>No description</div>
        )}
      </aside>
    </>
  )
}
