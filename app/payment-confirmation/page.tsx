"use client"

import { useEffect, useState } from "react"
import LoadingIndicator from "@/components/loading-indicator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"


declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export default function PaymentConfirmation() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signinUrl,setSigninUrl]=useState<string | null >(null);
  const [iframeTime,setIframeTime]=useState(false);
  const [openIframeUrl,setOpenIframeUrl]=useState<string | null>("null")
 const [showPopup,setShowPopup]=useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      debugger
      if (event.data?.type === 'formSubmitted') {
        const visaForm = document.getElementById('OmantelVisaApplicationForm');
        const nextStep = document.getElementById('nextStep');

        if (visaForm && nextStep) {
          visaForm.style.display = 'none';
          nextStep.style.display = 'block';
          localStorage.setItem("simple_event_data", JSON.stringify(event?.data));
          window.location.href="/visa-payment";
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

useEffect(() => {
  // Define the handler
  const handleMessage = (event:MessageEvent) => {
   debugger
    console.log("Payment Callback Data:", event.data);
  };

  // Add event listener
  window.addEventListener("message", handleMessage);

  // Cleanup on unmount
  return () => {
    window.removeEventListener("message", handleMessage);
  };
}, []);

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
    return <LoadingIndicator fullScreen text="Preparing your application form..." />
  }

  // If no iframe URL is found, show an error
  if (!iframeUrl) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">iframe URL not available</p>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }
  function getBrowserInfo() {
  const userAgent = navigator.userAgent;

  if (/chrome|crios|crmo/i.test(userAgent)) {
    return "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    return "Firefox";
  } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
    return "Safari";
  } else if (/edg/i.test(userAgent)) {
    return "Edge";
  } else {
    return "Unknown";
  }
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

  // Full-screen iframe with no other content
  return (
    <div className="fixed inset-0 w-full h-full">
        {/* {showPopup && (
  <div className="absolute right-0 bottom-0 bg-gray-100 p-4 w-full text-center shadow-md text-sm sm:text-base">
    <strong>Setting Notice:</strong>
   <p className="mt-2">
        Please go to <strong>Settings &gt; Safari</strong> and turn OFF <strong>“Prevent Cross-Site Tracking”</strong> to ensure full functionality.
      </p>
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md mt-3"
      onClick={() => setShowPopup(false)}
    >
      Got It
    </button>
  </div>
)} */}

     {openIframeUrl &&   
     <iframe
        src={openIframeUrl}
        id="OmantelVisaApplicationForm"
        className="w-full h-full border-0"
        frameBorder="0"
        title="Payment Gateway"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
      }
      <div id="nextStep" style={{ display: 'none' }}>
       
     <div className="min-h-screen flex flex-col justify-center bg-hayyak-background py-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">
        <div className="text-center mb-5xl">
          <h1 className="heading-1 mb-4">Make Payment</h1>
        </div>

        <div className="w-[75%] max-w-2xl px-4 sm:px-0">
          <Card className="border  bg-hayyak-white w-full">
          <CardContent className="px-6 sm:px-8 pb-8 pt-8">
              {/* Entry information */}
                            {/* <div className="mb-3 pb-3  border-gray-200">
                            <div className="flex justify-evenly items-center">
                                <span className="text-gray-600 caption">First Name:</span>
                                <span className="body-small text-gray-900">
                                        Yukenthiran
                                </span>
                              </div>
                            </div> */}
                            
          </CardContent>
          </Card>

        </div>
      </div>
    </div>


          </div>
          </div>
  )
}
