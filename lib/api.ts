/**
 * API functions for the Visa Application Service
 * This file contains all the API functions that interact with the backend
 */

import apiClient from "./api-client"
import config from "./api-config"

// Update API Base URL to use the staging URL instead of production
const base_url = config.BASE_URL

/**
 * Helper function to make API calls through our proxy
 */
async function callProxyApi(endpoint: string, body: any, authToken?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  const response = await fetch(base_url+`/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${response.statusText}`)
  }

  const data = await response.json()

  // Special handling for create_organization endpoint
  if (endpoint === "create_organization" && data?.result?.[0]?.vendor_key) {
    console.log("Vendor key received from create_organization:", data.result[0].vendor_key)
    localStorage.setItem("vendor_key", data.result[0].vendor_key)
    console.log("Vendor key stored in localStorage:", data.result[0].vendor_key)
  }

  return data
}

/**
 * Create an organization
 * @param organizationName The name of the organization
 * @returns Promise with the organization creation response
 */
export async function createOrganization(organizationName: string): Promise<any> {
  try {
    // Make the API call through our proxy
    const data = await callProxyApi("create_organization", {
      organization_name: organizationName,
    })

    // Store the vendor key in localStorage if available
    if (data && data.result && data.result.length > 0 && data.result[0].vendor_key) {
      const vendorKey = data.result[0].vendor_key
      console.log("Vendor key extracted from create_organization response:", vendorKey)
      localStorage.setItem("vendor_key", vendorKey)
      console.log("Vendor key stored in localStorage:", vendorKey)
    } else {
      console.error("No vendor key found in create_organization response:", data)
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Failed to create organization:", error)
    return {
      success: false,
      error: "Failed to create organization",
      _isMockData: true,
    }
  }
}

/**
 * Login a traveller
 * @param credentials The traveller's credentials
 * @returns Promise with the login response
 */
export async function loginTraveller(credentials: any): Promise<any> {
  try {
    // Mock successful login
    return {
      success: true,
      token: "mock_token",
    }
  } catch (error) {
    return {
      success: false,
      message: "Invalid credentials",
    }
  }
}

/**
 * Create a traveller
 * @param travellerData The traveller's data
 * @returns Promise with the traveller creation response
 */
export async function createTraveller(travellerData: any): Promise<any> {
  try {
    // Mock successful traveller creation
    return {
      success: true,
      message: "Traveller created successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to create traveller",
    }
  }
}

// Replace the existing convertAmount function with this updated implementation
export async function convertAmount(amount: string, currency: string): Promise<any> {
  try {
    // Make API call to the conversion endpoint through our proxy
    const data = await callProxyApi("amount_convertion", {
      amount: amount,
      currency: "USD", // Always use USD as currency as specified
    })

    // Round the result to 3 decimal places
    const roundedAmount = data.result ? Number(data.result).toFixed(3) : "0.000"

    return {
      success: true,
      result: {
        amount: roundedAmount,
        currency: "OMR",
      },
    }
  } catch (error) {
    console.error("Error converting amount:", error)
    // Fallback to estimated conversion in case of API failure, rounded to 3 decimal places
    const estimatedAmount = (Number.parseFloat(amount) * 0.38).toFixed(3)
    return {
      success: false,
      result: {
        amount: estimatedAmount,
        currency: "OMR",
      },
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get visa programs
 * @param params The search parameters
 * @returns Promise with the visa programs
 */
export async function getVisaPrograms(params: any): Promise<any> {
  try {
    // Get the vendor key from localStorage
    const vendorKey = localStorage.getItem("vendor_key")

    if (!vendorKey) {
      console.log("No vendor key found, creating a new organization...")

      // Create a new organization to get a vendor key
      const orgData = await callProxyApi("create_organization", {
        organization_name: "Omantel",
      })

      if (orgData && orgData.result && orgData.result.length > 0 && orgData.result[0].vendor_key) {
        // Store the new vendor key
        const newVendorKey = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", newVendorKey)
        console.log("New vendor key generated and stored:", newVendorKey)
      } else {
        console.error("No vendor key found in organization response:", orgData)
        throw new Error("No vendor key found in organization response")
      }
    }

    // Get the (potentially new) vendor key
    const currentVendorKey = localStorage.getItem("vendor_key")

    if (!currentVendorKey) {
      throw new Error("Failed to obtain vendor key")
    }

    // Format the request body exactly as required by the API
    const requestBody = {
      destination: params.destination.toLowerCase(),
      citizenship: params.citizenship.toLowerCase(),
      arrivalDate: params.arrivalDate || params.travelDate, // Support both parameter names
    }

    console.log("Making visa programs API call with:", {
      vendorKey: currentVendorKey ? `${currentVendorKey.substring(0, 10)}...` : "missing",
      requestBody,
    })

    // Make the API call with proper authorization through our proxy
    let data = await callProxyApi("get_visa_programs_omantel", requestBody, currentVendorKey)

    // Store the successful response
    localStorage.setItem("visa_programs_data", JSON.stringify(data))

    // Enhanced response processing
    console.log("Raw API response data:", JSON.stringify(data, null, 2))

    // Ensure we have a valid result structure
    if (!data) {
      data = { result: [] }
    }

    // Handle different response structures
    if (data.result) {
      // Case 1: result is already an array
      if (Array.isArray(data.result)) {
        console.log("API returned array result with length:", data.result.length)
      }
      // Case 2: result has a programs property that is an array
      else if (data.result.programs && Array.isArray(data.result.programs)) {
        console.log("API returned nested programs array with length:", data.result.programs.length)
        // Keep the original structure - the UI will handle it
      }
      // Case 3: result is an object that needs to be converted to an array
      else if (typeof data.result === "object") {
        console.log("Converting result object to array:", Object.keys(data.result))
        data.result = Object.values(data.result)
      }
      // Case 4: result is something else, convert to empty array
      else {
        console.warn("API returned unexpected result type, using empty array instead:", typeof data.result)
        data.result = []
      }
    }
    // Case 5: No result property but has programs directly
    else if (data.programs && Array.isArray(data.programs)) {
      console.log("API returned programs directly:", data.programs.length)
      data.result = { programs: data.programs }
    }
    // Case 6: No valid data structure, create empty result
    else {
      console.warn("API returned no valid result structure, creating empty result")
      data.result = []
    }

    // Store program IDs for later use if we have valid programs
    if (Array.isArray(data.result) && data.result.length > 0) {
      const programIds = data.result.filter((program:any) => program && program.id).map((program: any) => program.id)

      if (programIds.length > 0) {
        localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
        console.log("Stored program IDs:", programIds)
      }
    } else if (
      data.result &&
      data.result.programs &&
      Array.isArray(data.result.programs) &&
      data.result.programs.length > 0
    ) {
      const programIds = data.result.programs
        .filter((program:any) => program && program.id)
        .map((program: any) => program.id)

      if (programIds.length > 0) {
        localStorage.setItem("visa_program_ids", JSON.stringify(programIds))
        console.log("Stored program IDs from nested structure:", programIds)
      }
    }

    return data
  } catch (error) {
    console.error("Failed to fetch visa programs:", error)

    // Try to use cached data if available
    const cachedData = localStorage.getItem("visa_programs_data")
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        console.log("Using cached visa programs data")

        // Ensure result is an array
        if (parsedData && parsedData.result && !Array.isArray(parsedData.result)) {
          if (typeof parsedData.result === "object") {
            parsedData.result = Object.values(parsedData.result)
          } else {
            parsedData.result = []
          }
        }

        return parsedData
      } catch (cacheError) {
        console.error("Error parsing cached data:", cacheError)
      }
    }

    // If no cached data or parsing failed, throw the original error
    throw error
  }
}

/**
 * Create a visa order
 * @param orderData The order data
 * @returns Promise with the order creation response
 */
export async function createVisaOrder(orderData: any): Promise<any> {
  try {
    // Mock successful order creation
    return {
      success: true,
      order_id: "mock_order_id",
      iframe_url: "https://omantel.sandbox-simplevisa.net/iframe/mock-order",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to create visa order",
    }
  }
}

/**
 * Get countries list from the API
 */
export async function getCountries(): Promise<any> {
  try {
    // Ensure API client is initialized
    await apiClient.initialize()

    // Make the API call through our proxy
    const response = await callProxyApi("country", {
      vendor_key: apiClient.getVendorKey(),
    })

    return {
      countries: response.result || [],
      _isMockData: false,
    }
  } catch (error) {
    console.error("Error fetching countries:", error)
    // Return fallback data instead of throwing
    return {
      countries: [],
      _isMockData: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Check if the API is in offline mode
 */
export function isOfflineMode(): boolean {
  return apiClient.isInOfflineMode()
}

/**
 * Set offline mode
 */
export function setOfflineMode(isOffline: boolean): void {
  apiClient.setOfflineMode(isOffline)
}

/**
 * Initialize API client
 * This should be called when the application starts
 */
export async function initializeApi(): Promise<boolean> {
  return await apiClient.initialize()
}

/**
 * Get API initialization status
 */
export function isApiInitialized(): boolean {
  return apiClient.isClientInitialized()
}

/**
 * Create a traveller in the Omantel system
 * @param userData The traveller's data
 * @returns Promise with the traveller creation response
 */
export async function createTravellerOmantel(userData: {
  email: string
  first_name: string
  last_name: string
  phone:string
  locale: string,
  omantel_user_id:number|string
}): Promise<any> {
  try {
    // Get the vendor key from localStorage
    const vendorKey = localStorage.getItem("vendor_key")

    if (!vendorKey) {
      console.warn("No vendor key found. Creating a mock vendor key for development.")
      // Create a mock vendor key for development/preview environments
      localStorage.setItem("vendor_key", "MOCK_VENDOR_KEY_FOR_DEVELOPMENT")
    }

    // Try to make the API call with proper error handling
    try {
      const data = await callProxyApi(
        "omantel_user_traveller",
        userData,
        vendorKey || "MOCK_VENDOR_KEY_FOR_DEVELOPMENT",
      )

      // Store the access token in localStorage if available
      if (data && data.result && data.result.length > 0 && data.result[0].access_token) {
        localStorage.setItem("traveller_access_token", data.result[0].access_token)
        console.log("Traveller access token stored:", data.result[0].access_token)
      }

      return data
    } catch (apiError) {
      console.error("API call failed:", apiError)
      // If the API call fails, fall back to mock data
      throw new Error(`API call failed: ${apiError instanceof Error ? apiError.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("Failed to create traveller:", error)

    // FALLBACK: Create a mock traveller response for development/preview
    console.log("Using fallback mock data for traveller creation")
    const mockAccessToken = `mock_token_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem("traveller_access_token", mockAccessToken)

    return {
      success: true,
      _isMockData: true,
      result: [
        {
          access_token: mockAccessToken,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      ],
    }
  }
}

/**
 * Create an iframe order for visa in the Omantel system
 * @param orderData The order data
 * @returns Promise with the order creation response
 */
export async function createIframeOrderVisaOmantel(orderData: {
  vendor_key: string
  reference_no: string
  description: string
  program_id: string
  quantity: number
  first_name: string
  last_name: string
  email: string
  fee: string
  arrival: string
  destination: string
  commission: string
  commission_type: string
}): Promise<any> {
  try {
    // Get the traveller access token from localStorage
    const accessToken = localStorage.getItem("traveller_access_token")

    if (!accessToken) {
      throw new Error("No traveller access token found. Please create a traveller first.")
    }

    // Try to make the API call with proper error handling
    try {
      const data = await callProxyApi("order_visa_omantel", orderData, accessToken)

      console.log("Iframe order API response:", data)

      // Store the iframe URL if available - ONLY use iframe_deeplink_url, no fallbacks
      if (data && data.result && data.result.iframe_deeplink_url) {
        localStorage.setItem("iframe_url", data.result.iframe_deeplink_url)
        localStorage.setItem("signin_url",data.result.deeplink)
        console.log("Iframe URL stored:", data.result.iframe_deeplink_url)

        localStorage.setItem("omantel_order_insertion",JSON.stringify({id:data.result.insertion_id}))
      } else {
        console.error("No iframe_deeplink_url found in API response:", data)
        throw new Error("Backend issue: Missing iframe_deeplink_url in response. Please try again later.")
      }

      // Store the order ID if available
      if (data && data.result && data.result.order_id) {
        localStorage.setItem("order_id", data.result.order_id)
        console.log("Order ID stored:", data.result.order_id)
      }

      return data
    } catch (apiError) {
      console.error("API call failed:", apiError)
      throw new Error(
        `Backend issue: ${apiError instanceof Error ? apiError.message : "Unknown error"}. Please try again later.`,
      )
    }
  } catch (error) {
    console.error("Failed to create iframe order:", error)

    // // In development/preview mode, we can use mock data
    // if (process.env.NODE_ENV !== "production" || window.location.hostname.includes("localhost")) {
    //   console.log("Development mode detected, using mock data")
    //   const mockIframeUrl = "https://omantel.sandbox-simplevisa.net/iframe/mock-order"
    //   const mockOrderId = `order_${Math.random().toString(36).substring(2, 10)}`

    //   localStorage.setItem("iframe_url", mockIframeUrl)
    //   localStorage.setItem("order_id", mockOrderId)

    //   return {
    //     success: true,
    //     _isMockData: true,
    //     result: {
    //       iframe_deeplink_url: mockIframeUrl,
    //       order_id: mockOrderId,
    //       reference_no: orderData.reference_no,
    //     },
    //   }
    // }

    // In production, we should throw the error
    throw new Error(
      `Backend issue: ${error instanceof Error ? error.message : "Unknown error"}. Please try again later.`,
    )
  }
}

export async function sendEventMsgToCEPApp(event:any,user:any,access_token:string){
  // event->send type,sub_type,description,user
  const get_headers_info=localStorage.getItem("sso_header");
  const parse_h_data=get_headers_info?JSON.parse(get_headers_info):"";
  if(!parse_h_data){
     return;
  }
  const data =  {
    "partnerEvent": {
        "cxp_session_id": parse_h_data?.sessionid,
        "event_type":"TRANSACTION",
        "sub_type": event.sub_type ,
        "event_details": {
            "description": event.description || "payment successful"
            // "metadata": {
            //     "triggerType": "FORCE_REFRESH",
            //     "loginMsisdn": "69001331",
            //     "accountMsisdn": "69001331",
            //     "acountType": "MOBILE",
            //     "billingType": "POSTPAID",
            //     "isOtpProfile": true
            // }
        }
    },
    "user": {
        "id": user.user_id ,
        "name": user.first_name+" "+user.last_name,
        "phone":user.mobile_no,
        "email": user.email
    },
    "sender": {
        "id": "OT-CXP-SUPERJET-f65c1d89",
        "name": "Superjet",
        "channel": "mobile"
    },
    "timestamp": new Date()
}
 try{
  const response= await fetch(base_url+"/omantel_event",{
    method:"POST",
    headers:{
      Authorization:access_token,
      "x-language":"en",
      "Content-Type":"application/json" 
    },
    body:JSON.stringify(data)
  });
  if(response.ok){
    const data = await response.json();
    if(data.message==="success"){
      return "success";
    }
    else{
      return "error";
    }
 }  
 }catch(err){
  console.error('error  at sending event msg : ' + err);
  return "error";
 }
}

export async function createCartUserApplication(vendor_key:String,visa_data:{  
  "user_id" :string|number,
  "traveller_id" : string|number|null, 
   "destination" :string, 
  "citizenship" : string,
  "citizenship_code" : string,
  "destination_code" : string,
  "program_id" : string,
  "fee" : string|number ,
  "currency": string,
  "commission" : string|number,
  "commission_type" : string|number,
  "deleted":string
}){
  // event->send type,sub_type,description,user
 try{
  const response= await fetch(base_url+"/add_order_cart",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+vendor_key,
      "Content-Type":"application/json" 
    },
    body:JSON.stringify(visa_data)
  });
  if(response.ok){
    const data = await response.json();
  
      return data;
    
  
 }  
 }catch(err){
  console.error('error  at sending event msg : ' + err);
  return err;
 }
}
export async function sendNotificationToCEPApp(notification:{title:string},user:any,headers:any){
  debugger
const data = {
  "notification_type": "TRANSACTIONAL",
  "notification_sub_type": "PAYMENT_CONFIRMATION",
  "message": {
      "id": "",
      "title":notification.title,
      "description": "<Message to be sent to the user>",
      "channels": [
      "push"
      ]
  },
  "user": {
      "id": user.user_id,
      "name": user.first_name+" "+user.last_name,
      "phone": user.mobile_no,
      "email": user.email
  },
  "sender": {
      "id": "OT-CXP-SUPERJET-f65c1d89",
      "name": "Superjet"
  }

}
 try{
  const response= await fetch(base_url+"/omantelnotification",{
    method:"POST",
    headers:{
      Authorization: headers?.authorization,
      "x-language":headers?.language,
      "Content-Type":"application/json" 
    },
    body:JSON.stringify(data)
  });
  if(response.ok){
    const data = await response.json();
    if(data.message==="success"){
      return "success";
    }
    else{
      return "error";
    }
 }  
 }catch(err){
  console.error('error  at sending event msg : ' + err);
  return "error";
 }
}




export async function OmantelCreateOrder(notification:any,user:any,headers:any){
debugger
const data = {
    "partnerEvent": {
        "partnerSessionId": null,
        "eventType": "ORDER", 
        "eventSubType": "ORDER_CREATION", 
        "eventDetails": {
            "description": "Order PLACED"
        }
    },
    "paymentDetails": {
        "paymentId": "123456",
        "transactionId": "txn123456789",
        "totalAmount": "16.8",
        "partnerAccountId": "123344",
        "rRN": "RRN12345",
        "currency": "OMR",
        "timestamp": "2025-04-15T10:30:00Z",
        "paymentMethod": "Card",
        "paymentStatus": "Confirmed"
    },
    "orderDetails": {
        "orderId": "123456",
        "customerId": "69102487",
        "description": "Purchase Order",
        "orderDateTime": "2025-04-15T10:30:00Z",
        "category": "Air Conditioners",
        "totalAmount": 150.75,
        "deliveryAddress": "123 Main Street, Cityville, Country",
        "orderStatus": "ORDER_PLACED",
        "items": [
            {
                "orderItemId": "123456",
                "name": "Purchase Order Item",
                "description": "Purchase Order Item description",
                "itemIndex": 1,
                "unitPrice": "50.00",
                "quantity": "2",
                "createdAt": "2025-04-15T10:30:00Z",
                "itemStatus": "CANCELLED"
            },
            {
                "orderItemId": "123457",
                "name": "Purchase Order Item1",
                "description": "Purchase Order Item1 description",
                "itemIndex": 2,
                "unitPrice": "5.00",
                "quantity": "1",
                "createdAt": "2025-04-15T10:30:00Z",
                "itemStatus": "PLACED"
            }
        ],
        "shippingAndBilling": {
            "shippingAddress": "shippingAddress",
            "shippingDate": "2025-04-15T10:30:00Z",
            "shippingCarrier": "ABC",
            "deliveryLocation": "deliveryLocaion",
            "trackingUrl": "trackingUrl",
            "trackingNumber": "trackingNumber",
            "billingAddress": "billingAddress",
            "billingDate": "2025-04-15T10:30:00Z",
            "invoiceNumber": "INV12345"
        },
        "discount": 2.00,
        "tax": 1.354,
        "fee": 0.234
    },
    "user": {
        "id": user?.user_id,
        "phone": user?.mobile_no,
        "email": user?.email
    },
    "sender": {
        "name": "Xhawi",
        "id": "OT-CXP-XHAWI-bc35a3c5"
    },
    "timestamp": new Date()
}
 try{
  const response= await fetch(base_url+"/omantel_create_order",{
    method:"POST",
    headers:{
      Authorization: headers?.authorization,
      "x-unique-id":headers?.uniqueid,
      "x-language":headers?.language,
      "Content-Type":"application/json" 
    },
    body:JSON.stringify(data)
  });
  if(response.ok){
    const data = await response.json();
    if(data.message==="success"){
      return "success";
    }
    else{
      return "error";
    }
 }  
 }catch(err){
  console.error('error  at sending event msg : ' + err);
  return "error";
 }
}

export async function OmantelUpdateOrder(notification:any,user:any,headers:any){
debugger
const data = {
    "partnerEvent": {
        "partnerSessionId": null,
        "eventType": "ORDER", 
        "eventSubType": "ORDER_UPDATE", 
        "eventDetails": {
            "description": "Order PLACED"
        }
    },
    "orderDetails": {
        "orderId": "123456",
        "customerId": "69102487",
        "description": "Purchase Order",
        "orderDateTime": "2025-04-15T10:30:00Z",
        "category": "Air Conditioners",
        "totalAmount": 150.75,
        "deliveryAddress": "123 Main Street, Cityville, Country",
        "orderStatus": "ORDER_PLACED"
    },
    "user": {
        "id": user?.user_id,
        "phone": user?.mobile_no,
        "email": user?.email
    },
    "sender": {
        "name": "Xhawi",
        "id": "OT-CXP-XHAWI-bc35a3c5"
    },
    "timestamp": new Date()
}
 try{
  const response= await fetch(base_url+"/omantel_order_update",{
    method:"POST",
    headers:{
      Authorization: headers?.authorization,
      "x-unique-id":headers?.uniqueid,
      "x-language":headers?.language,
      "Content-Type":"application/json" 
    },
    body:JSON.stringify(data)
  });
  if(response.ok){
    const data = await response.json();
    if(data.message==="success"){
      return "success";
    }
    else{
      return "error";
    }
 }  
 }catch(err){
  console.error('error  at sending event msg : ' + err);
  return "error";
 }
}

export async function getVendorKey(){
  try{
   const orgResponse = await fetch(base_url+"/create_organization", {
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

      console.log("Organization created successfully", orgData);
       const  vendor_key = orgData.result[0].vendor_key
        localStorage.setItem("vendor_key", vendor_key);
      return vendor_key;

  }
  catch(err){
    return "";
  }
}
/**
 * Generate a unique reference number with 15 characters
 * @returns A unique 15-character reference number
 */
export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
