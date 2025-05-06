"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getVisaPrograms, initializeApi } from "@/lib/api"
import { Calendar, Check, Clock, DollarSign, Globe } from "lucide-react"
// Add import for the country utils
import { getCountryFlagUrl } from "@/lib/country-utils"
import { allCountries } from "@/lib/countries"

export default function VisaPrograms() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    destination: "",
    citizenship: "",
    purpose: "tourism",
    lengthofstay: 10,
  })
  const [visaPrograms, setVisaPrograms] = useState<any[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const [travelDate, setTravelDate] = useState("")
  const [processingOrder, setProcessingOrder] = useState(false)
  const [flagErrors, setFlagErrors] = useState<Record<string, boolean>>({})
  const [countries, setCountries] = useState<any[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  // Add a state variable to track errors
  const [error, setError] = useState<string | null>(null)

  // Initialize API and check status
  useEffect(() => {
    async function initApi() {
      try {
        // Initialize API
        await initializeApi()
        setLoading(false)
      } catch (error) {
        console.error("Failed to initialize API:", error)
        setLoading(false)
      }
    }

    initApi()
  }, [])

  // Fetch countries from API
  const fetchCountries = () => {
    if (countries.length > 0) {
      setLoadingCountries(false)
      return
    }

    setLoadingCountries(true)
    try {
      // Simply use the static country list without API calls
      setCountries(allCountries.map((country) => ({ name: country, code: "" })))
    } catch (error) {
      console.error("Error setting up countries:", error)
    } finally {
      setLoadingCountries(false)
    }
  }

  // Add a useEffect to fetch countries on component mount
  useEffect(() => {
    if (!loading && countries.length === 0) {
      fetchCountries()
    }
  }, [loading, countries.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSearch function to handle API errors without falling back to mock data
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVisaPrograms([])
    setError(null) // Add this line to track errors

    try {
      // Format the travel date for the API in DD-MM-YYYY format as required by the API
      const today = new Date()
      const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getFullYear()}`

      console.log("Searching for visa programs with params:", {
        destination: formData.destination.toLowerCase(),
        citizenship: formData.citizenship.toLowerCase(),
        arrivalDate: formattedDate,
      })

      const data = await getVisaPrograms({
        destination: formData.destination.toLowerCase(), // API expects lowercase
        citizenship: formData.citizenship.toLowerCase(), // API expects lowercase
        arrivalDate: formattedDate,
      })

      console.log("Visa programs API response:", data)

      if (data && data.programs && Array.isArray(data.programs) && data.programs.length > 0) {
        console.log("Visa programs found:", data.programs)
        setVisaPrograms(data.programs)

        // Store the entire response in localStorage
        localStorage.setItem("visa_programs_data", JSON.stringify(data))
        console.log("Stored visa programs data in localStorage")

        // Store the first program ID for easy access
        if (data.programs[0].id) {
          localStorage.setItem("program_id", data.programs[0].id)
          console.log("Stored program ID in localStorage:", data.programs[0].id)
        }
      } else {
        console.log("No visa programs found or invalid response format")
        setError("No visa programs found for the selected criteria. Please try different options.")
      }
      setSearchPerformed(true)
    } catch (error) {
      console.error("Failed to fetch visa programs:", error)
      setError("Failed to fetch visa programs. Please check your connection and try again.")
      setSearchPerformed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program)
  }

  // Update the handleApply function to ensure programId is correctly passed to the visa application page
  const handleApply = async () => {
    if (!selectedProgram || !travelDate) {
      alert("Please select a travel date")
      return
    }

    setProcessingOrder(true)

    try {
      // Ensure we have the program ID
      const programId = selectedProgram.id || ""

      if (!programId) {
        console.error("No program ID found in selected program:", selectedProgram)
        alert("Missing program ID. Please select a different visa program.")
        setProcessingOrder(false)
        return
      }

      console.log("Selected program details:", {
        programId: programId,
        programName: selectedProgram.program_name || selectedProgram.name || "",
        fee: selectedProgram.fee || 0,
        commission: selectedProgram.commision || "0",
        commissionType: selectedProgram.commision_type || "flat rate",
      })

      // Navigate to visa application page with query parameters
      router.push(
        `/visa-application?destination=${encodeURIComponent(formData.destination)}&citizenship=${encodeURIComponent(
          formData.citizenship,
        )}&travelDate=${encodeURIComponent(travelDate)}&visaType=${encodeURIComponent(
          selectedProgram.program_name || selectedProgram.name || "",
        )}&visaFee=${encodeURIComponent(selectedProgram.fee || 0)}&programId=${encodeURIComponent(
          programId,
        )}&commission=${encodeURIComponent(selectedProgram.commision || "0")}&commissionType=${encodeURIComponent(
          selectedProgram.commision_type || "flat rate",
        )}`,
      )
    } catch (error) {
      console.error("Error processing visa application:", error)
      alert("There was an error processing your application. Please try again.")
    } finally {
      setProcessingOrder(false)
    }
  }

  // Add a function to handle flag loading errors
  const handleFlagError = (countryName: string) => {
    setFlagErrors((prev) => ({ ...prev, [countryName]: true }))
  }

  // Add a function to display country flags in the visa programs list
  const getCountryFlag = (countryName: string) => {
    // If we've already had an error with this flag, use the placeholder
    if (flagErrors[countryName]) {
      return `/placeholder.svg?height=64&width=64&query=flag%20of%20${encodeURIComponent(countryName)}`
    }

    return getCountryFlagUrl(countryName)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Travel Details</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Country</Label>
                  <Select
                    value={formData.destination}
                    onValueChange={(value) => handleSelectChange("destination", value)}
                    required
                    disabled={loadingCountries}
                    onOpenChange={(open) => {
                      if (open) fetchCountries()
                    }}
                  >
                    <SelectTrigger id="destination" className="omantel-input">
                      <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select destination"} />
                    </SelectTrigger>
                    <SelectContent className="h-[300px] overflow-y-auto">
                      {countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem key={country.code || country.name} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {loadingCountries ? "Loading countries..." : "No countries available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship">Your Citizenship</Label>
                  <Select
                    value={formData.citizenship}
                    onValueChange={(value) => handleSelectChange("citizenship", value)}
                    required
                    disabled={loadingCountries}
                    onOpenChange={(open) => {
                      if (open) fetchCountries()
                    }}
                  >
                    <SelectTrigger id="citizenship" className="omantel-input">
                      <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select citizenship"} />
                    </SelectTrigger>
                    <SelectContent className="h-[300px] overflow-y-auto">
                      {countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem key={country.code || country.name} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {loadingCountries ? "Loading countries..." : "No countries available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Travel</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => handleSelectChange("purpose", value)}
                    required
                  >
                    <SelectTrigger id="purpose" className="omantel-input">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourism">Tourism</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lengthofstay">Length of Stay (days)</Label>
                  <Input
                    id="lengthofstay"
                    name="lengthofstay"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.lengthofstay}
                    onChange={handleInputChange}
                    required
                    className="omantel-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading || loadingCountries}
                >
                  {loading ? "Searching..." : loadingCountries ? "Loading countries..." : "Search Visa Programs"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading visa programs...</p>
                </div>
              </div>
            ) : searchPerformed ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Available Visa Programs</h2>
                {error ? (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-600">{error}</p>
                    <Button
                      onClick={() => setSearchPerformed(false)}
                      className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {visaPrograms.length > 0 ? (
                      visaPrograms.map((program, index) => (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-all ${
                            selectedProgram?.id === program.id ? "ring-blue-600 ring-2" : "hover:shadow-md"
                          }`}
                          onClick={() => handleProgramSelect(program)}
                        >
                          <CardContent className="p-6">
                            {/* Add this inside the CardContent, at the beginning: */}
                            <div className="flex items-center gap-2 mb-4">
                              <img
                                src={getCountryFlag(formData.destination) || "/placeholder.svg"}
                                alt={`${formData.destination} flag`}
                                className="w-8 h-6 object-cover rounded-sm shadow-sm"
                                onError={() => handleFlagError(formData.destination)}
                              />
                              <span className="text-sm text-gray-500">
                                {formData.destination} visa for {formData.citizenship} citizens
                              </span>
                            </div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{program.program_name || program.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {program.program_type || program.type || "Tourist"} Visa
                                </p>
                              </div>
                              {selectedProgram?.id === program.id && (
                                <div className="bg-blue-600 text-white rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span>
                                  Processing:{" "}
                                  {program.suggested_processing_time
                                    ? `${program.suggested_processing_time} days`
                                    : program.processing_time || "3-5 business days"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>Validity: {program.validity || "90 days"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <span>
                                  Entries: {program.max_entries === "0.0" ? "Multiple" : program.entries || "Single"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                <span>
                                  Fee: {program.fee} {program.currency || "USD"}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                              {program.description?.body ||
                                program.description ||
                                "Standard visa for temporary visits."}
                            </p>

                            {selectedProgram?.id === program.id && (
                              <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="travel-date">Travel Date</Label>
                                  <Input
                                    id="travel-date"
                                    type="date"
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                    className="omantel-input"
                                  />
                                </div>
                                <Button
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                  onClick={handleApply}
                                  disabled={processingOrder || !travelDate}
                                >
                                  {processingOrder ? "Processing..." : "Apply Now"}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10">
                        <p className="text-gray-500">No visa programs found for the selected criteria.</p>
                        <p className="text-sm text-gray-400 mt-2">Try different destination or citizenship options.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <img src="/global-connections.png" alt="Search for Visa" className="h-48 w-48 mb-4" />
                <h2 className="text-xl font-semibold">Find Your Perfect Visa</h2>
                <p className="mt-2 text-gray-600">
                  Enter your travel details to discover available visa options for your journey.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
