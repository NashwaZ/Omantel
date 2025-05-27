"use client"

import { useEffect, useState } from "react"
import LoadingIndicator from "@/components/loading-indicator"

export default function PaymentConfirmation() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signinUrl,setSigninUrl]=useState<string | null >(null);
  const [iframeTime,setIframeTime]=useState(false);
  const [openIframeUrl,setOpenIframeUrl]=useState<string | null>("null")

  useEffect(() => {
    // Get the iframe URL from localStorage
    try{
    const signin_url=localStorage.getItem("signin_url");
    const storedIframeUrl = localStorage.getItem("iframe_url")
   if(signin_url){
    setSigninUrl(signin_url)
    setOpenIframeUrl(signin_url)
   }
   if (storedIframeUrl) {
      setIframeUrl(storedIframeUrl)

    } else {
      console.error("No iframe URL found in localStorage")
    }
    setTimeout(()=>{
      setOpenIframeUrl(storedIframeUrl);
      setIsLoading(false);
    },4000)
    
  }catch(err){
    console.error(err);
  }
 
  }, [])



  // Full-screen loading indicator
  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading payment gateway..." />
  }

  // If no iframe URL is found, show an error
  if (!iframeUrl) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Payment gateway not available</p>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  // Full-screen iframe with no other content
  return (
    <div className="fixed inset-0 w-full h-full">
     {openIframeUrl &&   
     <iframe
        src={openIframeUrl}
        className="w-full h-full border-0"
        frameBorder="0"
        title="Payment Gateway"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
      }
    </div>
  )
}
