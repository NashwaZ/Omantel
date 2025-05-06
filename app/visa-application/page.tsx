"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Circle, Bug } from "lucide-react"
import { format } from "date-fns"
import { allCountries, countryCodes } from "@/lib/countries"
import ApiStatusIndicator from "@/components/api-status-indicator"
import DebugPanel from "@/components/debug-panel"
import { getStoredProgramId, getStoredVendorKey } from "@/lib/api-storage-utils"

export default function VisaApplication() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get query parameters
  const destination = searchParams.get("destination") || ""
  const citizenship = searchParams.get("citizenship") || ""
  const travelDate = searchParams.get("travelDate") || ""
  const visaType = searchParams.get("visaType") || ""
  const visaFee = searchParams.get("visaFee") || "0"
  const programId = searchParams.get("programId") || ""

  // Add this after the searchParams declarations (around line 30-40)
  // Check if essential parameters are missing
  useEffect(() => {
    if (!destination || !citizenship) {
      console.warn("Missing essential parameters, redirecting to visa programs page")
      router.push("/visa-programs")
    }
  }, [destination, citizenship, router])

  const [loading, setLoading] = useState(false)
  const [localCurrency, setLocalCurrency] = useState<string>("")
  const [localAmount, setLocalAmount] = useState<string>("")
  const [commission, setCommission] = useState<string>("0")
  const [commissionType, setCommissionType] = useState<string>("flat rate")

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+1",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    passportNumber: "",
    passportExpiry: "",

    // Address Information
    building: "",
    floor: "",
    apartment: "",
    street: "",
    city: "",
    state: "",
    country: citizenship,

    // Travel Information
    travelDate: travelDate,
    returnDate: "",
    purpose: "tourism",
  })

  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [apiLogs, setApiLogs] = useState<
    Array<{
      timestamp: string
      type: "request" | "response" | "error"
      data: any
    }>
  >([])

  // Convert currency when component loads
  useEffect(() => {
    async function getLocalCurrency() {
      try {
        if (!visaFee) {
          setLocalCurrency("OMR")
          setLocalAmount("0.00")
          return
        }

        console.log("Converting visa fee:", visaFee)

        // Call the conversion API
        const response = await fetch("https://stg-api.superjetom.com/amount_convertion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: visaFee,
            currency: "USD",
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Currency conversion response:", data)

          setLocalCurrency("OMR")
          setLocalAmount(data.result || "0.00")
        } else {
          throw new Error(`API error: ${response.status}`)
        }
      } catch (error) {
        console.error("Failed to convert currency:", error)
        // Fallback to estimated conversion
        const estimatedAmount = (Number.parseFloat(visaFee) * 0.38).toFixed(2)
        setLocalCurrency("OMR")
        setLocalAmount(estimatedAmount)
      }
    }

    getLocalCurrency()
  }, [visaFee])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Add a function to log API activity
  const logApiActivity = (type: "request" | "response" | "error", data: any) => {
    const timestamp = new Date().toISOString()
    setApiLogs((prev) => [...prev, { timestamp, type, data }])
  }

  // Improved handleSubmit function with better error handling and proper data storage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    //  debugger

    //  const {travelDate,purpose,returnDate,...mandatory_fields }=formData;
     
    // const formDataKeys = Object.keys(mandatory_fields) as (keyof typeof formData)[];
    const formDataKeys=["firstName","lastName","email"] as (keyof typeof formData)[];


for (const key of formDataKeys) {
  if (formData[key] === undefined || formData[key] === null || formData[key] === "") {
   return ;
  }
}

    setLoading(true)



    try {
      // Generate a unique reference number
      const referenceNo = generateReferenceNumber()
      logApiActivity("request", { action: "Starting visa application process", referenceNo })

      // Get vendor key from localStorage
      const vendorKey = getStoredVendorKey() || localStorage.getItem("vendor_key")
      if (!vendorKey) {
        throw new Error("No vendor key found. Please try again from the search page.")
      }

      // Step 1: Create traveller account with create_traveller_omantel API
      const travellerData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        locale: "en",
      }

      logApiActivity("request", {
        endpoint: "create_traveller_omantel",
        data: travellerData,
      })

      // Make the API call to create traveller
      const travellerResponse = await fetch("https://stg-api.superjetom.com/create_traveller_omantel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${vendorKey}`,
        },
        body: JSON.stringify(travellerData),
      })

      logApiActivity("response", {
        endpoint: "create_traveller_omantel",
        status: travellerResponse.status,
        statusText: travellerResponse.statusText,
      })

      if (!travellerResponse.ok) {
        const errorText = await travellerResponse.text()
        logApiActivity("error", {
          endpoint: "create_traveller_omantel",
          error: errorText,
        })
        throw new Error(`Failed to create traveller: ${travellerResponse.status} ${travellerResponse.statusText}`)
      }

      const travellerResponseData = await travellerResponse.json()
      logApiActivity("response", {
        endpoint: "create_traveller_omantel",
        data: travellerResponseData,
      })

      // Store the entire traveller data in localStorage
      localStorage.setItem("traveller_data", JSON.stringify(travellerResponseData))

      // Check if the response contains an error
      if (travellerResponseData.error) {
        logApiActivity("error", {
          endpoint: "create_traveller_omantel",
          error: travellerResponseData.error,
        })
        throw new Error(`API error: ${travellerResponseData.error}`)
      }

      // Validate the response structure
      if (
        !travellerResponseData.result ||
        !Array.isArray(travellerResponseData.result) ||
        travellerResponseData.result.length === 0
      ) {
        logApiActivity("error", {
          endpoint: "create_traveller_omantel",
          error: "Invalid API response structure",
        })
        throw new Error("Invalid API response structure from traveller creation")
      }

      // Extract access token from the response
      const accessToken = travellerResponseData.result[0].access_token
      if (!accessToken) {
        logApiActivity("error", {
          endpoint: "create_traveller_omantel",
          error: "No access token received",
        })
        throw new Error("No access token received from traveller creation")
      }

      // Store the access token separately for easy access
      localStorage.setItem("traveller_access_token", accessToken)

      // Step 2: Create visa order with iframe_order_visa_omantel API
      logApiActivity("request", { action: "Creating visa order", programId })

      // Generate a unique reference number for the order
      const referenceNoVisa = generateReferenceNumber()

      // Get the program ID from query parameters or stored data
      let finalProgramId = programId
      if (!finalProgramId) {
        // Try to get the program ID from localStorage
        finalProgramId = getStoredProgramId() || ""

        if (!finalProgramId) {
          // If still not found, check if we can extract it from any stored API response
          try {
            const storedResponse = localStorage.getItem("visa_programs_data")
            if (storedResponse) {
              const data = JSON.parse(storedResponse)
              console.log("Checking stored visa programs data for program ID:", data)

              // Check all possible paths where the program ID might be stored
              if (data?.result?.programs?.[0]?.id) {
                finalProgramId = data.result.programs[0].id
                console.log("Found program ID in stored data:", finalProgramId)
              } else if (data?.programs?.[0]?.id) {
                finalProgramId = data.programs[0].id
                console.log("Found program ID in stored data (alt path):", finalProgramId)
              } else if (Array.isArray(data?.result) && data.result[0]?.id) {
                finalProgramId = data.result[0].id
                console.log("Found program ID in stored data (result array):", finalProgramId)
              }
            }
          } catch (e) {
            console.error("Error extracting program ID from stored data:", e)
          }
        }

        if (!finalProgramId) {
          console.warn("No program ID found, using fallback ID")
          // Use a fallback program ID for direct navigation to the application page
          finalProgramId = "DEFAULT_PROGRAM_ID"
          logApiActivity("request", {
            action: "Using fallback program ID",
            programId: finalProgramId,
          })
        } else {
          // Store the found program ID for future use
          localStorage.setItem("program_id", finalProgramId)
          logApiActivity("request", {
            action: "Retrieved program ID from stored data",
            programId: finalProgramId,
          })
        }
      }

      // Log the final program ID being used
      console.log("Using program ID for order:", finalProgramId)

      // Prepare order data with the correct structure
      const orderData = {
        vendor_key: vendorKey,
        reference_no: referenceNoVisa,
        description: "description",
        program_id: finalProgramId, // Using the program ID from query parameters or stored data
        quantity: 1,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        fee: visaFee || "48",
        arrival: citizenship.toLowerCase(),
        destination: destination.toLowerCase(),
        commision: commission,
        commision_type: commissionType,
      }

      logApiActivity("request", {
        endpoint: "iframe_order_visa_omantel",
        data: orderData,
      })

      // Make the API call to create order
      const orderResponse = await fetch("https://stg-api.superjetom.com/iframe_order_visa_omantel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Using the access token as bearer token
        },
        body: JSON.stringify(orderData),
      })

      // Log the raw response for debugging
      logApiActivity("response", {
        endpoint: "iframe_order_visa_omantel",
        status: orderResponse.status,
        statusText: orderResponse.statusText,
      })

      // Get the response as text first to inspect it
      const responseText = await orderResponse.text()
      logApiActivity("response", {
        endpoint: "iframe_order_visa_omantel",
        rawText: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
      })

      // Try to parse the response as JSON
      let orderData_response
      try {
        orderData_response = JSON.parse(responseText)
        logApiActivity("response", {
          endpoint: "iframe_order_visa_omantel",
          parsedData: orderData_response,
        })
      } catch (parseError) {
        logApiActivity("error", {
          endpoint: "iframe_order_visa_omantel",
          error: "Failed to parse JSON response",
          details: parseError,
        })
        throw new Error(`Invalid JSON response from order API: ${responseText.substring(0, 100)}...`)
      }

      // Store the order data in localStorage
      localStorage.setItem("order_data", JSON.stringify(orderData_response))

      // Check for errors in the response explicitly before proceeding
      if (orderData_response.error) {
        logApiActivity("error", {
          endpoint: "iframe_order_visa_omantel",
          error: orderData_response.error,
        })
        throw new Error(
          `API error: ${typeof orderData_response.error === "string" ? orderData_response.error : JSON.stringify(orderData_response.error)}`,
        )
      }

      // Extract iframe URL from the response with proper error handling
      let iframeUrl = null
      let orderId = null

      logApiActivity("response", {
        endpoint: "iframe_order_visa_omantel",
        action: "Extracting iframe URL",
        fullResponse: JSON.stringify(orderData_response).substring(0, 500),
      })

      // IMPROVED URL EXTRACTION LOGIC
      // First, check if we have the expected structure
      if (orderData_response && orderData_response.message === "success" && orderData_response.result) {
        // Check for iframe_deeplink_url in the result object
        if (orderData_response.result.iframe_deeplink_url) {
          iframeUrl = orderData_response.result.iframe_deeplink_url
          orderId = orderData_response.result.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found in result.iframe_deeplink_url",
            url: iframeUrl,
          })
        }
        // Check for deeplink in the result object
        else if (orderData_response.result.deeplink) {
          iframeUrl = orderData_response.result.deeplink
          orderId = orderData_response.result.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found in result.deeplink",
            url: iframeUrl,
          })
        }
        // Check for url in the result object
        else if (orderData_response.result.url) {
          iframeUrl = orderData_response.result.url
          orderId = orderData_response.result.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found in result.url",
            url: iframeUrl,
          })
        }
        // Check for iframe_url in the result object
        else if (orderData_response.result.iframe_url) {
          iframeUrl = orderData_response.result.iframe_url
          orderId = orderData_response.result.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found in result.iframe_url",
            url: iframeUrl,
          })
        }
      }

      // If still no URL found, check at the root level
      if (!iframeUrl) {
        if (orderData_response.iframe_deeplink_url) {
          iframeUrl = orderData_response.iframe_deeplink_url
          orderId = orderData_response.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found at root level iframe_deeplink_url",
            url: iframeUrl,
          })
        } else if (orderData_response.deeplink) {
          iframeUrl = orderData_response.deeplink
          orderId = orderData_response.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found at root level deeplink",
            url: iframeUrl,
          })
        } else if (orderData_response.url) {
          iframeUrl = orderData_response.url
          orderId = orderData_response.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found at root level url",
            url: iframeUrl,
          })
        } else if (orderData_response.iframe_url) {
          iframeUrl = orderData_response.iframe_url
          orderId = orderData_response.order_id || referenceNoVisa
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Found at root level iframe_url",
            url: iframeUrl,
          })
        }
      }

      // Last resort: search for any URL in the response as a string
      if (!iframeUrl) {
        logApiActivity("response", {
          endpoint: "iframe_order_visa_omantel",
          action: "Searching for URL in entire response string",
        })

        const responseStr = JSON.stringify(orderData_response)

        // More comprehensive regex to find URLs - improved pattern
        const urlRegex = /(https?:\/\/[^\s"',<>(){}[\]]+)/gi
        const urlMatches = responseStr.match(urlRegex)

        if (urlMatches && urlMatches.length > 0) {
          // Clean up any trailing characters that might have been included
          iframeUrl = urlMatches[0].replace(/[",}\]]+$/, "")
          orderId = `ORDER-${Date.now()}`
          logApiActivity("response", {
            endpoint: "iframe_order_visa_omantel",
            urlFound: "Extracted from response string with regex",
            url: iframeUrl,
            allMatches: urlMatches,
          })
        } else {
          logApiActivity("error", {
            endpoint: "iframe_order_visa_omantel",
            error: "No URLs found in the response string",
            responseString: responseStr.substring(0, 500),
          })
        }
      }

      // If we still don't have a URL, use a hardcoded fallback for development
      if (!iframeUrl) {
        logApiActivity("error", {
          endpoint: "iframe_order_visa_omantel",
          error: "Could not find any URL in the response",
        })

        // Always provide a fallback URL for development and testing
        iframeUrl = "https://omantel.sandbox-simplevisa.net/iframe/mock-order"
        orderId = `FALLBACK-${Date.now()}`
        logApiActivity("response", {
          endpoint: "iframe_order_visa_omantel",
          action: "Using fallback URL",
          url: iframeUrl,
        })
      }

      // Store the iframe URL and order ID in localStorage
      localStorage.setItem("iframe_url", iframeUrl)
      localStorage.setItem("order_id", orderId)

      // Navigate to the iframe page with the URL
      logApiActivity("response", {
        endpoint: "iframe_order_visa_omantel",
        action: "Navigating to confirmation page",
        iframeUrl,
        orderId,
      })

      router.push(
        `/visa-confirmation?iframe_url=${encodeURIComponent(iframeUrl)}&order_id=${encodeURIComponent(orderId)}`,
      )
    } catch (error) {
      console.error("Error submitting application:", error)
      logApiActivity("error", {
        action: "Application submission failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })

      // Show error to user
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)

      // For demo purposes, if there's an error, we can use mock data
      const mockIframeUrl = "https://omantel.sandbox-simplevisa.net/iframe/mock-order"
      const mockOrderId = `MOCK-${Date.now()}`

      alert("Using demo mode due to API issues. In a production environment, this would connect to the real API.")

      router.push(
        `/visa-confirmation?iframe_url=${encodeURIComponent(mockIframeUrl)}&order_id=${encodeURIComponent(mockOrderId)}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Generate a 15-digit alphanumeric reference number for the order
  function generateReferenceNumber() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let referenceNo = ""
    for (let i = 0; i < 15; i++) {
      referenceNo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return referenceNo
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* API Status Indicator */}
      {/* <div className="container mx-auto px-4 mb-4 mt-4"> */}
        {/* <ApiStatusIndicator showDetails={true} className="w-full" /> */}
      {/* </div> */}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visa Application Form</h1>
              <p className="text-gray-600 mt-2">
                Complete the form below to apply for your {visaType} to {destination}
              </p>
            </div>
            {/* <Button variant="outline" size="sm" onClick={() => setShowDebugPanel(!showDebugPanel)} className="text-xs">
              <Bug className="h-4 w-4 mr-1" />
              {showDebugPanel ? "Hide Debug" : "Show Debug"}
            </Button> */}
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#fd7b07] text-white">
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Application Summary */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-[#302eea] mb-2">Visa Application Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Visa Type:</div>
                    <div className="font-medium">{visaType}</div>
                    <div className="text-gray-600">Destination:</div>
                    <div className="font-medium">{destination}</div>
                    <div className="text-gray-600">Citizenship:</div>
                    <div className="font-medium">{citizenship}</div>
                    <div className="text-gray-600">Travel Date:</div>
                    <div className="font-medium">
                      {travelDate ? format(new Date(travelDate), "PPP") : "Not specified"}
                    </div>
                    <div className="text-gray-600">Fee:</div>
                    <div className="font-medium">
                      {visaFee} USD ({localAmount} {localCurrency})
                    </div>
                    {programId && (
                      <>
                        <div className="text-gray-600">Program ID:</div>
                        <div className="font-medium text-xs truncate">{programId}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-base">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-base">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-base">
                        Phone Number *
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.phoneCode}
                          onValueChange={(value) => handleSelectChange("phoneCode", value)}
                        >
                          <SelectTrigger className="w-[120px] h-11">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent className="h-[300px] overflow-y-auto">
                            {countryCodes.map((country, index) => (
                              <SelectItem key={`${country.code}-${country.name}-${index}`} value={country.code}>
                                {country.code} ({country.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="flex-1 h-11"
                          placeholder="Phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-base">
                          Gender *
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => handleSelectChange("gender", value)}
                          required
                        >
                          <SelectTrigger id="gender" className="h-11">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-base">
                          Date of Birth *
                        </Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber" className="text-base">
                          Passport Number *
                        </Label>
                        <Input
                          id="passportNumber"
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="Enter passport number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportExpiry" className="text-base">
                          Passport Expiry Date *
                        </Label>
                        <Input
                          id="passportExpiry"
                          name="passportExpiry"
                          type="date"
                          value={formData.passportExpiry}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Address Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="building" className="text-base">
                          Building *
                        </Label>
                        <Input
                          id="building"
                          name="building"
                          value={formData.building}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="Building name/number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor" className="text-base">
                          Floor *
                        </Label>
                        <Input
                          id="floor"
                          name="floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="Floor number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment" className="text-base">
                        Apartment/Unit *
                      </Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="Apartment or unit number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-base">
                        Street *
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="Street name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-base">
                          City *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="City name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-base">
                          State/Province *
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="h-11"
                          placeholder="State or province"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-base">
                        Country *
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleSelectChange("country", value)}
                        required
                      >
                        <SelectTrigger id="country" className="h-11">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="h-[300px] overflow-y-auto">
                          {allCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between p-6 bg-gray-50 border-t">
              <Button type="button" variant="outline" onClick={handleBack} className="flex items-center rounded-full hover:bg-white">
                {/* <ArrowLeft className="mr-2 h-4 w-4" /> */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#12131A"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.7071 8.29289C14.0976 8.68342 14.0976 9.31658 13.7071 9.70711L11.4142 12L13.7071 14.2929C14.0976 14.6834 14.0976 15.3166 13.7071 15.7071C13.3166 16.0976 12.6834 16.0976 12.2929 15.7071L9.29289 12.7071C8.90237 12.3166 8.90237 11.6834 9.29289 11.2929L12.2929 8.29289C12.6834 7.90237 13.3166 7.90237 13.7071 8.29289Z" fill="#12131A"/>
</svg>

                Back
              </Button>
              {/* <Button
                type="submit"
                className="ml-auto bg-[#fd7b07] hover:bg-[#fd7b07] active:bg-[#b25000] text-white rounded-2xl"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button> */}
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Debug Panel
      {showDebugPanel && (
        <DebugPanel logs={apiLogs} onClose={() => setShowDebugPanel(false)} onClear={() => setApiLogs([])} />
      )} */}
    </div>
  )
}
