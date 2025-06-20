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
import {sendEventMsgToCEPApp, getVendorKey } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"
import { CustomInput } from "@/components/ui/custom-input"
import { Progress } from "@/components/ui/progress"
// import Loading from "./loading"
import config from "@/lib/api-config"
import Lottie from "lottie-react"


import animationFailure from "../../public/function-icon-anime/failure-icon.json"


import { useTranslation } from "react-i18next"
import  "@/lib/i18n"

export default  function VisaHistory() {

    const [locale,setLocale]=useState("en");
    
    const { t,i18n } = useTranslation();
    const [vendorKey,setVendorKey]=useState("");
    const [haederData,setHeaderData]=useState({});
    const base_url=config.BASE_URL;

       useEffect(()=>{
         const getLanguage=localStorage.getItem("app_language");
          if(getLanguage){
          setLocale(getLanguage);
          }
        },[])

        const [visaHistory,setVisaHistory]= useState([]);

        useEffect(()=>{
            const callVendorApi=async()=>{
            const vendor_key= await getVendorKey();
            setVendorKey(vendor_key)
            }
            callVendorApi();
        },[])

   
        useEffect(()=>{
            if(vendorKey){
               
            }
          
        },[vendorKey])


   
    return (
        // bg-[linear-gradient(to_bottom,_#fef2f2_15%,_#f9fafb_85%)]
        <>
     <div className="min-h-screen flex flex-col relative">
  {/* Your content here */}
  <div className="h-[30%] md:h-[40%]" style={{width:"100%",background:"#fef2f2",position: "absolute", top:"0",zIndex:"-1"}}></div>
 {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
       

          <div className="mb-8" >
           <div className="flex justify-center"> <Lottie 
  animationData={animationFailure} 
  loop={false} 
  autoplay={true} 
  style={{ width: 125, height: 125 }} 
/></div>

            <h1 className="text-4xl font-bold text-gray-800 text-center">Payment Failed</h1>
            {/* {t("Visa")} {t("Pending")} {t("History")} */}
            {/* <p className="body-default text-gray-600">
          
             </p> */}
          </div>
          <div className="h-[80px]"></div>
<div className="md:flex md:justify-center">
  <Button className="w-full md:w-[50%] text-start px-6 py-8 justify-start bg-gray-50 border text-gray-800 text-xl hover:bg-gray-50  active:bg-gray-50 ">
    Retry
    <span className="text-2xl text-gray-400 w-full text-end">{'>'}</span>
  </Button>
</div>

          </div>
          </main>
          </div>
        </>
    )
    
}