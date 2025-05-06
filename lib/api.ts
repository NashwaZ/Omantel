/**
 * API functions for the Visa Application Service
 * This file contains all the API functions that interact with the backend
 */

import apiClient from "./api-client"

// Declare API_BASE_URL
const API_BASE_URL = "https://stg-api.superjetom.com"

/**
 * Create an organization
 * @param organizationName The name of the organization
 * @returns Promise with the organization creation response
 */
export async function createOrganization(organizationName: string): Promise<any> {
  try {
    console.log(`Creating organization: ${organizationName}`)

    // Make a direct fetch call to the API endpoint
    const response = await fetch("https://stg-api.superjetom.com/create_organization", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organization_name: organizationName }),
    })

    // Parse the response
    const data = await response.json()
    console.log("Organization creation response:", data)

    // Store the vendor key in localStorage if available
    if (data && data.result && data.result.length > 0 && data.result[0].vendor_key) {
      localStorage.setItem("vendor_key", data.result[0].vendor_key)
      console.log("Vendor key stored:", data.result[0].vendor_key)
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
    console.log("Logging in traveller:", credentials)
    // Mock successful login
    return {
      success: true,
      token: "mock_token",
    }
  } catch (error) {
    console.error("Failed to login traveller:", error)
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
    console.log("Creating traveller:", travellerData)
    // Mock successful traveller creation
    return {
      success: true,
      message: "Traveller created successfully",
    }
  } catch (error) {
    console.error("Failed to create traveller:", error)
    return {
      success: false,
      message: "Failed to create traveller",
    }
  }
}

// Replace the existing convertAmount function with this new implementation
export async function convertAmount(amount: string, currency: string): Promise<any> {
  try {
    console.log(`Converting amount ${amount} from ${currency} using API`)

    // Make API call to the conversion endpoint
    const response = await fetch("https://stg-api.superjetom.com/amount_convertion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "USD", // Always use USD as currency as specified
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Currency conversion response:", data)

    return {
      success: true,
      result: {
        amount: data.result,
        currency: "OMR",
      },
    }
  } catch (error) {
    console.error("Failed to convert amount:", error)
    // Fallback to estimated conversion in case of API failure
    const estimatedAmount = (Number.parseFloat(amount) * 0.38).toFixed(2)
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
 * Create a visa order
 * @param orderData The order data
 * @returns Promise with the order creation response
 */
export async function createVisaOrder(orderData: any): Promise<any> {
  try {
    console.log("Creating visa order:", orderData)
    // Mock successful order creation
    return {
      success: true,
      order_id: "mock_order_id",
      iframe_url: "https://omantel.sandbox-simplevisa.net/iframe/mock-order",
    }
  } catch (error) {
    console.error("Failed to create visa order:", error)
    return {
      success: false,
      message: "Failed to create visa order",
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
    console.log("Getting visa programs:", params)

    // Make a real API call instead of returning mock data
    const response = await fetch(`${API_BASE_URL}/get_visa_programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to get visa programs:", error)
    // Don't return mock data, throw the error to be handled by the caller
    throw error
  }
}

// Add a function to store API errors for the status indicator
export function storeApiError(error: string | null): void {
  if (error) {
    localStorage.setItem("api_error", error)
  } else {
    localStorage.removeItem("api_error")
  }
}

// Add a new function to get visa programs using the stored vendor key
export async function getVisaProgramsWithVendorKey(params: {
  destination: string
  citizenship: string
  arrivalDate: string
}): Promise<any> {
  try {
    console.log("Getting visa programs with vendor key:", params)

    // Get the vendor key from localStorage
    const vendorKey = localStorage.getItem("vendor_key") || ""

    if (!vendorKey) {
      const error = "No vendor key found in localStorage"
      console.error(error)
      storeApiError(error)
      throw new Error(error)
    }

    // Make a direct fetch call to the API endpoint with the vendor key as bearer token
    const response = await fetch("https://stg-api.superjetom.com/get_visa_programs_omantel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${vendorKey}`,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = `API returned status: ${response.status}`
      storeApiError(error)
      throw new Error(error)
    }

    // Parse the response
    const data = await response.json()
    console.log("Visa programs response:", data)

    // Clear any stored errors since the request succeeded
    storeApiError(null)

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Failed to get visa programs:", error)
    if (error instanceof Error) {
      storeApiError(error.message)
    } else {
      storeApiError("Unknown error occurred")
    }
    throw error
  }
}

/**
 * Get countries list from the API
 */
export async function getCountries(): Promise<any> {
  try {
    // Ensure API client is initialized
    await apiClient.initialize()

    // Set a timeout for the API call
    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Countries API request timed out"))
      }, 8000)
    })

    // Make the API call
    const apiPromise = apiClient.makeRequest("country", {
      vendor_key: apiClient.getVendorKey(),
    })

    // Race between the API call and the timeout
    const response = await Promise.race([apiPromise, timeoutPromise])

    return {
      countries: response.result || [],
      _isMockData: false,
    }
  } catch (error) {
    console.error("Failed to get countries:", error)
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
