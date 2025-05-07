export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { country } = req.body

  if (!country) {
    return res.status(400).json({ error: "Country is required" })
  }

  const PEXELS_API_KEY = "DbHKy1dLsKEd7pE8H6hcpMmnt0UyRluSHq4d8krMttx8UEtO79g0kAne" // 🔥 Hardcoded here

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(country)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from Pexels")
    }

    const data = await response.json()

    if (data.photos.length === 0) {
      return res.status(404).json({ error: "No image found for this country" })
    }

    const imageUrl = data.photos[0].src.landscape
    const photographerName = data.photos[0].photographer
    const photographerUrl = data.photos[0].photographer_url

    return res.status(200).json({ imageUrl, photographerName, photographerUrl })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
