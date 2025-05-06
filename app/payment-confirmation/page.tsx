"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

export default function PaymentConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"success" | "failure" | "processing">("processing")

  useEffect(() => {
    // Check URL parameters to determine payment status
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "true") {
      setStatus("success")
    } else if (error) {
      setStatus("failure")
    } else {
      // If no clear parameters, default to success for demo
      setStatus("success")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 text-center">
            {status === "success" ? (
              <>
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your visa application has been received and is being processed. You will receive updates via email.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Reference Number:</span>
                    <span className="font-medium">OM{Math.floor(Math.random() * 1000000)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">48.00 OMR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  className="bg-omantel-orange hover:bg-omantel-orange text-white w-full"
                  onClick={() => router.push("/")}
                >
                  Apply for Another Visa
                </Button>
              </>
            ) : status === "failure" ? (
              <>
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't process your payment. Please check your payment details and try again.
                </p>
                <Button
                  className="bg-omantel-orange hover:bg-omantel-orange text-white w-full"
                  onClick={() => router.push("/")}
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <div className="animate-spinner rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
                <p className="text-gray-600 mb-6">Please wait while we process your payment...</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
{/* 
      <div className="bg-white py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Omantel. All rights reserved.</p>
      </div> */}
    </div>
  )
}
