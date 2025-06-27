'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next"

import  "@/lib/i18n"


export default function CheckVisaStatusIframe(){
const [applicationId,setApplicationId]=useState("");
const [iframeUrl,setIframeUrl]=useState("");

   useEffect(() => {
  const iframe_data = localStorage.getItem("status_iframe");
  if (iframe_data) {
    try {
      const parsed: { application_id?: string; iframe_url?: string } = JSON.parse(iframe_data);

      if (typeof parsed.application_id === "string" && parsed.application_id) {
        setApplicationId(parsed.application_id); 
        setIframeUrl(parsed.iframe_url ?? "");   
      }
    } catch (error) {
      console.error("Invalid JSON in status_iframe:", error);
    }
  }
}, []);

useEffect(() => {
  // Remove min height from first "min-h-screen" element
  const elements = document.getElementsByClassName("min-h-screen");
  if (elements.length > 0) {
    (elements[0] as HTMLElement).style.minHeight = "auto";
  }
  window.scrollTo(0, 0);
document.getElementsByTagName("html")[0].style.overflow = "hidden";
// setTimeout(()=>{
// const firstLink = document.querySelector("a");
// if (firstLink) {
//   firstLink.style.display = "none";
// }
//    },2000);
  
}, []);

    return(
        <div style={{overflow:"hidden"}}>
        {iframeUrl && <iframe
        src={iframeUrl}
        id="OmantelVisaStatus"
        className="w-full h-[100vh] border-0"
        frameBorder="0"
        title="check status"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>}
        </div>
    )
}