"use client"

import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Fonts } from "../../constants/Fonts"
import { useBookContext } from "../../context/BookContext"
import { type Chapter, type Book } from "../../context/BookContext"
import BookMiniPlayer from "../../components/BookMiniPlayer"

const { width: screenWidth } = Dimensions.get("window")

// Generate chapters for a book (same as in [id].tsx)
const generateChapters = (bookId: string, count: number): Chapter[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${bookId}-chapter-${i + 1}`,
    bookId,
    title: `Chapter ${i + 1}`,
    number: i + 1,
    audio_url: null,
    duration: 180000,
  }))
}

const BOOKS_INFO: Record<string, Book> = {
  "5": {
    id: "5",
    title: "Cover Case",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("5", 12),
  },
  "2": {
    id: "2",
    title: "Chalachitra Sidhandangal",
    cover: require("../../assets/images/Hasthalikhitham.jpg"),
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("2", 15),
  },
  "3": {
    id: "3",
    title: "Hasthalikhitham",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("3", 10),
  },
  "4": {
    id: "4",
    title: "Kumaranasan Vijnankosham",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("4", 20),
  },
  "8": {
    id: "8",
    title: "Vaikom",
    cover: require("../../assets/images/vaikom cover-1.jpg"),
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("8", 13),
  },
}

export default function ChapterDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const {
    currentChapter,
    currentBook,
    playChapter,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    sound,
  } = useBookContext()

  const bookId = String(params.bookId || "")
  const chapterId = String(params.chapterId || "")

  const book = BOOKS_INFO[bookId]
  const chapter = book?.chapters.find((ch) => ch.id === chapterId) || currentChapter
  const displayBook = book || currentBook

  const [isLoading, setIsLoading] = useState(false)
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying)
  const [localPlaybackPosition, setLocalPlaybackPosition] = useState(playbackPosition)
  const [localPlaybackDuration, setLocalPlaybackDuration] = useState(playbackDuration)
  const [isDragging, setIsDragging] = useState(false)
  const [tempPosition, setTempPosition] = useState(0)
  const [progressBarWidth, setProgressBarWidth] = useState(0)

  useEffect(() => {
    setLocalIsPlaying(isPlaying)
    if (!isDragging) {
      setLocalPlaybackPosition(playbackPosition)
      setLocalPlaybackDuration(playbackDuration)
    }
  }, [isPlaying, playbackPosition, playbackDuration, isDragging])

  // Seek to a specific position in the audio
  const seekToPosition = async (positionMillis: number) => {
    if (sound && localPlaybackDuration > 0) {
      try {
        await sound.setPositionAsync(Math.max(0, Math.min(positionMillis, localPlaybackDuration)))
        setLocalPlaybackPosition(positionMillis)
      } catch (error) {
        console.error("Error seeking to position:", error)
      }
    }
  }

  // Handle progress bar layout to get its width
  const handleProgressBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    setProgressBarWidth(width)
  }

  // PanResponder for handling touch gestures on progress bar
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setIsDragging(true)
      const touchX = event.nativeEvent.locationX
      const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth))
      const newPosition = percentage * localPlaybackDuration
      setTempPosition(newPosition)
      setLocalPlaybackPosition(newPosition)
    },
    onPanResponderMove: (event) => {
      if (progressBarWidth > 0) {
        const touchX = event.nativeEvent.locationX
        const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth))
        const newPosition = percentage * localPlaybackDuration
        setTempPosition(newPosition)
        setLocalPlaybackPosition(newPosition)
      }
    },
    onPanResponderRelease: () => {
      if (tempPosition >= 0 && localPlaybackDuration > 0) {
        const clampedPosition = Math.max(0, Math.min(tempPosition, localPlaybackDuration))
        seekToPosition(clampedPosition)
      }
      setIsDragging(false)
      setTempPosition(0)
    },
  })

  if (!chapter || !displayBook) {
    return (
      <View style={[styles.container, styles.noElementContainer]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="book-outline" size={64} color="#ccc" />
        <Text style={styles.noElementText}>Chapter not found</Text>
      </View>
    )
  }

  const handlePlayPause = async () => {
    if (currentChapter?.id !== chapter.id) {
      if (displayBook) {
        await playChapter(chapter, displayBook)
      }
    } else {
      togglePlayback()
    }
  }

  const formatTime = (millis: number) => {
    if (!millis) return "00:00"
    const minutes = Math.floor(millis / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleShare = async () => {
    try {
      const shareContent = `Check out "${chapter.title}" from "${displayBook.title}"!\n\n${displayBook.description}`

      const result = await Share.share({
        message: shareContent,
        title: `${chapter.title} - ${displayBook.title}`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  // Check if this chapter is the one currently playing
  const isThisChapterPlaying = currentChapter?.id === chapter.id && localIsPlaying

  // Get the current position to display (either actual position or temp position while dragging)
  const displayPosition = isDragging ? tempPosition : localPlaybackPosition
  const progressPercentage = localPlaybackDuration ? (displayPosition / localPlaybackDuration) * 100 : 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
        {/* Hero header */}
        <View style={styles.hero}>
          {displayBook.cover ? (
            <Image source={displayBook.cover} style={styles.coverArt} />
          ) : (
            <View style={styles.coverArtPlaceholder}>
              <Ionicons name="book" size={64} color="#fff" />
            </View>
          )}

          <Text style={styles.trackTitle}>{chapter.title}</Text>
          <Text style={styles.trackSubtitle}>{displayBook.title}</Text>
          <Text style={styles.authorText}>{displayBook.author}</Text>

          {/* Controls row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryPlay} onPress={handlePlayPause} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Ionicons name={isThisChapterPlaying ? "pause" : "play"} size={30} color="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressContainer} onLayout={handleProgressBarLayout} {...panResponder.panHandlers}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.progressThumb,
                  {
                    left: `${Math.max(0, Math.min(100, progressPercentage))}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
              <Text style={styles.timeSeparator}>/</Text>
              <Text style={styles.timeText}>{formatTime(localPlaybackDuration)}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>About this Chapter</Text>
          <Text style={styles.detailText}>{displayBook.description}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Chapter Number:</Text>
            <Text style={styles.detailValue}>{chapter.number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Book:</Text>
            <Text style={styles.detailValue}>{displayBook.title}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Author:</Text>
            <Text style={styles.detailValue}>{displayBook.author}</Text>
          </View>
        </View>
      </View>
      </ScrollView>

      <BookMiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#16213e",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  noElementContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noElementText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginTop: 16,
  },
  hero: {
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  coverArt: {
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: 20,
    marginBottom: 16,
    resizeMode: "cover",
  },
  coverArtPlaceholder: {
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: 20,
    backgroundColor: "#16213e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  trackTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#fff",
    textAlign: "center",
  },
  trackSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: "#ccc",
    marginTop: 4,
    marginBottom: 8,
    textAlign: "center",
  },
  authorText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#aaa",
    marginBottom: 16,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f3460",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F500E2",
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    width: "100%",
    position: "relative",
    height: 30,
    justifyContent: "center",
    paddingVertical: 10,
  },
  progressSection: {
    width: "100%",
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2c3e50",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F500E2",
  },
  progressThumb: {
    position: "absolute",
    top: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginLeft: -7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  timeText: {
    color: "#ccc",
    fontSize: 12,
  },
  timeSeparator: {
    color: "#ccc",
    fontSize: 12,
    marginHorizontal: 4,
  },
  detailsCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: "#ccc",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
})

