"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardTitle,CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Currency } from "lucide-react"
import { useCountryList } from "@/lib/countries"
import ApiDebugPanel from "@/components/api-debug-panel"
import {sendEventMsgToCEPApp,createTravellerOmantel, createIframeOrderVisaOmantel, generateReferenceNumber, createCartUserApplication } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"
import { CustomInput } from "@/components/ui/custom-input"
import { Progress } from "@/components/ui/progress"
import Loading from "./loading"
import config from "@/lib/api-config"


import { useTranslation } from "react-i18next"
import  "@/lib/i18n"

import { ChevronDown, ChevronUp, FileText, Info, XCircle, Paperclip } from "lucide-react"
// import { count } from "console"

export default function VisaApplication() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const base_url=config.BASE_URL;
  // Get query parameters with fallbacks
  // const destination = localStorage.getItem("visa_destination") || "";
  // const citizenship =  localStorage.getItem("visa_citizenship") || "";

  // const travelDate =  localStorage.getItem("visa_travelDate") || "";

  const visaType = searchParams.get("visaType") || "Tourist Visa"
  // const visaFee = searchParams.get("visaFee") || "0"
  const programId = searchParams.get("programId") || ""

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    marketingConsent: true,
    countryCode:"",
     // building: "",
    // floor: "",
    // apartment: "",
    // street: "",
    // city: "",
    // state: "",
    // country:""
  })
    const [searchData,setSearchData]=useState({
      country:"",
      country_arabic:""
    })

    const [EmailError,setEmailError]=useState("");
    const [PhoneError,setPhoneError]=useState("");
    const [firstNameError,setFirstNameError]=useState("");
    const [lastNameError,setLastNameError]=useState("");

  const [attemptedSubmit,setAttemptedSubmit]=useState(false);
const { countries,load, error } = useCountryList();

const firstNameRef=useRef<HTMLInputElement>(null);
const lastNameRef=useRef<HTMLInputElement>(null);
const emailRef=useRef<HTMLInputElement>(null);
const countrySearchRef=useRef<HTMLInputElement>(null);
const phoneNoRef=useRef<HTMLInputElement>(null);
const countryCodeRef=useRef<HTMLInputElement>(null);
const [phoneCodeError,setPhoneCodeError]=useState("")

const [userInfo,setUserInfo]=useState();
const [vendorKey,setVendorKey]=useState("");
const [isLoading, setIsLoading] = useState(true);
  const [requirements, setRequirements] = useState<any[]>([]);

  const [files, setFiles] = useState<Record<string, File | null>>({});
 const [filesData, setFilesData] = useState<{ [key: string]: File | null }>({});

//  const [vendorKey,setVendorKey]=useState("");
 const [formSubmit,setFormSubmit]=useState(false);
 const [destinationCountry,setDestinationCountry]=useState("");
  // const router = useRouter()

const formRef=useRef({firstName:firstNameRef,lastName:lastNameRef,email:emailRef,country:countrySearchRef,phone:phoneNoRef,countryCode:countryCodeRef})

  // Add these state variables at the top of the component with the other state variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [destination, setDestination] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [visaDetails,setVisaDetails]=useState<{ [key: string]: any | null }>({});

     const [locale,setLocale]=useState("en");
    const [header,setHeader]=useState(null);
    const startFirstRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedDestination = localStorage.getItem("visa_destination") || "";
    const storedCitizenship = localStorage.getItem("visa_citizenship") || "";
    const storedTravelDate = localStorage.getItem("visa_travelDate") || "";
     const get_visa=localStorage.getItem("visa_programs_data");
      const parse_visa_details =get_visa? JSON.parse(get_visa):"";

    setDestination(storedDestination);
    setCitizenship(storedCitizenship);
    setTravelDate(storedTravelDate);
    setVisaDetails(parse_visa_details);





    window.scrollTo(0,0)


  }, []);

  useEffect(()=>{
       type Country = {
  country: string;
  country_code: string;
  [key: string]: any;
};


const selectedCountry: Country | undefined |string = countries.find(
  (c:any) => c.country === citizenship
);
setFormData((prev) => ({
  ...prev,
  countryCode:
    typeof selectedCountry === "object" &&
    selectedCountry !== null &&
    "country_code" in selectedCountry
      ? (selectedCountry as any).country_code
      : ""
}));

  },[countries,citizenship])


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

  const getUploadedFileLength=()=>{
  const file_key_name=Object.keys(filesData);
  let count =0;
  for(let i=0;i<file_key_name.length;i++ ){
    const key_name =file_key_name[i];
  
 if(filesData[key_name]!==null){
     count+=1;
  }
}
return count;
}

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {

  const { name } = e.target;
 const value=e.target.value.trimStart(); // Trim leading spaces
  if(name==="firstName" || name==="lastName"){
      const pattern = /^[a-zA-Z ]+$/;
  if( pattern.test(value) || value.length<=0 ){
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  }

  else if(name==="phone"){
    const phonePattern=/^[0-9]+$/;
    if(phonePattern.test(value) || value.length<=0){
      if(value.length<=15){
        setFormData((prev) => ({ ...prev, [name]: value }));
        // setPhoneError("");
      }
    }
  }
  else if(name==="countryCode"){
    debugger 
     const {name,value}=e.target;
  const filterValue=value.substring(1);
  const codePattern = /^[0-9]+$/;
    if(codePattern.test(filterValue) || filterValue.length<=0){

      if(filterValue.length<=4){
    setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  }
  else{
setFormData((prev) => ({ ...prev, [name]: value }));
  }
  

};

const checkNameFormat = (e:any) => {
  const name = e.target.name;
  const value = e.target.value.trim();
  if(name=="firstName"){
  if(value.length<=0){
    setFirstNameError("First name is required.");
  }
  else{
    setFirstNameError("");
  }
}
else if(name=="lastName"){
  if(value.length<=0){
    setLastNameError("Last name is required.");
  }
  else{
    setLastNameError("");
  }
}
}

const checkPhoneFormat = (e:any) => {
  // debugger
  const phone = e.target.value.trim();

 
    if(phone && phone.length<7){
    setPhoneError("Phone no should contain at least 7 digits.");
   
  }
  else if(phone.length<=0){
    setPhoneError("Phone no is required.");
  } else {
    setPhoneError("");
  }
}

const checkEmailFormat = (e:any) => {
 const email = e.target.value.trim();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email && !emailPattern.test(email)) {
    setEmailError("Please enter a valid email address.");
  }
  else if(email.length<=0){
    setEmailError("Email is required.");
  } else {
    setEmailError("");
  }
}

  // const handleSelectChange = (name: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }))
  // }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, marketingConsent: checked }))
  }

   


     const validationCheck=formData?.firstName && formData?.lastName && formData?.marketingConsent && formData.countryCode.substring(1) && formData?.phone && (getUploadedFileLength()===requirements.length)



const { t,i18n } = useTranslation();


const getDirection = (lang: string): "ltr" | "rtl" => {
  return lang==='ar' ? "rtl" : "ltr";
};
  const updateHtmlAttributes = (lang: string) => {
    document.documentElement.dir = getDirection(lang)==="rtl"?"rtl":"ltr";
    document.documentElement.lang = lang;
  };

    useEffect(()=>{

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


    
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     const destinationDropdown = document.getElementById("destination-dropdown")
 
  //     if (
  //       destinationDropdown &&
  //       destinationDropdown.style.display === "block" &&
  //       !document.getElementById("destination-search")?.contains(event.target as Node) &&
  //       !destinationDropdown.contains(event.target as Node)
  //     ) {
  //       destinationDropdown.style.display = "none"
  //     }

  //   } 

  //   document.addEventListener("mousedown", handleClickOutside)
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside)
  //   }
  // }, [])
  
 useEffect(()=>{
    const createOrganization=async()=>{
    try{
      // Step 1: Create organization to get vendor key
    //  console.log("Creating organization...")
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
        // console.log("Vendor key stored successfully:", vendor_key)
      } else {
        throw new Error("No vendor key found in response")
      }
    }
    catch (error) {
      console.error("Error submitting form:", error)
      // setApiError(error instanceof Error ? error.message : "Failed to process request")
    }
  }
  createOrganization();

  },[])
  // Update the handleSubmit function to better handle API errors
  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault()
    // console.log("Form submitted:", formData)


           
        
        //       try{ 
        //        const getHeader=localStorage.getItem("sso_header");
        //        let getUserId;
        //        if(getHeader){
        //         getUserId=JSON.parse(getHeader)?.userid;
        //         // setHeaderData(JSON.parse(getHeader));
        //        }
        //           const user_data ={
        //             user_id:getUserId 
        //         }
        //          const response =await fetch(base_url+"/get_visa_history",{
        //             method:"POST",
        //             headers:{
        //                 "Authorization":"Bearer "+vendorKey,
        //                 "Content-Type":"application/json"
        //             },
        //             body:JSON.stringify(user_data)
        //     })

        //     if(!response.ok){
        //          throw new Error("visa history Api :"+response.statusText)
        //     }
        //     const data = await response.json();
        //     if(data.message==="success"){
        //         if(data.result.length>5){
        //           router.push("/visa-pending-history");
        //           return;
        //         }
        //     }
        // }

        //         catch(err){
        //             console.error(err);
        //         }
          



   
    // Store form data in localStorage for recovery
    localStorage.setItem("visa_application_form", JSON.stringify(formData))
    // localStorage.setItem("visa_destination", destination)
    // localStorage.setItem("visa_citizenship", citizenship)
    // localStorage.setItem("visa_type", visaType)
    // localStorage.setItem("visa_fee", visaFee)
    localStorage.setItem("program_id", programId || "")

    try {
      // Step 1: Create traveller in Omantel system
      setAttemptedSubmit(true);
       setFormSubmit(true);
     
      const fields:String[] =["firstName","lastName","email","phone","countryCode"];
      for(let i=0;i<fields.length;i++){
        const key=fields[i] as keyof typeof formData;
          if(!formData[key]){
    const inputRef = formRef.current[key as keyof typeof formRef.current];
    inputRef?.current?.focus();
      return;
      }
      }
     const checkError ={firstName:firstNameError,lastName:lastNameError,email:EmailError,phone:PhoneError,countryCode:phoneCodeError};
      const errorKeys = Object.keys(checkError);
      for (const key of errorKeys) {
        if (checkError[key as keyof typeof checkError]) {
          const inputRef = formRef.current[key as keyof typeof formRef.current];
          inputRef?.current?.focus();
          return;
        }
      }
    

      

       const key_names=Object.keys(filesData);
    for(let i=0;i<key_names.length;i++){
      const names=key_names[i];
      if(filesData[names]==null){

        return;
      }
    }
     

      setIsSubmitting(true)
      setSubmissionError(null)

      const get_user_data=localStorage.getItem("user_info_cep");
      const parse_user_data = get_user_data?JSON.parse(get_user_data):"";
      if(!parse_user_data){
        console.error("User ID is required to create a traveller. ");
        return;
      }

//       type Country = {
//   country: string;
//   country_code: string;
//   [key: string]: any;
// };


// const selectedCountry: Country | undefined |string = countries.find(
//   (c:any) => c.country === citizenship
// );

const travellerData = {
  email: formData.email,
  first_name: formData.firstName,
  last_name: formData.lastName,
  phone: formData.countryCode+" "+formData.phone,
  locale: "en",
  omantel_user_id: parse_user_data?.id,
};

      // console.log("Creating traveller with data:", travellerData)
      let travellerResponse

      try {
        travellerResponse = await createTravellerOmantel(travellerData)

        // console.log("Traveller created successfully:", travellerResponse)
       

      } catch (error) {
        console.error("Error creating traveller:", error)
        // Check if we're in development/preview mode and continue with mock data
        if (process.env.NODE_ENV !== "production" || window.location.hostname.includes("localhost")) {
          // console.log("Development mode detected, continuing with mock data")
          // The createTravellerOmantel function will handle creating mock data
          travellerResponse = await createTravellerOmantel(travellerData)

        } else {
          throw error // Re-throw in production
        }
      }

      // Step 2: Create iframe order for visa with 15-character reference number
      const referenceNo = generateReferenceNumber()
      // console.log("Generated reference number:", referenceNo)

      const get_local_visa=localStorage.getItem("visa_programs_data");
      const parse_visa_data =get_local_visa? JSON.parse(get_local_visa):"";
     const visa_program=parse_visa_data.result.programs[0];
     
      const orderData = {
        vendor_key: localStorage.getItem("vendor_key") || "OMANTEL", // Use stored vendor key or default
        reference_no: referenceNo,
        description: `Visa application for ${formData.firstName} ${formData.lastName}`,
        program_id: programId, // This is the ID we stored from get_visa_programs_omantel
        quantity: 1,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        fee: visa_program?.fee,
        currency:visa_program?.currency,
        arrival: citizenship.toLowerCase(),
        destination: destination.toLowerCase(),
        commission: visa_program?.commision, // Default value as specified
        commission_type: visa_program?.commision_type || "flat rate", // Default value as specified
        travel_date:travelDate
      }

      // console.log("Creating iframe order with data:", orderData)
              
//    const visa_info={  
//  "user_id" : parse_user_data?.id,
//   "traveller_id" : travellerResponse.result[0].id, 
//    "destination" : destination.toLowerCase(), 
//   "citizenship" :  citizenship.toLowerCase(),
//   "citizenship_code" : visa_program?.citizenship,
//   "destination_code" : visa_program?.destination,
//   "program_id" : visa_program?.id,
//   "fee" : visa_program?.fee,
//   "currency":visa_program?.currency ,
//   "commission" : visa_program?.commision,
//   "commission_type" : visa_program?.commision_type || "flat rate"
// }
      let orderResponse

      try {
     
     
        // const cardResponse =await createCartUserApplication(vendorKey,visa_info);
        const get_cart_details = localStorage.getItem("added_cart_details");
     let cartResponse;
if (get_cart_details) {
  const parsedData = JSON.parse(get_cart_details); // parsedData is now an object
  cartResponse = parsedData.result[0]; // Now this is valid
}
        
         const get_user=localStorage.getItem("user_info_cep");
            const userInfo=get_user?JSON.parse(get_user):"";
              const auth_token=localStorage.getItem("sso_header");
            const header=auth_token?JSON.parse(auth_token):"";
            const accessToken=header?.authorization;
           
       if(requirements?.length > 0)  {
            const fileList=Object.keys(filesData);

           var  uploaded_document_details=[];
        for(let k=0;k<fileList.length;k++){
          const each_file_obj=fileList[k]
            const file_data=filesData[each_file_obj];
            const file_name=file_data?.name;
            if(file_name){
            const extension=file_name.substring(file_name.lastIndexOf('.')).toLowerCase();
            const formData=new FormData();
            formData.append("image",file_data);
            formData.append("document_type",each_file_obj)
            const response = await fetch(base_url+'/upload_documentss3',{
              method:"POST",
              headers:{
                "Authorization":"Bearer "+vendorKey
              },
              body:formData
            })
            if(response.ok){
            const data=await response.json();
            if(data.message=="File uploaded successfully"){
              //  const get_card_details=localStorage.getItem("added_card_details");
              //  const parse_card=get_card_details && JSON.parse(get_card_details);
            const obj={
                cart_id:cartResponse?.id,
                document_type:each_file_obj,
                document:data.fileUrl
            }
            uploaded_document_details.push(obj);
            }
            }
          }
        }
        
        const UpdateFileInfoResponse=await fetch(base_url+"/upload_documents",{
          method:"POST",
          headers:{
            "Authorization":"Bearer "+vendorKey,
            "Content-Type":"application/json"
          },
          body:JSON.stringify({data:uploaded_document_details})
        })
        
          const update_file_data=await UpdateFileInfoResponse.json()
        if(update_file_data.message=="Upload process completed"){
        localStorage.setItem("file_stored_info",JSON.stringify(uploaded_document_details));
        }
                 }

           orderResponse = await createIframeOrderVisaOmantel(orderData)
        // Navigate to payment confirmation page
          // console.log("Iframe order created successfully:", orderResponse)



        // Check if we have a valid iframe_deeplink_url
        if (!orderResponse?.result?.iframe_deeplink_url) {
          throw new Error("Backend issue: Missing iframe_deeplink_url in response. Please try again later.")
        }

        const local_cart_data= localStorage.getItem("added_cart_details");
      const omantel_order=localStorage.getItem("omantel_order_insertion");
      
        const iframe_insert_id=omantel_order?JSON.parse(omantel_order).id:"";
        let cart_id;
        if(local_cart_data){
          let cart_data = JSON.parse(local_cart_data);
          cart_id = cart_data.result[0].id;
        }
        const update_cart_data={
          traveller_id:travellerResponse.result[0].id,
          omantel_order_id:iframe_insert_id,
          cart_id:cart_id,
          document_status:"complete"
        }

        const omantel_cart_response =await fetch(base_url+"/update_omantel_cart_ids",{
          method:"POST",
          headers:{
            "Authorization":"Bearer "+vendorKey,
            "Content-Type":"application/json"
          },
          body:JSON.stringify(update_cart_data)
        });
        if(!omantel_cart_response.ok){
          throw new Error("the update cart Api : "+omantel_cart_response.statusText)
        }

             const eventDetails = {
              sub_type: "Form Submission - Next Stage",
              description: "User is submitting the form to proceed to the next stage."
            };
            //  await sendEventMsgToCEPApp(eventDetails,userInfo,accessToken)
        // router.push("/payment-confirmation")
        // router.push("/visa-iframe")
        const deeplink_url=orderResponse?.result?.iframe_deeplink_url
        window.location.href=deeplink_url;

      } catch (error) {
        console.error("Error creating iframe order:", error)
        // Check if we're in development/preview mode and continue with mock data
        // if (process.env.NODE_ENV !== "production" || window.location.hostname.includes("localhost")) {
        //   console.log("Development mode detected, continuing with mock data")
          // The createIframeOrderVisaOmantel function will handle creating mock data
          // orderResponse = await createIframeOrderVisaOmantel(orderData)

   
          // // router.push("/payment-confirmation")
          // router.push("/visa-iframe")
        // } else {
        //   throw error // Re-throw in production
        // }
      }
    // } catch (error) {
    //   console.error("Error during submission:", error)
    //   setSubmissionError(
    //     error instanceof Error
    //       ? error.message
    //       : "Backend issue: An error occurred while processing your application. Please try again later.",
    //   )
    // } 
    // finally {
    //   setIsSubmitting(false)
    // }
  }
  catch(err){
    console.error(err);
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


 const handleFileDelete=(name:any,index:number)=>{
     
   setFilesData((prev) => ({
      ...prev,
      [name]: null,
    }));
  }

const handleChangeFile = (
  e:any,
  index: number
) => {
  
  const { name, id } = e.target;
  const allowedExt = ['pdf', 'png', 'jpeg', 'jpg'];

  const file = e.target.files?.[0];
 
  if (file) {
    
     const ext = file.name.split('.').pop()?.toLowerCase();
    if(allowedExt.includes(ext)){
//       const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// if (file?.size) {
//   if (file.size > MAX_FILE_SIZE) {
//     e.target.value = ""; 
//     // setFileError(()"File size must be less than 2MB.");
//     return;
//   }
// }
    setFilesData((prev) => ({
      ...prev,
      [name.replace(" ","_")]: file,
    }));
  }
  else{
    // "file format is not supported"
     e.target.value = ""; 
  }
  }

  const inputElement = document.getElementById(id) as HTMLInputElement;
  if (inputElement) {
    inputElement.value = "";
  }
};

useEffect(()=>{
  const callRequirements=async()=>{
   
    try{
    // Add file submission logic here
   const destination1 :string | null | undefined=localStorage.getItem("visa_destination");
   if(destination1){
   setDestinationCountry(destination1)
   }
    const country={
    "destination":destination1
}
    const response=await fetch(base_url+"/visa_required_doc",{
      method:"POST",
      headers:{
       "Authorization":"Bearer "+vendorKey,
       "Content-Type":"application/json"
      },
      body:JSON.stringify(country)
    });
    if(response.ok){
    const data =await response.json();
    if(data.message==="success"){
       setRequirements(data.result);
       if(data.result.length>0){
      data.result.forEach((obj:any)=>(
      setFilesData((prev) => ({
      ...prev,
      [obj.required_documents.replace(/ /g, "_")]: null,
    }))
      ))
    }
       
    }}
  }catch(err){
    console.log("err at get requirements API",err);
  }
  finally{
    setIsLoading(false);
  }
}
if(vendorKey){
  callRequirements();
}
},[vendorKey])


if(isLoading){
   return <Loading />
}

  const uploadProgress = requirements.length > 0 ? (getUploadedFileLength() / requirements.length) * 100 : 100

const getSizeOfFile=(size:any)=>{
  
return (size/1024).toFixed(0);
}


const checkPhoneCodeFormat=(e:any)=>{

  const {name,value}=e.target;
  const filterValue=value.split("+")[1]
  const codePattern = /^[0-9]+$/;

  if(!codePattern.test(filterValue) || filterValue.length==0){

     setPhoneCodeError("code");
  }
  else{
    setPhoneCodeError("");
  }


}



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* <div className="mb-8">
            <Button
              variant="ghost"
              className="flex items-center justify-center text-gray-600 hover:text-[#ea6e00] p-2 h-9 w-9"
              onClick={handleBack}
              aria-label="Back to visa results"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div> */}

          <div className="mb-8" >
            <h1 className="text-4xl font-bold text-gray-800 ">{t("Visa")} {t("Application")}</h1>
            <p className="body-default text-gray-600">
             {t("Please fill in the form below to apply for your")} {visaType!="Tourist Visa"? visaType:""}{visaType=="Tourist Visa"? t(visaType):""} {t("to")} {t(destination)}.
             </p>
          </div>

          <Card className="mt-4 shadow-lg border-0 rounded-2xl overflow-hidden">
              {/* <CardHeader className="bg-gray-50 border-b p-8">
            <CardTitle className="text-2xl text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-[#ea6e00]" />
              Visa Application for {destination}
            </CardTitle>
            <p className="text-gray-600 mt-2">{visaDetails?.result?.programs[0]?.program_name}</p>
          </CardHeader> */}
            <CardContent className="p-8 pt-10">
              <form autoComplete="off" onSubmit={handleSubmit} className="space-y-8"  >
                {/* Personal Information */}
                <div>
                   <div  className="flex"><Info className="h-5 w-5 me-2 text-[#ea6e00] " style={{position:"relative",top:"4px"}} />
                  <h3 className="heading-4 mb-4">{t("Personal Information")}</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="label">
                         {t("First")} {t("Name")} *
                      </Label>
                      <CustomInput
                        id="firstName"
                        ref={firstNameRef}
                        name="firstName"
                          className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={checkNameFormat}
                        placeholder={t("Enter your first name")}
                         error={firstNameError!==""?t(firstNameError):""}
                      success={formData.firstName !== "" && firstNameError===""}
                       
                      />
                     
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="label">
                       {t("Last")} {t("Name")} *
                      </Label>
                      <CustomInput
                        id="lastName"
                        name="lastName"
                        ref={lastNameRef}
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={checkNameFormat}
                         placeholder={t("Enter your last name")}
                         error={lastNameError!==""?t(lastNameError):""}
                      success={formData.lastName !== "" && lastNameError===""}
                        
                      />
                    </div>
                    <div className="space-y-2 ">
                      <Label htmlFor="email" className="label">
                        {t("Email")} *
                      </Label>
                      <CustomInput
                        id="email"
                        name="email"
                        type="email"
                        ref={emailRef}
                        className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={checkEmailFormat}
                        placeholder={t("Enter your email address")}
                        error={ EmailError!==""?t(EmailError):""}
                        success={formData.email !== "" && EmailError===""} 
                      />
                    </div>


                    {/* country */}

                     {/* <div className="space-y-2">
                                      <Label htmlFor="destination" className="label font-medium">
                                      {t("Country")}
                                      </Label>
                                      <div className="relative">
                                        <CustomInput
                                          type="text"
                                          id="destination-search"
                                          placeholder={t("Search for a country")+"..."}
                                          className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                                          value={i18n.language=="en"?searchData.country:searchData.country_arabic}
                                          onChange={(e) => {
                                            const destination =searchData.country;
                                            if(e.target.value.length<destination.length){
                                                setFormData((prev) => ({ ...prev, country:"" }))
                                            }
                                            setSearchData((prev) => ({ ...prev, country: e.target.value,country_arabic:e.target.value }))
                                            const dropdown = document.getElementById("destination-dropdown")
                                            if (dropdown) dropdown.style.display = "block"
                                          }}
                                          onFocus={() => {
                                            const dropdown = document.getElementById("destination-dropdown")
                                            if (dropdown) dropdown.style.display = "block"
                                          }}
                                          error={attemptedSubmit && !formData.country ? t("Please select a country") : ""}
                                          success={formData.country !== ""}
                                        />
                                        <button
                                          type="button"
                                          className={`absolute end-0 top-0 h-12 px-l text-hayyak hover:text-hayyak-hover active:text-hayyak-pressed`}
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
                      i18n.language === "en"
                        ? countries
                            .filter(
                              (country: any) =>
                                searchData.country === "" ||
                                country.country.toLowerCase().includes(searchData.country.toLowerCase())
                            )
                            .map((country: any) => (
                              <div
                                key={country.country}
                                className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                   setFormData((prev) => ({ ...prev, country: country.country }));
                                  setSearchData((prev) => ({ ...prev,country: country.country , country_arabic: country.arabic_country }));
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
                                searchData.country === "" ||
                                (country.arabic_country ?? "").toLowerCase().includes(searchData.country.toLowerCase())
                            )
                            .map((country: any) => (
                            
                    
                              country.arabic_country?<div
                                key={country.country}
                                className="px-4 py-3 cursor-pointer body-small hover:bg-hayyak-light transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, country: country.country }));
                                  setSearchData((prev) => ({ ...prev,country: country.country , country_arabic: country.arabic_country }));
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
                                    </div> */}

              

                     <div className="space-y-2">
                      <Label htmlFor="phone" className="label">
                        {t("Phone")} {t("Number")} *
                      </Label>
<div className="flex gap-3">
  <div className="w-[30%]">
                      <CustomInput
                        id="countryCode"
                        name="countryCode"
                        ref={countryCodeRef}
                        className="h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={(formData.countryCode.includes("+")?"":"+")+formData.countryCode}
                        // disabled={true}
                        onChange={handleInputChange}
                        onBlur={checkPhoneCodeFormat}
                        //  placeholder={t("Enter your phone number")}
                        success={formData.countryCode.substring(1) !== ""}
                        error={phoneCodeError?phoneCodeError:""}

                        // error={attemptedSubmit && !formData.phone ?error.phone?error.phone: "Phone no is required." : ""}
                      />
                  </div>
                  
                      <CustomInput
                        id="phone"
                        name="phone"
                        ref={phoneNoRef}
                        className="h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={checkPhoneFormat}
                         placeholder={t("Enter your phone number")}
                        success={formData.phone !== "" && PhoneError===""}
                        error={PhoneError!==""?t(PhoneError):""}

                        // error={attemptedSubmit && !formData.phone ?error.phone?error.phone: "Phone no is required." : ""}
                      />
                   </div>
                    </div>

                  </div>
                </div>

                
                   
            
             

                {/* Address Information - Improve mobile layout */}
                {/* <div>
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
                    </div> 
                   {/* <div className="space-y-2 col-span-1 sm:col-span-2">
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
                </div> */}

               



  <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Paperclip className="h-5 w-5 me-2 text-[#ea6e00]" />
                   {t("Document Requirements for")} {destinationCountry ?t(destinationCountry):""}
                  </h3>

                  
                  {/* Box displaying the requirements */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">
                      {t("Required Documents to Upload")} ({requirements.length} {t('file(s)')}):
                      </h4>
                      {/* This list renders if numberOfRequiredDocs > 0 */}
                      {requirements.length > 0 ? (
                        <>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                          {requirements.map((doc, index) => (
                            <li key={index}>{i18n.language=="en"?doc.required_documents:doc.required_documents_arabic}</li> // For USA, this should show "Passport Photo"
                          ))}
                        </ul>
                         <div className="mt-3">
                        <h4 className="font-semibold text-amber-800 mb-2">{t("Additional Information & Guidelines:")}</h4>
                           {
                           requirements.map((doc, index) => (
                            doc?.additional_information?
                        <p className="text-amber-700 text-sm leading-relaxed">
                          {i18n.language=="en"?doc?.additional_information:doc?.additional_information_arabic}
                         
                           {/* For USA, this shows passport validity */}
                        </p>
                        :<></>
                          ))}
                          <p className="text-amber-700 text-sm leading-relaxed">{t("The accepted file formats are JPEG, JPG, PNG, and PDF.")}</p>
                      </div>
                      </>
                      ) : (
                        <p className="text-amber-700">
                          {t("No specific documents need to be uploaded for this destination through our system.")}
                        </p>
                      )
                      }
                    </div>                   
                  </div>
                  {requirements.length>0 && <h4 className="mt-6 font-semibold text-gray-800 mb-3">{t('Upload Your Documents')}:</h4>}
               <div className="flex-col md:flex-row" style={{display:"flex"}}>
              {requirements.length>0 ? requirements?.map((req:any, index:number) => (
                <div key={index} className="mr-3">
                                   
                  <input
                    type="file"
                    accept="application/pdf, image/png, image/jpeg, image/jpg"
                    name={req.required_documents.replace(/ /g, "_")}
                    id={req.required_documents.replace(/ /g, "_")}
                    onChange={(e)=>handleChangeFile(e,index)}
                    className="w-full border p-2 rounded-md "
                    style={{display:"none"}}
                  />
                  
               {  
               <>   <Button
                 type="button"
              onClick={()=>{document.getElementById(req.required_documents.replace(/ /g, "_"))?.click()}}
              className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4"
            ><span style={{ color: "white" }}>
 {filesData[req.required_documents.replace(/ /g, "_")]?.name ? 
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.6911 2.11058C14.2284 1.9995 13.7487 1.99973 13.1137 2.00003L9.7587 2.00006C8.95373 2.00005 8.28937 2.00004 7.74818 2.04426C7.18608 2.09018 6.66937 2.18875 6.18404 2.43604C5.43139 2.81953 4.81947 3.43145 4.43598 4.1841C4.18868 4.66944 4.09012 5.18614 4.04419 5.74824C3.99998 6.28943 3.99999 6.95378 4 7.75875V16.2414C3.99999 17.0463 3.99998 17.7107 4.04419 18.2519C4.09012 18.814 4.18868 19.3307 4.43598 19.816C4.81947 20.5687 5.43139 21.1806 6.18404 21.5641C6.66937 21.8114 7.18608 21.9099 7.74818 21.9559C8.28937 22.0001 8.95372 22.0001 9.75868 22.0001H14.2413C15.0463 22.0001 15.7106 22.0001 16.2518 21.9559C16.8139 21.9099 17.3306 21.8114 17.816 21.5641C18.5686 21.1806 19.1805 20.5687 19.564 19.816C19.8113 19.3307 19.9099 18.814 19.9558 18.2519C20 17.7107 20 17.0463 20 16.2414L20 8.8864C20.0003 8.25142 20.0006 7.77161 19.8895 7.30892C19.7915 6.90078 19.6299 6.5106 19.4106 6.15271C19.1619 5.74699 18.8225 5.40789 18.3733 4.95909L17.041 3.62678C16.5922 3.17756 16.2531 2.83813 15.8474 2.5895C15.4895 2.37019 15.0993 2.20857 14.6911 2.11058ZM13 4.00006H9.8C8.94342 4.00006 8.36113 4.00084 7.91104 4.03761C7.47262 4.07343 7.24842 4.13836 7.09202 4.21805C6.7157 4.4098 6.40973 4.71576 6.21799 5.09208C6.1383 5.24848 6.07337 5.47269 6.03755 5.9111C6.00078 6.36119 6 6.94348 6 7.80006V16.2001C6 17.0566 6.00078 17.6389 6.03755 18.089C6.07337 18.5274 6.1383 18.7516 6.21799 18.908C6.40973 19.2844 6.7157 19.5903 7.09202 19.7821C7.24842 19.8618 7.47262 19.9267 7.91104 19.9625C8.36113 19.9993 8.94342 20.0001 9.8 20.0001H14.2C15.0566 20.0001 15.6389 19.9993 16.089 19.9625C16.5274 19.9267 16.7516 19.8618 16.908 19.7821C17.2843 19.5903 17.5903 19.2844 17.782 18.908C17.8617 18.7516 17.9266 18.5274 17.9624 18.089C17.9992 17.6389 18 17.0566 18 16.2001V9.00006H16C14.3431 9.00006 13 7.65692 13 6.00006V4.00006ZM17.56 7.00006C17.4398 6.85796 17.2479 6.66216 16.887 6.30128L15.6988 5.11306C15.3379 4.75218 15.1421 4.56026 15 4.44009V6.00006C15 6.55235 15.4477 7.00006 16 7.00006H17.56Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L11.7071 16.7071C11.3166 17.0976 10.6834 17.0976 10.2929 16.7071L8.29289 14.7071C7.90237 14.3166 7.90237 13.6834 8.29289 13.2929C8.68342 12.9024 9.31658 12.9024 9.70711 13.2929L11 14.5858L14.2929 11.2929C14.6834 10.9024 15.3166 10.9024 15.7071 11.2929Z" fill="currentColor"/>
</svg> :
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M20 16C20 15.4477 19.5523 15 19 15C18.4477 15 18 15.4477 18 16V18H16C15.4477 18 15 18.4477 15 19C15 19.5523 15.4477 20 16 20H18V22C18 22.5523 18.4477 23 19 23C19.5523 23 20 22.5523 20 22V20H22C22.5523 20 23 19.5523 23 19C23 18.4477 22.5523 18 22 18H20V16Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 4.00006H9.8C8.94342 4.00006 8.36113 4.00084 7.91104 4.03761C7.47262 4.07343 7.24842 4.13836 7.09202 4.21805C6.7157 4.4098 6.40973 4.71576 6.21799 5.09208C6.1383 5.24848 6.07337 5.47269 6.03755 5.9111C6.00078 6.36119 6 6.94348 6 7.80006V16.2001C6 17.0566 6.00078 17.6389 6.03755 18.089C6.07337 18.5274 6.1383 18.7516 6.21799 18.908C6.40973 19.2844 6.7157 19.5903 7.09202 19.7821C7.24842 19.8618 7.47262 19.9267 7.91104 19.9625C8.36113 19.9993 8.94342 20.0001 9.8 20.0001H12C12.5523 20.0001 13 20.4478 13 21.0001C13 21.5523 12.5523 22.0001 12 22.0001H9.75868C8.95372 22.0001 8.28936 22.0001 7.74818 21.9559C7.18608 21.9099 6.66937 21.8114 6.18404 21.5641C5.43139 21.1806 4.81947 20.5687 4.43598 19.816C4.18868 19.3307 4.09012 18.814 4.04419 18.2519C3.99998 17.7107 3.99999 17.0463 4 16.2414V7.75876C3.99999 6.9538 3.99998 6.28943 4.04419 5.74824C4.09012 5.18614 4.18868 4.66944 4.43598 4.1841C4.81947 3.43145 5.43139 2.81953 6.18404 2.43604C6.66937 2.18875 7.18608 2.09018 7.74818 2.04426C8.28937 2.00004 8.95373 2.00005 9.7587 2.00006L13.1137 2.00003C13.7487 1.99973 14.2284 1.9995 14.6911 2.11058C15.0993 2.20857 15.4895 2.37019 15.8474 2.5895C16.2531 2.83813 16.5922 3.17756 17.041 3.62678L18.3733 4.95909C18.8225 5.40788 19.1619 5.74699 19.4106 6.15271C19.6299 6.5106 19.7915 6.90078 19.8895 7.30892C20.0006 7.77161 20.0003 8.2514 20 8.88638L20 12.0001C20 12.5523 19.5523 13.0001 19 13.0001C18.4477 13.0001 18 12.5523 18 12.0001V9.00006H16C14.3431 9.00006 13 7.65692 13 6.00006V4.00006ZM17.56 7.00006C17.4398 6.85796 17.2479 6.66216 16.887 6.30128L15.6988 5.11306C15.3379 4.75218 15.1421 4.56026 15 4.44009V6.00006C15 6.55235 15.4477 7.00006 16 7.00006H17.56Z" fill="currentColor"/>
</svg>

}
</span>


       &nbsp; {i18n.language=="en"?req.required_documents:req.required_documents_arabic}
            </Button>
            <div className="text-sm" style={{color:"rgb(239 68 68)"}}>{attemptedSubmit && !filesData[req.required_documents.replace(/ /g, "_")]?.name ?`required.`:"" }</div>
            </>
       }
        
     {/* {filesData[req.required_documents.replace(/ /g, "_")]?.name && (
      <div className="flex label font-medium" style={{ border: "1px solid", gap: '8px' , padding: "10px",
        marginTop: "10px",  borderRadius: "15px"}}>
  <div className="flex w-[90%] justify-center" >
    <div
      style={{
          
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block", // Ensure it behaves correctly
      }}
      title={filesData[req.required_documents.replace(/ /g, "_")]?.name} // Optional: show full name on hover
    >
      {
        filesData[req.required_documents.replace(/ /g, "_")]?.name.substring(
          0,
          filesData[req.required_documents.replace(/ /g, "_")]?.name.lastIndexOf(".")
        )
      }
    </div>
    <div >
      {
        filesData[req.required_documents.replace(/ /g, "_")]?.name.substring(
          filesData[req.required_documents.replace(/ /g, "_")]?.name.lastIndexOf(".") as number
        )
      }
    </div>
  </div>
  <div onClick={(e)=>handleFileDelete(req.required_documents.replace(/ /g, "_"),index)}>
    <span style={{color:"red"}} 
    
      >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.29289 8.29289C8.68342 7.90237 9.31658 7.90237 9.70711 8.29289L12 10.5858L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L13.4142 12L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L12 13.4142L9.70711 15.7071C9.31658 16.0976 8.68342 16.0976 8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929L10.5858 12L8.29289 9.70711C7.90237 9.31658 7.90237 8.68342 8.29289 8.29289Z" fill="currentColor"/>
</svg></span>

  </div>
  </div>
)} */}

            </div>
                
              ))
            :<></>}
            </div>
          
        </div>

   {/* <div className="space-y-3 mb-4"></div> */}
        {/* uploaded files */}
        
                         { getUploadedFileLength()>0 &&  <p className="text-sm font-medium text-gray-700">{t("Uploaded files")}:</p>}
                          {
                            
                            requirements.length>0 && requirements?.map((req,index)=>(
                                filesData[req.required_documents.replace(/ /g, "_")]?.name && (
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg text-sm">

  { filesData[req.required_documents.replace(/ /g, "_")] &&  <div
      style={{
        width:"90%",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block", // Ensure it behaves correctly
      }}
      className="truncate text-gray-700"
      title={filesData[req.required_documents.replace(/ /g, "_")]?.name} // Optional: show full name on hover
    >
      {
        filesData[req.required_documents.replace(/ /g, "_")]?.name 
      }<span>{getSizeOfFile(filesData[req.required_documents.replace(/ /g, "_")]?.size)}KB</span>
    </div>}
   
  <div onClick={(e)=>handleFileDelete(req.required_documents.replace(/ /g, "_"),index)}>
    <span style={{color:"red"}} 
    
      >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.29289 8.29289C8.68342 7.90237 9.31658 7.90237 9.70711 8.29289L12 10.5858L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L13.4142 12L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L12 13.4142L9.70711 15.7071C9.31658 16.0976 8.68342 16.0976 8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929L10.5858 12L8.29289 9.70711C7.90237 9.31658 7.90237 8.68342 8.29289 8.29289Z" fill="currentColor"/>
</svg></span>

  </div>
  </div>
)
                            ))
                          }
        



         {/* Upload Progress Bar */}
                    {
                       
                       requirements.length>0 &&<div className="mt-2" >
                        <Progress value={uploadProgress} className="w-full h-2 [&>div]:bg-[#ea6e00]" />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {getUploadedFileLength()} {t("of")} {requirements.length} {t("files uploaded")}
                        </p>
                      </div>
                         
                         }


                {/* Consent and Information */}
                {/* <div className="space-y-2">
                  <p className="body-small text-gray-600">
                    {t("We use this to create your E-Visa and send you updates about your application")}
                  </p>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={handleCheckboxChange}
                      className="me-2"
                    />
                    <Label htmlFor="marketingConsent" className="body-small font-normal  leading-tight cursor-pointer">
                       {t("I want to receive E-Visa updates, product launches and personalized offers. I can opt out anytime.")}
                      </Label>
                  </div>
                </div> */}

                {/* Submit Button */}
                <div className="pt-4">
                  {submissionError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 body-small">
                     {t("Error")}: {submissionError}
                    </div>
                  )}
                  <div className="flex justify-end">
                  <Button
                    type="submit"
                  // className={`w-full ${[formData.marketingConsent?"bg-[#ea6e00]":"bg-[grey]"]} ${validationCheck?"bg-[#ea6e00] hover:bg-[#ea6e00]":"bg-[#8E8E8E] hover:bg-[#8E8E8E]"} active:bg-[#b55500] text-white py-6 body-large font-medium rounded-[16px] min-h-[56px]`}
                  className={` ${[formData.marketingConsent?"bg-[#ea6e00]":"bg-[grey]"]} ${validationCheck?"bg-[#ea6e00] hover:bg-[#ea6e00]":"bg-[#8E8E8E] hover:bg-[#8E8E8E]"} active:bg-[#b55500] text-white py-1 body-large font-medium rounded-[16px]  disabled:opacity-50`}
                    disabled={!validationCheck || !formData.marketingConsent }
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <LoadingIndicator size="small" />
                      </div>
                    ) : (
                      t("Start Visa Application")
                    )}
                  </Button>
                  </div>
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
