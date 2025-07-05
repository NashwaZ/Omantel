"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import LoadingIndicator from "@/components/loading-indicator"

interface ApplicationIframeProps {
  iframeUrl: string
  orderId: string
}

export default function ApplicationIframe({ iframeUrl, orderId }: ApplicationIframeProps) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState("100vh")

  // Store the deeplink in session storage for persistence
  useEffect(() => {
    if (iframeUrl) {
      try {
        // Only store if it's a valid iframe_deeplink_url
        if (iframeUrl.includes("simplevisa.net")) {
          sessionStorage.setItem(
            "deeplink",
            JSON.stringify({
              result: { iframe_deeplink_url: iframeUrl },
            }),
          )
        } else {
          console.error("Invalid iframe URL format:", iframeUrl)
          setError("Backend issue: Invalid iframe URL format. Please try again later.")
        }
      } catch (error) {
        console.error("Error storing deeplink in session storage:", error)
        setError("Error storing application data. Please try again later.")
      }
    } else {
      setError("Backend issue: Missing iframe URL. Please try again later.")
    }
  }, [iframeUrl])

  // Unified message listener for iframe communication
  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      // Security check - only accept messages from trusted domains
      const trustedDomains = ["omantel.sandbox-simplevisa.net", "simplevisa.net", window.location.hostname]

      try {
        const originDomain = new URL(event.origin).hostname
        const isTrusted = trustedDomains.some((domain) => originDomain.includes(domain))

        if (!isTrusted) {
          console.warn("Received message from untrusted domain:", event.origin)
          return
        }

        // console.log("Received message from iframe:", event.data)

        // Handle form submission
        if (event?.data?.type === "formSubmitted") {
          // Store data
          try {
            sessionStorage.setItem("event_data", JSON.stringify(event.data))
            setFormSubmitted(true)
          } catch (error) {
            console.error("Error storing event data:", error)
          }
        }

        // Handle iframe loaded event
        if (event?.data?.type === "iframeLoaded") {
          setLoading(false)
        }

        // Handle iframe error
        if (event?.data?.type === "iframeError") {
          setError(event.data.message || "An error occurred in the iframe")
        }

        // Handle iframe height adjustment
        if (event?.data?.type === "iframeHeight" && typeof event.data.height === "number") {
          setIframeHeight(`${event.data.height}px`)
        }
      } catch (error) {
        console.error("Error processing message event:", error)
      }
    }

    window.addEventListener("message", messageListener)
    return () => window.removeEventListener("message", messageListener)
  }, [orderId, router])

  // Handle iframe load/error events
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      console.log("Iframe loaded successfully")
      setLoading(false)
    }

    const handleError = () => {
      console.error("Iframe failed to load")
      setError("Backend issue: Failed to load the application form. Please try again later.")
    }

    iframe.addEventListener("load", handleLoad)
    iframe.addEventListener("error", handleError)

    // Set a timeout to handle cases where the iframe might be stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Iframe load timeout - setting loading to false")
        setLoading(false)
      }
    }, 15000)

    return () => {
      iframe.removeEventListener("load", handleLoad)
      iframe.removeEventListener("error", handleError)
      clearTimeout(timeoutId)
    }
  }, [loading])

  const handleGoHome = () => {
    router.push("/")
  }

  // If form is submitted, show the next step
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Omantel Logo" width={120} height={32} className="h-8 w-auto" />
            <h1 className="ml-4 text-xl font-semibold text-blue-600">Visa Application</h1>
          </div>
          <Button variant="outline" onClick={handleGoHome} className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your visa application has been submitted successfully. Please proceed to payment.
            </p>
            <Button
              className="bg-omantel-orange hover:bg-omantel-orange text-white w-full"
              onClick={() => router.push(`/payment-confirmation?success=true&order_id=${orderId}`)}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main iframe view
  return (
    <div className="min-h-screen flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <LoadingIndicator size="large" text="Loading visa application form..." />
        </div>
      )}

      {error ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button
                className="bg-omantel-orange hover:bg-omantel-orange rounded-full"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button variant="outline" className="rounded-full" onClick={handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1" style={{ position: "relative", height: iframeHeight, minHeight: "calc(100vh - 64px)" }}>
          <iframe
            id="visa-iframe"
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full"
            style={{
              border: "none",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            frameBorder="0"
            title="Visa Application Form"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
    </div>
  )
}
