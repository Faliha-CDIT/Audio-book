import AsyncStorage from "@react-native-async-storage/async-storage"
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet } from "react-native"

export default function IntroScreen() {
  const router = useRouter()
  const videoRef = useRef<Video>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [hasCheckedLaunch, setHasCheckedLaunch] = useState(false)

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched")
        
        if (hasLaunched !== "true") {
          // First launch - show intro video
          setHasCheckedLaunch(true)
        } else {
          // Already launched - go directly to home
          router.replace("/home")
        }
      } catch (error) {
        console.error("Error checking first launch:", error)
        router.replace("/home")
      }
    }

    checkFirstLaunch()
  }, [router])

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return

    // Check if video has finished playing
    if (status.didJustFinish) {
      try {
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {
          // Mark as launched and navigate to home
          await AsyncStorage.setItem("hasLaunched", "true")
          router.replace("/home")
        })
      } catch (error) {
        console.error("Error handling video completion:", error)
        router.replace("/home")
      }
    }
  }

  // Don't render video if we're redirecting
  if (!hasCheckedLaunch) {
    return null
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Video
        ref={videoRef}
        source={require("../assets/images/sarva_2.mp4")}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        useNativeControls={false}
        isLooping={false}
        style={styles.video}
        shouldPlay={true}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
})
