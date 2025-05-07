"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { allCountries } from "@/lib/countries"
import ApiDebugPanel from "@/components/api-debug-panel"
import { createTravellerOmantel, createIframeOrderVisaOmantel, generateReferenceNumber } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"

export default function VisaApplication() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get query parameters with fallbacks
  const destination = searchParams.get("destination") || ""
  const citizenship = searchParams.get("citizenship") || ""
  const travelDate = searchParams.get("travelDate") || ""
  const visaType = searchParams.get("visaType") || "Tourist Visa"
  const visaFee = searchParams.get("visaFee") || "0"
  const programId = searchParams.get("programId") || ""

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    building: "",
    floor: "",
    apartment: "",
    street: "",
    city: "",
    state: "",
    country: citizenship || "",
    phone: "",
    marketingConsent: false,
  })

  // Add these state variables at the top of the component with the other state variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Try to recover data from localStorage if URL parameters are missing
  useEffect(() => {
    if (!destination || !citizenship || !programId) {
      try {
        const storedVisaData = localStorage.getItem("selected_visa_data")
        const storedProgramsData = localStorage.getItem("visa_programs_data")

        if (storedVisaData) {
          const parsedData = JSON.parse(storedVisaData)
          // Use the stored data to fill in missing parameters
        }
      } catch (error) {
        console.error("Error recovering data from localStorage:", error)
      }
    }
  }, [destination, citizenship, programId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, marketingConsent: checked }))
  }

  // Update the handleSubmit function to better handle API errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)

    // Store form data in localStorage for recovery
    localStorage.setItem("visa_application_form", JSON.stringify(formData))
    localStorage.setItem("visa_destination", destination)
    localStorage.setItem("visa_citizenship", citizenship)
    localStorage.setItem("visa_type", visaType)
    localStorage.setItem("visa_fee", visaFee)
    localStorage.setItem("program_id", programId || "")

    try {
      // Step 1: Create traveller in Omantel system
      setIsSubmitting(true)
      setSubmissionError(null)

      const travellerData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        locale: "en",
      }

      console.log("Creating traveller with data:", travellerData)
      let travellerResponse

      try {
        travellerResponse = await createTravellerOmantel(travellerData)
        console.log("Traveller created successfully:", travellerResponse)
      } catch (error) {
        console.error("Error creating traveller:", error)
        // Check if we're in development/preview mode and continue with mock data
        if (process.env.NODE_ENV !== "production" || window.location.hostname.includes("localhost")) {
          console.log("Development mode detected, continuing with mock data")
          // The createTravellerOmantel function will handle creating mock data
          travellerResponse = await createTravellerOmantel(travellerData)
        } else {
          throw error // Re-throw in production
        }
      }

      // Step 2: Create iframe order for visa with 15-character reference number
      const referenceNo = generateReferenceNumber()
      console.log("Generated reference number:", referenceNo)

      const orderData = {
        vendor_key: localStorage.getItem("vendor_key") || "OMANTEL", // Use stored vendor key or default
        reference_no: referenceNo,
        description: `Visa application for ${formData.firstName} ${formData.lastName}`,
        program_id: programId, // This is the ID we stored from get_visa_programs_omantel
        quantity: 1,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        fee: visaFee,
        arrival: citizenship.toLowerCase(),
        destination: destination.toLowerCase(),
        commision: "0", // Default value as specified
        commision_type: "flat rate", // Default value as specified
      }

      console.log("Creating iframe order with data:", orderData)
      let orderResponse

      try {
        orderResponse = await createIframeOrderVisaOmantel(orderData)
        console.log("Iframe order created successfully:", orderResponse)

        // Check if we have a valid iframe_deeplink_url
        if (!orderResponse?.result?.iframe_deeplink_url) {
          throw new Error("Backend issue: Missing iframe_deeplink_url in response. Please try again later.")
        }

        // Navigate to payment confirmation page
        router.push("/payment-confirmation")
      } catch (error) {
        console.error("Error creating iframe order:", error)
        // Check if we're in development/preview mode and continue with mock data
        if (process.env.NODE_ENV !== "production" || window.location.hostname.includes("localhost")) {
          console.log("Development mode detected, continuing with mock data")
          // The createIframeOrderVisaOmantel function will handle creating mock data
          orderResponse = await createIframeOrderVisaOmantel(orderData)
          router.push("/payment-confirmation")
        } else {
          throw error // Re-throw in production
        }
      }
    } catch (error) {
      console.error("Error during submission:", error)
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Backend issue: An error occurred while processing your application. Please try again later.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Calculate OMR value from USD
  const calculateOMR = (usd: string) => {
    const usdValue = Number.parseFloat(usd) || 0
    return (usdValue * 0.384).toFixed(3)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="flex items-center justify-center text-gray-600 hover:text-[#ea6e00] p-2 h-9 w-9"
              onClick={handleBack}
              aria-label="Back to visa results"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="heading-2 mb-2">Visa Application</h1>
            <p className="body-default text-gray-600">
              Please fill in the form below to apply for your {visaType} to {destination}.
            </p>
          </div>

          <Card className="shadow-z1">
            <CardContent className="p-8 pt-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="heading-4 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="label">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="label">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label htmlFor="email" className="label">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information - Improve mobile layout */}
                <div>
                  <h3 className="heading-4 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="building" className="label">
                        Building
                      </Label>
                      <Input
                        id="building"
                        name="building"
                        value={formData.building}
                        onChange={handleInputChange}
                        placeholder="Building name/number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor" className="label">
                        Floor
                      </Label>
                      <Input
                        id="floor"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="Floor number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment" className="label">
                        Apartment
                      </Label>
                      <Input
                        id="apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Apartment number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street" className="label">
                        Street
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Street name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="label">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="label">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State/Province/Region"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="country" className="label">
                        Country *
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
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

                {/* Contact Information */}
                <div>
                  <h3 className="heading-4 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="label">
                        Phone No *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Consent and Information */}
                <div className="space-y-4">
                  <p className="body-small text-gray-600">
                    We use this to create your E-Visa and send you updates about your application
                  </p>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="marketingConsent" className="body-small font-normal leading-tight cursor-pointer">
                      I want to receive E-Visa updates, product launches and personalized offers. I can opt out anytime.
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  {submissionError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 body-small">
                      Error: {submissionError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-[#ea6e00] hover:bg-[#ff7800] active:bg-[#b55500] text-white py-6 body-large font-medium rounded-[16px] min-h-[56px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <LoadingIndicator size="small" />
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* API Debug Panel */}
      <ApiDebugPanel />
    </div>
  )
}
