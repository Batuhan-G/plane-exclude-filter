export interface FilterInputProps<T extends { id: string; name: string; color?: string }> {
  label: string
  items: T[]
  selected: T[]
  onAdd: (item: T) => void
  onRemove: (id: string) => void
  renderItem?: (item: T) => React.ReactNode
}
