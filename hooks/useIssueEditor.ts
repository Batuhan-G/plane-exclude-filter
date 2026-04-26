import { useEffect, useRef, useState } from 'react'
import type { Priority, RawIssue } from '@/lib/types'

export type EditingField = 'state' | 'priority' | 'assignees' | 'labels' | null

interface Options {
  issue: RawIssue | null
  onIssueUpdate: (updated: RawIssue) => void
  onClose: () => void
}

export function useIssueEditor({ issue, onIssueUpdate, onClose }: Options) {
  const [localIssue, setLocalIssue] = useState<RawIssue | null>(issue)

  const [editing, setEditing] = useState<EditingField>(null)
  const [fieldLoading, setFieldLoading] = useState<EditingField>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const [editingTitle, setEditingTitle] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const titleEditRef = useRef<HTMLHeadingElement>(null)

  const [editingDesc, setEditingDesc] = useState(false)
  const [savingDesc, setSavingDesc] = useState(false)
  const [descError, setDescError] = useState<string | null>(null)
  const descEditRef = useRef<HTMLDivElement>(null)

  const fieldRefs = {
    state: useRef<HTMLDivElement>(null),
    priority: useRef<HTMLDivElement>(null),
    assignees: useRef<HTMLDivElement>(null),
    labels: useRef<HTMLDivElement>(null),
  }

  useEffect(() => {
    setLocalIssue(issue)
    setEditing(null)
    setFieldError(null)
    setEditingTitle(false)
    setTitleError(null)
    setEditingDesc(false)
    setDescError(null)
  }, [issue?.id])

  useEffect(() => {
    if (!editingTitle || !titleEditRef.current || !localIssue) return
    titleEditRef.current.innerText = localIssue.name
    titleEditRef.current.focus()
    const range = document.createRange()
    range.selectNodeContents(titleEditRef.current)
    range.collapse(false)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  }, [editingTitle])

  useEffect(() => {
    if (!editingDesc || !descEditRef.current || !localIssue) return
    descEditRef.current.innerHTML = localIssue.description_html ?? ''
    descEditRef.current.focus()
    const range = document.createRange()
    range.selectNodeContents(descEditRef.current)
    range.collapse(false)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  }, [editingDesc])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (editingTitle) { setEditingTitle(false); setTitleError(null) }
      else if (editing) { setEditing(null); setFieldError(null) }
      else if (editingDesc) { setEditingDesc(false); setDescError(null) }
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, editing, editingTitle, editingDesc])

  useEffect(() => {
    if (!editing) return
    function handle(e: MouseEvent) {
      const ref = fieldRefs[editing!]
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setEditing(null)
        setFieldError(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [editing])

  async function patchField(
    field: 'state' | 'priority' | 'assignees' | 'labels',
    value: unknown,
  ) {
    if (!localIssue) return
    const prev = localIssue
    const optimistic: RawIssue = { ...localIssue, [field]: value }
    setLocalIssue(optimistic)
    if (field !== 'assignees' && field !== 'labels') setEditing(null)
    setFieldLoading(field)
    setFieldError(null)

    try {
      const res = await fetch(
        `/api/plane?action=updateIssue&project=${localIssue.project}&issue=${localIssue.id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) },
      )
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json() as Record<string, unknown>
      const merged: RawIssue = {
        ...optimistic,
        state: (data.state as string) ?? optimistic.state,
        priority: (data.priority as Priority) ?? optimistic.priority,
        assignees: (data.assignees as string[]) ?? optimistic.assignees,
        labels: Array.isArray(data.labels)
          ? (data.labels as Array<string | { id: string }>).map(l => typeof l === 'string' ? l : l.id)
          : optimistic.labels,
      }
      setLocalIssue(merged)
      onIssueUpdate(merged)
    } catch {
      setLocalIssue(prev)
      setFieldError(`Failed to update ${field}`)
    } finally {
      setFieldLoading(null)
    }
  }

  async function saveTitle() {
    if (!localIssue || !titleEditRef.current) return
    const name = titleEditRef.current.innerText.trim()
    if (!name) return
    const prev = localIssue
    setSavingTitle(true)
    setTitleError(null)
    try {
      const res = await fetch(
        `/api/plane?action=updateIssue&project=${localIssue.project}&issue=${localIssue.id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) },
      )
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json() as Record<string, unknown>
      const merged: RawIssue = { ...localIssue, name: (data.name as string) ?? name }
      setLocalIssue(merged)
      onIssueUpdate(merged)
      setEditingTitle(false)
    } catch {
      setLocalIssue(prev)
      setTitleError('Failed to save title')
    } finally {
      setSavingTitle(false)
    }
  }

  async function saveDesc() {
    if (!localIssue || !descEditRef.current) return
    const html = descEditRef.current.innerHTML
    const prev = localIssue
    setSavingDesc(true)
    setDescError(null)
    try {
      const res = await fetch(
        `/api/plane?action=updateIssue&project=${localIssue.project}&issue=${localIssue.id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description_html: html }) },
      )
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json() as Record<string, unknown>
      const merged: RawIssue = {
        ...localIssue,
        description_html: (data.description_html as string) ?? html,
      }
      setLocalIssue(merged)
      onIssueUpdate(merged)
      setEditingDesc(false)
    } catch {
      setLocalIssue(prev)
      setDescError('Failed to save description')
    } finally {
      setSavingDesc(false)
    }
  }

  return {
    localIssue,
    editing, setEditing,
    fieldLoading, fieldError,
    fieldRefs,
    patchField,
    editingTitle, setEditingTitle,
    savingTitle, titleError,
    titleEditRef,
    saveTitle,
    editingDesc, setEditingDesc,
    savingDesc, descError,
    descEditRef,
    saveDesc,
  }
}
