import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider, themeInitScript } from "@/components/theme-provider"
import { TopBar } from "@/components/top-bar"

import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Mini CRM de Leads — Impulsell",
  description:
    "Aplicação para visualizar, buscar, filtrar e registrar contato em leads de campanha.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0a1e" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-flash: aplica o tema antes do React hidratar */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground min-h-full">
        <ThemeProvider>
          <TopBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}