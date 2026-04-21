import styles from './Spinner.module.css'

export type SpinnerVariant = 'light' | 'dark'

export interface SpinnerProps {
  variant?: SpinnerVariant
}

export function Spinner({ variant = 'light' }: SpinnerProps) {
  return <span className={variant === 'dark' ? styles.spinnerDark : styles.spinner} />
}
