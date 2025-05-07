"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="heading-3">Omantel</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center p-2 text-gray-600 rounded-[16px] px-4"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`flex items-center body-default font-medium ${
              pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <Link
            href="/visa-programs"
            className={`body-default font-medium ${
              pathname.includes("/visa-programs") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Visa Programs
          </Link>
        </nav>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 md:hidden">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className={`flex items-center body-default font-medium p-2 rounded-md ${
                    pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <Link
                  href="/visa-programs"
                  className={`flex items-center body-default font-medium p-2 rounded-md ${
                    pathname.includes("/visa-programs")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Visa Programs
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
