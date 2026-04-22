import styles from './Spinner.module.css'
import type { SpinnerProps } from './Spinner.types'

export function Spinner({ variant = 'light' }: SpinnerProps) {
  return <span className={variant === 'dark' ? styles.spinnerDark : styles.spinner} />
}
