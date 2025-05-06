"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle, Home } from "lucide-react"
import ApiStatusIndicator from "@/components/api-status-indicator"
import ApplicationIframe from "@/components/application-iframe"

export default function VisaConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get iframe URL from query parameters
  const iframeUrl = searchParams.get("iframe_url")
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (!iframeUrl) {
      setError("No iframe URL provided. Please try again.")
      setLoading(false)
    } else {
      console.log("Iframe URL received:", iframeUrl)
      setLoading(false)
    }
  }, [iframeUrl])

  const handleBack = () => {
    router.push("/visa-programs")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  // If we have an iframe URL and no errors, use the ApplicationIframe component
  if (iframeUrl && !error && !loading) {
    return <ApplicationIframe iframeUrl={iframeUrl} orderId={orderId || "unknown"} />
  }

  // Otherwise, show loading or error state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* API Status Indicator */}
      {/* <div className="container mx-auto px-4 mb-4 mt-4">
        <ApiStatusIndicator showDetails={true} className="w-full" />
      </div> */}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="omantel-loading mb-4">
                <div className="omantel-loading-spinner"></div>
              </div>
              <p className="text-gray-600">Loading visa application form...</p>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-2">
                  <XCircle className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
                <p className="text-red-600">{error}</p>
                <div className="flex justify-center space-x-4 mt-6">
                  <Button className="bg-omantel-orange hover:bg-omantel-orange rounded-full" onClick={handleBack}>
                    Return to Visa Programs
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={handleGoHome}>
                    <Home className="mr-2 h-4 w-4" />
                    Take me to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="omantel-loading mb-4">
                <div className="omantel-loading-spinner"></div>
              </div>
              <p className="text-gray-600">Preparing visa application form...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
