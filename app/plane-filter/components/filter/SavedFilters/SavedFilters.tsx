'use client'

import { useState, useEffect } from 'react'
import type { SavedFilter, SavedFiltersProps, SaveFormProps, PresetItemProps } from './SavedFilters.types'
import {
  readStorage,
  writeStorage,
  hasActiveFilter,
  findActivePresetId,
  appendFilter,
  removeFilter,
  renameFilter,
  buildNewFilter,
} from './SavedFilters.utils'
import styles from './SavedFilters.module.css'

// ─── Sub-components ──────────────────────────────────────

function SaveForm({ name, onChange, onConfirm, onCancel }: SaveFormProps) {
  return (
    <div className={styles.saveForm}>
      <input
        className={styles.nameInput}
        value={name}
        onChange={e => onChange(e.target.value)}
        placeholder="Preset name…"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter')  onConfirm()
          if (e.key === 'Escape') onCancel()
        }}
      />
      <button
        className={styles.confirmBtn}
        onClick={onConfirm}
        disabled={!name.trim()}
        title="Save"
      >
        ✓
      </button>
      <button className={styles.cancelBtn} onClick={onCancel} title="Cancel">
        ✕
      </button>
    </div>
  )
}

function PresetItem({
  filter,
  isActive,
  isEditing,
  editName,
  onEditNameChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onLoad,
  onDelete,
}: PresetItemProps) {
  return (
    <li className={`${styles.item} ${isActive ? styles.itemActive : ''}`}>
      {isEditing ? (
        <input
          className={styles.editInput}
          value={editName}
          onChange={e => onEditNameChange(e.target.value)}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter')  onCommitRename()
            if (e.key === 'Escape') onCancelRename()
          }}
          onBlur={onCommitRename}
        />
      ) : (
        <span
          className={styles.itemName}
          onDoubleClick={onStartRename}
          title="Double-click to rename"
        >
          {filter.name}
        </span>
      )}

      <div className={styles.itemActions}>
        <button className={styles.loadBtn} onClick={onLoad}>Load</button>
        <button className={styles.deleteBtn} onClick={onDelete} title="Delete">✕</button>
      </div>
    </li>
  )
}

// ─── Main component ──────────────────────────────────────

export function SavedFilters({ include, exclude, selectedProject, onLoad }: SavedFiltersProps) {
  const [saved, setSaved]         = useState<SavedFilter[]>([])
  const [saving, setSaving]       = useState(false)
  const [saveName, setSaveName]   = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName]   = useState('')

  useEffect(() => {
    setSaved(readStorage())
  }, [])

  const projectFilters  = saved.filter(f => f.projectId === selectedProject)
  const activePresetId  = findActivePresetId(projectFilters, include, exclude)
  const showSaveButton  = hasActiveFilter(include, exclude) && !saving

  function persist(updated: SavedFilter[]) {
    setSaved(updated)
    writeStorage(updated)
  }

  function handleSave() {
    const trimmed = saveName.trim()
    if (!trimmed) return
    persist(appendFilter(saved, buildNewFilter(trimmed, selectedProject, include, exclude)))
    setSaveName('')
    setSaving(false)
  }

  function handleCancelSave() {
    setSaving(false)
    setSaveName('')
  }

  function handleDelete(id: string) {
    persist(removeFilter(saved, id))
  }

  function handleStartRename(f: SavedFilter) {
    setEditingId(f.id)
    setEditName(f.name)
  }

  function handleCommitRename(id: string) {
    const trimmed = editName.trim()
    if (trimmed) persist(renameFilter(saved, id, trimmed))
    setEditingId(null)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          <span className={styles.dot} />
          SAVED FILTERS
        </span>
      </div>

      {showSaveButton && (
        <button className={styles.saveBtn} onClick={() => setSaving(true)}>
          + Save current filter
        </button>
      )}

      {saving && (
        <SaveForm
          name={saveName}
          onChange={setSaveName}
          onConfirm={handleSave}
          onCancel={handleCancelSave}
        />
      )}

      {projectFilters.length === 0 ? (
        <span className={styles.empty}>No saved filters yet</span>
      ) : (
        <ul className={styles.list}>
          {projectFilters.map(f => (
            <PresetItem
              key={f.id}
              filter={f}
              isActive={f.id === activePresetId}
              isEditing={editingId === f.id}
              editName={editName}
              onEditNameChange={setEditName}
              onStartRename={() => handleStartRename(f)}
              onCommitRename={() => handleCommitRename(f.id)}
              onCancelRename={() => setEditingId(null)}
              onLoad={() => onLoad(f.include, f.exclude)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
