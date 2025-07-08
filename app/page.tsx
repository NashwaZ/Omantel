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
import { sendEventMsgToCEPApp } from "@/lib/api"
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'
import { usePathname } from "next/navigation";
import { LanguagesIcon } from "lucide-react";
import LoadingIndicator from "@/components/LoadingIndicator"

import config from "@/lib/api-config"

// Import country data directly
// import { allCountries } from "@/lib/countries"

// Import the CustomInput component at the top of the file
import { CustomInput } from "@/components/ui/custom-input"
import { useCountryList } from "@/lib/countries"
import { Description } from "@radix-ui/react-toast"
import { enUS, arSA } from "date-fns/locale";
// import { unique } from "next/dist/build/utils"
// const { i18n, t } = useTranslation();
// const currentLocale = i18n.language; // 'en' or 'ar'

export default function VisaSearch() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  // const [countries,setCountries] = useState<string[]>([])
const { countries,load } = useCountryList();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchData,setSearchData]=useState({
    destination: "",
    citizenship: "",
    destination_arabic:"",
    citizenship_arabic:""
  })
  const [partnerUserId,setPartnerUserId]=useState(null)
  const [locale,setLocale]=useState("en")

  const [formData, setFormData] = useState({
    destination: "",
    citizenship: "",
  });

   const pathname = usePathname();

const [userInfo,setUserInfo]=useState({ 
email:"",
first_name:"",
id: "",
last_name: "",
mobile_no: "",
sub: "",
updated_at: "",
user_id: "",
username: "",
created_at:"",
});

  const [vendorKey,setVendorKey]=useState("");

  const [header,setHeader]=useState({
        "accessToken": "",
        "uniqueId": "",
        "language":"",
        "sessionId":"",
        "partnerUserId": ""
  });

  const [accessToken,setAccessToken]=useState("");
  const [passingParams,setPassingParams]=useState({accessToken:null,partnerUserId:null,language:null,deviceId:null,uniqueId:null});

  const validationCheck=formData?.destination && formData?.citizenship && date;

  const { i18n, t } = useTranslation();

  const base_url=config.BASE_URL;
  
const getDirection = (lang: string): "ltr" | "rtl" => {
  return lang==='ar' ? "rtl" : "ltr";
};
  const updateHtmlAttributes = (lang: string) => {
    document.documentElement.dir = getDirection(lang);
    document.documentElement.lang = lang;
  };

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

//   useEffect(() => {

//   const searchParams = new URLSearchParams(window.location.search);
//   const base64Data = searchParams.get("data");

//   if (base64Data) {
//     try {
//       const decodedString = atob(base64Data);
//       const params = new URLSearchParams(decodedString);

//       const headerData = {
//         accessToken: params.get("accessToken"),
//         uniqueId: params.get("uniqueId"),
//         language: params.get("language"),
//         sessionId: params.get("sessionId"),
//         partnerUserId: params.get("partnerUserId"),
//       };
//       var values={
//         "accessToken": headerData.accessToken,
//         "uniqueId": headerData.uniqueId,
//         "language":headerData.language,
//         "sessionId":headerData.sessionId,
//         "partnerUserId": headerData.partnerUserId,
        
//       }
//       setHeader(values);
//       localStorage.setItem("header", JSON.stringify(headerData));
      
//       // initApi(values);
//       // setHeader(headerData); // assuming SetHeader is a useState setter
//       localStorage.setItem("header", JSON.stringify(headerData));
//       console.log("Header Data:", headerData);
//     } catch (error) {
//       console.error("Failed to decode or parse query data:", error);
//     }
//   }
// }, []);


// async function initApi(headerdata1: { accessToken: string | null; uniqueId: string | null; language: string | null; sessionId: string | null; partnerUserId: string | null }) {
//   try {
//     if (headerdata1) {
//  
//       const response = await fetch(base_url+'/omanteltoken', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': headerdata1.accessToken ?? '',
//           'x-language': headerdata1.language ?? 'en'
//         }
//       });

//       if (!response.ok) {

//         throw new Error(`Token fetch failed with status: ${response.status}`);
//       }

//       const data = await response.json();
//       if(data.message==="success"){
//         const id_token=data.result.idToken;
//         localStorage.setItem("id_token",id_token);
//       }

//       // Example: Update your accessToken here if applicable
//       // headerdata.accessToken = data.accessToken;  // update logic as per response

//       console.log('Token fetched successfully:', data);
//     }
//   } catch (error) {
//     console.error('Failed to initialize API:', error);
//     setLoading(false);
//   }
// }




  useEffect(()=>{
    const createOrganization=async()=>{
    try{
      // Step 1: Create organization to get vendor key
    //  console.log("Creating organization...")
     const storedLang=localStorage.getItem("app_language");
     localStorage.clear();
     if(storedLang){
     localStorage.setItem("app_language",storedLang);
     }
      const orgResponse = await fetch(base_url+"/create_organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization_name: "Omantel"}),
      })

      if (!orgResponse.ok) {
        throw new Error(`Failed to create organization: ${orgResponse.status} ${orgResponse.statusText}`)
      }
     
       const orgData = await orgResponse.json();

      // console.log("Organization created successfully", orgData)

      // Extract and store vendor key
    
       let vendor_key = ""
      if (orgData && orgData.result && orgData.result.length > 0 && orgData.result[0].vendor_key) {
        vendor_key = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", vendor_key);
        setVendorKey(vendor_key);
        // console.log("Vendor key stored successfully:", vendorKey)
      } else {
        throw new Error("No vendor key found in response")
      }
    }
    catch (error) {
      console.error("Error submitting form:", error)
      setApiError(error instanceof Error ? error.message : "Failed to process request")
    }
  }
  createOrganization();

  },[])

  useEffect(()=>{

  const call_SSO= async ()=>{  
    const url=window.location.search;
    const getParams=new URLSearchParams(url)
    const h_id=getParams.get("id");
    if(h_id!==null){
    const get_h_id = Buffer.from(h_id, 'base64').toString('utf-8');

    if(get_h_id){
    const data ={
      vendor_key:vendorKey,
      head_id: get_h_id
    }

  const response = await fetch(base_url+"/omantel_sso_basic",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  })

  if(!response.ok){
     console.log("Error at get head sso api");
  }
  else{
    const data = await response.json(); 
    if(data.message==='success'){

        const header_data=data.result;

      //    var values={
      //   "accessToken": header_data.authorization,
      //   "uniqueId": header_data.uniqueid,
      //   "language":header_data.language,
      //   "sessionId":header_data.sessionid,
      //   "partnerUserId": header_data.userid,
      //   "deviceId":header_data.deviceid  // check device id name 
        
      // }
      // setHeader(values);
      setPassingParams({
        accessToken:data.result.authorization,
        partnerUserId:data.result.userid,
        language:data?.result.language,
        deviceId: data?.result.deviceid,   // check device id name ,
        uniqueId: data?.result.uniqueid
      })
        setAccessToken(data.result.authorization);
        setPartnerUserId(data.result.userid);
      var lang=  localStorage.getItem("app_language");
      if(lang)
         setLocale(lang);
      
      if(!lang){
        localStorage.setItem("app_language",data.result.language);
        lang=data.result.language;
      setLocale(data.result.language);
      }
      if(lang){
      i18n.changeLanguage(lang).then(()=>{
 updateHtmlAttributes(String(lang));
      localStorage.setItem("sso_header", JSON.stringify(header_data));
      
        })
      }

      // initApi(values);

    }
     else{
        updateHtmlAttributes(i18n.language);
    }
  }

}
    }
  }
if(vendorKey){
  call_SSO();
}
},[vendorKey])

useEffect(() => {
  const timer = setTimeout(() => {
    const get_language = localStorage.getItem("app_language");
    if (get_language) {
      setLocale(get_language);
    }
  }, 1000);

  return () => clearTimeout(timer); // 🔁 Cleanup when component unmounts
}, []);


  useEffect(()=>{

    const fetchUserData=async(token:string,headers:any,lang:any)=>{
     
      
  try {
  
    const {partnerUserId, uniqueId,deviceId} = headers;
      const response = await fetch(base_url+'/omantel_user_traveller_check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-language':lang,
          'Authorization': token,
          'user_id':partnerUserId,
          "unique_id":uniqueId,
          "device_id": deviceId // check device id name
        }
      });

      if (!response.ok) {
        throw new Error(`Token fetch failed with status: ${response.status}`);
      }

      const data = await response.json();
      if(data.message==="success"){
        // console.log(data.result);
        if(data.result.length>0){

        setUserInfo(data.result[0]);
       const header_data= localStorage.getItem("sso_header");
       if(header_data){
        const parse_header=JSON.parse(header_data);
        parse_header["userid"]=data.result[0].user_id;
         localStorage.setItem("sso_header",JSON.stringify(parse_header));
       }
      
       localStorage.setItem("user_info_cep",JSON.stringify(data.result[0]));
       
      }
    }

      // console.log('Token fetched successfully:', data);
    }
   catch (error) {
    console.error('Failed to initialize API:', error);
  
  }
    }

    if(passingParams?.accessToken ){
      fetchUserData(passingParams?.accessToken,passingParams,passingParams?.language);
    }
    
  },[passingParams])



  // Update the handleSubmit function to properly create organization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
   
    setAttemptedSubmit(true)
    setApiError(null)
     setLoading(true);

    if (!formData.destination || !formData.citizenship || !date) {
      setLoading(false);
      return
    }

      // Format date for API in DD-MM-YYYY format
      const formattedDate = date ? format(date, "yyyy-MM-dd") : "12-04-2025"

       const eventDetails = {
         sub_type:"Visa Search",
         description: "User is searching for visa programs based on selected country."
       };
       
      // await sendEventMsgToCEPApp(eventDetails,userInfo,accessToken)
      // Navigate to results page with query parameters
      router.push(
        `/visa-results?destination=${encodeURIComponent(formData.destination)}&citizenship=${encodeURIComponent(
          formData.citizenship,
        )}&travelDate=${encodeURIComponent(formattedDate)}`,
      )
     setLoading(false);
   
  }

  const handleBack = () => {
    router.back()
  }

    const toggleLanguage=()=>{
 
    if(locale=="en"){
      const set_language="ar"
    localStorage.setItem("app_language",set_language);
    setLocale("ar");
      i18n.changeLanguage(set_language).then(()=>{
 updateHtmlAttributes(set_language);
   
    
        })
    }
  else{
    const set_language="en"
  localStorage.setItem("app_language",set_language);
   setLocale("en");
     i18n.changeLanguage(set_language).then(()=>{
 updateHtmlAttributes(set_language);
   
    
        })

  }
  }

  return (
    <>
      
    <div className={`${calendarOpen? "adjust-h-size":""} min-h-screen  flex flex-col justify-center bg-hayyak-background py-10 relative`}
  //    style={{
  //   height: calendarOpen ? "150vh" : "100vh"
  // }}
  >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">
        <div className="text-center mb-5xl">
          <h1 className=" heading-1 mb-4">{t('E-Visa')} {t('Application')} {t('Service')}</h1>
          <p className="body-large text-gray-600">{t("Check your visa eligibility and apply online in minutes")}</p>
        </div>

        <div className="w-full max-w-3xl px-4 sm:px-0">
          <Card className="border-0 shadow-z1 bg-hayyak-white w-full">
            <CardContent className="px-6 sm:px-8 pb-8 pt-8">
              <form onSubmit={handleSubmit} className="space-y-5 w-full relative" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="label font-medium">
                     {t('Destination')} {t("Country")}
                  </Label>
                  <div className="relative">
                    <CustomInput
                      type="text"
                      id="destination-search"
                      placeholder={t("Search for a country")+"..."}
                      className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                      value={i18n.language=="en"?searchData.destination:searchData.destination_arabic}
                      onChange={(e) => {
                        const destination =searchData.destination;
                        if(e.target.value.length<destination.length){
                            setFormData((prev) => ({ ...prev, destination:"" }))
                        }
                        setSearchData((prev) => ({ ...prev, destination: e.target.value,destination_arabic:e.target.value }))
                        const dropdown = document.getElementById("destination-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      onFocus={() => {
                        const dropdown = document.getElementById("destination-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      error={attemptedSubmit && !formData.destination ? t("Please select a destination country") : ""}
                      success={formData.destination !== ""}
                    />
                    <button
                      type="button"
                      className={`absolute end-0 top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed`}
                      onClick={() => {
                        const dropdown = document.getElementById("destination-dropdown")
                        const searchInput = document.getElementById("destination-search") as HTMLInputElement;

                        if (dropdown) {
                          dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"

                        }
                        if(searchInput){
                            searchInput.focus();
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
  i18n.language === "en"
    ? countries
        .filter(
          (country: any) =>
            searchData.destination === "" ||
            country.country.toLowerCase().includes(searchData.destination.toLowerCase())
        )
        .map((country: any) => (
          <div
            key={country.country}
            className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            onClick={() => {
               setFormData((prev) => ({ ...prev, destination: country.country }));
              setSearchData((prev) => ({ ...prev,destination: country.country , destination_arabic: country.arabic_country }));
              const dropdown = document.getElementById("destination-dropdown");
              if (dropdown) dropdown.style.display = "none";
            }}
          >
            {country.country}
          </div>
        ))
    : countries
        .filter(
          (country: any) =>
            searchData.destination === "" ||
            (country.arabic_country ?? "").toLowerCase().includes(searchData.destination.toLowerCase())
        )
        .map((country: any) => (
        

          country.arabic_country?<div
            key={country.country}
            className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setFormData((prev) => ({ ...prev, destination: country.country }));
              setSearchData((prev) => ({ ...prev,destination: country.country , destination_arabic: country.arabic_country }));
              const dropdown = document.getElementById("destination-dropdown");
              if (dropdown) dropdown.style.display = "none";
            }}
          >
            {country.arabic_country}
          </div>
          :
          <></>
       
        ))
)

 : (
                        <div className="px-4 py-3 body-small text-gray-500">{load ?locale=="en"?"Loading ...":"تحميل ...": locale=="en" ? "No countries found":"لم يتم العثور على أي دولة"}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship" className="label font-medium">
                     {t("Your")} {t("Citizenship")}
                  </Label>
                  <div className="relative">
                    <CustomInput
                      type="text"
                      id="citizenship-search"
                      placeholder={t("Search for a country")+"..."}
                      className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                      value={i18n.language=="en"?searchData.citizenship:searchData.citizenship_arabic}
                    
                      onChange={(e) => {
                        const citizenship =searchData.citizenship;
                        if(e.target.value.length<citizenship.length){
                            setFormData((prev) => ({ ...prev, citizenship:"" }))
                        }
                        setSearchData((prev) => ({ ...prev, citizenship: e.target.value,citizenship_arabic:e.target.value }))
                        const dropdown = document.getElementById("citizenship-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      onFocus={() => {
                        const dropdown = document.getElementById("citizenship-dropdown")
                        if (dropdown) dropdown.style.display = "block"
                      }}
                      error={attemptedSubmit && !formData.citizenship ?t("Please select a citizenship country") : ""}
                      success={formData.citizenship !== ""}
                    />
                    <button
                      type="button"
                      className={`absolute end-0  top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed`}
                      onClick={() => {
                        const dropdown = document.getElementById("citizenship-dropdown")
                        const searchInput = document.getElementById("citizenship-search") as HTMLInputElement;
                        if (dropdown) {
                          dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"
                        }

                           if(searchInput){
                            searchInput.focus();
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
  i18n.language === "en"
    ? countries
        .filter(
          (country: any) =>
            searchData.citizenship === "" ||
            country.country.toLowerCase().includes(searchData.citizenship.toLowerCase())
        )
        .map((country: any) => (
          <div
            key={country.country}
            className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setFormData((prev) => ({ ...prev, citizenship: country.country }));
              setSearchData((prev) => ({ ...prev, citizenship: country.country,citizenship_arabic:country.arabic_country }));
              const dropdown = document.getElementById("citizenship-dropdown");
              if (dropdown) dropdown.style.display = "none";
            }}
          >
            {country.country}
          </div>
        ))
    : countries
        .filter(
          (country: any) =>
            searchData.citizenship === "" ||
            (country.arabic_country ?? "").toLowerCase().includes(searchData.citizenship.toLowerCase())
        )
        .map((country: any) => (
        

          country.arabic_country?<div
            key={country.country}
            className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setFormData((prev) => ({ ...prev, citizenship: country.country }));
              setSearchData((prev) => ({ ...prev, citizenship: country.country,citizenship_arabic: country.arabic_country }));
              const dropdown = document.getElementById("citizenship-dropdown");
              if (dropdown) dropdown.style.display = "none";
            }}
          >
            {country.arabic_country}
          </div>
          :
          <></>
       
        ))
)

 : (
                        <div className="px-4 py-3 body-small text-gray-500">{load ?locale=="en"?"Loading ...":"تحميل ...": locale=="en" ? "No countries found":"لم يتم العثور على أي دولة"}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-date" className="label font-medium">
                      {t('Travel')} {t("Date")}
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      id="travel-date"
                      className="w-full h-12 px-4 text-left flex items-center body-small border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-[#ea6e00] transition-colors"
                      onClick={() => setCalendarOpen(!calendarOpen)}
                    >
                    <CalendarIcon className={`mr-3 h-5 w-5 text-[#ea6e00] ml-[15px]`} />

                        {date ? format(date, "PPP" ,{ locale: i18n.language !== "en" ? arSA : enUS }) : t("When are you traveling?")} 
                    
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
                      // <div className="text-red-500 caption mt-1">{locale=="en"?"Please select a travel date":"الرجاء تحديد تاريخ السفر"}</div>
                      <div className="text-red-500 caption mt-1"> {t("Please select a travel date")} </div>
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
                  className={`w-full h-12 body-large font-medium rounded-[16px] bg-[#ea6e00] hover:bg-[#ea6e00]  active:bg-[#b55500] text-white px-4xl py-3 disabled:bg-hayyak-moderate-grey disabled:text-hayyak-dark-grey mt-4`}
                  disabled={loading}
                >
                  {loading ? (

                    <div className="flex items-center justify-center">
                      <LoadingIndicator size="small" />
                    </div>
                    
                  ) :  (
                    t("Check Visa Requirements")
                    )}
                </Button>

                {/* {loading && (
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
                )} */}
              </form>
            </CardContent>
          </Card>

          <div className="mt-4xl text-center">
            <p className="caption">{t("Powered by Omantel eVisa Services. Fast, secure, and reliable visa processing.")}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
