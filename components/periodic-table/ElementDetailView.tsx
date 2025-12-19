"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useAppContext } from "../../context/AppContext"

const { width: screenWidth } = Dimensions.get("window")

export default function ElementDetailView() {
  const {
    favorites,
    toggleFavorite,
    currentElement,
    playElement,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    sound,
    elements,
  } = useAppContext()

  const [isLoading, setIsLoading] = useState(false)
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying)
  const [localPlaybackPosition, setLocalPlaybackPosition] = useState(playbackPosition)
  const [localPlaybackDuration, setLocalPlaybackDuration] = useState(playbackDuration)
  const [isDragging, setIsDragging] = useState(false)
  const [tempPosition, setTempPosition] = useState(0)
  const [progressBarWidth, setProgressBarWidth] = useState(0)

  const displayElement = currentElement

  const isFavorite = displayElement ? favorites.includes(displayElement.number) : false

  useEffect(() => {
    // Update local state when context state changes
    setLocalIsPlaying(isPlaying)
    if (!isDragging) {
      setLocalPlaybackPosition(playbackPosition)
      setLocalPlaybackDuration(playbackDuration)
    }

    return () => {
      // Don't unload the sound when leaving the screen
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
    },
    onPanResponderMove: (event) => {
      if (progressBarWidth > 0) {
        const touchX = event.nativeEvent.locationX
        const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth))
        const newPosition = percentage * localPlaybackDuration
        setTempPosition(newPosition)
      }
    },
    onPanResponderRelease: (event) => {
      if (progressBarWidth > 0) {
        const touchX = event.nativeEvent.locationX
        const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth))
        const newPosition = percentage * localPlaybackDuration
        seekToPosition(newPosition)
      }
      setIsDragging(false)
      setTempPosition(0)
    },
  })

  // Show a placeholder if no element is selected
  if (!displayElement) {
    return (
      <View style={[styles.container, styles.noElementContainer]}>
        <Ionicons name="flask-outline" size={64} color="#ccc" />
        <Text style={styles.noElementText}>No element selected....</Text>
        <Text style={styles.noElementSubtext}>Select an element from the table or grid view</Text>
      </View>
    )
  }

  const handlePlayPause = () => {
    if (currentElement?.number !== displayElement.number) {
      // If the displayed element is different from the currently playing one,
      // play this element instead of toggling
      playElement(displayElement)
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

  // Check if this element is the one currently playing
  const isThisElementPlaying = currentElement?.number === displayElement.number && localIsPlaying

  // Get the current position to display (either actual position or temp position while dragging)
  const displayPosition = isDragging ? tempPosition : localPlaybackPosition
  const progressPercentage = localPlaybackDuration ? (displayPosition / localPlaybackDuration) * 100 : 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.elementSymbolContainer,
            { backgroundColor: displayElement.category === "nonmetal" ? "#70a1ff" : "#ff6b6b" },
          ]}
        >
          <Text style={styles.elementSymbol}>{displayElement.symbol}</Text>
          <Text style={styles.atomicNumber}>{displayElement.number}</Text>
        </View>

        <View style={styles.elementInfo}>
          <Text style={styles.elementName}>{displayElement.name}</Text>
          <Text style={styles.elementCategory}>{displayElement.category}</Text>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(displayElement.number)}>
            <Ionicons name={isFavorite ? "star" : "star-outline"} size={24} color={isFavorite ? "#ffd700" : "#fff"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.playerCard}>
        <Text style={styles.playerTitle}>Listen to {displayElement.name}</Text>

        <View style={styles.audioPlayer}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name={isThisElementPlaying ? "pause" : "play"} size={32} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer} onLayout={handleProgressBarLayout} {...panResponder.panHandlers}>
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
              <Text style={styles.timeText}>{formatTime(localPlaybackDuration)}</Text>
            </View>
            
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Element Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Atomic Mass:</Text>
          <Text style={styles.detailValue}>{displayElement.atomic_mass} u</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Electron Configuration:</Text>
          <Text style={styles.detailValue}>{displayElement.electron_configuration}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Discovered by:</Text>
          <Text style={styles.detailValue}>{displayElement.discovered_by || "Unknown"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phase:</Text>
          <Text style={styles.detailValue}>{displayElement.phase}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Density:</Text>
          <Text style={styles.detailValue}>{displayElement.density} g/cm³</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Density:</Text>
          <Text style={styles.detailValue}>{displayElement.density} g/cm³</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0f0f1a",
  },
  noElementContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noElementText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  noElementSubtext: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
  },
  elementSymbolContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 16,
  },
  elementSymbol: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
  },
  atomicNumber: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.7)",
  },
  elementInfo: {
    flex: 1,
    justifyContent: "center",
  },
  elementName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  elementCategory: {
    fontSize: 16,
    color: "#ccc",
    textTransform: "capitalize",
  },
  favoriteButton: {
    position: "absolute",
    top: 36,
    right: 0,
    padding: 8,
  },
  playerCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0f3460",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBarContainer: {
    position: "relative",
    height: 30,
    justifyContent: "center",
    paddingVertical: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#2c3e50",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  progressThumb: {
    position: "absolute",
    top: 7,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginLeft: -8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    color: "#ccc",
    fontSize: 12,
  },
  detailsCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 150,
    fontSize: 14,
    color: "#ccc",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
})
