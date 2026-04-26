import styles from './ActivityFilterPanel.module.css'
import type { ActivityFilterPanelProps } from './ActivityFilterPanel.types'

export function ActivityFilterPanel({ filter, newCount, updatedCount, onChange }: ActivityFilterPanelProps) {
  const disabled = !filter.enabled

  return (
    <div className={`${styles.panel} ${styles.panelActivity}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          <span className={styles.panelTitleDot} />
          ACTIVITY
        </span>
        <button
          className={`${styles.toggle} ${filter.enabled ? styles.toggleOn : styles.toggleOff}`}
          onClick={() => onChange({ ...filter, enabled: !filter.enabled })}
          aria-label={filter.enabled ? 'Disable' : 'Enable'}
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
          <span>Last 24h — New ({newCount})</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filter.showUpdatedOnly}
            disabled={disabled}
            onChange={e => onChange({ ...filter, showUpdatedOnly: e.target.checked })}
          />
          <span>Last 24h — Updated ({updatedCount})</span>
        </label>
      </div>
    </div>
  )
}
