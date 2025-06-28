"use client"

// import { useEffect, useState } from "react"
// import LoadingIndicator from "@/components/loading-indicator"
// import { Button } from "@/components/ui/button"
// import { sendEventMsgToCEPApp } from "@/lib/api"
// import { useRouter } from "next/navigation"

// declare global {
//   interface Window {
//     ReactNativeWebView?: {
//       postMessage: (message: string) => void;
//     };
//   }
// }

// export default function MakePayment() {

//   const [isLoading, setIsLoading] = useState(false);
//   const [convertedFees,setConvertedFees]=useState({fee:""});
//     const router = useRouter()

//  type VisaDetails = {
//   destinationCountry: string | null;
//   passportCountry: string | null;
//   firstName: string | null;
//   lastName: string | null;
//   email: string | null;
//   fee: number| string | null;
//   currency: string | null;
// };
//   const [VisaDetails,setVisaDetails]=useState<VisaDetails>({
//     destinationCountry:"",
//     passportCountry:'',
//     firstName:"",
//     lastName:"",
//     email:"",
//     fee:"",
//     currency:""
//   });
 

    
// const  handleSubmit=async(e:any)=>{
//     e.preventDefault();
//       const get_user=localStorage.getItem("user_info_cep");
//                  const userInfo=get_user?JSON.parse(get_user):"";
//                    const auth_token=localStorage.getItem("sso_header");
//                  const header=auth_token?JSON.parse(auth_token):"";
//                  const accessToken=header?.authorization;
                 
//                 const eventDetails = {
//                    sub_type: "proceed_payment",
//                    description: "Initiate the payment for visa."
//                  };
             
//                        await sendEventMsgToCEPApp(eventDetails,userInfo,accessToken)
//  if (
//       typeof window !== 'undefined' &&
//       window.ReactNativeWebView &&
//       typeof window.ReactNativeWebView.postMessage === 'function'
//     ) {

//      const user_local_data = localStorage.getItem("visa_application_form");
//      const user_details=user_local_data? JSON.parse(user_local_data):"";

    
//  if(user_details){
//     // const payment_payload ={
//     //   action:"paymentInitiate",
//       const payload= {
//     name: VisaDetails.firstName,
//     partnerAccountId: "OT-CXP-SUPERJET-f65c1d89",
//     items: [
//       {
//         unitPrice: 1,
//         quantity: 1,
//         serviceDetails: {
//           serviceType: "e-Visa",
//           serviceSubType: "e-Visa"
//         },
//         invoiceNumber: "12345",
//         vatValue: 0,
//         standardPrice: VisaDetails.fee,
//         taxablePrice: VisaDetails.fee,
//         vatPercent: 0
//       }
//     ],
//     id: "12345",
//     rRN: ""
//   }
// // }
//       window.ReactNativeWebView.postMessage(JSON.stringify(payload));
//       console.log('Message posted to React Native app:', payload);
//     }
//     } else {
//       console.warn('Not running inside React Native WebView.');
//     }
// }

// useEffect(()=>{
//   setIsLoading(true);
//      const user_local_data = localStorage.getItem("visa_application_form");
//      const user_details=user_local_data? JSON.parse(user_local_data):"";
//      const destination=localStorage.getItem("visa_destination");
//      const passportCountry=localStorage.getItem("visa_citizenship");
//      const programs_JSON =localStorage.getItem("visa_programs_data");
//      const programs_details=programs_JSON?JSON.parse(programs_JSON):"";
//      if(user_details && programs_details && destination && passportCountry){
         
//           fetch(base_url+"/amount_convertion", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 amount:programs_details.result.programs[0].fee,
//              currency:programs_details.result.programs[0].currency
//             }),
//           }).then((response)=> response.json())
//            .then((data)=>{
//             setConvertedFees({fee: data.result});
//             const v_details={
//              destinationCountry:destination,
//              passportCountry:passportCountry,
//              firstName:user_details.firstName,
//              lastName:user_details.lastName,
//              email:user_details.email,
//              fee:programs_details.result.programs[0].fee+" ("+Number(data.result).toFixed(3)+" OMR)",
//              currency:  programs_details.result.programs[0].currency
//             //  || programs_details.result.programs[0].currency
//         }

//         setVisaDetails(v_details);
//         setIsLoading(false);
            
//         })
//            .catch( (error) =>{
//           console.error(error);
//            setConvertedFees({fee: ""});
//             const v_details={
//              destinationCountry:destination,
//              passportCountry:passportCountry,
//              firstName:user_details.firstName,
//              lastName:user_details.lastName,
//              email:user_details.email,
//              fee:programs_details.result.programs[0].fee,
//              currency:  programs_details.result.programs[0].currency
//             //  || programs_details.result.programs[0].currency
//         }

//         setVisaDetails(v_details);
//         setIsLoading(false);

//         })
//       }
        
//      },[])
//   const handleBack = () => {
//     router.back()
//   }



//   // Full-screen loading indicator
//   if (isLoading) {
//     return <LoadingIndicator fullScreen text="Loading payment gateway..." />
//   }

//   // If no iframe URL is found, show an error
 

//   // Full-screen iframe with no other content
//   return (
//     <div className="fixed inset-0 w-full h-full">

       
//      <div className="min-h-screen flex flex-col justify-center bg-hayyak-background py-10 relative">
//        <div className="container mx-auto ">
//               <div className=" items-start mb-8" style={{display:"block",textAlign:'start',width:"100%"}}>
//               <Button
//                 variant="ghost"
//                 onClick={handleBack}
//                 className="p-2 h-10 w-10 flex items-center justify-center text-[#ea6e00] hover:bg-gray-50 rounded-[16px]"
//                 aria-label="Back to search"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="m12 19-7-7 7-7" />
//                   <path d="M19 12H5" />
//                 </svg>
//               </Button>
//             </div>
//             </div>
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">

//         <div className="text-center mb-5xl">
//           <h1 className="heading-1 mb-7">Make Payment</h1>
//         </div>

//         <div className="w-full sm:w-[85%] max-w-2xl border py-3 rounded-xl px-4 sm:px-4 mx-auto">
        
//                             <div className="w-full  mb-3 pb-3 flex justify-center border-gray-200">
//                             <table className="w-[100%] md:w-[60%] lg:w-[80%]">
//                                 <tbody>
//                                     <tr>
//                                         <td className="p-2">
//                                            <span className="text-gray-600 caption"> First Name:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                           <span className="body-small text-gray-900">{VisaDetails?.firstName}</span> 
//                                         </td>
//                                     </tr>
//                                      <tr>
//                                         <td  className="p-2">
//                                            <span className="text-gray-600 caption"> Last Name:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                               <span className="body-small text-gray-900">
//                                            {VisaDetails?.lastName}</span> 
//                                         </td>
//                                     </tr>
//                                      <tr>
//                                         <td  className="p-2">
//                                            <span className="text-gray-600 caption"> Email:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                             <span className="body-small text-gray-900"> {VisaDetails?.email}</span>
//                                         </td>
//                                     </tr>

//                                      <tr>
//                                         <td  className="p-2">
//                                            <span className="text-gray-600 caption"> Passport Country:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                            <span className="body-small text-gray-900"> {VisaDetails?.passportCountry}</span>
//                                         </td>
//                                     </tr>

//                                      <tr>
//                                         <td className="p-2">
//                                            <span className="text-gray-600 caption"> Destination Country:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                            <span className="body-small text-gray-900"> {VisaDetails?.destinationCountry}</span>
//                                         </td>
//                                     </tr>
//                                      <tr>
//                                         <td className="p-2">
//                                            <span className="text-gray-600 caption"> Fee:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                           <span className="body-small text-gray-900">  {VisaDetails?.fee}</span>
//                                         </td>
//                                     </tr>
//                                      <tr>
//                                         <td className="p-2">
//                                            <span className="text-gray-600 caption"> Currency:</span>
//                                         </td>
//                                         <td  className="p-2">
//                                           <span className="body-small text-gray-900">  {VisaDetails?.currency}</span>
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                             </div>

                           
                

//         </div>

//          <div className="text-center">
//                      <Button
//                           onClick={(e) => handleSubmit(e)}
//                           className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4"
//                         >
//                           Make Payment
//                         </Button>
//                  </div>
//       </div>
//     </div>


//           </div>
          
//   )
// }

import { useEffect, useState } from "react";
import LoadingIndicator from "@/components/loading-indicator";
import { Button } from "@/components/ui/button";
import { sendEventMsgToCEPApp, sendNotificationToCEPApp } from "@/lib/api";
import { useRouter } from "next/navigation";

import { useTranslation } from "react-i18next"
import  "@/lib/i18n"
import { getVendorKey } from "@/lib/api";
import config from "@/lib/api-config";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export default function MakePayment() {
  const [isLoading, setIsLoading] = useState(false);

       const [locale,setLocale]=useState("en");
      const [header,setHeader]=useState(null);
      const [convertedFees, setConvertedFees] = useState({ fee: "" });
  const router = useRouter();

  const [isClicked,setIsClicked]=useState(false);
  
   const base_url=config.BASE_URL;      
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
          
      i18n.changeLanguage(getLanguage).then(()=>{
           updateHtmlAttributes(getLanguage);
      })
    }
    },[])
  

  type VisaDetails = {
    destinationCountry: string | null;
    passportCountry: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    fee: number | string | null;
    currency: string | null;
  };

  const [VisaDetails, setVisaDetails] = useState<VisaDetails>({
    destinationCountry: "",
    passportCountry: '',
    firstName: "",
    lastName: "",
    email: "",
    fee: "",
    currency: ""
  });

  const handleSubmit = async (e: any) => {
    try{
    e.preventDefault();
    
    setIsClicked(true);
    const get_user = localStorage.getItem("user_info_cep");
    const userInfo = get_user ? JSON.parse(get_user) : "";
    const auth_token = localStorage.getItem("sso_header");
    const header = auth_token ? JSON.parse(auth_token) : "";
    const accessToken = header?.authorization;
    const get_program_id=localStorage.getItem("order_id");
    const order_id={
      order_id:get_program_id
    }
    const vendor_key= await getVendorKey();
const response =await fetch( base_url+"/omantel_payment",{
  method:"POST",
  headers:{
    Authorization:"Bearer "+vendor_key,
    "Content-Type":"application/json"
  },
  body:JSON.stringify(order_id)
})
if(!response.ok){
  throw new Error("Error at payment...");
}
const data =await response.json();
if(data.message==="success"){
var payment_id=JSON.stringify(data.result);
    const eventDetails = {
      sub_type: "proceed_payment",
      description: "Initiate the payment for visa."
    };

    // await sendEventMsgToCEPApp(eventDetails, userInfo, accessToken);
    
    if (
      typeof window !== 'undefined' &&
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === 'function'
    ) {
      const user_local_data = localStorage.getItem("visa_application_form");
      const user_details = user_local_data ? JSON.parse(user_local_data) : "";

      if (user_details) {
        // const payload1 = {
        //   name: VisaDetails.firstName,
        //   partnerAccountId: "OT-CXP-SUPERJET-f65c1d89",
        //   items: [
        //     {
        //       unitPrice: 1,
        //       quantity: 1,
        //       serviceDetails: {
        //         serviceType: "e-Visa",
        //         serviceSubType: "e-Visa"
        //       },
        //       invoiceNumber: "12345",
        //       vatValue: 0,
        //       standardPrice: VisaDetails.fee,
        //       taxablePrice: VisaDetails.fee,
        //       vatPercent: 0
        //     }
        //   ],
        //   id: "12345",
        //   rRN: ""
        // };

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
  setIsClicked(false)
}
  };

  useEffect(() => {
    setIsLoading(true);
    const user_local_data = localStorage.getItem("visa_application_form");
    const user_details = user_local_data ? JSON.parse(user_local_data) : "";
    const destination = localStorage.getItem("visa_destination");
    const passportCountry = localStorage.getItem("visa_citizenship");
    const programs_JSON = localStorage.getItem("visa_programs_data");
    const programs_details = programs_JSON ? JSON.parse(programs_JSON) : "";

    if (user_details && programs_details && destination && passportCountry) {
      fetch(base_url+"/amount_convertion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: programs_details.result.programs[0].fee,
          currency: programs_details.result.programs[0].currency
        }),
      }).then((response) => response.json())
        .then((data) => {
          setConvertedFees({ fee: data.result });
          const v_details = {
            destinationCountry: destination,
            passportCountry: passportCountry,
            firstName: user_details.firstName,
            lastName: user_details.lastName,
            email: user_details.email,
            fee: programs_details.result.programs[0].fee + " (" + Number(data.result).toFixed(3) + " OMR)",
            currency: programs_details.result.programs[0].currency
          };

          setVisaDetails(v_details);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setConvertedFees({ fee: "" });
          const v_details = {
            destinationCountry: destination,
            passportCountry: passportCountry,
            firstName: user_details.firstName,
            lastName: user_details.lastName,
            email: user_details.email,
            fee: programs_details.result.programs[0].fee,
            currency: programs_details.result.programs[0].currency
          };

          setVisaDetails(v_details);
          setIsLoading(false);
        });
    }

    // Add event listener for receiving messages from CEP app
    const messageListener = (event: MessageEvent) => {
      const { action, payload } = event.data;
      console.log("Payment Callback Data:", payload);
      // Handle the action and payload as needed
    };

    window.addEventListener("message", messageListener);


    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);


  useEffect(()=>{
     const get_user=localStorage.getItem("user_info_cep");
        const userInfo=get_user?JSON.parse(get_user):"";
          const auth_token=localStorage.getItem("sso_header");
        const header=auth_token?JSON.parse(auth_token):"";
        // const accessToken=header?.authorization;
        
    
    const notify={title:"E-visa order successfully created."}
    sendNotificationToCEPApp(notify,userInfo,header);
  },[])

  const handleBack = () => {
    router.back();
  }

  // Full-screen loading indicator
  if (isLoading) {
    return <LoadingIndicator fullScreen text={t("Loading payment gateway...")} />
  }

  // Full-screen iframe with no other content
  return (
    <div className=" inset-0 w-full h-full">
      <div className="min-h-screen  bg-hayyak-background py-10 relative">
        <div className="container mx-auto ">
          <div className=" items-start mb-8" style={{ display: "block", textAlign: 'start', width: "100%" }}>
            {/* <Button
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
            </Button> */}
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">
          <div className="text-center mb-5xl">
            <h1 className="heading-1 mb-7">{t("Make Payment")}</h1>
          </div>

          <div className="w-full sm:w-[85%] max-w-2xl border py-3 rounded-xl px-4 sm:px-4 mx-auto">
            <div className="w-full mb-3 pb-3 flex justify-center border-gray-200">
              <table className="w-[100%] md:w-[60%] lg:w-[80%]">
                <tbody>
                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("First Name")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900">{VisaDetails?.firstName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Last Name")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900">{VisaDetails?.lastName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Email")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900"> {VisaDetails?.email}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Passport Country")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900"> {VisaDetails?.passportCountry}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Destination Country")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900"> {VisaDetails?.destinationCountry}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Fee")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900">  {VisaDetails?.fee}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <span className="text-gray-600 caption"> {t("Currency")}:</span>
                    </td>
                    <td className="p-2">
                      <span className="body-small text-gray-900">  {VisaDetails?.currency}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={(e) => handleSubmit(e)}
              className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4"
            >
              {
                isClicked?
                 <div className="flex items-center justify-center">
                  <LoadingIndicator size="small" />
                </div>
              :
             t("Confirm and Pay")
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
