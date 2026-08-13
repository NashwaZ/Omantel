"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardTitle,CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Currency } from "lucide-react"
import { useCountryList } from "@/lib/countries"
import ApiDebugPanel from "@/components/api-debug-panel"
import {sendEventMsgToCEPApp, getVendorKey, getVisaPrograms } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"
import { CustomInput } from "@/components/ui/custom-input"
import { Progress } from "@/components/ui/progress"

import Loading from "./loading"
import config from "@/lib/api-config"


import { useTranslation } from "react-i18next"
import  "@/lib/i18n"


export default  function VisaHistory() {

  const getPlaceholderImageUrl = (destination: string) =>
    `https://flags.restcountries.com/v5/svg/${destination?.toLowerCase().slice(0, 2)}.svg`

    const [locale,setLocale]=useState("en");
    
    const { t,i18n } = useTranslation();
    const [vendorKey,setVendorKey]=useState("");
    const [haederData,setHeaderData]=useState({});
    const [cartData,setCartData]=useState({id:""});
    const base_url=config.BASE_URL;
    const router=useRouter();
    const [isLoading,setIsLoading]=useState(true);
    const [deletingId,setDeletingId]=useState("")

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
            const get_cart_data=localStorage.getItem("added_cart_details");
            if(get_cart_data){
                const parse_cart=JSON.parse(get_cart_data);
                const cart_data=parse_cart.result[0]
                setCartData(cart_data)
            }
        },[])

   
            const getVisaHistoryData=async()=>{
              
              try{ 
               const getHeader=localStorage.getItem("user_info_cep");
               let getUserId;
               if(getHeader){
                getUserId=JSON.parse(getHeader)?.user_id;
                setHeaderData(JSON.parse(getHeader));
               }
                  const user_data ={
                    user_id:getUserId 
                }
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
                if (data.message === "success") {
                   
                setVisaHistory(data.result);
            }
        }

                catch(err){
                    console.error(err);
                }
                finally{
                  setIsLoading(false);
                }
            }

        useEffect(()=>{
            if(vendorKey){
                getVisaHistoryData();
            }
          
        },[vendorKey])

        if(isLoading){
          return <Loading />
        }


        
        const startProcess=async(e:any,history:any)=>{
             const obj ={message:"success",result:[history]}

             localStorage.setItem("added_cart_details",JSON.stringify(obj));
             localStorage.setItem("selected_program_id",history?.program_id);
             localStorage.setItem("visa_citizenship",history?.citizenship);
             localStorage.setItem("visa_destination",history?.destination);
             localStorage.setItem("visa_program_ids",JSON.stringify([history?.program_id]));
             localStorage.setItem("visa_travelDate",history?.travel_date);
        const params = {
                destination: history?.destination,
                citizenship: history?.citizenship,
                 arrivalDate: history?.travel_date,
               }

        // console.log("Fetching visa programs with params:", params)

        // Call the API function
        const response = await getVisaPrograms(params)

              router.push("/visa-application/?programId="+history?.program_id)
        }
        
        const inProgress=(e:any,history:any)=>{
              router.push("/visa-application/?programId="+history?.program_id)
        }

        const handleDeleteVisaHistory=async(e:any,id:number|string)=>{

            e.preventDefault();
               
          try { 
            const req_data ={
                id:id
            }
            const response =await fetch(base_url+"/delete_visa_data_from_cart",{
                method:"POST",
                headers:{
                    "Authorization":"Bearer "+vendorKey,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(req_data)
            });
            if(!response.ok){
                throw new Error("could not delete visa details");
            }
            setDeletingId(String(id));
            const data =await response.json();
            if(data.message==="success"){
                getVisaHistoryData();
               
            }
        }
        catch(err){
            console.error(err)
        }
         

        }
      
   
    return (
       
        <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
       

          <div className="mb-8" >
            <h1 className="text-4xl font-bold text-gray-800 text-center">{t("Pending Visa Records")}</h1>
            {/* {t("Visa")} {t("Pending")} {t("History")} */}
            {/* <p className="body-default text-gray-600">
          
             </p> */}
          </div>
          <div className="px-5 py-3 border mb-[25px] rounded bg-[#fff2e6]">
            <h2 className="text-xl font-bold text-gray-800 ">{t("Notes")}:</h2>
            <p>{t("Only 5 pending visa orders can be maintained. Remove older or unused ones to continue.")}</p>
          </div>

<div className="flex gap-[12px] flex-wrap">
    
    {visaHistory.length>0 && visaHistory?.map((history:any,index)=>(
    <Card className={`p-[12px] sm:w-full md:w-[49%] relative transition-all duration-100 ease-in-out  ${
            deletingId == history.id ? "opacity-0 scale-95 -translate-y-4" : ""
          }`} key={index}>
        <CardHeader className="w-full mb-[10px]">
            <div className="flex justify-between w-full">
           <CardTitle>{t("Order")} #{history.program_id.split("-")[0]}</CardTitle>
             <div  onClick={(e)=>{handleDeleteVisaHistory(e,history?.id)}} style={{cursor:"pointer"}}>
         <span style={{color:"red"}} 
      >
   <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentColor"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
    fill="currentColor"
  />
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M8.29289 8.29289C8.68342 7.90237 9.31658 7.90237 9.70711 8.29289L12 10.5858L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L13.4142 12L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L12 13.4142L9.70711 15.7071C9.31658 16.0976 8.68342 16.0976 8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929L10.5858 12L8.29289 9.70711C7.90237 9.31658 7.90237 8.68342 8.29289 8.29289Z"
    fill="currentColor"
  />
</svg>
</span>
          </div>
          </div>
        </CardHeader>
            <div className="flex pb-[6px]">
                <div className="w-[60%]">
           
            <CardContent >
                <table>
                    <tbody>
                        <tr>
                         <td>
                <p>{t("Destination")}</p>
                </td>
                <td>
              : {t(history?.destination.substring(0,1).toUpperCase()+history?.destination.substring(1))}
                </td>
                </tr>
                 <tr>
                 <td>
                <p>{t("Citizenship")}</p>
                </td>
                <td>
              : {t(history?.citizenship.substring(0,1).toUpperCase()+history?.citizenship.substring(1))}
                </td>
                </tr>
                <tr>
                         <td>
                <p>{t("Order Status")} </p>
                </td>
                <td>
              : {t(history?.status.substring(0,1).toUpperCase()+history?.status.substring(1))}
                </td>
                </tr>
                    </tbody>
                </table>
            </CardContent>
            </div>
           
            <div className=" w-[40%]">
            <img
              src = {history.country_flags?.toString() || getPlaceholderImageUrl(history?.destination_code)}
              //  src={history.country_flags?.to}
               alt="destination"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = getPlaceholderImageUrl(history?.destination_code)
               }}
             />
            </div>
            </div>
            <div className="h-[50px]"></div>
             <CardFooter style={{position:"absolute",bottom:"15px"}}>
            <div className="flex gap-[8px] mt-[12px]">
         
    {(cartData && cartData['id'] )&& cartData?.id ==history.id?
                 <Button className="px-8" name={`history_${history.id}`}
                 disabled={visaHistory && visaHistory.length>5} onClick={(e)=>inProgress(e,history)}>
             {t("In Progress")}
                
                </Button>
                :  <Button className="px-8" name={`history_${history.id}`}
                 disabled={visaHistory && visaHistory.length>5} onClick={(e)=>startProcess(e,history)}>
            {t("Start Process")}
                   
                </Button>
}
                </div>
                </CardFooter>
          </Card>
    ))}
      
 
       <div className="md:flex md:justify-center w-full" >
  <Button className="w-full md:w-[50%] px-6 bg-gray-50 border border-[#ea6e00] text-[#ea6e00]  hover:bg-gray-100 active:bg-gray-100" 
    disabled={!Boolean(visaHistory?.length<5)}
    onClick={(e)=>{
             e.preventDefault();
             
            //  const destination=localStorage.getItem("visa_destination");
            //  const citizenship=localStorage.getItem("visa_citizenship");
            //  const travel_date=localStorage.getItem("visa_travelDate");
            // router.push(`/visa-results/?destination=${destination}&citizenship=${citizenship}&travelDate=${travel_date}`);
            router.back();
         }}>
     {t("Back to apply")}
  </Button>
</div>

          </div>
          </div>
          </main>
          </div>
        </>
    )
    
}