"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

// Import country data directly
import { allCountries } from "@/lib/countries"

// Import the CustomInput component at the top of the file
import { CustomInput } from "@/components/ui/custom-input"

export default function VisaSearch() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [countries] = useState<string[]>(allCountries)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    destination: "",
    citizenship: "",
  })

  // Add click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const destinationDropdown = document.getElementById("destination-dropdown")
      const citizenshipDropdown = document.getElementById("citizenship-dropdown")
      const calendarElement = document.getElementById("calendar-dropdown")
      const dateButton = document.getElementById("travel-date")

      // For destination dropdown
      if (
        destinationDropdown &&
        destinationDropdown.style.display === "block" &&
        !document.getElementById("destination-search")?.contains(event.target as Node) &&
        !destinationDropdown.contains(event.target as Node)
      ) {
        destinationDropdown.style.display = "none"
      }

      // For citizenship dropdown
      if (
        citizenshipDropdown &&
        citizenshipDropdown.style.display === "block" &&
        !document.getElementById("citizenship-search")?.contains(event.target as Node) &&
        !citizenshipDropdown.contains(event.target as Node)
      ) {
        citizenshipDropdown.style.display = "none"
      }

      // For calendar dropdown
      if (
        calendarOpen &&
        calendarElement &&
        !calendarElement.contains(event.target as Node) &&
        !dateButton?.contains(event.target as Node)
      ) {
        setCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [calendarOpen])

  // Add custom calendar styling
  useEffect(() => {
    // Add custom styles for calendar hover effects
    const style = document.createElement("style")
    style.innerHTML = `
    /* Custom Calendar Styling */
    
    /* Calendar container */
    .rdp {
      --rdp-accent-color: #ea6e00;
      --rdp-background-color: #fff;
      margin: 0 !important;
      padding: 0 !important;
      font-family: inherit !important;
      background-color: #fff !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
      width: 320px !important;
    }
    
    /* Calendar dropdown container */
    #calendar-dropdown {
      background-color: #fff !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }
    
    /* Month container */
    .rdp-months {
      background-color: #fff !important;
      padding: 16px !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    
    /* Caption (month/year) */
    .rdp-caption {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      margin-bottom: 16px !important;
      background-color: #fff !important;
    }
    
    /* Month/year label */
    .rdp-caption_label {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #000 !important;
      padding: 0 !important;
    }
    
    /* Navigation buttons container */
    .rdp-nav {
      position: absolute !important;
      left: 0 !important;
      right: 0 ! important;
      display: flex !important;
      justify-content: space-between !important;
      width: 100% !important;
      z-index: 1 !important;
      background-color: transparent !important;
    }
    
    /* Navigation buttons */
    .rdp-nav_button {
      width: 32px !important;
      height: 32px !important;
      padding: 0 !important;
      border-radius: 50% !important;
      background-color: transparent !important;
      color: #666 !important;
      border: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
    }
    
    .rdp-nav_button:hover {
      background-color: #f5f5f5 !important;
      color: #000 !important;
    }
    
    /* Table */
    .rdp-table {
      width: 100% !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      background-color: #fff !important;
    }
    
    /* Weekday headers */
    .rdp-head_cell {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #666 !important;
      padding: 8px 0 16px 0 !important;
      background-color: #fff !important;
      text-align: center !important;
    }
    
    /* Day cells */
    .rdp-cell {
      padding: 0 !important;
      background-color: #fff !important;
      text-align: center !important;
    }
    
    /* Day buttons */
    .rdp-day {
      width: 40px !important;
      height: 40px !important;
      font-size: 14px !important;
      font-weight: 400 !important;
      border-radius: 0 !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      margin: 0 auto !important;
      background-color: transparent !important;
      color: #000 !important;
      border: none !important;
    }
    
    /* Day hover effect */
    .rdp-day:hover:not(.rdp-day_disabled) {
      background-color: #ea6e00 !important;
      color: white !important;
    }
    
    /* Selected day */
    .rdp-day_selected {
      background-color: #ea6e00 !important;
      color: white !important;
      font-weight: 500 !important;
    }
    
    .rdp-day_selected:hover {
      background-color: #ea6e00 !important;
      color: white !important;
    }
    
    /* Today's date */
    .rdp-day_today:not(.rdp-day_selected) {
      background-color: #fff8f3 !important;
      color: #ea6e00 !important;
      font-weight: 500 !important;
    }
    
    /* Disabled days */
    .rdp-day_disabled {
      opacity: 0.25 !important;
      cursor: not-allowed !important;
      color: #999 !important;
    }
    
    /* Outside days */
    .rdp-day_outside {
      color: #ccc !important;
    }
    
    /* Week row */
    .rdp-row {
      margin: 0 !important;
      background-color: #fff !important;
    }
    
    /* Focus state */
    .rdp-button:focus {
      outline: none !important;
    }
    
    /* Custom animation for calendar appearance */
    #calendar-dropdown {
      animation: calendarAppear 0.2s ease-out !important;
    }
    
    @keyframes calendarAppear {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to properly create organization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    setApiError(null)

    if (!formData.destination || !formData.citizenship || !date) {
      return
    }

    setLoading(true)

    try {
      // Step 1: Create organization to get vendor key
      console.log("Creating organization...")
      const orgResponse = await fetch("https://stg-api.superjetom.com/create_organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization_name: "Omantel"}),
      })

      if (!orgResponse.ok) {
        throw new Error(`Failed to create organization: ${orgResponse.status} ${orgResponse.statusText}`)
      }

      const orgData = await orgResponse.json()
      console.log("Organization created successfully", orgData)

      // Extract and store vendor key
      let vendorKey = ""
      if (orgData && orgData.result && orgData.result.length > 0 && orgData.result[0].vendor_key) {
        vendorKey = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", vendorKey)
        console.log("Vendor key stored successfully:", vendorKey)
      } else {
        throw new Error("No vendor key found in response")
      }

      // Format date for API in DD-MM-YYYY format
      const formattedDate = date ? format(date, "dd-MM-yyyy") : "12-04-2025"

      // Navigate to results page with query parameters
      router.push(
        `/visa-results?destination=${encodeURIComponent(formData.destination)}&citizenship=${encodeURIComponent(
          formData.citizenship,
        )}&travelDate=${encodeURIComponent(formattedDate)}`,
      )
    } catch (error) {
      console.error("Error submitting form:", error)
      setApiError(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-hayyak-background py-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">
        <div className="text-center mb-5xl">
          <h1 className="heading-1 mb-4">E-Visa Application Service</h1>
          <p className="body-large text-gray-600">Check your visa eligibility and apply online in minutes</p>
        </div>

        <div className="w-full max-w-3xl px-4 sm:px-0">
          <Card className="border-0 shadow-z1 bg-hayyak-white w-full">
            <CardContent className="px-6 sm:px-8 pb-8 pt-8">
              <form onSubmit={handleSubmit} className="space-y-5 w-full relative">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="label font-medium">
                    Destination Country
                  </Label>
                  <div className="relative">
                    <CustomInput
                      type="text"
                      id="destination-search"
                      placeholder="Search for a country..."
                      className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                      value={formData.destination}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, destination: e.target.value }))
                        const dropdown = document.getElementById("destination-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      onFocus={() => {
                        const dropdown = document.getElementById("destination-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      error={attemptedSubmit && !formData.destination ? "Please select a destination country" : ""}
                      success={formData.destination !== ""}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed"
                      onClick={() => {
                        const dropdown = document.getElementById("destination-dropdown")
                        if (dropdown) {
                          dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      id="destination-dropdown"
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto hidden transition-all duration-200"
                      style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
                    >
                      {countries.length > 0 ? (
                        countries
                          .filter(
                            (country) =>
                              formData.destination === "" ||
                              country.toLowerCase().includes(formData.destination.toLowerCase()),
                          )
                          .map((country) => (
                            <div
                              key={country}
                              className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, destination: country }))
                                const dropdown = document.getElementById("destination-dropdown")
                                if (dropdown) dropdown.style.display = "none"
                              }}
                            >
                              {country}
                            </div>
                          ))
                      ) : (
                        <div className="px-4 py-3 body-small text-gray-500">No countries found</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship" className="label font-medium">
                    Your Citizenship
                  </Label>
                  <div className="relative">
                    <CustomInput
                      type="text"
                      id="citizenship-search"
                      placeholder="Search for a country..."
                      className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                      value={formData.citizenship}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, citizenship: e.target.value }))
                        const dropdown = document.getElementById("citizenship-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      onFocus={() => {
                        const dropdown = document.getElementById("citizenship-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      error={attemptedSubmit && !formData.citizenship ? "Please select a citizenship country" : ""}
                      success={formData.citizenship !== ""}
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed"
                      onClick={() => {
                        const dropdown = document.getElementById("citizenship-dropdown")
                        if (dropdown) {
                          dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      id="citizenship-dropdown"
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto hidden transition-all duration-200"
                      style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
                    >
                      {countries.length > 0 ? (
                        countries
                          .filter(
                            (country) =>
                              formData.citizenship === "" ||
                              country.toLowerCase().includes(formData.citizenship.toLowerCase()),
                          )
                          .map((country) => (
                            <div
                              key={country}
                              className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, citizenship: country }))
                                const dropdown = document.getElementById("citizenship-dropdown")
                                if (dropdown) dropdown.style.display = "none"
                              }}
                            >
                              {country}
                            </div>
                          ))
                      ) : (
                        <div className="px-4 py-3 body-small text-gray-500">No countries found</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-date" className="label font-medium">
                    Travel Date
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      id="travel-date"
                      className="w-full h-12 px-4 text-left flex items-center body-small border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-[#ea6e00] transition-colors"
                      onClick={() => setCalendarOpen(!calendarOpen)}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-[#ea6e00]" />
                      {date ? format(date, "PPP") : "When are you traveling?"}
                    </button>

                    {calendarOpen && (
                      <div id="calendar-dropdown" className="absolute z-[100] mt-2 left-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate)
                            setCalendarOpen(false)
                          }}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    )}

                    {attemptedSubmit && !date && (
                      <div className="text-red-500 caption mt-1">Please select a travel date</div>
                    )}
                  </div>
                </div>

                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-l py-m rounded-md body-small">
                    {apiError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 body-large font-medium rounded-[16px] bg-[#ea6e00] hover:bg-[#ff7800] active:bg-[#b55500] text-white px-4xl py-3 disabled:bg-hayyak-moderate-grey disabled:text-hayyak-dark-grey mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-m"></div>
                      Searching...
                    </div>
                  ) : (
                    "Check Visa Requirements"
                  )}
                </Button>

                {loading && (
                  <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#b55500] shadow-sm flex items-center justify-center">
                      <div className="flex space-x-1 items-center justify-center h-full">
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
                        />
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "200ms", animationDuration: "0.6s" }}
                        />
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "400ms", animationDuration: "0.6s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="mt-4xl text-center">
            <p className="caption">Powered by Omantel eVisa Services. Fast, secure, and reliable visa processing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
