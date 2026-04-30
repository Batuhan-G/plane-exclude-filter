import { FilterInput } from '../FilterInput/FilterInput'
import { Avatar } from '../../ui/Avatar/Avatar'
import { EMPTY_FILTER, PRIORITY_ITEMS } from '@/lib/constants'
import type { PlaneLabel, PlaneMember, PlanePriority, PlaneState } from '@/lib/types'
import styles from './FilterPanel.module.css'
import type { FilterPanelProps, PanelVariant } from './FilterPanel.types'

const PANEL_LABELS: Record<PanelVariant, string> = {
  include: 'INCLUDE FILTERS',
  exclude: 'EXCLUDE FILTERS',
}

export function FilterPanel({ variant, members, labels, states, filter, onChange, onClear }: FilterPanelProps) {
  const hasFilters =
    filter.assignees.length > 0 || filter.labels.length > 0 || filter.states.length > 0 ||
    filter.priorities.length > 0 || (filter.createdBy ?? []).length > 0

  const memberRenderer = (item: PlaneMember) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar name={item.name} size={20} />
      <span>{item.name}</span>
    </div>
  )

  const priorityRenderer = (item: PlanePriority) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
      <span>{item.name}</span>
    </div>
  )

  const coloredRenderer = (item: PlaneLabel | PlaneState) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
      <span>{item.name}</span>
    </div>
  )

  return (
    <div className={`${styles.panel} ${variant === 'include' ? styles.panelInclude : styles.panelExclude}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          <span className={`${styles.panelTitleDot} ${variant === 'include' ? styles.panelTitleDotInclude : styles.panelTitleDotExclude}`} />
          {PANEL_LABELS[variant]}
        </span>
        {hasFilters && (
          <button className={styles.clearBtn} onClick={onClear}>Clear</button>
        )}
      </div>

      <FilterInput
        label="Assignee"
        items={members}
        selected={filter.assignees}
        onAdd={item => onChange(prev => ({ ...prev, assignees: [...prev.assignees, item] }))}
        onRemove={id => onChange(prev => ({ ...prev, assignees: prev.assignees.filter(a => a.id !== id) }))}
        renderItem={memberRenderer}
      />
      <FilterInput
        label="Label"
        items={labels}
        selected={filter.labels}
        onAdd={item => onChange(prev => ({ ...prev, labels: [...prev.labels, item] }))}
        onRemove={id => onChange(prev => ({ ...prev, labels: prev.labels.filter(l => l.id !== id) }))}
        renderItem={coloredRenderer}
      />
      <FilterInput
        label="State"
        items={states}
        selected={filter.states}
        onAdd={item => onChange(prev => ({ ...prev, states: [...prev.states, item] }))}
        onRemove={id => onChange(prev => ({ ...prev, states: prev.states.filter(s => s.id !== id) }))}
        renderItem={coloredRenderer}
      />
      <FilterInput
        label="Priority"
        items={PRIORITY_ITEMS}
        selected={filter.priorities}
        onAdd={item => onChange(prev => ({ ...prev, priorities: [...prev.priorities, item] }))}
        onRemove={id => onChange(prev => ({ ...prev, priorities: prev.priorities.filter(p => p.id !== id) }))}
        renderItem={priorityRenderer}
      />
      <FilterInput
        label="Created By"
        items={members}
        selected={filter.createdBy ?? []}
        onAdd={item => onChange(prev => ({ ...prev, createdBy: [...(prev.createdBy ?? []), item] }))}
        onRemove={id => onChange(prev => ({ ...prev, createdBy: (prev.createdBy ?? []).filter(m => m.id !== id) }))}
        renderItem={memberRenderer}
      />
    </div>
  )
}

export { EMPTY_FILTER }
