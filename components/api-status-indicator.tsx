"use client"

import { useEffect, useState } from "react"
import { isOfflineMode } from "@/lib/api"
import { WifiOff, Wifi, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApiStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export default function ApiStatusIndicator({ className = "", showDetails = false }: ApiStatusIndicatorProps) {
  const [isOffline, setIsOffline] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [checkCount, setCheckCount] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    // Check initial status
    setIsOffline(isOfflineMode())
    setLastChecked(new Date())

    // Set up an interval to check status periodically
    const checkInterval = setInterval(() => {
      const offline = isOfflineMode()
      setIsOffline(offline)
      setLastChecked(new Date())
      setCheckCount((prev) => prev + 1)

      // Check if we have any API errors stored in localStorage
      const storedError = localStorage.getItem("api_error")
      if (storedError) {
        setApiError(storedError)
      } else {
        setApiError(null)
      }
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [])

  if (!showDetails) {
    return (
      <div
        className={`fixed bottom-4 right-4 p-2 rounded-full ${
          isOffline ? "bg-red-500" : apiError ? "bg-yellow-500" : "bg-green-500"
        } text-white shadow-md ${className}`}
        title={isOffline ? "API Offline" : apiError ? "API Error" : "API Online"}
      >
        {isOffline ? <WifiOff size={16} /> : apiError ? <AlertTriangle size={16} /> : <Wifi size={16} />}
      </div>
    )
  }

  return (
    <div
      className={`${
        isOffline
          ? "bg-red-50 text-red-700 border-red-200"
          : apiError
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : "bg-green-50 text-green-700 border-green-200"
      } rounded-md p-3 border ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isOffline ? (
            <WifiOff className="mr-2 h-4 w-4" />
          ) : apiError ? (
            <AlertTriangle className="mr-2 h-4 w-4" />
          ) : (
            <Wifi className="mr-2 h-4 w-4" />
          )}
          <p className="text-sm font-medium">
            {isOffline
              ? "API is offline - Cannot connect to server"
              : apiError
                ? `API Error: ${apiError}`
                : "Connected to API - Using live data"}
          </p>
        </div>
        {!isOffline && !apiError && (
          <div className="flex items-center">
            <p className="text-xs">Using real-time data from API</p>
          </div>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Last checked: {lastChecked.toLocaleTimeString()} (Checks: {checkCount})
        {isOffline && (
          <Button variant="link" className="text-xs p-0 h-auto ml-2" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  )
}
