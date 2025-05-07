export const runtime = "edge" // Optional: use edge functions

export async function POST(request) {
  try {
    const body = await request.json()
    const { country } = body

    if (!country) {
      return Response.json({ error: "Country is required" }, { status: 400 })
    }

    // Clean and prepare the search query - remove special characters and ensure proper encoding
    const cleanCountry = country.trim().replace(/[^\w\s]/gi, "")
    const query = encodeURIComponent(`${cleanCountry} city landmark`)

    const PIXABAY_API_KEY = "50038285-94e4a3f64eb259e7bd014610c"
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true&min_width=800`

    console.log(`Fetching from Pixabay with query: ${cleanCountry}`)

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; VisaApp/1.0)",
        },
      })
      clearTimeout(timeoutId)

      console.log(`Pixabay API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.hits || data.hits.length === 0) {
        console.log(`No images found for query: ${cleanCountry}`)
        return Response.json(
          {
            imageUrl: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(cleanCountry + " scenic view")}`,
            photographerName: "Placeholder",
            photographerProfile: null,
            photoPage: null,
            fallback: true,
          },
          { status: 200 },
        )
      }

      // Pick a random image from the results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(data.hits.length, 3))
      const photo = data.hits[randomIndex]

      return Response.json(
        {
          imageUrl: photo.largeImageURL,
          photographerName: photo.user,
          photographerProfile: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`,
          photoPage: photo.pageURL,
        },
        { status: 200 },
      )
    } catch (fetchError) {
      console.error("Fetch error:", fetchError.message)
      // Use fallback image if fetch fails
      return Response.json(
        {
          imageUrl: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(cleanCountry + " scenic view")}`,
          photographerName: "Placeholder",
          photographerProfile: null,
          photoPage: null,
          fallback: true,
        },
        { status: 200 },
      )
    }
  } catch (err) {
    console.error("Error in getCountryImage:", err)
    // Always return a valid response even if everything fails
    return Response.json(
      {
        imageUrl: `/placeholder.svg?height=400&width=600&query=travel destination`,
        photographerName: "Placeholder",
        photographerProfile: null,
        photoPage: null,
        fallback: true,
      },
      { status: 200 },
    )
  }
}
