import styles from './Tag.module.css'

export interface TagProps {
  label: string
  color?: string
  onRemove: () => void
}

export function Tag({ label, color, onRemove }: TagProps) {
  return (
    <span
      className={styles.tag}
      style={color ? { background: color + '22', borderColor: color + '55', color } : {}}
    >
      {color && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      )}
      {label}
      <button className={styles.tagRemove} onClick={onRemove} aria-label="Remove">×</button>
    </span>
  )
}
