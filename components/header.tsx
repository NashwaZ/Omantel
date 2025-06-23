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

  useEffect(()=>{
   const getLang = localStorage.getItem("app_language");
   if(getLang){
   
      i18n.changeLanguage(getLang).then(()=>{
 updateHtmlAttributes(getLang);
   })
   
  }
  },[])



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
  // useEffect(() => {
  //   let attempts = 0;
  //   const maxAttempts = 5;
  
  //   const interval = setInterval(() => {
  //     const userData = localStorage.getItem("user_info_cep");
  //     const headersData = localStorage.getItem("sso_header");
  
  //     if (userData) {
  //       setUserDetails(JSON.parse(userData));
  //     }
  //      var lang=  localStorage.getItem("app_language");
  //     if(lang)
  //        setLanguage(lang);
      
  
  //     if (!lang && headersData) {
  //       setLanguage(JSON.parse(headersData)?.language);
  //     }
  
  //     // Stop polling when both are set or max attempts reached
  //     if ((userData && headersData) || attempts >= maxAttempts) {
  //       clearInterval(interval);
  //     }
  
  //     attempts++;
  //   }, 500); // Check every 500ms
  
  //   return () => clearInterval(interval);
  // }, []);

  
    const getLang=() => {
      debugger
      
      let   parse_header;
     

       var lang=  localStorage.getItem("app_language");
      if(lang){
         setLanguage(lang);
         return;
      }

      const get_headersData = localStorage.getItem("sso_header");
      if (!lang && get_headersData) {
      parse_header = JSON.parse(get_headersData);
        setLanguage(parse_header?.language || "en");
      }
      if(!parse_header){
        setTimeout(getLang, 1000); 
      }
     
    }
    const getUserData=()=>{
let parse_user_data;
 const get_user_data = localStorage.getItem("user_info_cep");
      if (get_user_data) {
      parse_user_data = JSON.parse(get_user_data);
        setUserDetails(parse_user_data);

      }
         if(!parse_user_data){
        setTimeout(getUserData, 1000); 
      }
    }

    useEffect(()=>{
   getLang();
   getUserData();
    },[])

  

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
              {/* <LanguagesIcon className="h-4 w-4" /> */}
              <div className="relative " style={{bottom:"1px"}} ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.9753 13H21V11H16.9753C16.7245 5.94668 14.5927 2 12 2C9.40733 2 7.27555 5.94668 7.02469 11H3V13H7.02469C7.27555 18.0533 9.40733 22 12 22C14.5927 22 16.7245 18.0533 16.9753 13ZM14.9726 13C14.8571 15.094 14.3857 16.8986 13.7467 18.1766C12.9482 19.7737 12.2151 20 12 20C11.7849 20 11.0518 19.7737 10.2533 18.1766C9.61429 16.8986 9.14295 15.094 9.02739 13H14.9726ZM9.02739 11C9.14295 8.90602 9.61429 7.10143 10.2533 5.82336C11.0518 4.22632 11.7849 4 12 4C12.2151 4 12.9482 4.22632 13.7467 5.82336C14.3857 7.10143 14.8571 8.90602 14.9726 11H9.02739Z" fill="#121319"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#191213"/>
</svg></div>

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
className="inline "

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
          <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  className="text-[#ea6e00] relative top-[2px]"
>
  <path
    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
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
