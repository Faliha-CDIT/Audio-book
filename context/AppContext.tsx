"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio"
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { AppState } from "react-native"
import { fetchElements, getFallbackElements } from "../services/api"

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

const ELEMENTS_CACHE_KEY = "@sarva_elements_cache_v1"

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Configures the audio session for foreground + background playback.
 */
async function configureAudioSession() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    })
  } catch (err) {
    console.warn("[Audio] setAudioModeAsync failed:", err)
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Start with bundled fallback elements so ALL devices display all 118 elements immediately
  const [elements, setElements] = useState<Element[]>(() => getFallbackElements())
  const [favorites, setFavorites] = useState<number[]>([])
  const [playbackHistory, setPlaybackHistory] = useState<number[]>([])
  const [currentElement, setCurrentElement] = useState<Element | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [sound, setSound] = useState<AudioPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const soundRef = useRef<AudioPlayer | null>(null)
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  const clearDemoInterval = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
  }, [])

  // Ensure a single reusable AudioPlayer instance so switching elements has zero ExoPlayer startup delay
  const getOrCreatePlayer = useCallback((initialSource: any): AudioPlayer => {
    if (soundRef.current) {
      return soundRef.current
    }

    const player = createAudioPlayer(initialSource, {
      updateInterval: 250,
      keepAudioSessionActive: true,
      preferredForwardBufferDuration: 2,
    })

    player.addListener("playbackStatusUpdate", (status) => {
      if (!status.isLoaded) return

      setPlaybackPosition(Math.round((status.currentTime ?? 0) * 1000))
      setPlaybackDuration(Math.round((status.duration ?? 0) * 1000))
      setIsPlaying(status.playing ?? false)

      if (status.didJustFinish) {
        setIsPlaying(false)
        setPlaybackPosition(0)
      }
    })

    soundRef.current = player
    setSound(player)
    return player
  }, [])

  // Initial setup
  useEffect(() => {
    configureAudioSession()
    loadElements()

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        configureAudioSession()
      }
    })

    return () => {
      subscription.remove()
      clearDemoInterval()
      soundRef.current?.remove()
      soundRef.current = null
    }
  }, [clearDemoInterval])

  const loadElements = async () => {
    // 1. Load cached elements if present (instant update if newer than bundled fallback)
    try {
      const cached = await AsyncStorage.getItem(ELEMENTS_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed)
        }
      }
    } catch (err) {
      console.warn("[Cache] Failed to read cached elements:", err)
    }

    // 2. Refresh from live API in background without blocking the UI
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const elementsData = await fetchElements()
        if (elementsData.length > 0) {
          setElements(elementsData)
          AsyncStorage.setItem(ELEMENTS_CACHE_KEY, JSON.stringify(elementsData)).catch(() => {})
          break
        }
      } catch (error) {
        console.error(`[API] fetchElements attempt ${attempt + 1} failed:`, error)
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
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
    clearDemoInterval()
    const player = soundRef.current
    if (player) {
      try {
        player.pause()
        player.seekTo(0)
      } catch (err) {
        console.warn("[Audio] Error stopping audio:", err)
      }
    }
    setIsPlaying(false)
    setPlaybackPosition(0)
    setPlaybackDuration(0)
  }, [clearDemoInterval])

  const playElement = useCallback((element: Element) => {
    clearDemoInterval()
    setCurrentElement(element)
    addToHistory(element.number)
    setPlaybackPosition(0)

    if (!element.audio_url) {
      // Demo mode (no audio URL)
      setIsPlaying(true)
      setPlaybackDuration(180000)
      demoIntervalRef.current = setInterval(() => {
        setPlaybackPosition((prev) => {
          if (prev >= 180000) {
            clearDemoInterval()
            setIsPlaying(false)
            return 180000
          }
          return prev + 1000
        })
      }, 1000)
      return
    }

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

      // Non-blocking session refresh so playback starts immediately
      configureAudioSession()

      const hadExistingPlayer = Boolean(soundRef.current)
      const player = getOrCreatePlayer(audioSource)
      if (hadExistingPlayer) {
        player.replace(audioSource)
      }
      player.play()
      setIsPlaying(true)
    } catch (audioError) {
      console.error("[Audio] Failed to create/play player:", audioError)
      setIsPlaying(true)
      setPlaybackDuration(180000)
      setPlaybackPosition(0)
    }
  }, [clearDemoInterval, getOrCreatePlayer])

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
