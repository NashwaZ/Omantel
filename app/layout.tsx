import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"
import ApiInitializer from "@/components/api-initializer"
import ApiStorageManager from "@/components/api-storage-manager"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Omantel Visa Application",
  description: "Apply for visas with Omantel",
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ApiInitializer />
          <header className="w-full bg-white border-b border-gray-200 py-3 px-4 shadow-sm z-10">
            <div className="container mx-auto flex items-center">
              <Image src="/omantel-logo.png" alt="Omantel Logo" width={150} height={40} priority />
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ApiStorageManager />
        </ThemeProvider>
      </body>
    </html>
  )
}
