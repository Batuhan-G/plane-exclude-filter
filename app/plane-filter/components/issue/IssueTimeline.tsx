'use client'

import { useState, useEffect, useCallback } from 'react'
import { relativeTime } from '@/lib/timeUtils'
import { formatActivity, mergeTimeline, type ActivitySegment } from '@/lib/activityUtils'
import type { RawIssue, PlaneMember, PlaneActivity, PlaneComment, TimelineEntry } from '@/lib/types'
import styles from './IssueTimeline.module.css'

interface IssueTimelineProps {
  issue: RawIssue | null
  members: PlaneMember[]
}

const timelineCache: Record<string, TimelineEntry[]> = {}

interface CurrentUser { id: string; display_name: string; avatar: string }
let currentUser: CurrentUser | null = null
let currentUserFetch: Promise<CurrentUser | null> | null = null

function fetchMe(): Promise<CurrentUser | null> {
  if (currentUser) return Promise.resolve(currentUser)
  if (!currentUserFetch) {
    currentUserFetch = fetch('/api/plane?action=me')
      .then(r => r.ok ? r.json() : null)
      .then((data: CurrentUser | null) => { if (data) currentUser = data; return data })
      .catch(() => null)
  }
  return currentUserFetch
}

function resolveActor(entry: TimelineEntry, members: PlaneMember[]): string {

  const detail = entry.data.actor_detail
  if (detail && 'display_name' in detail && detail.display_name) return detail.display_name

  const actorId = (entry.data as { actor?: string }).actor
  if (actorId) {
    const member = members.find(m => m.id === actorId)
    if (member) return member.name
  }

  return 'Unknown'
}

function getDotColor(entry: TimelineEntry): string {
  if (entry.type === 'comment') return '#3b82f6'
  const { field, verb } = entry.data
  if (!field && verb === 'created') return '#22c55e'
  if (field === 'state') return 'var(--accent)'
  if (field === 'assignees') return '#8b5cf6'
  if (field === 'priority') return '#f97316'
  if (field === 'label') return 'var(--text3)'
  return 'var(--text3)'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function IssueTimeline({ issue, members }: IssueTimelineProps) {
  const [timeline, setTimeline]         = useState<TimelineEntry[]>([])
  const [loading, setLoading]           = useState(false)
  const [me, setMe]                     = useState<CurrentUser | null>(null)
  const [expandedComments, setExpanded] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [comment, setComment]           = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)

  useEffect(() => { fetchMe().then(setMe) }, [])

  useEffect(() => {
    if (!issue) return
    const key = issue.id
    if (timelineCache[key]) { setTimeline(timelineCache[key]); return }
    setLoading(true)
    const { project, id } = { project: issue.project, id: issue.id }
    Promise.all([
      fetch(`/api/plane?action=activities&project=${project}&issue=${id}`).then(r => r.json()),
      fetch(`/api/plane?action=comments&project=${project}&issue=${id}`).then(r => r.json()),
    ])
      .then(([activities, comments]) => {
        const merged = mergeTimeline(activities as PlaneActivity[], comments as PlaneComment[])
        timelineCache[key] = merged
        setTimeline(merged)
      })
      .catch(() => setTimeline([]))
      .finally(() => setLoading(false))
  }, [issue?.id])

  const handleSubmit = useCallback(async () => {
    if (!issue || !comment.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(
        `/api/plane?action=addComment&project=${issue.project}&issue=${issue.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment_html: `<p>${comment.trim()}</p>` }),
        }
      )
      if (!res.ok) throw new Error('Failed')
      const newComment = await res.json() as PlaneComment
      const entry: TimelineEntry = { type: 'comment', data: newComment }
      const updated = [...timeline, entry]
      timelineCache[issue.id] = updated
      setTimeline(updated)
      setComment('')
    } catch {
      setSubmitError('Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [issue, comment, timeline])

  const handleDelete = useCallback(async (commentId: string) => {
    if (!issue) return
    setDeletingId(commentId)

    const prev = [...timeline]
    const updated = timeline.filter(e => e.data.id !== commentId)
    timelineCache[issue.id] = updated
    setTimeline(updated)
    try {
      const res = await fetch(
        `/api/plane?action=deleteComment&project=${issue.project}&issue=${issue.id}&comment=${commentId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed')
    } catch {
      timelineCache[issue.id] = prev
      setTimeline(prev)
    } finally {
      setDeletingId(null)
    }
  }, [issue, timeline])

  if (!issue) return null

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>ACTIVITY</span>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonDot} />
              <div className={styles.skeletonLine} style={{ width: `${55 + i * 10}%` }} />
            </div>
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <div className={styles.empty}>No activity yet</div>
      ) : (
        <div className={styles.timeline}>
          {timeline.map((entry, idx) => {
            const isLast     = idx === timeline.length - 1
            const dotColor   = getDotColor(entry)
            const actor      = resolveActor(entry, members)
            const isComment  = entry.type === 'comment'
            const isExpanded = isComment && expandedComments.has(entry.data.id)
            const commentText = isComment ? stripHtml((entry.data as PlaneComment).comment_html) : ''
            const isLong     = commentText.length > 180
            const isOwnComment = isComment && me != null &&
              ((entry.data as PlaneComment).actor === me.id ||
               (entry.data as PlaneComment).actor_detail?.id === me.id)
            const isBeingDeleted = deletingId === entry.data.id

            return (
              <div key={entry.data.id} className={`${styles.node} ${isComment ? styles.nodeComment : ''}`}>
                {/* Left spine */}
                <div className={styles.nodeLeft}>
                  <div
                    className={styles.dot}
                    style={{
                      width:      isComment ? 12 : 8,
                      height:     isComment ? 12 : 8,
                      background: dotColor,
                    }}
                  />
                  {!isLast && <div className={styles.line} />}
                </div>

                {/* Content */}
                <div className={styles.nodeContent}>
                  {isComment ? (
                    /* ── Comment card ── */
                    <div className={`${styles.commentCard} ${isBeingDeleted ? styles.commentDeleting : ''}`}>
                      <div className={styles.commentCardHeader}>
                        <span className={styles.commentAuthor}>{actor}</span>
                        <span className={styles.timestamp}>{relativeTime(entry.data.created_at)}</span>
                        {isOwnComment && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(entry.data.id)}
                            disabled={isBeingDeleted}
                            title="Delete comment"
                          >
                            {isBeingDeleted ? (
                              <span className={styles.deletingSpinner} />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <line x1="2" y1="2" x2="10" y2="10" />
                                <line x1="10" y1="2" x2="2" y2="10" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      <div className={styles.commentCardBody}>
                        <span className={isExpanded || !isLong ? styles.commentFull : styles.commentClamped}>
                          {commentText}
                        </span>
                        {isLong && (
                          <button
                            className={styles.showMore}
                            onClick={() =>
                              setExpanded(prev => {
                                const next = new Set(prev)
                                if (next.has(entry.data.id)) next.delete(entry.data.id)
                                else next.add(entry.data.id)
                                return next
                              })
                            }
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* ── Activity row ── */
                    <div className={styles.nodeRow}>
                      <span className={styles.eventText}>
                        <span className={styles.actor}>{actor}</span>
                        {' '}
                        {formatActivity(entry.data as PlaneActivity).map((seg: ActivitySegment, i: number) =>
                          seg.bold
                            ? <strong key={i} className={styles.activityValue}>{seg.text}</strong>
                            : <span key={i}>{seg.text}</span>
                        )}
                      </span>
                      <span className={styles.timestamp}>{relativeTime(entry.data.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Comment input */}
      <div className={styles.commentInput}>
        <textarea
          className={styles.commentTextarea}
          placeholder="Add a comment..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
          rows={3}
          disabled={submitting}
        />
        {submitError && <span className={styles.submitError}>{submitError}</span>}
        <div className={styles.commentActions}>
          <span className={styles.commentHint}>⌘↵ to submit</span>
          <button
            className={styles.commentBtn}
            onClick={handleSubmit}
            disabled={submitting || !comment.trim()}
          >
            {submitting ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}
