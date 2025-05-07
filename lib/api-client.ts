// Simplify the API client to focus on the countries API
/**
 * API Client for the Visa Application Service
 * This client handles all API calls and authentication
 */

// API Base URL - Updated to staging URL
const API_BASE_URL = "https://stg-api.superjetom.com"

// Storage keys
const VENDOR_KEY_STORAGE_KEY = "vendor_key" // Changed to match the key used in other functions
const OFFLINE_MODE_KEY = "visa_offline_mode"

// Default vendor key as fallback
const DEFAULT_VENDOR_KEY =
  "noltijeibsobxlq261ifcz49wl7ej5t1dqeaty0vd5vj9wrawv92foadn17eotduz7s0d3u63rp3wwca25kauj9oyjc1yu9cs79evlrs90rh385n3zn5lwsz7y5xbvs009vm5kc8s08fysif5hdqeju7rwmbm9n3kskrtnlfjppif1jw2bdvu1m1azye581cn9vyadqzypum445i3o77im9uod0efcx3jasf1jmn6m8ovlsx0tktby5r1kzedlu6"

// Mock data for countries
const allCountries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
  "Brazil",
  "South Africa",
  "United Arab Emirates",
  "Saudi Arabia",
  "Oman",
  "Turkey",
  "Pakistan", // Added Pakistan as it's used in the example
]

// Mock data for country to ISO code mapping
const countryToISOCode: { [key: string]: string } = {
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Japan: "JP",
  China: "CN",
  India: "IN",
  Brazil: "BR",
  "South Africa": "ZA",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  Oman: "OM",
  Turkey: "TR",
  Pakistan: "PK", // Added Pakistan as it's used in the example
}

/**
 * API Client class to handle all API calls
 */
class ApiClient {
  private vendorKey: string | null = null
  private isInitialized = false
  private isOfflineMode = false

  constructor() {
    // Try to load vendor key and offline mode from storage
    if (typeof window !== "undefined") {
      this.vendorKey = localStorage.getItem(VENDOR_KEY_STORAGE_KEY)
      this.isOfflineMode = false // Always start in online mode

      // If we have a vendor key, consider the client initialized
      this.isInitialized = !!this.vendorKey

      // If not initialized, use the default vendor key immediately
      if (!this.isInitialized) {
        this.vendorKey = DEFAULT_VENDOR_KEY
        this.isInitialized = true
        localStorage.setItem(VENDOR_KEY_STORAGE_KEY, this.vendorKey)
      }
    }
  }

  /**
   * Debug a request with detailed logging
   */
  private debugRequest(endpoint: string, options: RequestInit, data: any): void {
    console.group(`🔍 API Request Debug: ${endpoint}`)
    console.log("URL:", `${API_BASE_URL}/${endpoint}`)
    console.log("Method:", options.method)
    console.log("Headers:", options.headers)
    console.log("Body:", data)
    console.groupEnd()
  }

  /**
   * Initialize the API client
   */
  async initialize(): Promise<boolean> {
    // If already initialized, return
    if (this.isInitialized) {
      return true
    }

    // Set up with default vendor key
    this.vendorKey = DEFAULT_VENDOR_KEY
    this.isInitialized = true

    if (typeof window !== "undefined") {
      localStorage.setItem(VENDOR_KEY_STORAGE_KEY, this.vendorKey)
    }

    return true
  }

  /**
   * Set offline mode status
   */
  setOfflineMode(isOffline: boolean): void {
    this.isOfflineMode = isOffline
    if (typeof window !== "undefined") {
      localStorage.setItem(OFFLINE_MODE_KEY, isOffline.toString())
    }
  }

  /**
   * Check if the client is in offline mode
   */
  isInOfflineMode(): boolean {
    return this.isOfflineMode
  }

  /**
   * Make a request to the API
   */
  async makeRequest(endpoint: string, data: any = {}): Promise<any> {
    // If we're not initialized, initialize first
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Add vendor key to request if available and not already included
    if (this.vendorKey && !data.vendor_key) {
      data.vendor_key = this.vendorKey
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add Authorization header if we have a vendor key
    if (this.vendorKey) {
      headers["Authorization"] = `Bearer ${this.vendorKey}`
    }

    const options: RequestInit = {
      method: "POST", // Always use POST for these APIs
      headers,
      body: JSON.stringify(data),
    }

    // Debug the request
    this.debugRequest(endpoint, options, data)

    try {
      // Use a direct URL without joining paths to avoid issues
      const url = endpoint.includes("http") ? endpoint : `${API_BASE_URL}/${endpoint}`
      console.log(`Making API request to: ${url}`)

      const response = await fetch(url, options)

      console.log(`API Response status from ${endpoint}:`, response.status, response.statusText)

      if (response.status === 404) {
        throw new Error(`API endpoint not found: ${endpoint}`)
      }

      // Handle 401 Unauthorized by trying to refresh the token
      if (response.status === 401) {
        console.log("Authentication failed (401), attempting to refresh token...")

        try {
          // Try to create a new organization to get a fresh token
          const refreshResponse = await fetch(`${API_BASE_URL}/create_organization`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ organization_name: "Omantel"}),
          })

          if (!refreshResponse.ok) {
            throw new Error(`Failed to refresh token: ${refreshResponse.status}`)
          }

          const refreshData = await refreshResponse.json()
          if (refreshData?.result?.[0]?.vendor_key) {
            this.vendorKey = refreshData.result[0].vendor_key
            localStorage.setItem(VENDOR_KEY_STORAGE_KEY, this.vendorKey)
            console.log("Token refreshed, retrying API call...")

            // Update headers with new token
            headers["Authorization"] = `Bearer ${this.vendorKey}`
            options.headers = headers

            // Retry the API call with the new token
            const retryResponse = await fetch(url, options)

            if (!retryResponse.ok) {
              throw new Error(`API retry failed with status: ${retryResponse.status}`)
            }

            // Parse the retry response
            return await retryResponse.json()
          } else {
            throw new Error("No vendor key in refresh response")
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError)
          throw new Error(`Authentication failed and token refresh failed: ${refreshError.message}`)
        }
      }

      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error(`Failed to parse JSON response: ${parseError.message}`)
        throw new Error(`Failed to parse JSON response: ${parseError.message}`)
      }

      console.log(`API Response data from ${endpoint}:`, responseData)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseData.message || "Unknown error"}`)
      }

      // If we got here, we're online
      this.setOfflineMode(false)

      return responseData
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error)

      // Don't automatically set offline mode or return mock data
      // Instead, throw the error to be handled by the caller
      throw error
    }
  }

  /**
   * Get a mock response for an endpoint
   */
  private getMockResponse(endpoint: string, data: any): any {
    console.warn(`Using mock response for ${endpoint}`)

    // Add _isMockData flag to all mock responses
    const mockData = { _isMockData: true }

    switch (endpoint) {
      case "country":
        return {
          ...mockData,
          result: allCountries.map((country) => ({
            name: country,
            code: countryToISOCode[country] || "",
          })),
        }
      default:
        return { ...mockData, result: [] }
    }
  }

  /**
   * Get the vendor key
   */
  getVendorKey(): string | null {
    return this.vendorKey
  }

  /**
   * Check if the client is initialized
   */
  isClientInitialized(): boolean {
    return this.isInitialized
  }
}

// Create a singleton instance
const apiClient = new ApiClient()

export default apiClient
