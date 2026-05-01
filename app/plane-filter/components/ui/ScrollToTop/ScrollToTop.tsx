'use client'

import { useEffect, useState, type RefObject } from 'react'
import styles from './ScrollToTop.module.css'

interface ScrollToTopProps {
  containerRef: RefObject<HTMLDivElement | null>
}

export function ScrollToTop({ containerRef }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onScroll() {
      setVisible(el!.scrollTop > 300)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [containerRef])

  function scrollToTop() {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button className={styles.btn} onClick={scrollToTop} aria-label="Scroll to top">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="13" x2="8" y2="3" />
        <polyline points="4,7 8,3 12,7" />
      </svg>
    </button>
  )
}
