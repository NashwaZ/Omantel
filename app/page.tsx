"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Circle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Import country data directly
import { allCountries } from "@/lib/countries"

export default function VisaSearch() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [countries] = useState<string[]>(allCountries)

  const [formData, setFormData] = useState({
    destination: "",
    citizenship: "",
  })

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to properly create organization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Step 1: Create organization to get vendor key
      console.log("Creating organization...")
      const orgResponse = await fetch("https://stg-api.superjetom.com/create_organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization_name: "Omantel" }),
      })

      if (!orgResponse.ok) {
        throw new Error("Failed to create organization: " + orgResponse.statusText)
      }

      const orgData = await orgResponse.json()
      console.log("Organization created:", orgData)

      // Extract and store vendor key
      let vendorKey = ""
      if (orgData && orgData.result && orgData.result.length > 0 && orgData.result[0].vendor_key) {
        vendorKey = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", vendorKey)
        console.log("Vendor key stored:", vendorKey)
      } else {
        console.error("No vendor key found in response")
        throw new Error("No vendor key found in response")
      }

      // Format date for API in DD-MM-YYYY format
      const formattedDate = date ? format(date, "yyyy-MM-dd") : "12-04-2025"

      // Navigate to results page with query parameters
      router.push(
        `/visa-results?destination=${encodeURIComponent(formData.destination)}&citizenship=${encodeURIComponent(
          formData.citizenship,
        )}&travelDate=${encodeURIComponent(formattedDate)}`,
      )
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("There was an error processing your request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">eVisa Application Service</h1>
          <p className="text-gray-600 text-lg">Check your visa eligibility and apply online in minutes</p>
        </div>

        <div className="w-full max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="destination" className="text-base font-medium">
                    Destination Country
                  </Label>
                  <div className="relative">
                    {/* <Circle className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" /> */}
                    <Select
                      value={formData.destination}
                      onValueChange={(value) => handleSelectChange("destination", value)}
                      required
                    >
                      <SelectTrigger id="destination" className="h-12 text-base ">
                        <SelectValue placeholder="Where are you traveling to?" />
                      </SelectTrigger>
                      <SelectContent className="h-[300px] overflow-y-auto ">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} >
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="citizenship" className="text-base font-medium">
                    Your Citizenship
                  </Label>
                  <div className="relative">
                    {/* <Circle className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" /> */}
                    <Select
                      value={formData.citizenship}
                      onValueChange={(value) => handleSelectChange("citizenship", value)}
                      required
                    >
                      <SelectTrigger id="citizenship" className="h-12 text-base ">
                        <SelectValue placeholder="What passport do you hold?" />
                      </SelectTrigger>
                      <SelectContent className="h-[300px] overflow-y-auto">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="travel-date" className="text-base font-medium">
                    Travel Date
                  </Label>
                  <div className="relative">
                    {/* <Circle className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" /> */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="travel-date"
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 text-base justify-start text-left font-normal hover:bg-white",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "When are you traveling?"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full h-12 text-base rounded-2xl  hover:bg-orange-500 text-white ${formData.destination && formData.citizenship && date?"bg-orange-400 opacity-100":"bg-gray-400"}`}
                  disabled={loading || !formData.destination || !formData.citizenship || !date}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    "Check Visa Requirements"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Powered by Omantel eVisa Services. Fast, secure, and reliable visa processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
