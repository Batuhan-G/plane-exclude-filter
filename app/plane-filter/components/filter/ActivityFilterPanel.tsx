import type { ActivityFilter } from '@/lib/types'
import styles from './ActivityFilterPanel.module.css'

export interface ActivityFilterPanelProps {
  filter: ActivityFilter
  newCount: number
  updatedCount: number
  onChange: (filter: ActivityFilter) => void
}

export function ActivityFilterPanel({ filter, newCount, updatedCount, onChange }: ActivityFilterPanelProps) {
  const disabled = !filter.enabled

  return (
    <div className={`${styles.panel} ${styles.panelActivity}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          <span className={styles.panelTitleDot} />
          AKTİVİTE
        </span>
        <button
          className={`${styles.toggle} ${filter.enabled ? styles.toggleOn : styles.toggleOff}`}
          onClick={() => onChange({ ...filter, enabled: !filter.enabled })}
          aria-label={filter.enabled ? 'Devre dışı bırak' : 'Etkinleştir'}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>

      <div className={disabled ? styles.bodyDisabled : styles.body}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filter.showNewOnly}
            disabled={disabled}
            onChange={e => onChange({ ...filter, showNewOnly: e.target.checked })}
          />
          <span>Son 24 saat — Yeni ({newCount})</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filter.showUpdatedOnly}
            disabled={disabled}
            onChange={e => onChange({ ...filter, showUpdatedOnly: e.target.checked })}
          />
          <span>Son 24 saat — Güncellendi ({updatedCount})</span>
        </label>
      </div>
    </div>
  )
}
