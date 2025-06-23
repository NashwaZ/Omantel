import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ApiInitializer from "@/components/api-initializer"
import ApiStorageManager from "@/components/api-storage-manager"
import ApiDebugPanel from "@/components/api-debug-panel"
import Header from "@/components/header"

// import { Inter, Albert_Sans } from "next/font/google"

// // Use Inter font from Google Fonts as primary font
// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-inter",
// })

// // Use Albert Sans as secondary font
// const albertSans = Albert_Sans({
//   subsets: ["latin"],
//   display: "swap",
//   weight: ["400", "500", "600", "700", "800"],
//   variable: "--font-albert-sans",
// })

export const metadata = {
  title: "Visa Application Service",
  description: "Apply for visas online with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ea6e00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`font-normal text-base leading-normal text-foreground bg-background overflow-x-hidden `}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ApiInitializer />
          <Header />
          <main className="min-h-screen">{children}</main>
          <ApiStorageManager />
          <ApiDebugPanel />
        </ThemeProvider>
      </body>
    </html>
  )
}
