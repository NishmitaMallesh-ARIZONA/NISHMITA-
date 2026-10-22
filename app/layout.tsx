import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'CampusCircle',
  description: 'One platform where college life connects',
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  appleWebApp: { capable: true, title: 'CampusCircle', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#312e81',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 pb-20 text-white">
        {children}
        <Nav />
      </body>
    </html>
  )
}