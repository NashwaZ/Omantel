/**
 * Utility functions for API response storage and retrieval
 */

/**
 * Store an API response in localStorage
 * @param endpoint The API endpoint
 * @param method The HTTP method
 * @param url The full URL
 * @param status The HTTP status code
 * @param requestBody The request body
 * @param responseBody The response body
 * @returns The generated storage key
 */
export function storeApiResponse(
  endpoint: string,
  method: string,
  url: string,
  status: number,
  requestBody: any,
  responseBody: any,
): string {
  try {
    const id = `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const storageKey = `api_response_${id}`

    const data = {
      id,
      timestamp: new Date().toISOString(),
      endpoint,
      url,
      method,
      status,
      requestBody,
      responseBody,
    }

    localStorage.setItem(storageKey, JSON.stringify(data))

    // Special handling for specific endpoints
    if (endpoint.includes("create_organization") || url.includes("create_organization")) {
      if (responseBody?.result?.[0]?.vendor_key) {
        localStorage.setItem("vendor_key", responseBody.result[0].vendor_key)
        // console.log("Vendor key stored:", responseBody.result[0].vendor_key)
      }
    }

    if (endpoint.includes("create_traveller_omantel") || url.includes("create_traveller_omantel")) {
      localStorage.setItem("traveller_data", JSON.stringify(responseBody))
      // console.log("Traveller data stored:", responseBody)

      if (responseBody?.result?.[0]?.access_token) {
        localStorage.setItem("traveller_access_token", responseBody.result[0].access_token)
        // console.log("Traveller access token stored:", responseBody.result[0].access_token)
      }
    }

    if (endpoint.includes("get_visa_programs_omantel") || url.includes("get_visa_programs_omantel")) {
      localStorage.setItem("visa_programs_data", JSON.stringify(responseBody))
      // console.log("Visa programs data stored:", responseBody)

      // Store the first program ID for easy access
      if (responseBody?.result?.programs?.[0]?.id) {
        localStorage.setItem("selected_program_id", responseBody.result.programs[0].id)
        // console.log("Selected program ID stored:", responseBody.result.programs[0].id)
      }
    }

    return storageKey
  } catch (e) {
    console.error("Failed to store API response:", e)
    return ""
  }
}

/**
 * Get a stored API response by endpoint
 * @param endpoint The API endpoint to search for
 * @returns The most recent matching API response or null if not found
 */
export function getStoredApiResponse(endpoint: string): any {
  try {
    // Get all keys from localStorage that start with 'api_response_'
    const apiResponseKeys = Object.keys(localStorage).filter((key) => key.startsWith("api_response_"))

    // Find keys that match the endpoint
    const matchingKeys = apiResponseKeys.filter((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}")
        return data.endpoint?.includes(endpoint) || data.url?.includes(endpoint)
      } catch {
        return false
      }
    })

    // Sort by timestamp (most recent first)
    matchingKeys.sort((a, b) => {
      try {
        const dataA = JSON.parse(localStorage.getItem(a) || "{}")
        const dataB = JSON.parse(localStorage.getItem(b) || "{}")
        return new Date(dataB.timestamp).getTime() - new Date(dataA.timestamp).getTime()
      } catch {
        return 0
      }
    })

    // Return the most recent matching response
    if (matchingKeys.length > 0) {
      try {
        return JSON.parse(localStorage.getItem(matchingKeys[0]) || "{}")
      } catch {
        return null
      }
    }

    return null
  } catch (e) {
    console.error("Failed to get stored API response:", e)
    return null
  }
}

/**
 * Get the program ID from stored visa programs data
 * @returns The program ID or null if not found
 */
export function getStoredProgramId(): string | null {
  // First try to get from dedicated storage
  const storedProgramId = localStorage.getItem("program_id") || localStorage.getItem("selected_program_id")
  if (storedProgramId) {
    // console.log("Using stored program ID:", storedProgramId)
    return storedProgramId
  }

  // Then try to get from visa programs data
  try {
    const visaProgramsData = localStorage.getItem("visa_programs_data")
    if (visaProgramsData) {
      const data = JSON.parse(visaProgramsData)

      // Check all possible paths where the program ID might be stored
      if (data?.result?.programs?.[0]?.id) {
        const programId = data.result.programs[0].id
        // console.log("Found program ID in visa_programs_data.result.programs:", programId)
        return programId
      } else if (data?.programs?.[0]?.id) {
        const programId = data.programs[0].id
        // console.log("Found program ID in visa_programs_data.programs:", programId)
        return programId
      } else if (Array.isArray(data?.result) && data.result[0]?.id) {
        const programId = data.result[0].id
        // console.log("Found program ID in visa_programs_data.result array:", programId)
        return programId
      }
    }
  } catch (e) {
    console.error("Failed to parse visa programs data:", e)
  }

  // Finally, try to find in any stored API response
  try {
    // Look for any API response that might contain program data
    const apiResponseKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith("api_response_") && localStorage.getItem(key)?.includes("get_visa_programs_omantel"),
    )

    for (const key of apiResponseKeys) {
      try {
        const responseData = JSON.parse(localStorage.getItem(key) || "{}")
        const responseBody = responseData.responseBody || {}

        // Check all possible paths
        if (responseBody?.result?.programs?.[0]?.id) {
          const programId = responseBody.result.programs[0].id
          // console.log("Found program ID in stored API response:", programId)
          return programId
        } else if (responseBody?.programs?.[0]?.id) {
          const programId = responseBody.programs[0].id
          // console.log("Found program ID in stored API response (alt path):", programId)
          return programId
        } else if (Array.isArray(responseBody?.result) && responseBody.result[0]?.id) {
          const programId = responseBody.result[0].id
          // console.log("Found program ID in stored API response (result array):", programId)
          return programId
        }
      } catch (e) {
        console.error("Failed to parse stored API response:", e)
      }
    }
  } catch (e) {
    console.error("Failed to get program ID from stored API response:", e)
  }

  return null
}

/**
 * Get the traveller access token from stored data
 * @returns The access token or null if not found
 */
export function getStoredAccessToken(): string | null {
  // First try to get from dedicated storage
  const storedToken = localStorage.getItem("traveller_access_token")
  if (storedToken) {
    return storedToken
  }

  // Then try to get from traveller data
  try {
    const travellerData = localStorage.getItem("traveller_data")
    if (travellerData) {
      const data = JSON.parse(travellerData)
      if (data?.result?.[0]?.access_token) {
        return data.result[0].access_token
      }
    }
  } catch (e) {
    console.error("Failed to parse traveller data:", e)
  }

  return null
}

/**
 * Get the vendor key from stored data
 * @returns The vendor key or null if not found
 */
export function getStoredVendorKey(): string | null {
  return localStorage.getItem("vendor_key")
}
