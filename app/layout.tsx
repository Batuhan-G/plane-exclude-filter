import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plane Exclude Filter',
  description: 'Plane task görünümü — exclude filter desteğiyle',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
