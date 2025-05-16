"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useCountryList } from "@/lib/countries"
import ApiDebugPanel from "@/components/api-debug-panel"
import { createTravellerOmantel, createIframeOrderVisaOmantel, generateReferenceNumber } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"
import { CustomInput } from "@/components/ui/custom-input"


export default function VisaApplication() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get query parameters with fallbacks
  const destination = localStorage.getItem("visa_destination") || "";
  const citizenship =  localStorage.getItem("visa_citizenship") || "";

  const travelDate =  localStorage.getItem("visa_travelDate") || "";
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
    const [searchData,setSearchData]=useState({
      country:""
    })

  const [attemptedSubmit,setAttemptedSubmit]=useState(false);
const { countries, loading, error } = useCountryList();

const firstNameRef=useRef<HTMLInputElement>(null);
const lastNameRef=useRef<HTMLInputElement>(null);
const emailRef=useRef<HTMLInputElement>(null);
const countrySearchRef=useRef<HTMLInputElement>(null);
const phoneNoRef=useRef<HTMLInputElement>(null);
const [userInfo,setUserInfo]=useState();

const formRef=useRef({firstName:firstNameRef,lastName:lastNameRef,email:emailRef,country:countrySearchRef,phone:phoneNoRef})

  // Add these state variables at the top of the component with the other state variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // // Try to recover data from localStorage if URL parameters are missing
  // useEffect(() => {
  //   if (!destination || !citizenship || !programId) {
  //     try {
  //       const storedVisaData = localStorage.getItem("selected_visa_data")
  //       const storedProgramsData = localStorage.getItem("visa_programs_data")

  //       if (storedVisaData) {
  //         const parsedData = JSON.parse(storedVisaData)
  //         // Use the stored data to fill in missing parameters
  //       }
  //     } catch (error) {
  //       console.error("Error recovering data from localStorage:", error)
  //     }
  //   }
  // }, [destination, citizenship, programId])

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

  const get_id_token =localStorage.getItem("id_token");

  useEffect(()=>{

    const fetchUserData=async(id_token:string)=>{
      debugger
  try {
  
      const response = await fetch('https://stg-api.superjetom.com/omanteluserdata', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer "+id_token
        }
      });

      if (!response.ok) {
        throw new Error(`Token fetch failed with status: ${response.status}`);
      }

      const data = await response.json();
      if(data.message==="success"){
        // console.log(data.result);
        setUserInfo(data.result);
      
  const user_data=data.result;
        const userInfo={
              firstName:user_data["custom:firstName"],
              lastName:user_data["custom:lastName"],
              email:user_data["custom:email"],
              phone:user_data["phone_number"] || "",
              building: "",
              floor: "",
              apartment: "",
              street: "",
              city: "",
              state:"",
              country: citizenship || "",
              marketingConsent: false,
        }

        setFormData(userInfo);
        setSearchData({country:citizenship});
      }


      // console.log('Token fetched successfully:', data);
    }
   catch (error) {
    console.error('Failed to initialize API:', error);
  
  }
    }
    if(get_id_token){
      debugger
      fetchUserData(get_id_token);
    }
  },[get_id_token])




  // Update the handleSubmit function to better handle API errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
   
    // Store form data in localStorage for recovery
    localStorage.setItem("visa_application_form", JSON.stringify(formData))
    // localStorage.setItem("visa_destination", destination)
    // localStorage.setItem("visa_citizenship", citizenship)
    localStorage.setItem("visa_type", visaType)
    localStorage.setItem("visa_fee", visaFee)
    localStorage.setItem("program_id", programId || "")

    try {
      // Step 1: Create traveller in Omantel system
      setAttemptedSubmit(true);
     
      const fields:String[] =["firstName","lastName","email","country","phone"];
      for(let i=0;i<fields.length;i++){
        const key=fields[i] as keyof typeof formData;
          if(!formData[key]){
    const inputRef = formRef.current[key as keyof typeof formRef.current];
    inputRef?.current?.focus();
      return;
      }
      }
     
      

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

    
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const dropdown = document.getElementById("country-dropdown");
    const searchInput = document.getElementById("country-search");

    const isDropdownVisible = dropdown && dropdown.style.display !== "none";

    const clickedOutside =
      dropdown &&
      !dropdown.contains(event.target as Node) &&
      searchInput &&
      !searchInput.contains(event.target as Node);

    if (isDropdownVisible && clickedOutside) {
      dropdown.style.display = "none";
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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
              <form autoComplete="off" onSubmit={handleSubmit} className="space-y-8"  >
                {/* Personal Information */}
                <div>
                  <h3 className="heading-4 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="label">
                        First Name *
                      </Label>
                      <CustomInput
                        id="firstName"
                        ref={firstNameRef}
                        name="firstName"
                          className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                         error={attemptedSubmit && !formData.firstName ? "First name is required." : ""}
                      success={formData.firstName !== ""}
                       
                      />
                     
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="label">
                        Last Name *
                      </Label>
                      <CustomInput
                        id="lastName"
                        name="lastName"
                        ref={lastNameRef}
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                         error={attemptedSubmit && !formData.lastName ? "Last name is required." : ""}
                      success={formData.lastName !== ""}
                        
                      />
                    </div>
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label htmlFor="email" className="label">
                        Email *
                      </Label>
                      <CustomInput
                        id="email"
                        name="email"
                        type="email"
                        ref={emailRef}
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        error={attemptedSubmit && !formData.email ? "Email is required." : ""}
                      success={formData.email !== ""}
                        
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
                      <CustomInput
                        id="building"
                        name="building"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.building}
                        onChange={handleInputChange}
                        placeholder="Building name/number"
                         success={formData.building !== ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor" className="label">
                        Floor
                      </Label>
                      <CustomInput
                        id="floor"
                        name="floor"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="Floor number"
                         success={formData.floor !== ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment" className="label">
                        Apartment
                      </Label>
                      <CustomInput
                        id="apartment"
                        name="apartment"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Apartment number"
                        success={formData.apartment !== ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street" className="label">
                        Street
                      </Label>
                      <CustomInput
                        id="street"
                        name="street"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Street name"
                        success={formData.street !== ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="label">
                        City
                      </Label>
                      <CustomInput
                        id="city"
                        name="city"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        success={formData.city !== ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="label">
                        State
                      </Label>
                    <CustomInput
                        id="state"
                        name="state"
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State/Province/Region"
                         success={formData.state !== ""}
                      />
                    </div>
                    {/* <div className="space-y-2 ">
                      <Label htmlFor="country" className="label">
                        Country *
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                                      <Label htmlFor="destination" className="label font-medium">
                                       Country *
                                      </Label>
                                      <div className="relative">
                                        <CustomInput
                                          type="text"
                                          id="country-search"
                                          ref={countrySearchRef}
                                          autoComplete="off"
                                          placeholder="Search for a country..."
                                          className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                                          value={searchData.country}
                                          onChange={(e) => {
                                            const destination =searchData.country;
                                            if(e.target.value.length<destination.length){
                                                setFormData((prev) => ({ ...prev, country:"" }))
                                            }
                                            setSearchData((prev) => ({ ...prev, country: e.target.value }))
                                            const dropdown = document.getElementById("country-dropdown")
                                            if (dropdown) dropdown.style.display = "block"
                                          }}
                                          onFocus={() => {
                                            const dropdown = document.getElementById("country-dropdown")
                                            if (dropdown){

                                             dropdown.style.display = "block";
                                            }
                                          }}
                                          error={attemptedSubmit && !formData.country ? "Please select a destination country" : ""}
                                          success={formData.country !== ""}
                                        />
                                        <button
                                          type="button"
                                          className="absolute right-0 top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed"
                                          onClick={() => {
                                            const dropdown = document.getElementById("country-dropdown")
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
                                          id="country-dropdown"
                                          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto hidden transition-all duration-200"
                                          style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
                                        >
                                          {countries.length > 0 ? (
                                            countries
                                              .filter(
                                                (country) =>
                                                  searchData.country === "" ||
                                                  country.toLowerCase().includes(searchData.country.toLowerCase()),
                                              )
                                              .map((country) => (
                                                <div
                                                  key={country}
                                                  className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                                  onClick={() => {
                                                    setFormData((prev) => ({ ...prev, country: country }))
                                                    setSearchData((prev) => ({ ...prev, country: country }))
                                                    const dropdown = document.getElementById("country-dropdown")
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
                      <CustomInput
                        id="phone"
                        name="phone"
                        ref={phoneNoRef}
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        success={formData.phone !== ""}
                        error={attemptedSubmit && !formData.phone ? "Phone no is required." : ""}
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
                    className={`w-full ${[formData.marketingConsent?"bg-[#ea6e00]":"bg-[grey]"]} hover:bg-[#ff7800] active:bg-[#b55500] text-white py-6 body-large font-medium rounded-[16px] min-h-[56px]`}
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
