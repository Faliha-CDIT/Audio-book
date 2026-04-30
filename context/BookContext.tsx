"use client"

import { Audio } from "expo-av"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
  sound: Audio.Sound | null
  isLoading: boolean

  // Actions
  playChapter: (chapter: Chapter, book: Book) => Promise<void>
  togglePlayback: () => Promise<void>
  setCurrentChapter: (chapter: Chapter | null) => void
  stopAudio: () => Promise<void>
}

const BookContext = createContext<BookContextType | undefined>(undefined)

export function BookProvider({ children }: { children: ReactNode }) {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Configure audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })

    return () => {
      // Cleanup sound when component unmounts
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

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
    setCurrentChapter(null)
    setCurrentBook(null)
  }

  const playChapter = async (chapter: Chapter, book: Book) => {
    try {
      setIsLoading(true)

      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }

      setCurrentChapter(chapter)
      setCurrentBook(book)

      // Load and play audio if available
      if (chapter.audio_url) {
        try {
          let audioSource

          // Check if it's a local file marker
          if (chapter.audio_url.startsWith("local://")) {
            // Handle local audio files
            const audioType = chapter.audio_url.replace("local://", "")
            // You can add specific book audio files here
            audioSource = { uri: chapter.audio_url }
          } else {
            // Remote URL or direct path
            audioSource = { uri: chapter.audio_url }
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

              // Auto-stop when finished
              if (status.didJustFinish) {
                setIsPlaying(false)
                setPlaybackPosition(0)
              }
            }
          })
        } catch (audioError) {
          console.error("Error loading audio:", audioError)
          // Fallback to demo mode
          setIsPlaying(true)
          setPlaybackDuration(chapter.duration || 180000) // Use chapter duration or default 3 minutes
          setPlaybackPosition(0)
        }
      } else {
        // Demo mode for chapters without audio
        setIsPlaying(true)
        setPlaybackDuration(chapter.duration || 180000)
        setPlaybackPosition(0)

        // Simulate playback progress
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
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error playing chapter:", error)
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

