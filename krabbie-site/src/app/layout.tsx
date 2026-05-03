import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Krabbie.com — เว็บสำเร็จรูปให้เช่า',
    template: '%s | Krabbie.com',
  },
  description: 'เว็บสำเร็จรูปให้เช่า สมัครปุ๊บได้เว็บทันที ไม่ต้องรู้โค้ด เริ่มต้น 150 บาท/เดือน',
  keywords: ['เว็บสำเร็จรูป', 'เว็บจองออนไลน์', 'ระบบจองบริการ', 'krabbie'],
  openGraph: {
    title: 'Krabbie.com — เว็บสำเร็จรูปให้เช่า',
    description: '"เว็บง่ายๆ แค่หนีบเดียว" 🦀',
    siteName: 'Krabbie.com',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
