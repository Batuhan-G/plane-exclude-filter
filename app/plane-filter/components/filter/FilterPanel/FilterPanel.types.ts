import type { FilterSet, PlaneLabel, PlaneMember, PlaneState } from '@/lib/types'

export type PanelVariant = 'include' | 'exclude'

export interface FilterPanelProps {
  variant: PanelVariant
  members: PlaneMember[]
  labels: PlaneLabel[]
  states: PlaneState[]
  filter: FilterSet
  onChange: React.Dispatch<React.SetStateAction<FilterSet>>
  onClear: () => void
}
