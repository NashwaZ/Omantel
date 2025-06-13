// The base URL for the external API
import config from "@/lib/api-config"
const base_url = config.BASE_URL;

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return new Response(JSON.stringify({ error: "Endpoint parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json()

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization")
    console.log(
      `Proxy: Forwarding request to ${endpoint} with auth: ${authHeader ? "Bearer " + authHeader.substring(7, 15) + "..." : "none"}`,
    )

    // Prepare headers for the API request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add authorization header if it exists
    if (authHeader) {
      headers["Authorization"] = authHeader
      console.log("Proxy: Authorization header added to request")
    }

    // Make the API request
    const apiResponse = await fetch(`${base_url}/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await apiResponse.json()
    console.log(`Proxy: Received response from ${endpoint} with status: ${apiResponse.status}`)

    // Return the response
    return new Response(JSON.stringify(data), {
      status: apiResponse.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(`Error in proxy route for endpoint ${endpoint}:`, error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
