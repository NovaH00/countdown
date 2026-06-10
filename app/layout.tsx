import type { Metadata } from "next"
import { plusJakartaSans, jetbrainsMono } from "./fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Countdown THPT Quốc Gia",
    default: "Countdown THPT Quốc Gia",
  },
  description: "Đếm ngược đến kỳ thi THPT Quốc Gia",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
