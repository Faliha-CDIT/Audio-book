import AsyncStorage from "@react-native-async-storage/async-storage"
import { useVideoPlayer, VideoView } from "expo-video"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet } from "react-native"

export default function IntroScreen() {
  const router = useRouter()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [hasCheckedLaunch, setHasCheckedLaunch] = useState(false)

  const player = useVideoPlayer(require("../assets/images/sarva_2.mp4"), (p) => {
    p.play()
  })

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

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      try {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {
          await AsyncStorage.setItem("hasLaunched", "true")
          router.replace("/home")
        })
      } catch (error) {
        console.error("Error handling video completion:", error)
        router.replace("/home")
      }
    })

    return () => {
      subscription.remove()
    }
  }, [player, router, fadeAnim])

  // Don't render video if we're redirecting
  if (!hasCheckedLaunch) {
    return null
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
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
