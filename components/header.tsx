"use client"

import { LanguagesIcon } from "lucide-react"
// import { useLanguage } from "@/contexts/language-context" // Import useLanguage
import { Button } from "@/components/ui/button" // Import Button
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'

export default function Header() {
  // const { t, toggleLanguage } = useLanguage() // Get t and toggleLanguage from context
 const router = useRouter()
type User = {
  first_name: string;
  last_name: string;
};

const [userDetails, setUserDetails] = useState<User | null>(null);
 const pathname = usePathname();

 const [language,setLanguage]=useState("en");

  const { i18n, t } = useTranslation();
const getDirection = (lang: string): "ltr" | "rtl" => {
  return lang==='ar' ? "rtl" : "ltr";
};
   const updateHtmlAttributes = (lang: string) => {
    document.documentElement.dir = getDirection(lang);
    document.documentElement.lang = lang;
  };



  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     const get_user_data = localStorage.getItem("user_info_cep");
  //     if (get_user_data) {
  //       const parse_user_data = JSON.parse(get_user_data);
  //       setUserDetails(parse_user_data);
  //     }
  //     const get_headersData=localStorage.getItem("sso_header");
  //     if(get_headersData){
  //       const parse_header=JSON.parse(get_headersData);
  //       setLanguage(parse_header?.language);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer); // cleanup on unmount
  // }, []);
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
  
    const interval = setInterval(() => {
      const userData = localStorage.getItem("user_info_cep");
      const headersData = localStorage.getItem("sso_header");
  
      if (userData) {
        setUserDetails(JSON.parse(userData));
      }
  
      if (headersData) {
        setLanguage(JSON.parse(headersData)?.language);
      }
  
      // Stop polling when both are set or max attempts reached
      if ((userData && headersData) || attempts >= maxAttempts) {
        clearInterval(interval);
      }
  
      attempts++;
    }, 500); // Check every 500ms
  
    return () => clearInterval(interval);
  }, []);
  

  const handleBack = () => {
    router.back()
  }

  const toggleLanguage=()=>{
    debugger
    if(language=="en"){
      const set_language="ar"
    localStorage.setItem("app_language",set_language);
    setLanguage("ar");
      i18n.changeLanguage(set_language).then(()=>{
 updateHtmlAttributes(set_language);
   
    
        })
    }
  else{
    const set_language="en"
  localStorage.setItem("app_language",set_language);
   setLanguage("en");
     i18n.changeLanguage(set_language).then(()=>{
 updateHtmlAttributes(set_language);
   
    
        })

  }
  }
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex gap-3 items-center justify-between">
           
     { pathname!=="/" && <div className="flex gap-3 items-center">
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
                </div> }
         
    
    
           

               {/* user Name */}
            
           {
           (userDetails && Object.keys(userDetails).length > 0)  &&  
         <div className={`flex justify-end gap-3  w-full`}>
       <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center px-8 sm:px-5"
              // aria-label={t.languageToggle || "Toggle language"}
            >
              <LanguagesIcon className="h-4 w-4" />
           {
            language=="en"?
              <div className="flex sm:inline ml-2 rtl:mr-2 rtl:ml-0">EN &nbsp;<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline"
>
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg>
 &nbsp;AR</div>
 :
   <div className="flex sm:inline ml-2 rtl:mr-2 rtl:ml-0">AR &nbsp;<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="inline"
>
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg>
 &nbsp;EN</div>
}
            </Button>
           <div className="flex border py-2 px-8 " style={{borderRadius:"16px",background:"#fcf3e6" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#ea6e00] relative top-[2px]">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
              {/* <span className="sm:inline ml-2 rtl:mr-2 rtl:ml-0">  {userDetails?.first_name+" "+userDetails?.last_name}</span> */}
              <span className="sm:inline ml-2 rtl:mr-2 rtl:ml-0">  {userDetails?.first_name}</span>
            </div>
           </div>
           }
          </div>
        </header>
  )
}
