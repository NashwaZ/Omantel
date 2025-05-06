"use client"

import { useEffect, useState } from "react"
import { initializeApi } from "@/lib/api"
import ApiStatusIndicator from "./api-status-indicator"

/**
 * Component to initialize the API client
 * This component is used in the root layout to ensure the API client is initialized
 * as early as possible in the application lifecycle
 */
export default function ApiInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize API with a timeout
    const initializeWithTimeout = async () => {
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => {
            console.warn("API initialization timed out")
            setInitialized(true) // Consider it initialized even if it timed out
            return true
          }, 5000)
        })

        // Race between actual initialization and timeout
        await Promise.race([initializeApi(), timeoutPromise])
        setInitialized(true)
      } catch (error) {
        console.error("Failed to initialize API:", error)
        setInitialized(true) // Consider it initialized even if it failed
      }
    }

    initializeWithTimeout()
  }, [])

  // This component doesn't render anything visible in production
  // In development, it shows a small status indicator
  if (process.env.NODE_ENV === "development") {
    return <ApiStatusIndicator />
  }

  return null
}
