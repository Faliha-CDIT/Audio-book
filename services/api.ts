// Define the element type based on the API response
export interface ApiElement {
  name: string
  symbol: string
  number: string | number
  category: string | null
  atomic_mass: string | number
  electron_configuration: string
  discovered_by: string
  phase: string
  density: string | number
  summary: string
  xpos: number
  ypos: number
  audio_url: string | null
  malayalam_name?: string | null
}

export interface ApiResponse {
  success: boolean
  data: ApiElement[]
}

// Convert API element to our app's element format
export const convertApiElement = (apiElement: ApiElement) => {
  return {
    name: apiElement.name,
    symbol: apiElement.symbol,
    number: typeof apiElement.number === "string" ? Number.parseInt(apiElement.number) || 0 : apiElement.number,
    category: apiElement.category || "unknown",
    atomic_mass:
      typeof apiElement.atomic_mass === "string"
        ? Number.parseFloat(apiElement.atomic_mass) || 0
        : apiElement.atomic_mass,
    electron_configuration: apiElement.electron_configuration,
    discovered_by: apiElement.discovered_by,
    phase: apiElement.phase,
    density: typeof apiElement.density === "string" ? Number.parseFloat(apiElement.density) || 0 : apiElement.density,
    summary: apiElement.summary,
    xpos: apiElement.xpos,
    ypos: apiElement.ypos,
    audio_url: apiElement.audio_url,
    malayalam_name: apiElement.malayalam_name || null,
  }
}

const API_KEY = "ehrXfaA1GBl61kV5ujlMIFELvY4/t/kv3eBLPHEp720="

// Fetch elements from the API with authentication
export const fetchElements = async () => {
  try {
    const response = await fetch("https://sarva.cditproject.org/api/elements", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-APP-KEY": API_KEY,
      },
    })

    const data: ApiResponse = await response.json()

    if (data.success) {
      return data.data.map(convertApiElement)
    } else {
      console.error("API returned success: false")
      return []
    }
  } catch (error) {
    console.error("Error fetching elements:", error)
    return []
  }
}

// Get the full audio URL
export const getAudioUrl = (audioPath: string | null) => {
  if (!audioPath) return null
  return `${audioPath}`
}
