"use client"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Fonts } from "../constants/Fonts"
import { useBookContext } from "../context/BookContext"

const { width } = Dimensions.get("window")

export default function BookMiniPlayer() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const {
    currentChapter,
    currentBook,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    setCurrentChapter,
    stopAudio,
  } = useBookContext()

  if (!currentChapter || !currentBook) return null

  const progressPercentage = playbackDuration ? (playbackPosition / playbackDuration) * 100 : 0

  const formatTime = (millis: number) => {
    if (!millis) return "00:00"
    const minutes = Math.floor(millis / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleClose = () => {
    // Stop the audio when closing the mini player
    stopAudio()
  }

  const handlePlayPause = () => {
    togglePlayback()
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Animated.View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />

      <TouchableOpacity
        style={styles.content}
        onPress={() =>
          router.push({
            pathname: "/book-details/chapter-detail",
            params: {
              bookId: currentBook.id,
              chapterId: currentChapter.id,
            },
          })
        }
      >
        {currentBook.cover && (
          <Image source={currentBook.cover} style={styles.coverImage} />
        )}
        {!currentBook.cover && (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book" size={24} color="#fff" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.chapterTitle} numberOfLines={1}>
            {currentChapter.title}
          </Text>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {currentBook.title}
          </Text>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(playbackPosition)}</Text>
            <Text style={styles.timeSeparator}>/</Text>
            <Text style={styles.time}>{formatTime(playbackDuration)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#16213e",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 100,
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: "#F500E2",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  coverPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0f3460",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  bookTitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#aaa",
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#ccc",
  },
  timeSeparator: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#ccc",
    marginHorizontal: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F500E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
})

