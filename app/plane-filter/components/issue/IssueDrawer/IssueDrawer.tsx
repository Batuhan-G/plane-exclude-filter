'use client'

import { useEffect } from 'react'
import { Avatar } from '../../ui/Avatar/Avatar'
import { IssueTimeline } from '../IssueTimeline'
import { PRIORITY_CONFIG, PRIORITY_ITEMS } from '@/lib/constants'
import { useIssueEditor } from '@/hooks/useIssueEditor'
import { useIssueAttachments } from '@/hooks/useIssueAttachments'
import { getFileIcon, formatSize, sanitizeDescHtml } from './IssueDrawer.utils'
import styles from './IssueDrawer.module.css'
import type { IssueDrawerProps } from './IssueDrawer.types'

const APP_URL = process.env.NEXT_PUBLIC_PLANE_APP_URL
const WORKSPACE = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG

export function IssueDrawer({ issue, states, labels, members, onClose, onIssueUpdate }: IssueDrawerProps) {
  const editor = useIssueEditor({ issue, onIssueUpdate, onClose })
  const { attachments, loading: loadingAttachments } = useIssueAttachments(issue)

  useEffect(() => {
    if (!issue) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [issue])

  if (!editor.localIssue) return null

  const {
    localIssue,
    editing, setEditing,
    fieldLoading, fieldError,
    fieldRefs, patchField,
    editingTitle, setEditingTitle, savingTitle, titleError, titleEditRef, saveTitle,
    editingDesc, setEditingDesc, savingDesc, descError, descEditRef, saveDesc,
  } = editor

  const p = PRIORITY_CONFIG[localIssue.priority] ?? PRIORITY_CONFIG.none
  const stateObj = states.find(s => s.id === localIssue.state)
  const issueUrl = APP_URL && WORKSPACE
    ? `${APP_URL}/${WORKSPACE}/projects/${localIssue.project}/issues/${localIssue.id}/`
    : null
  const descHtml = sanitizeDescHtml(localIssue.description_html ?? '', issueUrl)

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerIssueId}>#{localIssue.sequence_id}</span>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {editingTitle ? (
          <div className={styles.titleWrap}>
            <h2
              ref={titleEditRef}
              className={`${styles.drawerTitle} ${styles.titleEditor}`}
              contentEditable
              suppressContentEditableWarning
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveTitle() } }}
            />
            {titleError && <span className={styles.fieldError}>{titleError}</span>}
            <div className={styles.titleActions}>
              <button className={styles.btnSave} onClick={saveTitle} disabled={savingTitle}>
                {savingTitle ? <><span className={styles.fieldSpinner} /> Saving…</> : 'Save'}
              </button>
              <button className={styles.btnCancel} onClick={() => { setEditingTitle(false) }} disabled={savingTitle}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h2 className={`${styles.drawerTitle} ${styles.titleClickable}`} onClick={() => setEditingTitle(true)}>
            {localIssue.name}
          </h2>
        )}

        {/* Editable properties */}
        <div className={styles.editableSection}>

          {/* Priority */}
          <div className={styles.editableRow}>
            <span className={styles.editableLabel}>PRIORITY</span>
            <div className={styles.editableFieldWrap} ref={fieldRefs.priority}>
              <button
                className={`${styles.editableValue} ${fieldLoading === 'priority' ? styles.fieldSaving : ''}`}
                onClick={() => setEditing(editing === 'priority' ? null : 'priority')}
                disabled={fieldLoading === 'priority'}
              >
                <span
                  className={styles.drawerPriority}
                  style={{ background: p.color + '22', borderColor: p.color + '55', color: p.color }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  {p.label}
                </span>
                {fieldLoading === 'priority' && <span className={styles.fieldSpinner} />}
              </button>
              {editing === 'priority' && (
                <div className={styles.fieldDropdown}>
                  {PRIORITY_ITEMS.map(pri => (
                    <button
                      key={pri.id}
                      className={`${styles.dropdownItem} ${localIssue.priority === pri.id ? styles.dropdownItemActive : ''}`}
                      onClick={() => patchField('priority', pri.id)}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: pri.color, display: 'inline-block', flexShrink: 0 }} />
                      {pri.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* State */}
          <div className={styles.editableRow}>
            <span className={styles.editableLabel}>STATE</span>
            <div className={styles.editableFieldWrap} ref={fieldRefs.state}>
              <button
                className={`${styles.editableValue} ${fieldLoading === 'state' ? styles.fieldSaving : ''}`}
                onClick={() => setEditing(editing === 'state' ? null : 'state')}
                disabled={fieldLoading === 'state'}
              >
                {stateObj
                  ? <span className={styles.stateBadge} style={{ borderColor: stateObj.color + '55', color: stateObj.color }}>{stateObj.name}</span>
                  : <span className={styles.stateBadge}>—</span>
                }
                {fieldLoading === 'state' && <span className={styles.fieldSpinner} />}
              </button>
              {editing === 'state' && (
                <div className={styles.fieldDropdown}>
                  {states.map(s => (
                    <button
                      key={s.id}
                      className={`${styles.dropdownItem} ${localIssue.state === s.id ? styles.dropdownItemActive : ''}`}
                      onClick={() => patchField('state', s.id)}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div className={styles.editableRow}>
            <span className={styles.editableLabel}>ASSIGNEES</span>
            <div className={styles.editableFieldWrap} ref={fieldRefs.assignees}>
              <button
                className={`${styles.editableValue} ${fieldLoading === 'assignees' ? styles.fieldSaving : ''}`}
                onClick={() => setEditing(editing === 'assignees' ? null : 'assignees')}
                disabled={fieldLoading === 'assignees'}
              >
                <span className={styles.assigneeValueDisplay}>
                  {localIssue.assignees.length === 0
                    ? <span className={styles.unassigned}>Unassigned</span>
                    : localIssue.assignees.map(aid => {
                        const m = members.find(m => m.id === aid)
                        if (!m) return null
                        return (
                          <span key={aid} className={styles.assigneeChip}>
                            <Avatar name={m.name} size={18} />
                            <span>{m.name}</span>
                          </span>
                        )
                      })
                  }
                </span>
                {fieldLoading === 'assignees' && <span className={styles.fieldSpinner} />}
              </button>
              {editing === 'assignees' && (
                <div className={styles.fieldDropdown}>
                  {members.map(m => {
                    const isAssigned = localIssue.assignees.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        className={`${styles.dropdownItem} ${isAssigned ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          const next = isAssigned
                            ? localIssue.assignees.filter(id => id !== m.id)
                            : [...localIssue.assignees, m.id]
                          patchField('assignees', next)
                        }}
                        disabled={fieldLoading === 'assignees'}
                      >
                        <Avatar name={m.name} size={16} />
                        {m.name}
                        {isAssigned && <span className={styles.checkmark}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          {localIssue.created_by && (() => {
            const creator = members.find(m => m.id === localIssue.created_by)
            return creator ? (
              <div className={styles.editableRow}>
                <span className={styles.editableLabel}>CREATED BY</span>
                <div className={styles.editableFieldWrap}>
                  <span className={styles.editableValue} style={{ cursor: 'default' }}>
                    <span className={styles.assigneeChip}>
                      <Avatar name={creator.name} size={18} />
                      <span>{creator.name}</span>
                    </span>
                  </span>
                </div>
              </div>
            ) : null
          })()}

          {fieldError && <span className={styles.fieldError}>{fieldError}</span>}
        </div>

        {localIssue.labels.length > 0 && (
          <div className={styles.labelsWrap} ref={fieldRefs.labels}>
            <div
              className={styles.drawerMeta}
              onClick={() => setEditing(editing === 'labels' ? null : 'labels')}
              style={{ cursor: 'pointer' }}
            >
              {localIssue.labels.map(lid => {
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
              {fieldLoading === 'labels' && <span className={styles.fieldSpinner} />}
            </div>
            {editing === 'labels' && (
              <div className={styles.fieldDropdown}>
                {labels.map(l => {
                  const isSelected = localIssue.labels.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ''}`}
                      onClick={() => {
                        const next = isSelected
                          ? localIssue.labels.filter(id => id !== l.id)
                          : [...localIssue.labels, l.id]
                        patchField('labels', next)
                      }}
                      disabled={fieldLoading === 'labels'}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
                      {l.name}
                      {isSelected && <span className={styles.checkmark}>✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.drawerDescWrap}>
          <div className={styles.descHeader}>
            <span className={styles.drawerMetaLabel}>DESCRIPTION</span>
            {editingDesc && (
              <div className={styles.descActions}>
                <button className={styles.btnSave} onClick={saveDesc} disabled={savingDesc}>
                  {savingDesc ? <><span className={styles.fieldSpinner} /> Saving…</> : 'Save'}
                </button>
                <button
                  className={styles.btnCancel}
                  onClick={() => setEditingDesc(false)}
                  disabled={savingDesc}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {descError && <span className={styles.fieldError}>{descError}</span>}

          {editingDesc ? (
            <div
              ref={descEditRef}
              className={styles.descEditor}
              contentEditable
              suppressContentEditableWarning
            />
          ) : descHtml && descHtml !== '<p></p>' ? (
            <div
              className={`${styles.drawerDescription} ${styles.descClickable}`}
              dangerouslySetInnerHTML={{ __html: descHtml }}
              onClick={() => setEditingDesc(true)}
            />
          ) : (
            <div className={`${styles.drawerNoDesc} ${styles.descClickable}`} onClick={() => setEditingDesc(true)}>
              No description
            </div>
          )}
        </div>

        <IssueTimeline issue={localIssue} members={members} />

        {(loadingAttachments || attachments.length > 0) && (
          <div className={styles.drawerAttachSection}>
            <span className={styles.drawerMetaLabel}>ATTACHMENTS</span>
            {loadingAttachments ? (
              <span className={styles.attachLoading}>Loading…</span>
            ) : (
              <div className={styles.attachList}>
                {attachments.map(att => {
                  const isImage = att.attributes.type.startsWith('image/')
                  const proxyUrl = `/api/plane?action=asset&url=${encodeURIComponent(att.asset)}`
                  return (
                    <div key={att.id} className={styles.attachItem}>
                      {isImage ? (
                        <a href={proxyUrl} target="_blank" rel="noreferrer" className={styles.attachImageWrap}>
                          <img src={proxyUrl} alt={att.attributes.name} className={styles.attachImage} />
                          <span className={styles.attachImageName}>{att.attributes.name}</span>
                        </a>
                      ) : (
                        <a
                          href={`${proxyUrl}&name=${encodeURIComponent(att.attributes.name)}`}
                          download={att.attributes.name}
                          className={styles.attachFile}
                        >
                          <span className={styles.attachFileIcon}>{getFileIcon(att.attributes.type)}</span>
                          <span className={styles.attachFileName}>{att.attributes.name}</span>
                          <span className={styles.attachFileSize}>{formatSize(att.attributes.size)}</span>
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
