import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppThemeProvider } from '@/providers/theme'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AppCEP',
  description: 'Consulta e salva endereços com base no CEP usando ViaCEP.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-[family-name:var(--font-inter)]">
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  )
}
