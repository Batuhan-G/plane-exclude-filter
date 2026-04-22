'use client'

import { useEffect, useRef, useState } from 'react'
import { Tag } from '../../ui/Tag/Tag'
import styles from './FilterInput.module.css'
import type { FilterInputProps } from './FilterInput.types'

export function FilterInput<T extends { id: string; name: string; color?: string }>({
  label,
  items,
  selected,
  onAdd,
  onRemove,
  renderItem,
}: FilterInputProps<T>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filteredItems = items.filter(
    i => i.name.toLowerCase().includes(query.toLowerCase()) && !selected.find(s => s.id === i.id),
  )

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.filterRow}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.filterRight} ref={wrapRef}>
        <div
          className={styles.tagInput}
          onClick={() => { setOpen(true); inputRef.current?.focus() }}
        >
          {selected.map(s => (
            <Tag key={s.id} label={s.name} color={s.color} onRemove={() => onRemove(s.id)} />
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? 'Select...' : ''}
            className={styles.tagInputField}
          />
        </div>
        {open && filteredItems.length > 0 && (
          <div className={styles.dropdown}>
            {filteredItems.map(item => (
              <button
                key={item.id}
                className={styles.dropdownItem}
                onMouseDown={e => { e.preventDefault(); onAdd(item); setQuery('') }}
              >
                {renderItem ? renderItem(item) : item.name}
              </button>
            ))}
          </div>
        )}
        {open && filteredItems.length === 0 && query && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownEmpty}>No results</div>
          </div>
        )}
      </div>
    </div>
  )
}
