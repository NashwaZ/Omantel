"use client"

import { useEffect, useState } from "react"
import { AlertCircle, WifiOff,CheckCircle2,Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoadingIndicator from "@/components/loading-indicator"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { getVisaPrograms } from "@/lib/api"
import { sendEventMsgToCEPApp } from "@/lib/api"
import { useTranslation } from "react-i18next"
import {getVendorKey, createCartUserApplication } from "@/lib/api"
import "@/lib/i18n"
import config from "@/lib/api-config"

const VisaResultsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [isSubmitLoad,setIsSubmitLoad]=useState(false);
  const [error, setError] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState(false)
  const [visaPrograms, setVisaPrograms] = useState<any[]>([])
  const [usingMockData, setUsingMockData] = useState(false)
  const [countryFlags, setCountryFlags] = useState<{ from?: string; to?: string }>({})
    const [locale,setLocale]=useState("en");

     const { t , i18n } = useTranslation();

     const base_url=config.BASE_URL;

  // Get query parameters
  const destination = searchParams?.get("destination") || "Unknown Destination"
  const citizenship = searchParams?.get("citizenship") || "Unknown Citizenship"
  const travelDate = searchParams?.get("travelDate") || new Date().toISOString()

  // State for country images and converted fees
  const [countryImages, setCountryImages] = useState<Record<string, string>>({})
  const [convertedFees, setConvertedFees] = useState<Record<string, string>>({})

  const [visaHistory,setVisaHistory]=useState([]);



 
  

  // Ensure visaPrograms is always an array before rendering
  const safeVisaPrograms = Array.isArray(visaPrograms) ? visaPrograms : []

  // Helper function to safely render text content
  const safeRenderText = (content: any): string => {
    if (content === null || content === undefined) {
      return ""
    }
    if (typeof content === "string") {
      return content
    }
    if (typeof content === "number" || typeof content === "boolean") {
      return content.toString()
    }
    if (typeof content === "object") {
      // If it's an object, return a placeholder instead of trying to render it
      return "[Object]"
    }
    return ""
  }

  // Helper function to safely access object properties
  const safeGetProperty = (obj: any, path: string, defaultValue: any = ""): any => {
    if (!obj) return defaultValue

    const keys = path.split(".")
    let result = obj

    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== "object") {
        return defaultValue
      }
      result = result[key]
    }

    return result !== undefined ? result : defaultValue
  }

    useEffect(()=>{
      // const get_headers_data=localStorage.getItem("sso_header");
      // if(get_headers_data){
      //   const parse_header=JSON.parse(get_headers_data);
      //   // setHeader(parse_header);
      //   const get_locale = parse_header.language;
      //   setLocale(get_locale);
      // }
 

      // const get_headers_data=localStorage.getItem("sso_header");
      // if(get_headers_data){
      //   const parse_header=JSON.parse(get_headers_data);
      //   setHeader(parse_header);
      //   const get_locale = parse_header.language;
      //   setLocale(get_locale);
          
      // i18n.changeLanguage(get_locale).then(()=>{
      //      updateHtmlAttributes(get_locale);
      // })
     
      // }
      const getLanguage=localStorage.getItem("app_language");
      if(getLanguage){
      setLocale(getLanguage);
      }
 
    },[])

      useEffect(() => {
  if(locale=="en" || locale=="ar"){  
    i18n.changeLanguage(locale); // Force change on client
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'; // Set direction
    }
  }, [locale]);
  

  useEffect(() => {
    const fetchVisaPrograms = async () => {
      try {
        setLoading(true)

        // Format the request parameters
        const params = {
          destination: destination,
          citizenship: citizenship,
          arrivalDate: travelDate,
        }

        console.log("Fetching visa programs with params:", params)

        // Call the API function
        const response = await getVisaPrograms(params)

        console.log("Visa programs response:", response)

        // More detailed logging of the response structure
        console.log("Raw API Response:", JSON.stringify(response, null, 2))
        console.log("Response Keys:", Object.keys(response || {}))
        if (response && response.result) {
          console.log("Result Keys:", Object.keys(response.result))
          console.log("Result Type:", typeof response.result)
          if (Array.isArray(response.result)) {
            console.log("Result is Array with length:", response.result.length)
            if (response.result.length > 0) {
              console.log("First item in result array:", response.result[0])
            }
          } else if (typeof response.result === "object") {
            console.log("Result is Object with keys:", Object.keys(response.result))
            if (response.result.programs) {
              console.log("Programs type:", typeof response.result.programs)
              console.log("Programs is array:", Array.isArray(response.result.programs))
              if (Array.isArray(response.result.programs) && response.result.programs.length > 0) {
                console.log("First program:", response.result.programs[0])
              }
            }
          }
        }

        // Process and sanitize the data before setting state
        const processPrograms = (programs: any[]): any[] => {
          return programs.map((program) => {
            // Create a sanitized copy of the program
            const sanitizedProgram: any = {}

            // Process each field to ensure it's safe to render
            Object.keys(program).forEach((key) => {
              const value = program[key]

              // Handle specific fields that might be objects
              if (
                key === "description" ||
                key === "notes" ||
                key === "additional_info" ||
                key === "embassy_info" ||
                key === "restrictions"
              ) {
                if (typeof value === "object" && value !== null) {
                  // If it's an object with a 'body' property, use that
                  if (value.body) {
                    sanitizedProgram[key] = typeof value.body === "string" ? value.body : JSON.stringify(value.body)
                  } else {
                    // Otherwise stringify the object
                    sanitizedProgram[key] = JSON.stringify(value)
                  }
                } else {
                  sanitizedProgram[key] = value
                }
              }
              // Handle requirements and documents which should be arrays
              else if ((key === "requirements" || key === "documents") && Array.isArray(value)) {
                sanitizedProgram[key] = value.map((item) => {
                  if (typeof item === "string") return item
                  if (typeof item === "object" && item !== null) {
                    // If it's an object with a name or description, use that
                    return item.name || item.description || JSON.stringify(item)
                  }
                  return String(item)
                })
              }
              // For all other fields, just copy them
              else {
                sanitizedProgram[key] = value
              }
            })

            return sanitizedProgram
          })
        }

        // Enhanced response handling with better fallbacks
        if (response) {
          // Case 1: Nested programs structure
          if (response.result && response.result.programs && Array.isArray(response.result.programs)) {
            console.log("Found programs in nested structure:", response.result.programs)
            const sanitizedPrograms = processPrograms(response.result.programs)
            setVisaPrograms(sanitizedPrograms)

            // Store country flags if available
            if (response.country_flags) {
              setCountryFlags(response.country_flags)
              console.log("Country flags found:", response.country_flags)
            }

            // Store program IDs for later use
            if (sanitizedPrograms.length > 0) {
              const programIds = sanitizedPrograms
                .filter((program) => program && program.id)
                .map((program) => program.id)

              localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
              console.log("Stored program IDs from nested structure:", programIds)
            }

            setUsingMockData(false)
          }
          // Case 2: Direct array in result
          else if (response.result && Array.isArray(response.result)) {
            console.log("Found programs in direct structure:", response.result)
            const sanitizedPrograms = processPrograms(response.result)
            setVisaPrograms(sanitizedPrograms)

            if (sanitizedPrograms.length > 0) {
              const programIds = sanitizedPrograms
                .filter((program) => program && program.id)
                .map((program) => program.id)

              localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
              console.log("Stored program IDs:", programIds)
            }

            setUsingMockData(false)
          }
          // Case 3: Result is an object that needs to be converted to array
          else if (response.result && typeof response.result === "object") {
            // Try to extract programs from the object
            const extractedPrograms = Object.values(response.result)
            if (Array.isArray(extractedPrograms) && extractedPrograms.length > 0) {
              console.log("Extracted programs from object:", extractedPrograms)
              const sanitizedPrograms = processPrograms(extractedPrograms)
              setVisaPrograms(sanitizedPrograms)

              const programIds = sanitizedPrograms
                .filter((program) => program && program.id)
                .map((program) => program.id)

              if (programIds.length > 0) {
                localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
                console.log("Stored program IDs from extracted programs:", programIds)
              }

              setUsingMockData(false)
              return
            }

            // Case 4: Programs might be directly in the response
            const programsInResponse = response.programs
            if (programsInResponse && Array.isArray(programsInResponse) && programsInResponse.length > 0) {
              console.log("Found programs directly in response:", programsInResponse)
              const sanitizedPrograms = processPrograms(programsInResponse)
              setVisaPrograms(sanitizedPrograms)

              const programIds = sanitizedPrograms
                .filter((program) => program && program.id)
                .map((program) => program.id)

              if (programIds.length > 0) {
                localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
                console.log("Stored program IDs from response programs:", programIds)
              }

              setUsingMockData(false)
              return
            }

            // If we got here, we couldn't find a valid programs array
            console.log("No valid programs structure found, using mock data")
            setVisaPrograms([
              {
                id: "mock_program_1",
                program_name: "Tourist Visa",
                fee: "50",
                suggested_processing_time: "5-7",
                max_stay: "30",
                validity: "90",
                max_entries: "1.0",
                available: true,
                requirements: ["Passport", "Photo", "Travel Itinerary"],
              },
              {
                id: "mock_program_2",
                program_name: "Business Visa",
                fee: "100",
                suggested_processing_time: "7-10",
                max_stay: "60",
                validity: "180",
                max_entries: "Multiple",
                available: true,
                requirements: ["Passport", "Business Letter", "Invitation"],
              },
            ])
            setUsingMockData(true)
          } else {
            // No valid data found
            console.log("No valid data structure found in response:", response)
            setVisaPrograms([
              {
                id: "mock_program_1",
                program_name: "Tourist Visa",
                fee: "50",
                suggested_processing_time: "5-7",
                max_stay: "30",
                validity: "90",
                max_entries: "1.0",
                available: true,
                requirements: ["Passport", "Photo", "Travel Itinerary"],
              },
            ])
            setUsingMockData(true)
          }
        } else {
          // No response at all
          console.error("No response received from API")
          setError("Failed to fetch visa programs. Please try again.")
          setNetworkError(true)
          setVisaPrograms([
            {
              id: "mock_program_1",
              program_name: "Tourist Visa (Fallback)",
              fee: "50",
              suggested_processing_time: "5-7",
              max_stay: "30",
              validity: "90",
              max_entries: "1.0",
              available: true,
              requirements: ["Passport", "Photo", "Travel Itinerary"],
            },
          ])
          setUsingMockData(true)
        }
      } catch (err) {
        console.error("Error fetching visa programs:", err)
        setError("Failed to fetch visa programs. Please try again.")
        setNetworkError(true)

        // Use mock data as fallback
        setVisaPrograms([
          {
            id: "mock_program_1",
            program_name: "Tourist Visa (Fallback)",
            fee: "50",
            suggested_processing_time: "5-7",
            max_stay: "30",
            validity: "90",
            max_entries: "1.0",
            available: true,
            requirements: ["Passport", "Photo", "Travel Itinerary"],
          },
        ])
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchVisaPrograms()
  }, [destination, citizenship, travelDate])

  // Modify the useEffect for converting fees
  useEffect(() => {
    if (safeVisaPrograms.length > 0) {
      const convertFee = async (currency:string,fee: string, programId: string) => {
        try {
          const response = await fetch(base_url+"/amount_convertion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: fee,
              currency: currency ,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.result) {
              setConvertedFees((prev) => ({
                ...prev,
                [programId]: Number(data.result).toFixed(3),
              }))
            }
          } 
        } catch (error) {
          console.error("Error converting currency:", error)
          // Fallback conversion if API fails
          setConvertedFees((prev) => ({
            ...prev,
            [programId]: (Number.parseFloat(fee) * 0.385).toFixed(3),
          }))
        }
      }

      // Convert fees for each program
      safeVisaPrograms.forEach((program) => {
        if (program.fee && program.id) {
          const feeValue = typeof program.fee === "string" ? program.fee : String(program.fee)
          const currency = typeof program.currency === "string" ? program.currency : String(program.fee)
          convertFee(currency,feeValue, program.id)
        }
      })
    }
  }, [safeVisaPrograms])

  // Handlers
  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setNetworkError(false)

    // Re-fetch the data - we'll reuse the same fetchVisaPrograms logic from the first useEffect
    const fetchVisaPrograms = async () => {
      try {
        const params = {
          destination: destination,
          citizenship: citizenship,
          arrivalDate: travelDate,
        }

        const response = await getVisaPrograms(params)

        // Process and sanitize the data before setting state
        const processPrograms = (programs: any[]): any[] => {
          return programs.map((program) => {
            // Create a sanitized copy of the program
            const sanitizedProgram: any = {}

            // Process each field to ensure it's safe to render
            Object.keys(program).forEach((key) => {
              const value = program[key]

              // Handle specific fields that might be objects
              if (
                key === "description" ||
                key === "notes" ||
                key === "additional_info" ||
                key === "embassy_info" ||
                key === "restrictions"
              ) {
                if (typeof value === "object" && value !== null) {
                  // If it's an object with a 'body' property, use that
                  if (value.body) {
                    sanitizedProgram[key] = typeof value.body === "string" ? value.body : JSON.stringify(value.body)
                  } else {
                    // Otherwise stringify the object
                    sanitizedProgram[key] = JSON.stringify(value)
                  }
                } else {
                  sanitizedProgram[key] = value
                }
              }
              // Handle requirements and documents which should be arrays
              else if ((key === "requirements" || key === "documents") && Array.isArray(value)) {
                sanitizedProgram[key] = value.map((item) => {
                  if (typeof item === "string") return item
                  if (typeof item === "object" && item !== null) {
                    // If it's an object with a name or description, use that
                    return item.name || item.description || JSON.stringify(item)
                  }
                  return String(item)
                })
              }
              // For all other fields, just copy them
              else {
                sanitizedProgram[key] = value
              }
            })

            return sanitizedProgram
          })
        }

        // Enhanced response handling with better fallbacks
        if (response) {
          // Case 1: Nested programs structure
          if (response.result && response.result.programs && Array.isArray(response.result.programs)) {
            console.log("Found programs in nested structure:", response.result.programs)
            const sanitizedPrograms = processPrograms(response.result.programs)
            setVisaPrograms(sanitizedPrograms)

            // Store country flags if available
            if (response.country_flags) {
              setCountryFlags(response.country_flags)
              console.log("Country flags found:", response.country_flags)
            }

            setUsingMockData(false)
          }
          // Case 2: Direct array in result
          else if (response.result && Array.isArray(response.result)) {
            console.log("Found programs in direct structure:", response.result)
            const sanitizedPrograms = processPrograms(response.result)
            setVisaPrograms(sanitizedPrograms)
            setUsingMockData(false)
          }
          // Case 3: Result is an object that needs to be converted to array
          else if (response.result && typeof response.result === "object") {
            // Try to extract programs from the object
            const extractedPrograms = Object.values(response.result)
            if (Array.isArray(extractedPrograms) && extractedPrograms.length > 0) {
              console.log("Extracted programs from object:", extractedPrograms)
              const sanitizedPrograms = processPrograms(extractedPrograms)
              setVisaPrograms(sanitizedPrograms)
              setUsingMockData(false)
              return
            }

            // Case 4: Programs might be directly in the response
            const programsInResponse = response.programs
            if (programsInResponse && Array.isArray(programsInResponse) && programsInResponse.length > 0) {
              console.log("Found programs directly in response:", programsInResponse)
              const sanitizedPrograms = processPrograms(programsInResponse)
              setVisaPrograms(sanitizedPrograms)
              setUsingMockData(false)
              return
            }

            // If we got here, we couldn't find a valid programs array
            console.log("No valid programs structure found, using mock data")
            setVisaPrograms([
              {
                id: "mock_program_1",
                program_name: "Tourist Visa",
                fee: "50",
                suggested_processing_time: "5-7",
                max_stay: "30",
                validity: "90",
                max_entries: "1.0",
                available: true,
                requirements: ["Passport", "Photo", "Travel Itinerary"],
              },
            ])
            setUsingMockData(true)
          } else {
            // No valid data found
            console.log("No valid data structure found in response:", response)
            setVisaPrograms([
              {
                id: "mock_program_1",
                program_name: "Tourist Visa",
                fee: "50",
                suggested_processing_time: "5-7",
                max_stay: "30",
                validity: "90",
                max_entries: "1.0",
                available: true,
                requirements: ["Passport", "Photo", "Travel Itinerary"],
              },
            ])
            setUsingMockData(true)
          }
        } else {
          // No response at all
          console.error("No response received from API")
          setError("Failed to fetch visa programs. Please try again.")
          setNetworkError(true)
          setVisaPrograms([
            {
              id: "mock_program_1",
              program_name: "Tourist Visa (Fallback)",
              fee: "50",
              suggested_processing_time: "5-7",
              max_stay: "30",
              validity: "90",
              max_entries: "1.0",
              available: true,
              requirements: ["Passport", "Photo", "Travel Itinerary"],
            },
          ])
          setUsingMockData(true)
        }
      } catch (err) {
        console.error("Error retrying fetch:", err)
        setError("Failed to fetch visa programs. Please try again.")
        setNetworkError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchVisaPrograms()
  }

  const handleBack = () => {
    router.back()
  }

  const handleApply = async(programId: string) => {
    

    if(visaHistory.length>5){
      return;
    }
    debugger
    setIsSubmitLoad(true);
    localStorage.setItem("visa_citizenship",citizenship);
    localStorage.setItem("visa_destination",destination);
  
const [day, month, year] = travelDate.split("-");
const travel_date = new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD

  const formatDate = travel_date.toISOString().slice(0, 10);
  console.log(formatDate); // "2025-10-23"

    localStorage.setItem("visa_travelDate",formatDate);

      const get_user_data=localStorage.getItem("user_info_cep");
      const parse_user_data = get_user_data?JSON.parse(get_user_data):"";

    console.log("Applying for program with ID:", programId)
    

    // Store the selected program ID for the iframe API
    localStorage.setItem("selected_program_id", programId)
    const get_user=localStorage.getItem("user_info_cep");
    const userInfo=get_user?JSON.parse(get_user):"";
      const auth_token=localStorage.getItem("sso_header");
    const header=auth_token?JSON.parse(auth_token):"";
    const accessToken=header?.authorization;
    const visa_program=safeVisaPrograms[0];
    const visa_info={  
     "user_id" : parse_user_data?.id,
      "traveller_id" : null , //travellerResponse.result[0].id, 
       "destination" : destination.toLowerCase(), 
      "citizenship" :  citizenship.toLowerCase(),
      "citizenship_code" : visa_program?.citizenship,
      "destination_code" : visa_program?.destination,
      "travel_date":formatDate,
      "program_id" : visa_program?.id,
      "fee" : visa_program?.fee,
      "currency":visa_program?.currency ,
      "commission" : visa_program?.commision,
      "commission_type" : visa_program?.commision_type || "flat rate",
      "deleted":"no"
    }
    const vendor_key =await getVendorKey();
        
          try {
         
         
            const cardResponse =await createCartUserApplication(vendor_key,visa_info);
            localStorage.setItem("added_cart_details",JSON.stringify(cardResponse));
          }catch(err){
             console.error("adding evisa to cartgood to go Api : ",err);
          }
    const eventDetails = {
      sub_type: "Visa Application",
      description: "User is applying for a visa."
    };

          await sendEventMsgToCEPApp(eventDetails,userInfo,accessToken)
setIsSubmitLoad(false)
    // Navigate to the application page
    router.push(`/visa-application?programId=${encodeURIComponent(programId)}`)
  }

  const getPlaceholderImageUrl = (destination: string) => {
    return `https://source.unsplash.com/400x300/?${destination}`
  }
  useEffect(()=>{
    const getVisaHistoryData=async()=>{
              debugger
              try{ 
               const getHeader=localStorage.getItem("sso_header");
               let getUserId;
               if(getHeader){
                getUserId=JSON.parse(getHeader)?.userid;
                // setHeaderData(JSON.parse(getHeader));
               }
                  const user_data ={
                    user_id:getUserId 
                }

                const vendorKey=await getVendorKey();
                 const response =await fetch(base_url+"/get_visa_history",{
                    method:"POST",
                    headers:{
                        "Authorization":"Bearer "+vendorKey,
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(user_data)
            })

            if(!response.ok){
                 throw new Error("visa history Api :"+response.statusText)
            }
            const data = await response.json();
            if(data.message==="success"){
                setVisaHistory(data.result);
            }
        }

                catch(err){
                    console.error(err);
                }
            }
            getVisaHistoryData();
            },[]
          )
       
          const handleNavigate=(e:any)=>{
            e.preventDefault();
             router.push("/visa-pending-history")
          }

  return (
    <div className="min-h-screen flex flex-col bg-hayyak-background">
      {/* Network Error Banner */}
      {networkError && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-center">
          <p className="text-amber-800 flex items-center justify-center body-small">
            <WifiOff className="h-4 w-4 mr-2" />
            <span>
              {t("We're having trouble connecting to our servers. Showing available information.")}
              <button
                onClick={handleRetry}
                className="ml-2 underline text-hayyak hover:text-hayyak-hover rounded-[16px] px-4"
              >
                   {t("Try again")}
              </button>
            </span>
          </p>
        </div>
      )}

      <div className="min-h-screen">
        {/* Hero section with destination info */}
        <div className="relative pt-1 pb-2 px-4 sm:px-6 lg:px-8 bg-white">
          {/* Content */}
          <div className="relative max-w-5xl mx-auto text-center">
            {/* <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="p-2 h-10 w-10 flex items-center justify-center text-[#ea6e00] hover:bg-gray-50 rounded-[16px]"
                aria-label="Back to search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </Button>
            </div> */}

            <div className="text-center mb-8">
              <div className="inline-flex items-center mb-3 px-3 py-1 bg-gray-100 rounded-full">
                <svg className="w-4 h-4 text-[#ea6e00] me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-gray-800 caption font-medium">{t(citizenship)} {t("Citizen")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">{t("Visa Options for")} {t(destination)}</h1>
              <p className="text-slate-600 text-center text-md md:text-lg mb-8">
              {t("Discover available visa programs for your trip to ")}{t(destination)}
          </p>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            {/* Travel Date */}
            <div className="bg-slate-100 p-4 rounded-xl flex items-center">
              <div className="bg-orange-100 p-2.5 rounded-full me-4">
                 <svg className="w-5 h-5 text-[#ea6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 ">{t("Travel")} {t("Date")}</p>
                <p className="font-semibold text-slate-700">{travelDate}</p>
              </div>
            </div>

           {/* Destination */}
            <div className="bg-slate-100 p-4 rounded-xl flex items-center">
              <div className="bg-orange-100 p-2.5 rounded-full me-4">
                
                   <svg className="w-5 h-5 text-[#ea6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 ">{t("Destination")}</p>
                <p className="font-semibold text-slate-700">{t(destination)}</p>
              </div>
            </div>

           {/* Citizenship */}
            <div className="bg-slate-100 p-4 rounded-xl flex items-center">
              <div className="bg-orange-100 p-2.5 rounded-full me-4">
               
                  <svg className="w-5 h-5 text-[#ea6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 text-left">{t('Citizenship')}</p>
                <p className="font-semibold text-slate-700">{t(citizenship)}</p>
              </div>
            </div>
            
</div>

          </div>
        </div>

        {/* Main content with visa options */}
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Alert for using mock data */}
          {usingMockData && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center shadow-sm">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="body-small">
               {t(`We're showing estimated visa information. For the most accurate and up-to-date requirements, please
                verify with the embassy or consulate.`)}
             
              </p>
            </div>
          )}

          {/* Network error notification */}
          {networkError && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center shadow-sm">
              <WifiOff className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="body-small font-medium">{t("Connection issue detected")}</p>
                <p className="caption mt-1">
    {t(`We're having trouble connecting to our servers. Showing available information.`)}
                </p>
              </div>
              <Button
                onClick={handleRetry}
                size="sm"
                className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 rounded-[16px] px-16"
              >
                 {t("Try again")}
               </Button>
            </div>
          )}

          {/* Loading, error and empty states */}
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <LoadingIndicator size="large" text="" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="heading-4 mb-3">{error}</p>
              <p className="body-small mb-5">{t("Please try again or modify your search parameters.")}</p>
              <Button onClick={handleBack} className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white">
                 {t("Back to Search")}
                </Button>
            </div>
          ) : safeVisaPrograms.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-8 rounded-2xl text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="heading-4 mb-3">{t("No visa programs found for this combination")}</p>
              <p className="body-small mb-5">
               {t("Please try a different destination or citizenship, or contact the embassy for more information.")}
              </p>
              <Button onClick={handleBack} className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white">
                {t("Back to Search")}
              </Button>
            </div>
          ) : (
            <>
             

              {/* Visa card grid - CENTERED WITH SMALLER CONTAINER */}
              <div className="grid grid-cols-1 gap-8  mx-auto">
                
                {safeVisaPrograms.map((program, index) => (
                  
                  <div key={program.id || index} className="bg-white  shadow-md overflow-hidden">
  {/* {program.program_type && (
                <div className="flex justify-center mb-7">
                  <div className="inline-block bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md">
                    {program.program_type}
                  </div>
                </div>
              )} */}
                    <div className="flex flex-col md:flex-row">

                    
                      {/* Image */}
                       <div className="w-full aspect-[3/2] md:aspect-auto md:w-2/5 relative p-0 flex items-center justify-center bg-slate-50 md:border-r border-slate-200 overflow-hidden md:rounded-l-2xl rounded-t-2xl md:rounded-tr-none">
                        {countryFlags.to ? (
                          <Image
                            src={countryFlags.to || "/placeholder.svg"}
                            alt={`${destination} Flag`}
                            fill
                            // style={{ objectFit: "cover" }}
                             className="md:rounded-l-2xl rounded-t-2xl md:rounded-tr-none object-contain"
                          />
                        ) : (
                          <Image
                            src={countryImages[destination] || getPlaceholderImageUrl(destination)}
                            alt={`${destination} Tourism`}
                            fill
                            className="md:rounded-l-2xl rounded-t-2xl md:rounded-tr-none object-contain"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 md:w-3/5 flex flex-col items-center text-start">
                        <div className="mb-2 flex items-center">
                           {/* <h2 className="mb-2 text-[20px] font-semibold" > {destination}&nbsp;&nbsp; </h2> */}
                          {program.available !== false ? (
                       
                             <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={14} />
                        {  t("Available")}
                        </div>
                          ) : (
                             <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                       
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              {t("Not Available")}
                            </div>
                          )}
                        </div>
                           {/* Visa options count */}
              
                {/* <div className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
                  <span>
                    {safeVisaPrograms.length === 1 && safeVisaPrograms[0].available===true
                      ? `${safeRenderText(safeVisaPrograms[0].program_name || safeVisaPrograms[0].name || "Visa Program")} `
                      : safeVisaPrograms.length <= 3
                        ? safeVisaPrograms.map((program, index) => (
                            <span key={program.id || index}>
                              {index > 0 && (index === safeVisaPrograms.length - 1 ? " and " : ", ")}
                              {safeRenderText(program.program_name || program.name || "Visa Program")}
                            </span>
                          ))
                        : `${safeVisaPrograms.length} Visa Options Available`}
                  </span>
                </div> */}
        

                        {/* Debug info - remove in production */}
                        <div className="w-full mb-4 text-left bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-40 hidden">
                          <pre>{JSON.stringify(program, null, 2)}</pre>
                        </div>

                        <h3 className="heading-3 mb-2">
                          {/* {safeRenderText(program.program_name || program.name || program.visa_type || "Visa Program")} */}
                       
                        </h3>

                        {/* Visa details */}
                        {(program.available===true && program?.required===true)
                         && <div className="w-full  mb-4">
                          <div className="border border-gray-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center text-orange-600 font-semibold mb-3">
                        <Info size={18} className="me-2" />
                          {t("Visa")} {t("Details")}
                      </div>

                            {/* Fee information with currency conversion */}
                            <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600 caption">{t("Fee")} ({program.currency}):</span>
                                <span className="body-small font-medium text-gray-900">
                              {safeRenderText(Number.parseFloat(program.fee).toFixed(2) || "0")} {program.currency}
                                </span>
                              </div>
                              </div>
                              <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 caption">{t("Fee")} (OMR):</span>
                                <span className="body-small text-gray-900">
                                  {convertedFees[program.id] ||
                                    (Number.parseFloat(safeRenderText(program.fee || "0")) * 0.385).toFixed(3)}{" "}
                                  OMR
                                </span>
                              </div>
                            </div>

                            {/* Time-related information */}
                            <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center   ">
                                <span className="text-gray-600 caption">{t("Processing")}:</span>
                                <span className="body-small text-gray-900">
                                {program.suggested_processing_time
                                    ? `${safeRenderText(program.suggested_processing_time)} ${t("days")}`
                                    : t("Not specified")}
                                </span>
                              </div>
                              </div>
                              <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center ">
                                <span className="text-gray-600 caption">{t("Max")} {t("Stay")}:</span>
                                <span className="body-small text-gray-900">
                                  {program.max_stay
                                    ? `${safeRenderText(program.max_stay).replace(".0", "")} ${t("days")}`
                                    : t("Not specified")}
                                </span>
                              </div>
                              </div>
                               <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 caption">{t("Validity")}:</span>
                                <span className="body-small text-gray-900">
                                   {program.validity
                                    ? `${safeRenderText(program.validity).replace(".0", "")} ${t("days")}`
                                    : t("Not specified")}
                                </span>
                              </div>
                            </div>

                            {/* Entry information */}
                            <div className="mb-3 pb-1.5 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 caption">{t("Entries")}:</span>
                                <span className="body-small text-gray-900">
                                  {/* {program.max_entries === "0.0" || program.max_entries === 0
                                    ? "Multiple"
                                    : program.max_entries === "1.0" || program.max_entries === 1
                                      ? "Single"
                                      : program.max_entries
                                        ? safeRenderText(program.max_entries).replace(".0", "")
                                        : "Not specified"} */}
                                    {t("Single")}
                                </span>
                              </div>
                            </div>

                            {/* Technical information */}
                            <div className="caption text-gray-600">
                              {/* Program ID is stored but not displayed */}
                              <div className="hidden">{safeRenderText(program.id || "N/A")}</div>
                              <div className="flex justify-between items-center">
                                <span>{t("Status")}:</span>
                                <span className="font-medium text-gray-900">
                                  {program.available !== false ? t("Available") : t("Unavailable")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>}

                        {
                        <div>
                        {
                        program.required===false && 
                        <div style={{textAlign:"start"}}>
                        <div className="mb-2">{t("A visa is not required for your visit.")}</div>

                         {program.label && <div>{program.label}</div>}
                       <div className="p-4 mt-4 rounded-2xl shadow-md bg-[#fff2e6]">
                         {program.required===false  && program.available===true && <div className="mb-2"><b>{t("You are good to go!")}</b> </div>}
                        {program.required===false && <div>{t("You don't need a Visa for")} {t(destination)} {t("if you have a passport from")} {t(citizenship)}</div>}
                        </div>
                        </div>
                        }
                              </div>
                        }

                        {/* Additional Information - only show if available */}
                        {(program.additional_info || program.embassy_info || program.restrictions) && (
                          <div className="w-full max-w-xs mb-5">
                            <div className="border border-gray-200 rounded-xl p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 mr-1 text-[#ea6e00]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              {t("Additional Information")}
                              </h4>

                              {program.additional_info && (
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                  <p className="caption text-gray-600">{safeRenderText(program.additional_info)}</p>
                                </div>
                              )}

                              {program.embassy_info && (
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                  <p className="caption font-medium text-gray-900 mb-1">{t("Embassy")} {"Information"}:</p>
                                  <p className="caption text-gray-600">{safeRenderText(program.embassy_info)}</p>
                                </div>
                              )}

                              {program.restrictions && (
                                <div className="mb-2">
                                  <p className="caption font-medium text-gray-900 mb-1">{t("Restrictions")}</p>
                                  <p className="caption text-gray-600">{safeRenderText(program.restrictions)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {program.available ===false && (program.required==true || program.required==false )&&
                           <div className="bg-amber-50 border border-amber-200 text-red-700 p-8 rounded-2xl text-center shadow-sm mt-3">
              {/* <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4"> */}
                {/* <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg> */}
              {/* </div> */}
              {/* <p className="heading-4 mb-3"></p> */}
              <p className="body-small mb-5">{
              t(
             "This visa program is currently unavailable or does not meet the specified criteria.")
              }</p>
              <Button onClick={handleBack} className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white">
              { t("Back to Search")}
              </Button>
            </div>
                        }

                        {/* Apply button */}
                  {(( program.available && program.required )  ?
                  <Button
                          onClick={() => handleApply(program.id)}
                          disabled={ visaHistory && visaHistory?.length>=5}
                          className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4 w-full"
                        >
                           {isSubmitLoad ? (
                                                <div className="flex items-center justify-center">
                                                  <LoadingIndicator size="small" />
                                                </div>
                                              ) : (
                                             t("Apply Now")
                                              )}
                         
                        </Button>:<></>)}
                {  visaHistory && visaHistory?.length>=5
                   ?
                        // <Button
                        //   onClick={(e) => handleNavigate(e)}
                        //   className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4 w-full"
                        // >
                        //    {isSubmitLoad ? (
                        //                         <div className="flex items-center justify-center">
                        //                           <LoadingIndicator size="small" />
                        //                         </div>
                        //                       ) : (
                        //                      t("Clear pending records")
                        //                       )}
                         
                        // </Button>
                      <>
  <div className="text-red-600">
   {t("Limit: 5 records. Remove unused orders before applying.")}
    <a href="/visa-pending-history" className="text-blue-800 underline ms-1">
      {t("Click here")}
    </a>
  </div>
</>
                        :
                        <></>
                      }
                      </div>

                    
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisaResultsPage
