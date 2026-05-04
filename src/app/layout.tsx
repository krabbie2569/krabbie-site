import type { Metadata } from 'next'
import { Syne, Sarabun, Space_Mono } from 'next/font/google'
import './globals.css'
import DevSwitcher from '@/components/DevSwitcher'

const syne = Syne({
  subsets:  ['latin'],
  weight:   ['700', '800'],
  variable: '--font-syne',
  display:  'swap',
})

const sarabun = Sarabun({
  subsets:  ['thai', 'latin'],
  weight:   ['300', '400', '600', '700'],
  variable: '--font-sarabun',
  display:  'swap',
})

const spaceMono = Space_Mono({
  subsets:  ['latin'],
  weight:   ['400', '700'],
  variable: '--font-mono',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Krabbie.com — เว็บสำเร็จรูปให้เช่า',
    template: '%s | Krabbie.com',
  },
  description: 'เว็บสำเร็จรูปให้เช่า สมัครปุ๊บได้เว็บทันที ไม่ต้องรู้โค้ด เริ่มต้น 150 บาท/เดือน',
  keywords:    ['เว็บสำเร็จรูป', 'เว็บจองออนไลน์', 'ระบบจองบริการ', 'krabbie'],
  openGraph: {
    title:       'Krabbie.com — เว็บสำเร็จรูปให้เช่า',
    description: '"เว็บง่ายๆ แค่หนีบเดียว" 🦀',
    siteName:    'Krabbie.com',
    locale:      'th_TH',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${syne.variable} ${sarabun.variable} ${spaceMono.variable}`}>
      <body>
        {children}
        <DevSwitcher />
      </body>
    </html>
  )
}
