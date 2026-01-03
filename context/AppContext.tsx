"use client"

import { Audio } from "expo-av"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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
  sound: Audio.Sound | null
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<Element[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [playbackHistory, setPlaybackHistory] = useState<number[]>([])
  const [currentElement, setCurrentElement] = useState<Element | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Configure audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })

    // Load elements from API
    loadElements()

    return () => {
      // Cleanup sound when component unmounts
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  const loadElements = async () => {
    try {
      setIsLoading(true)
      const elementsData = await fetchElements()
      setElements(elementsData)
    } catch (error) {
      console.error("Error loading elements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (elementNumber: number) => {
    setFavorites((prev) =>
      prev.includes(elementNumber) ? prev.filter((num) => num !== elementNumber) : [...prev, elementNumber],
    )
  }

  const addToHistory = (elementNumber: number) => {
    setPlaybackHistory((prev) => {
      const filtered = prev.filter((num) => num !== elementNumber)
      return [elementNumber, ...filtered].slice(0, 50) // Keep last 50
    })
  }

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync()
        await sound.unloadAsync()
        setSound(null)
      } catch (error) {
        console.error("Error stopping audio:", error)
      }
    }
    setIsPlaying(false)
    setPlaybackPosition(0)
    setPlaybackDuration(0)
  }

  const playElement = async (element: Element) => {
    try {
      setIsLoading(true)

      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }

      setCurrentElement(element)
      addToHistory(element.number)

      // Load and play audio if available
      if (element.audio_url) {
        try {
          let audioSource
          
          // Check if it's a local file marker
          if (element.audio_url.startsWith("local://")) {
            // Handle local audio files
            const audioType = element.audio_url.replace("local://", "")
            if (audioType === "introduction") {
              audioSource = require("../assets/audio/MOOLAKAVIJNANAKOSHAM INTRODUCTION.mp3")
            } else if (audioType === "conclusion") {
              audioSource = require("../assets/audio/CONCLUSION.mp3")
            } else {
              audioSource = { uri: element.audio_url }
            }
          } else {
            // Remote URL
            audioSource = { uri: element.audio_url }
          }
          
          const { sound: newSound } = await Audio.Sound.createAsync(audioSource, { shouldPlay: true })

          setSound(newSound)

          // Get audio status
          const status = await newSound.getStatusAsync()
          if (status.isLoaded) {
            setPlaybackDuration(status.durationMillis || 0)
            setIsPlaying(status.isPlaying || false)
          }

          // Set up playback status update
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              setPlaybackPosition(status.positionMillis || 0)
              setPlaybackDuration(status.durationMillis || 0)
              setIsPlaying(status.isPlaying || false)
            }
          })
        } catch (audioError) {
          console.error("Error loading audio:", audioError)
          // Fallback to demo mode
          setIsPlaying(true)
          setPlaybackDuration(180000) // 3 minutes demo
          setPlaybackPosition(0)
        }
      } else {
        // Demo mode for elements without audio
        setIsPlaying(true)
        setPlaybackDuration(180000) // 3 minutes demo
        setPlaybackPosition(0)

        // Simulate playback progress
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
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error playing element:", error)
      setIsLoading(false)
    }
  }

  const togglePlayback = async () => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          if (status.isPlaying) {
            await sound.pauseAsync()
          } else {
            await sound.playAsync()
          }
        }
      } catch (error) {
        console.error("Error toggling playback:", error)
      }
    } else {
      // Fallback for demo mode
      setIsPlaying((prev) => !prev)
    }
  }

  const normalize = (value: string | number | null | undefined) =>
    (value ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()

  const searchElements = (query: string): Element[] => {
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
  }

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
