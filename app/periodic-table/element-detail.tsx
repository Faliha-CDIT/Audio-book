"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
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
import { useAppContext } from "../../context/AppContext"

const { width: screenWidth } = Dimensions.get("window")

export default function ElementDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const {
    favorites,
    toggleFavorite,
    playbackHistory,
    addToHistory,
    currentElement,
    playElement,
    isPlaying,
    togglePlayback,
    playbackPosition,
    playbackDuration,
    sound,
    elements,
  } = useAppContext()

  // Convert params to element object with proper types
  const paramElement = params.number
    ? {
        name: String(params.name || ""),
        symbol: String(params.symbol || ""),
        number: Number(params.number || 0),
        category: String(params.category || ""),
        atomic_mass: Number(params.atomic_mass || 0),
        electron_configuration: String(params.electron_configuration || ""),
        discovered_by: String(params.discovered_by || ""),
        phase: String(params.phase || ""),
        density: Number(params.density || 0),
        summary: String(params.summary || ""),
        xpos: Number(params.xpos || 0),
        ypos: Number(params.ypos || 0),
        showFavorites: params.showFavorites === "true",
        audio_url: String(params.audio_url || ""),
      }
    : null

  // Find the element in our elements array to get the most up-to-date data
  const foundElement = params.number ? elements.find((e) => e.number === Number(params.number)) || null : null

  const [isLoading, setIsLoading] = useState(false)
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying)
  const [localPlaybackPosition, setLocalPlaybackPosition] = useState(playbackPosition)
  const [localPlaybackDuration, setLocalPlaybackDuration] = useState(playbackDuration)
  const [isDragging, setIsDragging] = useState(false)
  const [tempPosition, setTempPosition] = useState(0)
  const [progressBarWidth, setProgressBarWidth] = useState(0)

  // Use the element from params, found element, or current element from context
  const displayElement = foundElement || (params.showFavorites === "true" ? null : currentElement)
  
  // Check if element is special (Introduction or Conclusion)
  const isSpecial = displayElement?.category === "special"

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
      // Immediately update localPlaybackPosition to prevent snap-back
      setLocalPlaybackPosition(newPosition)
    },
    onPanResponderMove: (event) => {
      if (progressBarWidth > 0) {
        const touchX = event.nativeEvent.locationX
        const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth))
        const newPosition = percentage * localPlaybackDuration
        setTempPosition(newPosition)
        // Update visual position in real-time while dragging
        setLocalPlaybackPosition(newPosition)
      }
    },
    onPanResponderRelease: () => {
      // Use the tempPosition that was calculated during dragging
      if (tempPosition >= 0 && localPlaybackDuration > 0) {
        const clampedPosition = Math.max(0, Math.min(tempPosition, localPlaybackDuration))
        seekToPosition(clampedPosition)
      }
      setIsDragging(false)
      setTempPosition(0)
    },
  })

  // Handle showing favorites list
  if (params.showFavorites === "true") {
    const favoriteElements = elements.filter((el) => favorites.includes(el.number))

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>AudioBook Hub</Text>
          </TouchableOpacity> */}
        </View>
        <Text style={styles.sectionTitle}>Your Favorite Elements</Text>
        {favoriteElements.length === 0 ? (
          <Text style={styles.noFavoritesText}>
            You haven&apos;t added any favorites yet. Long press on any element to add it to favorites.
          </Text>
        ) : (
          <View style={styles.favoritesList}>
            {favoriteElements.map((el) => (
              <TouchableOpacity
                key={el.number}
                style={[styles.favoriteItem, { backgroundColor: "#16213e" }]}
                onPress={() => {
                  playElement(el)
                  router.push({
                    pathname: "/periodic-table/element-detail",
                    params: {
                      number: el.number.toString(),
                      name: el.name,
                      symbol: el.symbol,
                      category: el.category,
                      atomic_mass: el.atomic_mass.toString(),
                      electron_configuration: el.electron_configuration,
                      discovered_by: el.discovered_by,
                      phase: el.phase,
                      density: el.density.toString(),
                      summary: el.summary,
                      xpos: el.xpos.toString(),
                      ypos: el.ypos.toString(),
                    },
                  })
                }}
              >
                <Text style={styles.favoriteSymbol}>{el.symbol}</Text>
                <Text style={styles.favoriteName}>{el.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    )
  }

  // Show a placeholder if no element is selected
  if (!displayElement) {
    return (
      <View style={[styles.container, styles.noElementContainer]}>
        <View style={styles.header}>
          {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>AudioBook Hub</Text>
          </TouchableOpacity> */}
        </View>
        <Ionicons name="flask-outline" size={64} color="#ccc" />
        <Text style={styles.noElementText}>No element selected</Text>
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

  const handleShare = async () => {
    try {
      const shareContent = isSpecial
        ? `Check out ${displayElement.name} from the Periodic Table Audio Book!`
        : `Check out ${displayElement.name} (${displayElement.symbol}) - Atomic Number ${displayElement.number}\n\nCategory: ${displayElement.category}\nAtomic Mass: ${displayElement.atomic_mass} u\n\nFrom the Periodic Table Audio Book!`

      const result = await Share.share({
        message: shareContent,
        title: `${displayElement.name} - Periodic Table Audio Book`,
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType)
        } else {
          // Shared
          console.log("Content shared successfully")
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log("Share dismissed")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  // Get element-specific glow color based on category or number
  const getElementGlowColor = () => {
    if (!displayElement) return "#00ffff"
    
    const colorMap: { [key: string]: string } = {
      "nonmetal": "#00ff88",
      "metal": "#ff00ff",
      "alkali metal": "#ff6b00",
      "alkaline earth metal": "#ffb300",
      "transition metal": "#00ccff",
      "lanthanide": "#ff1493",
      "actinide": "#ff0080",
      "metalloid": "#00ff00",
      "halogen": "#ff4444",
      "noble gas": "#00ddff",
      "special": "#F500E2",
    }
    
    return colorMap[displayElement.category.toLowerCase()] || "#00ffff"
  }
  
  // Helper to add opacity to hex color
  const addOpacity = (color: string, opacity: number) => {
    // Convert hex to rgba
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Check if this element is the one currently playing
  const isThisElementPlaying = currentElement?.number === displayElement.number && localIsPlaying

  // Get the current position to display (either actual position or temp position while dragging)
  const displayPosition = isDragging ? tempPosition : localPlaybackPosition
  const progressPercentage = localPlaybackDuration ? (displayPosition / localPlaybackDuration) * 100 : 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Hero header */}
        <View style={styles.hero}>
          <View
            style={[
              styles.coverArtOuter,
              {
                borderColor: getElementGlowColor(),
                shadowColor: getElementGlowColor(),
              },
            ]}
          >
            {/* Outer glow shadow layer */}
            <View
              style={[
                styles.coverArtShadow,
                {
                  backgroundColor: getElementGlowColor(),
                  shadowColor: getElementGlowColor(),
                },
              ]}
            />
            {/* Glossy border/glow effect */}
            <View
              style={[
                styles.coverArtGlow,
                {
                  borderColor: getElementGlowColor(),
                  shadowColor: getElementGlowColor(),
                },
              ]}
            />
            <View
              style={[
                styles.coverArt,
                {
                  borderColor: getElementGlowColor(),
                  shadowColor: getElementGlowColor(),
                },
              ]}
            >
              {/* Base gradient for 3D depth */}
              <LinearGradient
                colors={[
                  getElementGlowColor(),
                  addOpacity(getElementGlowColor(), 0.9),
                  addOpacity(getElementGlowColor(), 0.8),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverArtGradient}
              />
              
              {/* Top highlight gradient */}
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.4)",
                  "rgba(255, 255, 255, 0.15)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={styles.coverArtTopHighlight}
              />
              
              {/* Bottom shadow gradient */}
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0, 0, 0, 0.3)",
                  "rgba(0, 0, 0, 0.5)",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0, y: 1 }}
                style={styles.coverArtBottomShadow}
              />
              
              {/* Inner border highlight */}
              <View style={styles.coverArtInnerBorder} />
              
              {/* Glossy overlay for 3D effect */}
              <View style={styles.coverGlossyOverlay} />
              
              {/* Text with embossed effect */}
              <View style={styles.coverSymbolContainer}>
                <Text style={[styles.coverSymbolShadow, { color: "rgba(0, 0, 0, 0.2)" }]}>
                  {displayElement.symbol}
                </Text>
                <Text style={[styles.coverSymbol, { color: "#000" }]}>
                  {displayElement.symbol}
                </Text>
              </View>
              
              {!isSpecial && (
                <Text style={[styles.coverNumber, { color: "rgba(0, 0, 0, 0.7)" }]}>
                  {displayElement.number}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.trackTitle}>{displayElement.name}</Text>
          <Text style={styles.trackSubtitle}>{displayElement.category}</Text>

          {/* Controls row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => toggleFavorite(displayElement.number)} style={styles.controlButton}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#F500E2" : "#fff"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryPlay} onPress={handlePlayPause} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Ionicons name={isThisElementPlaying ? "pause" : "play"} size={30} color="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#fff" />
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

        {/* Details - Hide for special elements (Introduction and Conclusion) */}
        {!isSpecial && (
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
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
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
  noElementSubtext: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
  hero: {
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  coverArtOuter: {
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
  },
  coverArtShadow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    opacity: 0.4,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
  coverArtGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    borderWidth: 3,
    opacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
  },
  coverArt: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    overflow: "hidden",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 25,
    position: "relative",
  },
  coverArtGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
  },
  coverArtTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    zIndex: 1,
  },
  coverArtBottomShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    zIndex: 1,
  },
  coverArtInnerBorder: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 2,
  },
  coverSymbolContainer: {
    position: "relative",
    zIndex: 3,
  },
  coverSymbol: {
    fontSize: 64,
    fontFamily: Fonts.bold,
    color: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
  },
  coverSymbolShadow: {
    fontSize: 64,
    fontFamily: Fonts.bold,
    position: "absolute",
    top: 2,
    left: 0,
  },
  coverNumber: {
    position: "absolute",
    bottom: 10,
    right: 12,
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.7)",
    zIndex: 3,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
  },
  coverGlossyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 2,
  },
  trackTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#fff",
    textAlign: "center",
  },
  trackSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#ccc",
    textTransform: "capitalize",
    marginTop: 4,
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
  favoritesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  favoriteItem: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  favoriteSymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  favoriteName: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
  noFavoritesText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginTop: 20,
  },
})
