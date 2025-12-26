"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardTitle,CardHeader, CardFooter } from "@/components/ui/card"

import {sendEventMsgToCEPApp, getVendorKey, getVisaPrograms } from "@/lib/api"
import LoadingIndicator from "@/components/loading-indicator"
import { format } from 'date-fns';

import Loading from "./loading"
import config from "@/lib/api-config"



import { useTranslation } from "react-i18next"
import  "@/lib/i18n"


export default  function VisaHistory() {

    const [locale,setLocale]=useState("en");
    
    const { t,i18n } = useTranslation();
    const [vendorKey,setVendorKey]=useState("");
    const [haederData,setHeaderData]=useState({});
    const [cartData,setCartData]=useState({id:""});
    const base_url=config.BASE_URL;
    const router=useRouter();
    const [isLoading,setIsLoading]=useState(true);
    const [deletingId,setDeletingId]=useState("");
    const [moreBtnClicked,setMoreBtnClicked]=useState<number[]>([]);
    const [iframeLink,setIframeLink]=useState("");
    const [iframeOpen,setIframeOpen]=useState(false);
    const [iframeLoading,setIframeLoading]=useState(false);
    const [paymentLoading,setPaymentLoading]=useState(false);
    const iframe_base_url= config.IFRAME_BASE_URL;

       useEffect(()=>{
         const getLanguage=localStorage.getItem("app_language");
          if(getLanguage){
          setLocale(getLanguage);
          }
          document.getElementsByTagName("html")[0].style.overflow = "auto";
        },[])

        const [visaHistory,setVisaHistory]= useState([]);

        useEffect(()=>{
            const callVendorApi=async()=>{
            const vendor_key= await getVendorKey();
            setVendorKey(vendor_key)
            }
            callVendorApi();
        },[])


        // useEffect(()=>{
        //     const get_cart_data=localStorage.getItem("added_cart_details");
        //     if(get_cart_data){
        //         const parse_cart=JSON.parse(get_cart_data);
        //         const cart_data=parse_cart.result[0]
        //         setCartData(cart_data)
        //     }
        // },[])

   
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
                 const response =await fetch(base_url+"/get_visa_user_records",{
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

 if(iframeLoading || paymentLoading){
          return <LoadingIndicator fullScreen text={t("Loading...")} size="large" />
        }


        const handleBack=()=>{
          router.back();
        }

const handleExpandRows=(id:any)=>{


   setMoreBtnClicked((data)=>[...data,id])
}

const handleCollapseRows=(id:any)=>{
  const filterbyId=moreBtnClicked.filter(num=> num!=id);
   setMoreBtnClicked(filterbyId);
}
        
        // const startProcess=async(e:any,history:any)=>{
        //      const obj ={message:"success",result:[history]}

        //      localStorage.setItem("added_cart_details",JSON.stringify(obj));
        //      localStorage.setItem("selected_program_id",history?.program_id);
        //      localStorage.setItem("visa_citizenship",history?.citizenship);
        //      localStorage.setItem("visa_destination",history?.destination);
        //      localStorage.setItem("visa_program_ids",JSON.stringify([history?.program_id]));
        //      localStorage.setItem("visa_travelDate",history?.travel_date);
        // const params = {
        //         destination: history?.destination,
        //         citizenship: history?.citizenship,
        //          arrivalDate: history?.travel_date,
        //        }

        // console.log("Fetching visa programs with params:", params)

        // // Call the API function
        // const response = await getVisaPrograms(params)

        //       router.push("/visa-application/?programId="+history?.program_id)
        // }
        
        // const inProgress=(e:any,history:any)=>{
        //       router.push("/visa-application/?programId="+history?.program_id)
        // }

        // const handleDeleteVisaHistory=async(e:any,id:number|string)=>{

        //     e.preventDefault();
               
        //   try { 
        //     const req_data ={
        //         id:id
        //     }
        //     const response =await fetch(base_url+"/delete_visa_data_from_cart",{
        //         method:"POST",
        //         headers:{
        //             "Authorization":"Bearer "+vendorKey,
        //             "Content-Type":"application/json"
        //         },
        //         body:JSON.stringify(req_data)
        //     });
        //     if(!response.ok){
        //         throw new Error("could not delete visa details");
        //     }
        //     setDeletingId(String(id));
        //     const data =await response.json();
        //     if(data.message==="success"){
        //         getVisaHistoryData();
               
        //     }
        // }
        // catch(err){
        //     console.error(err)
        // }
         

        // }
      
        const openIframe=async(email:any,application_id:any)=>{
        try{
          
          const emails ={email:email}
          const response= await fetch(base_url+"/visa_download_iframe_link",{
            method:"POST",
            headers:{
             "Authorization":"Bearer "+vendorKey,
              "Content-Type":"application/json"
            },
            body:JSON.stringify(emails)

          })
          if(response.ok){
            const data = await response.json();
            if(data.message==="success"){
            if(data.result.deeplink){
                
              const deeplink_url=data.result.deeplink;
                window.location.href=deeplink_url;
        
                // setIframeLink(data.result.deeplink);
                //  setIframeLoading(true);
                // setIframeOpen(true);
               
                // const iframe_link={
                //   application_id:application_id,
                //   // iframe_url:`https://omantel.sandbox-simplevisa.net/applications/${application_id}/step/fill_form/?iframe=true`
                //   iframe_url:`${iframe_base_url}/applications/${application_id}/details/?iframe=true`
                // }
                // localStorage.setItem("status_iframe",JSON.stringify(iframe_link));
               
                // const delay = (ms:any) => new Promise((resolve) => setTimeout(resolve, ms));
                // await delay(10000);
                // router.push("/check-visa-status-iframe");
            
            }
          }
          }
        }
        catch(err){
          console.error("error at download iframe link : "+err);
        }

            
        }

        const handlePayment=async(e:any,orderId:any,applicationId:any)=>{ 
          e.preventDefault();
    
         if(!orderId || !vendorKey){
               console.error("Order ID is missing");
               return;
          }
             setPaymentLoading(true);
         
            try{
             
             const order_id={
               order_id:orderId
             } 
               const response =await fetch( base_url+"/omantel_payment_payload",{
                 method:"POST",
                 headers:{
                   Authorization:"Bearer "+vendorKey,
                   "Content-Type":"application/json"
                 },
                 body:JSON.stringify(order_id)
               })
               if(!response.ok){
                 throw new Error("Error at payment...");
               }
               const data =await response.json();
               if(data.message==="success"){
               //  var payment_id=JSON.stringify(data.result);
                   // const eventDetails = {
                   //   sub_type: "proceed_payment",
                   //   description: "Initiate the payment for visa."
                   // };
               
               // await sendEventMsgToCEPApp(eventDetails, userInfo, accessToken);
               
               if (
                 typeof window !== 'undefined' &&
                 window.ReactNativeWebView &&
                 typeof window.ReactNativeWebView.postMessage === 'function'
               ) {
                 const user_local_data = localStorage.getItem("user_info_cep");
                 const user_details = user_local_data ? JSON.parse(user_local_data) : "";
            
                 if (user_details) {
                   
                   const payload=data.result;
                   window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                   console.log('Message posted to React Native app:', payload);
                 }
               } else {
                 console.warn('Not running inside React Native WebView.');
               }
             }
         }
         catch(err){
           console.error(err);
         }
         finally{
           setPaymentLoading(false)
         }
        }
   
    return (
       
        <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
      { !iframeOpen ? 
    
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
       

          <div className="mb-8" >
            <h1 className="text-4xl font-bold text-gray-800 text-center">{t("Visa History")}</h1>
            {/* {t("Visa")} {t("Pending")} {t("History")} */}
            {/* <p className="body-default text-gray-600">
          
             </p> */}
          </div>
          

<div >
{/* // className="md:flex  md:gap-[15px] md:flex-wrap"> */}
    
    {visaHistory.length>0 ? visaHistory?.map((history:any,index)=>(
    <Card className={`p-[15px] sm:w-full  mt-4 transition-all duration-100 ease-in-out  ${
            deletingId == history.id ? "opacity-0 scale-95 -translate-y-4" : ""
          }`} key={index}>
        <CardHeader className="w-full mb-[10px]">
            <div className="flex justify-between w-full flex-wrap">
              <div  className="w-[70%] h-[40px] flex items-end">
               
           <CardTitle> Order #{history.order_id.split("-")[0]}</CardTitle>
        
           </div>
            <div className=" w-[30%] flex justify-end">
             <img src={history.country_flags?.to} className="w-[80px] h-[40px]" alt="destination"/>
            </div>
          </div>
        </CardHeader>
           
           
            <CardContent >
              
               {/* <div className=" w-full mt-4 ">
             <img src={history.country_flags?.to} className="w-full h-[180px]" alt="destination"/>
            </div> */}
                <table className="mt-4 w-full">
                    <tbody>
                      <tr>
                         <td>
                <p>{t("Order Date")}</p>
                </td>
                <td>
              : &nbsp; {format(new Date(history?.visa_created), "dd-MM-yyyy hh:mm a")}
                </td>
                </tr>

                  <tr>
                         <td className="pt-2">
                <p>{t("Order Status")} </p>
                </td>
                <td className="pt-2">
                <div className="flex justify-between">
             <span> : &nbsp; {t(history?.order_status.substring(0,1).toUpperCase()+history?.order_status.substring(1))}</span>
               { moreBtnClicked && moreBtnClicked.includes(history.id)==false  ?  <span  style={{cursor:"pointer"}} onClick={()=>{handleExpandRows(history.id)}}>
                <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
      fill="#12131A"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.29289 10.2929C8.68342 9.90237 9.31658 9.90237 9.70711 10.2929L12 12.5858L14.2929 10.2929C14.6834 9.90237 15.3166 9.90237 15.7071 10.2929C16.0976 10.6834 16.0976 11.3166 15.7071 11.7071L12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L8.29289 11.7071C7.90237 11.3166 7.90237 10.6834 8.29289 10.2929Z"
      fill="#12131A"
    />
  </svg>
               </span>:<span  style={{cursor:"pointer"}} onClick={()=>{handleCollapseRows(history.id)}}> <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
      fill="#12131A"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.2929 9.29289C11.6834 8.90237 12.3166 8.90237 12.7071 9.29289L15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071L12 11.4142L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L11.2929 9.29289Z"
      fill="#12131A"
    />
  </svg></span> }
               </div>
              
                 </td>
                </tr>
                </tbody>
              <tbody >  {
  moreBtnClicked.length> 0 && moreBtnClicked.includes(history.id)?
       <>

                    
                       <tr >
                         <td  className="pt-4">
                <p>{t("First Name")}</p>
                </td>
                <td  className="pt-4">
              : &nbsp; {history?.first_name.substring(0,1).toUpperCase()+history?.first_name.substring(1)}
                </td>
                </tr>

                 <tr>
                         <td>
                <p>{t("Last Name")}</p>
                </td>
                <td>
              : &nbsp; {history?.last_name.substring(0,1).toUpperCase()+history?.last_name.substring(1)}
                </td>
                </tr>

                

                        <tr>
                         <td>
                <p>{t("Destination")}</p>
                </td>
                <td>
              : &nbsp; {t(history?.destination.substring(0,1).toUpperCase()+history?.destination.substring(1))}
                </td>
                </tr>

              

                 <tr>
                 <td>
                <p>{t("Citizenship")}</p>
                </td>
                <td>
              : &nbsp; {t(history?.citizenship.substring(0,1).toUpperCase()+history?.citizenship.substring(1))}
                </td>
                </tr>

 <tr>
                         <td>
                <p>{t("email")}</p>
                </td>
                <td>
              : &nbsp; {history?.email}
                </td>
                </tr>
                {/*  */}
                 <tr>
                 <td>
                <p>{t("Travel Date")}</p>
                </td>
                <td>
              : &nbsp; {history?.travel_date}
                </td>
                </tr>

             
            
                 <tr>
                  <td>
                <p>{t("Payment Status")} </p>
                </td>
                <td>
              : &nbsp; {t(history?.payment_status.split("_")[0].substring(0,1).toUpperCase()+history?.payment_status.split("_")[0].substring(1))}
                </td>
                </tr>
              
                 <tr>
                  <td>
                <p>{`${t("Fee")}`} </p>
                </td>
                <td>
              : &nbsp; {history?.fee_omr+" OMR"}
                </td>
                </tr>
                <tr>
                  <td>
                <p>{`${t("VAT")}`} </p>
                </td>
                <td>
              : &nbsp; {history?.tax+" OMR"}
                </td>
                </tr>
                <tr>
                  <td>
                <p>{`${t("Total")}`} </p>
                </td>
                <td>
              : &nbsp; {history?.total+" OMR"}
                </td>
                </tr>
                </>
                :<></>
}
            
                    </tbody>
                </table>
            </CardContent>
            
              {
  moreBtnClicked.length> 0 && moreBtnClicked.includes(history.id) ? 
   <CardFooter className="mt-4" >
         
   
   {
   history?.application_status==="success" && history?.payment_status && history?.payment_status.toLowerCase() ==="success"?
              <Button className="px-4 " name={`history_${history.id}`}
              disabled={history?.order_status.toLowerCase()==="completed"?false:true}
              onClick={(e)=>{openIframe(history.email,JSON.parse(history.applications)[0].id)}}
                 >
                Download
                 
                </Button>
              :
              history?.application_status==="success" && history?.payment_status!=="success" ?
<Button className="px-4 " name={`payment_${history.id}`}
             
              onClick={(e)=>{
                debugger;
                handlePayment(e,history.order_id,JSON.parse(history.applications)[0].id)}}
                 >
                Payment
                 
                </Button>
                :
                <></>
}
                </CardFooter>
                      :<></>
}
          
          </Card>
        
    ))
    :
          <>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-center shadow-sm">
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
              <p className="heading-4 mb-3">{t("No record found")}</p>
              {/* <p className="body-small mb-5">
               {t("Please try a different destination or citizenship, or contact the embassy for more information.")}
              </p> */}
              <Button onClick={handleBack} className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white">
                {t("Back")}
              </Button>
            </div>
          </>
          }
      
 
  </div>

         
          </div>
          </main>
          
          :
        
     <iframe
        src={iframeLink&&iframeLink+"?iframe=true"}
        id="OmantelVisaStatus"
        className="w-full h-full border-0"
        frameBorder="0"
        title="check status"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
      }
          </div>
        </>
    )
    
}