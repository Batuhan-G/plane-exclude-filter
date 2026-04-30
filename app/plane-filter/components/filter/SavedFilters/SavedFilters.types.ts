import type { FilterSet } from '@/lib/types'

export interface SavedFilter {
  id: string
  name: string
  projectId: string
  include: FilterSet
  exclude: FilterSet
  createdAt: string
}

export interface SavedFiltersProps {
  include: FilterSet
  exclude: FilterSet
  selectedProject: string
  onLoad: (include: FilterSet, exclude: FilterSet) => void
}

export interface SaveFormProps {
  name: string
  onChange: (name: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export interface PresetItemProps {
  filter: SavedFilter
  isActive: boolean
  isEditing: boolean
  editName: string
  onEditNameChange: (name: string) => void
  onStartRename: () => void
  onCommitRename: () => void
  onCancelRename: () => void
  onLoad: () => void
  onDelete: () => void
}
