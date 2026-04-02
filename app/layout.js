import './globals.css'

export const metadata = {
  title: 'Business Card Scanner',
  description: 'Scan business cards with AI-powered OCR and export to Excel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
