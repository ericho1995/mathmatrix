'use client'

import { useEffect, useRef } from 'react'

/**
 * Scrolls the child marked aria-current="page" into view inside a sideways-
 * scrolling row.
 *
 * On a phone the year-level chips overflow to the right, so someone arriving
 * from a "Year 9 papers" link could not see which year was selected — the
 * active chip was off-screen. Horizontal only: `block: 'nearest'` stops the
 * page itself from jumping.
 */
export default function ScrollActiveIntoView({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const active = ref.current?.querySelector('[aria-current="page"]')
    active?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  )
}
