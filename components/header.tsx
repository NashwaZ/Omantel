"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-3xl font-bold text-blue-600">Omantel</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className={`flex items-center text-sm font-medium ${
              pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <Link
            href="/visa-programs"
            className={`text-sm font-medium ${
              pathname.includes("/visa-programs") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Visa Programs
          </Link>
        </nav>
      </div>
    </header>
  )
}
