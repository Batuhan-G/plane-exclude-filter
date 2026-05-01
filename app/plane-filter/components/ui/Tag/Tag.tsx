import styles from './Tag.module.css'
import type { TagProps } from './Tag.types'

export function Tag({ label, color, onRemove }: TagProps) {
  return (
    <span
      className={styles.tag}
      style={color ? { background: color + '22', borderColor: color + '55', color } : {}}
    >
      {color && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      )}
      <span className={styles.tagLabel}>{label}</span>
      <button className={styles.tagRemove} onClick={onRemove} aria-label="Remove">×</button>
    </span>
  )
}
