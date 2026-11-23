"use client"

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio"
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { AppState } from "react-native"

export interface Chapter {
  id: string
  bookId: string
  title: string
  number: number
  audio_url?: string | null
  duration?: number
}

export interface Book {
  id: string
  title: string
  cover?: any
  author: string
  description: string
  chapters: Chapter[]
}

interface BookContextType {
  currentChapter: Chapter | null
  currentBook: Book | null
  isPlaying: boolean
  playbackPosition: number
  playbackDuration: number
  sound: AudioPlayer | null
  isLoading: boolean

  // Actions
  playChapter: (chapter: Chapter, book: Book) => Promise<void>
  togglePlayback: () => Promise<void>
  setCurrentChapter: (chapter: Chapter | null) => void
  stopAudio: () => Promise<void>
}

const BookContext = createContext<BookContextType | undefined>(undefined)

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

export function BookProvider({ children }: { children: ReactNode }) {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [sound, setSound] = useState<AudioPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const soundRef = useRef<AudioPlayer | null>(null)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  useEffect(() => {
    configureAudioSession()

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        configureAudioSession()
      }
    })

    return () => {
      subscription.remove()
      soundRef.current?.remove()
    }
  }, [])

  const stopAudio = useCallback(async () => {
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
    setCurrentChapter(null)
    setCurrentBook(null)
  }, [])

  const playChapter = useCallback(async (chapter: Chapter, book: Book) => {
    // Tear down previous player first
    const prevPlayer = soundRef.current
    if (prevPlayer) {
      try {
        prevPlayer.pause()
        prevPlayer.remove()
      } catch (_) {}
      soundRef.current = null
      setSound(null)
    }

    setCurrentChapter(chapter)
    setCurrentBook(book)

    if (!chapter.audio_url) {
      // Demo mode
      setIsPlaying(true)
      setPlaybackDuration(chapter.duration || 180000)
      setPlaybackPosition(0)
      const interval = setInterval(() => {
        setPlaybackPosition((prev) => {
          const duration = chapter.duration || 180000
          if (prev >= duration) {
            clearInterval(interval)
            setIsPlaying(false)
            return duration
          }
          return prev + 1000
        })
      }, 1000)
      return
    }

    setIsLoading(true)
    try {
      const audioSource: any = { uri: chapter.audio_url }

      // Re-configure audio session before each play (Android OEM audio focus fix)
      await configureAudioSession()

      const newPlayer = createAudioPlayer(audioSource, { updateInterval: 500 })

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
      console.error("[Audio] Failed to load chapter audio:", audioError)
      setIsPlaying(true)
      setPlaybackDuration(chapter.duration || 180000)
      setPlaybackPosition(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const togglePlayback = useCallback(async () => {
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

  const contextValue: BookContextType = {
    currentChapter,
    currentBook,
    isPlaying,
    playbackPosition,
    playbackDuration,
    sound,
    isLoading,
    playChapter,
    togglePlayback,
    setCurrentChapter,
    stopAudio,
  }

  return <BookContext.Provider value={contextValue}>{children}</BookContext.Provider>
}

export function useBookContext() {
  const context = useContext(BookContext)
  if (context === undefined) {
    throw new Error("useBookContext must be used within a BookProvider")
  }
  return context
}
