import { useRef } from 'react'
import type React from 'react'

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0)
    scrollLeft.current = ref.current?.scrollLeft ?? 0
    if (ref.current) ref.current.style.cursor = 'grabbing'
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const diff = x - startX.current
    if (Math.abs(diff) > 4) hasDragged.current = true
    ref.current.scrollLeft = scrollLeft.current - diff
  }

  function onMouseUp() {
    isDragging.current = false
    if (ref.current) ref.current.style.cursor = 'grab'
  }

  function onClickCapture(e: React.MouseEvent) {
    if (hasDragged.current) {
      e.stopPropagation()
      hasDragged.current = false
    }
  }

  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onClickCapture,
    },
  }
}
