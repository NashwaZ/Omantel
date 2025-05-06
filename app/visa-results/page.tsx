"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Circle, Clock, CreditCard, Globe, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// Update the getCountryFlag function to use our new utility
import { getCountryFlagUrl } from "@/lib/country-utils"

export default function VisaResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [visaData, setVisaData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [flagError, setFlagError] = useState(false)

  // Get query parameters
  const destination = searchParams.get("destination") || ""
  const citizenship = searchParams.get("citizenship") || ""
  const travelDate = searchParams.get("travelDate") || ""

  // Inside the component, update the useEffect hook:
  useEffect(() => {
    // Fetch visa data using the vendor key
    const fetchVisaData = async () => {
      setLoading(true)
      try {
        // Get vendor key from local storage
        const vendorKey = localStorage.getItem("vendor_key")
        if (!vendorKey) {
          throw new Error("No vendor key found, please try again from the search page")
        }

        // Format the travel date for the API in DD-MM-YYYY format
        let formattedTravelDate = travelDate || "12-04-2025"
        if (travelDate && travelDate.includes("-")) {
          const dateParts = travelDate.split("-")
          if (dateParts.length === 3) {
            // Convert from YYYY-MM-DD to DD-MM-YYYY
            formattedTravelDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          }
        }

        console.log("Calling API with params:", {
          destination: destination.toLowerCase(),
          citizenship: citizenship.toLowerCase(),
          arrivalDate: formattedTravelDate,
        })

        // Call the API endpoint
        const response = await fetch("https://stg-api.superjetom.com/get_visa_programs_omantel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vendorKey}`,
          },
          body: JSON.stringify({
            destination: destination.toLowerCase(),
            citizenship: citizenship.toLowerCase(),
            arrivalDate: formattedTravelDate,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        // Check if we have programs and if visa is available
        if (data && data.result && data.result.programs) {
          const programs = data.result.programs

          if (Array.isArray(programs) && programs.length > 0) {
            // Check if visa is available
            const isAvailable = programs[0].available === "true" || programs[0].available === true

            // Store the entire response in localStorage
            localStorage.setItem("visa_programs_data", JSON.stringify(data))
            console.log("Stored visa programs data in localStorage")

            // Store the program ID for easy access
            if (programs[0].id) {
              localStorage.setItem("program_id", programs[0].id)
              console.log("Stored program ID in localStorage:", programs[0].id)
            }

            // Convert the fee to local currency
            const fee = programs[0].fee || 48
            let localAmount = "0.00"
            const localCurrency = "OMR"

            try {
              // Call the conversion API
              const conversionResponse = await fetch("https://stg-api.superjetom.com/amount_convertion", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: fee.toString(),
                  currency: "USD",
                }),
              })

              if (conversionResponse.ok) {
                const conversionData = await conversionResponse.json()
                localAmount = conversionData.result || (Number(fee) * 0.38).toFixed(2)
              } else {
                // Fallback if API fails
                localAmount = (Number(fee) * 0.38).toFixed(2)
              }
            } catch (error) {
              console.error("Currency conversion failed:", error)
              // Fallback to estimated conversion
              localAmount = (Number(fee) * 0.38).toFixed(2)
            }

            // Create visa data object
            setVisaData({
              available: isAvailable,
              type: programs[0].program_name || "Tourist e-visa",
              fee: {
                usd: fee,
                local: localAmount,
                currency: localCurrency,
              },
              maxStay: programs[0].max_stay || 90,
              processingTime: programs[0].suggested_processing_time
                ? `${programs[0].suggested_processing_time} days`
                : "3-5 business days",
              validity: programs[0].validity ? `${programs[0].validity} days` : "6 months from date of issue",
              // entries: programs[0].max_entries === "0.0" ? "Multiple entry" : "Single entry",
              entries:"Single entry",
              requirements: [
                "Valid passport with at least 6 months validity",
                "Return ticket",
                "Hotel reservation",
                "Travel insurance",
              ],
              programId: programs[0].id, // Add program ID to visa data
            })
          } else {
            setError("No visa programs available for the selected destination and citizenship.")
          }
        } else {
          setError("Invalid API response format.")
        }
      } catch (err) {
        console.error("Failed to fetch visa information:", err)
        setError("Failed to fetch visa information. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (destination && citizenship) {
      fetchVisaData()
    } else {
      setError("Please provide both destination and citizenship")
      setLoading(false)
    }
  }, [destination, citizenship, travelDate])

  const handleApply = () => {
    router.push(
      `/visa-application?destination=${encodeURIComponent(destination)}&citizenship=${encodeURIComponent(
        citizenship,
      )}&travelDate=${encodeURIComponent(travelDate)}&visaType=${encodeURIComponent(
        visaData?.type || "",
      )}&visaFee=${encodeURIComponent(visaData?.fee?.usd || 0)}`,
    )
  }

  const handleBack = () => {
    router.back()
  }

  // Handle flag loading errors
  const handleFlagError = () => {
    setFlagError(true)
  }

  // Get country flag with error handling
  const getCountryFlag = (countryName: string) => {
    if (flagError) {
      return `/placeholder.svg?height=64&width=64&query=flag%20of%20${encodeURIComponent(countryName)}`
    }
    return getCountryFlagUrl(countryName)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="flex items-center text-gray-600 hover:bg-white-500 px-0"
              onClick={handleBack}
            >
              {/* <ArrowLeft className="mr-2 h-4 w-4" /> */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#12131A"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.7071 8.29289C14.0976 8.68342 14.0976 9.31658 13.7071 9.70711L11.4142 12L13.7071 14.2929C14.0976 14.6834 14.0976 15.3166 13.7071 15.7071C13.3166 16.0976 12.6834 16.0976 12.2929 15.7071L9.29289 12.7071C8.90237 12.3166 8.90237 11.6834 9.29289 11.2929L12.2929 8.29289C12.6834 7.90237 13.3166 7.90237 13.7071 8.29289Z" fill="#12131A"/>
</svg>



              Back to Search
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 ">Visa Requirements</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Destination</p>
                <p className="text-lg font-medium">{destination}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Citizenship</p>
                <p className="text-lg font-medium">{citizenship}</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="omantel-loading mb-4">
                  <div className="omantel-loading-spinner"></div>
                </div>
                <p className="text-gray-600">Checking visa requirements...</p>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <div className="text-red-500 mb-2">
                    <Info className="h-12 w-12 mx-auto" />
                  </div>
                  <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
                  <p className="text-red-600">{error}</p>
                  <Button className="mt-4 bg-[#fd7b07] hover:bg-[#fd7b07] rounded-full" onClick={handleBack}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : visaData?.available ? (
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="bg-[#fd7b07] px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Visa Available</h2>
                </div>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 p-6 flex flex-col items-center justify-center bg-gray-50 border-r border-gray-100">
                      <img
                        src={getCountryFlag(destination) || "/placeholder.svg"}
                        alt={`${destination} flag`}
                        className="w-full max-w-[200px] rounded shadow-md border border-gray-200"
                        onError={handleFlagError}
                      />
                      <h3 className="font-medium text-lg mt-3">{destination}</h3>
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{visaData.type}</h3>
                          <Badge className="mt-1 bg-[#fd7b07]">{visaData.entries}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-[#fd7b07] mr-3" />
                          <div>
                            <p className="font-medium">Visa Fee</p>
                            <p className="text-gray-600">
                              {visaData.fee.usd} USD ({visaData.fee.local} {visaData.fee.currency})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-[#fd7b07] mr-3" />
                          <div>
                            <p className="font-medium">Maximum Stay</p>
                            <p className="text-gray-600">{visaData.maxStay} days</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-[#fd7b07] mr-3" />
                          <div>
                            <p className="font-medium">Processing Time</p>
                            <p className="text-gray-600">{visaData.processingTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-[#fd7b07] mr-3" />
                          <div>
                            <p className="font-medium">Validity</p>
                            <p className="text-gray-600">{visaData.validity}</p>
                          </div>
                        </div>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleApply}
                              className="w-full bg-[#fd7b07] hover:bg-[#fd7b07] active:bg-[#b25000] text-white py-6 text-lg rounded-2xl"
                            >
                              <Circle className="h-5 w-5 mr-2" />
                              Apply Now
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Continue to application form</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Requirements section */}
                  <div className="border-t border-gray-100 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {visaData.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6 text-center">
                  <div className="text-yellow-500 mb-2">
                    <Info className="h-12 w-12 mx-auto" />
                  </div>
                  <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Visa Available</h2>
                  <p className="text-yellow-600">
                    We couldn't find any visa options for the selected destination and citizenship combination.
                  </p>
                  <Button className="mt-4 bg-[#fd7b07] hover:bg-[#fd7b07] rounded-full" onClick={handleBack}>
                    Try Different Options
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Omantel. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
  )
}
