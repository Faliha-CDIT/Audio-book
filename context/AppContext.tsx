"use client"

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio"
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { AppState, Platform } from "react-native"
import { fetchElements } from "../services/api"

export interface Element {
  name: string
  symbol: string
  number: number
  category: string
  atomic_mass: number
  electron_configuration: string
  discovered_by: string
  phase: string
  density: number
  summary: string
  xpos: number
  ypos: number
  audio_url?: string | null
  malayalam_name?: string | null
}

interface AppContextType {
  elements: Element[]
  favorites: number[]
  playbackHistory: number[]
  currentElement: Element | null
  isPlaying: boolean
  playbackPosition: number
  playbackDuration: number
  sound: AudioPlayer | null
  isLoading: boolean

  // Actions
  toggleFavorite: (elementNumber: number) => void
  addToHistory: (elementNumber: number) => void
  playElement: (element: Element) => void
  togglePlayback: () => void
  searchElements: (query: string) => Element[]
  setCurrentElement: (element: Element | null) => void
  stopAudio: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Configures the audio session for foreground + background playback.
 * Called once on mount and again when the app returns to foreground
 * (some Android OEMs reset audio focus when returning from background).
 */
async function configureAudioSession() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,       // iOS: play even on silent switch
      shouldPlayInBackground: true,  // Keep audio active when app is backgrounded
    })
  } catch (err) {
    console.warn("[Audio] setAudioModeAsync failed:", err)
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<Element[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [playbackHistory, setPlaybackHistory] = useState<number[]>([])
  const [currentElement, setCurrentElement] = useState<Element | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [sound, setSound] = useState<AudioPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use a ref to always access the latest player inside async callbacks
  // without stale closure issues.
  const soundRef = useRef<AudioPlayer | null>(null)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  // Initial setup
  useEffect(() => {
    configureAudioSession()
    loadElements()

    // Re-configure audio focus on Android when the app comes back to foreground,
    // because some OEMs (Xiaomi, OPPO, Samsung OneUI) release audio focus while
    // the app is backgrounded, causing subsequent plays to be silent.
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        configureAudioSession()
      }
    })

    return () => {
      subscription.remove()
      // Clean up any active player
      soundRef.current?.remove()
    }
  }, [])

  const loadElements = async () => {
    setIsLoading(true)
    // Retry up to 3 times in case of transient network/certificate issues
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const elementsData = await fetchElements()
        if (elementsData.length > 0) {
          setElements(elementsData)
          break
        }
      } catch (error) {
        console.error(`[API] fetchElements attempt ${attempt + 1} failed:`, error)
        if (attempt === 2) {
          console.error("[API] All retries exhausted, elements not loaded")
        }
        // Wait 1s before retrying
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    setIsLoading(false)
  }

  const toggleFavorite = (elementNumber: number) => {
    setFavorites((prev) =>
      prev.includes(elementNumber)
        ? prev.filter((num) => num !== elementNumber)
        : [...prev, elementNumber],
    )
  }

  const addToHistory = (elementNumber: number) => {
    setPlaybackHistory((prev) => {
      const filtered = prev.filter((num) => num !== elementNumber)
      return [elementNumber, ...filtered].slice(0, 50)
    })
  }

  const stopAudio = useCallback(() => {
    const player = soundRef.current
    if (player) {
      try {
        player.pause()
        player.seekTo(0)
        player.remove()
      } catch (err) {
        console.warn("[Audio] Error stopping audio:", err)
      }
      soundRef.current = null
      setSound(null)
    }
    setIsPlaying(false)
    setPlaybackPosition(0)
    setPlaybackDuration(0)
  }, [])

  const playElement = useCallback(async (element: Element) => {
    // --- 1. Tear down any currently active player FIRST ---
    const prevPlayer = soundRef.current
    if (prevPlayer) {
      try {
        prevPlayer.pause()
        prevPlayer.remove()
      } catch (_) {}
      soundRef.current = null
      setSound(null)
    }

    setCurrentElement(element)
    addToHistory(element.number)

    if (!element.audio_url) {
      // ---- Demo mode (no audio URL) ----
      setIsPlaying(true)
      setPlaybackDuration(180000)
      setPlaybackPosition(0)
      const interval = setInterval(() => {
        setPlaybackPosition((prev) => {
          if (prev >= 180000) {
            clearInterval(interval)
            setIsPlaying(false)
            return 180000
          }
          return prev + 1000
        })
      }, 1000)
      return
    }

    // ---- Real audio ----
    setIsLoading(true)

    try {
      // Resolve the audio source
      let audioSource: any
      if (element.audio_url.startsWith("local://")) {
        const audioType = element.audio_url.replace("local://", "")
        if (audioType === "introduction") {
          audioSource = require("../assets/audio/MOOLAKAVIJNANAKOSHAM INTRODUCTION.mp3")
        } else if (audioType === "conclusion") {
          audioSource = require("../assets/audio/CONCLUSION.mp3")
        } else {
          audioSource = { uri: element.audio_url }
        }
      } else {
        audioSource = { uri: element.audio_url }
      }

      // Re-configure audio session right before creating the player.
      // This is the key fix for Android devices that lose audio focus
      // between successive plays (Xiaomi MIUI, Samsung OneUI, OPPO ColorOS, etc.)
      await configureAudioSession()

      const newPlayer = createAudioPlayer(audioSource, {
        updateInterval: 500, // 500ms is enough for a progress bar; reduces CPU on low-end phones
      })

      newPlayer.addListener("playbackStatusUpdate", (status) => {
        if (!status.isLoaded) return

        setPlaybackPosition(Math.round((status.currentTime ?? 0) * 1000))
        setPlaybackDuration(Math.round((status.duration ?? 0) * 1000))
        setIsPlaying(status.playing ?? false)

        if (status.didJustFinish) {
          setIsPlaying(false)
          setPlaybackPosition(0)
        }
      })

      newPlayer.play()
      soundRef.current = newPlayer
      setSound(newPlayer)
      setIsPlaying(true)
    } catch (audioError) {
      console.error("[Audio] Failed to create/play player:", audioError)
      // Graceful fallback: show demo progress so the UI still responds
      setIsPlaying(true)
      setPlaybackDuration(180000)
      setPlaybackPosition(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const togglePlayback = useCallback(() => {
    const player = soundRef.current
    if (player) {
      try {
        if (player.playing) {
          player.pause()
          setIsPlaying(false)
        } else {
          player.play()
          setIsPlaying(true)
        }
      } catch (err) {
        console.warn("[Audio] togglePlayback error:", err)
      }
    } else {
      // Demo mode toggle
      setIsPlaying((prev) => !prev)
    }
  }, [])

  const normalize = (value: string | number | null | undefined) =>
    (value ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()

  const searchElements = useCallback(
    (query: string): Element[] => {
      const normalizedQuery = normalize(query)
      if (!normalizedQuery) return []
      return elements.filter((element) => {
        const haystacks = [
          element.name,
          element.symbol,
          element.number,
          element.category,
          element.discovered_by,
          element.phase,
          element.summary,
          element.electron_configuration,
          element.malayalam_name,
        ]
        return haystacks.some((field) => normalize(field).includes(normalizedQuery))
      })
    },
    [elements],
  )

  const contextValue: AppContextType = {
    elements,
    favorites,
    playbackHistory,
    currentElement,
    isPlaying,
    playbackPosition,
    playbackDuration,
    sound,
    isLoading,
    toggleFavorite,
    addToHistory,
    playElement,
    togglePlayback,
    searchElements,
    setCurrentElement,
    stopAudio,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
