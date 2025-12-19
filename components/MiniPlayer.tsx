"use client"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Fonts } from "../constants/Fonts"
import { useAppContext } from "../context/AppContext"

const { width } = Dimensions.get("window")

export default function MiniPlayer() {
  const router = useRouter()
  const {
    currentElement,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    setCurrentElement,
    stopAudio,
    playElement,
  } = useAppContext()

  if (!currentElement) return null

  const progressPercentage = playbackDuration ? (playbackPosition / playbackDuration) * 100 : 0

  const formatTime = (millis: number) => {
    if (!millis) return "00:00"
    const minutes = Math.floor(millis / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const getElementColor = (category: string): string => {
    switch (category) {
      case "alkali metal":
        return "#ff6b6b"
      case "alkaline earth metal":
        return "#ff9e7d"
      case "transition metal":
        return "#ffc75f"
      case "post-transition metal":
        return "#f9f871"
      case "metalloid":
        return "#7bed9f"
      case "nonmetal":
        return "#70a1ff"
      case "noble gas":
        return "#7f47ed"
      case "lanthanide":
        return "#ff79c6"
      case "actinide":
        return "#ff5e57"
      default:
        return "#c8d6e5"
    }
  }

  const handleClose = () => {
    // Stop the audio when closing the mini player
    stopAudio()
    setCurrentElement(null)
  }

  const handlePlayPause = () => {
    // console.log("MiniPlayer: handlePlayPause called")
    // console.log("Current element:", currentElement?.name)
    // console.log("Is playing:", isPlaying)

    // Always use togglePlayback to maintain the current position
    // This will handle both play and pause states correctly
    togglePlayback()
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />

      <TouchableOpacity
        style={styles.content}
        onPress={() =>
          router.push({
            pathname: "/periodic-table/element-detail",
          })
        }
      >
        <View style={[styles.elementSymbolWrapper, { borderColor: getElementColor(currentElement.category), shadowColor: getElementColor(currentElement.category) }]}>
          <View style={[styles.elementSymbol, { backgroundColor: getElementColor(currentElement.category) }]}>
            <Text style={styles.symbolText}>{currentElement.symbol}</Text>
            <View style={[styles.symbolGlossyOverlay, { borderColor: getElementColor(currentElement.category) }]} />
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{currentElement.name}</Text>
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
    backgroundColor: "#16213e",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 100,
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
  elementSymbolWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 12,
  },
  elementSymbol: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  symbolGlossyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  symbolText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
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
