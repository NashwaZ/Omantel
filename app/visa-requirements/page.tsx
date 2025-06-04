"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import LoadingIndicator from "@/components/loading-indicator";

export default function VisaRequirements() {
  const [isLoading, setIsLoading] = useState(true);
  const [requirements, setRequirements] = useState<any[]>([]);

  const [files, setFiles] = useState<Record<string, File | null>>({});
 const [filesData, setFilesData] = useState<{ [key: string]: File | null }>({});

 const [vendorKey,setVendorKey]=useState("");
 const [formSubmit,setFormSubmit]=useState(false);
  const router = useRouter()

const handleChangeFile = (
  e:any,
  index: number
) => {
  debugger
  const { name, id } = e.target;
  const allowedExt = ['pdf', 'png', 'jpeg', 'jpg'];

  const file = e.target.files?.[0];

  if (file) {
     const ext = file.name.split('.').pop()?.toLowerCase();
    if(allowedExt.includes(ext)){
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
    const createOrganization=async()=>{
    try{
      // Step 1: Create organization to get vendor key
     console.log("Creating organization...")
      const orgResponse = await fetch("https://stg-api.superjetom.com/create_organization", {
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

      console.log("Organization created successfully", orgData)

      // Extract and store vendor key
    
       let vendor_key = ""
      if (orgData && orgData.result && orgData.result.length > 0 && orgData.result[0].vendor_key) {
        vendor_key = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", vendor_key);
        setVendorKey(vendor_key);
        console.log("Vendor key stored successfully:", vendor_key)
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
// useEffect(()=>{
// debugger
//   console.log(filesData);

// },[filesData])


useEffect(()=>{
  const callRequirements=async()=>{
    try{
    // Add file submission logic here
   const destination=localStorage.getItem("visa_destination");
    const country={
    "destination":destination
}
    const response=await fetch("https://stg-api.superjetom.com/visa_required_doc",{
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
      [obj.required_documents.replace(" ","_")]: null,
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
  const handleSubmit = async() => {
    debugger
   setFormSubmit(true);
    // console.log("Files submitted:", files);
    const key_names=Object.keys(filesData);
    for(let i=0;i<key_names.length;i++){
      const names=key_names[i];
      if(filesData[names]==null){

        return;
      }
    }
  try{
    const fileList=Object.keys(filesData);
   var  uploaded_document_details=[];
for(let k=0;k<fileList.length;k++){
  const each_file_obj=fileList[k]
    const file_data=filesData[each_file_obj];
    const file_name=file_data?.name;
    if(file_name){
    const extension=file_name.split('.').pop()?.toLowerCase();
    const formData=new FormData();
    formData.append("image",file_data);
    formData.append("document_type",extension? extension : "")
    const response = await fetch('https://stg-api.superjetom.com/upload_documentss3',{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+vendorKey
      },
      body:formData
    })
    if(response.ok){
    const data=await response.json();
    if(data.message=="File uploaded successfully"){
       const get_card_details=localStorage.getItem("added_card_details");
       const parse_card=get_card_details && JSON.parse(get_card_details);
    const obj={
        cart_id:parse_card.result[0]?.id,
        document_type:each_file_obj,
        document:data.fileUrl
    }
    uploaded_document_details.push(obj);
    }
    }
  }
}
debugger
const UpdateFileInfoResponse=await fetch("https://stg-api.superjetom.com/upload_documents",{
  method:"POST",
  headers:{
    "Authorization":"Bearer "+vendorKey,
    "Content-Type":"application/json"
  },
  body:JSON.stringify({data:uploaded_document_details})
})

  const update_file_data=await UpdateFileInfoResponse.json()
if(update_file_data.message=="Upload process completed"){
localStorage.setItem("file_stored_info",JSON.stringify(uploaded_document_details))
 router.push("/payment-confirmation");
}

  }
  catch(err){
      console.error("uploading documents",err);
  }
  };

  const handleFileDelete=(name:any,index:number)=>{
     
   setFilesData((prev) => ({
      ...prev,
      [name]: null,
    }));
  }
   if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading ..." />
  }

  return (
    <div className="fixed inset-0 w-full h-full">
      <div className="min-h-screen flex flex-col justify-center bg-hayyak-background py-10 relative">
        <div className="container mx-auto">
          <div
            className="items-start mb-8"
            style={{ display: "block", textAlign: "start", width: "100%" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col  max-w-3xl">
          <div className="text-center mb-5xl">
            <h1 className="heading-1 mb-2">Document Requirements</h1>
            <div className="mb-7"><span className="text-gray-600">{"(Accepted formats: JPEG, JPG, PNG, PDF)"}</span></div>
          </div>

          <div className="w-full sm:w-[85%] max-w-2xl border py-3 rounded-xl px-4 sm:px-4 mx-auto">
            <div className="w-full mb-3 pb-3 flex flex-col items-center gap-4 border-gray-200">
              
              {requirements.length>0 ? requirements?.map((req:any, index:number) => (
                <div key={index} className="w-full text-left">
                   <Label htmlFor={req.required_documents.replace(" ","_")} className="label font-medium">
                                      {req.required_documents}
                                   </Label>
                                   
                  <input
                    type="file"
                    accept="application/pdf, image/png, image/jpeg, image/jpg"
                    name={req.required_documents.replace(" ","_")}
                    id={req.required_documents.replace(" ","_")}
                    onChange={(e)=>handleChangeFile(e,index)}
                    className="w-full border p-2 rounded-md "
                    style={{display:"none"}}
                  />
                  <div className="flex flex-col">
                   <Button
                 
              onClick={()=>{document.getElementById(req.required_documents.replace(" ","_"))?.click()}}
              className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4"
            ><span style={{ color: "white" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.6911 2.11058C14.2284 1.9995 13.7487 1.99973 13.1137 2.00003L9.7587 2.00006C8.95373 2.00005 8.28937 2.00004 7.74818 2.04426C7.18608 2.09018 6.66937 2.18875 6.18404 2.43604C5.43139 2.81953 4.81947 3.43145 4.43598 4.1841C4.18868 4.66944 4.09012 5.18614 4.04419 5.74824C3.99998 6.28943 3.99999 6.95378 4 7.75875V16.2414C3.99999 17.0463 3.99998 17.7107 4.04419 18.2519C4.09012 18.814 4.18868 19.3307 4.43598 19.816C4.81947 20.5687 5.43139 21.1806 6.18404 21.5641C6.66937 21.8114 7.18608 21.9099 7.74818 21.9559C8.28937 22.0001 8.95372 22.0001 9.75868 22.0001H14.2413C15.0463 22.0001 15.7106 22.0001 16.2518 21.9559C16.8139 21.9099 17.3306 21.8114 17.816 21.5641C18.5686 21.1806 19.1805 20.5687 19.564 19.816C19.8113 19.3307 19.9099 18.814 19.9558 18.2519C20 17.7107 20 17.0463 20 16.2414L20 8.8864C20.0003 8.25142 20.0006 7.77161 19.8895 7.30892C19.7915 6.90078 19.6299 6.5106 19.4106 6.15271C19.1619 5.74699 18.8225 5.40789 18.3733 4.95909L17.041 3.62678C16.5922 3.17756 16.2531 2.83813 15.8474 2.5895C15.4895 2.37019 15.0993 2.20857 14.6911 2.11058ZM13 4.00006H9.8C8.94342 4.00006 8.36113 4.00084 7.91104 4.03761C7.47262 4.07343 7.24842 4.13836 7.09202 4.21805C6.7157 4.4098 6.40973 4.71576 6.21799 5.09208C6.1383 5.24848 6.07337 5.47269 6.03755 5.9111C6.00078 6.36119 6 6.94348 6 7.80006V16.2001C6 17.0566 6.00078 17.6389 6.03755 18.089C6.07337 18.5274 6.1383 18.7516 6.21799 18.908C6.40973 19.2844 6.7157 19.5903 7.09202 19.7821C7.24842 19.8618 7.47262 19.9267 7.91104 19.9625C8.36113 19.9993 8.94342 20.0001 9.8 20.0001H14.2C15.0566 20.0001 15.6389 19.9993 16.089 19.9625C16.5274 19.9267 16.7516 19.8618 16.908 19.7821C17.2843 19.5903 17.5903 19.2844 17.782 18.908C17.8617 18.7516 17.9266 18.5274 17.9624 18.089C17.9992 17.6389 18 17.0566 18 16.2001V9.00006H16C14.3431 9.00006 13 7.65692 13 6.00006V4.00006ZM17.56 7.00006C17.4398 6.85796 17.2479 6.66216 16.887 6.30128L15.6988 5.11306C15.3379 4.75218 15.1421 4.56026 15 4.44009V6.00006C15 6.55235 15.4477 7.00006 16 7.00006H17.56Z"
      fill="currentColor"
    />
    <path
      d="M12.7071 10.2929C12.3166 9.90237 11.6834 9.90237 11.2929 10.2929L9.29289 12.2929C8.90237 12.6834 8.90237 13.3166 9.29289 13.7071C9.68342 14.0976 10.3166 14.0976 10.7071 13.7071L11 13.4142V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13.4142L13.2929 13.7071C13.6834 14.0976 14.3166 14.0976 14.7071 13.7071C15.0976 13.3166 15.0976 12.6834 14.7071 12.2929L12.7071 10.2929Z"
      fill="currentColor"
    />
  </svg>
</span>


        upload file
            </Button>
        { !filesData[req.required_documents.replace(" ","_")]?.name && <div className={`label font-medium mt-2 ${(formSubmit && filesData[req.required_documents.replace(" ","_")]==null) ?"text-red-600":"text-gray-600"}`}>{req?.additional_information}</div>}
     {filesData[req.required_documents.replace(" ","_")]?.name && (
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
      title={filesData[req.required_documents.replace(" ","_")]?.name} // Optional: show full name on hover
    >
      {
        filesData[req.required_documents.replace(" ","_")]?.name.substring(
          0,
          filesData[req.required_documents.replace(" ","_")]?.name.lastIndexOf(".")
        )
      }
    </div>
    <div >
      {
        filesData[req.required_documents.replace(" ","_")]?.name.substring(
          filesData[req.required_documents.replace(" ","_")]?.name.lastIndexOf(".") as number
        )
      }
    </div>
  </div>
  <div onClick={(e)=>handleFileDelete(req.required_documents.replace(" ","_"),index)}>
    <span style={{color:"red"}} 
    
      >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.29289 8.29289C8.68342 7.90237 9.31658 7.90237 9.70711 8.29289L12 10.5858L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L13.4142 12L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L12 13.4142L9.70711 15.7071C9.31658 16.0976 8.68342 16.0976 8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929L10.5858 12L8.29289 9.70711C7.90237 9.31658 7.90237 8.68342 8.29289 8.29289Z" fill="currentColor"/>
</svg></span>

  </div>
  </div>
)}

            </div>
            </div>
                
              ))
            :<></>}
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleSubmit}
              className="bg-[#ea6e00] hover:bg-[#ea6e00] rounded-[16px] px-16 text-white mt-4"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
