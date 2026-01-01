import AsyncStorage from "@react-native-async-storage/async-storage"
import { Video } from "expo-av"
import { useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated } from "react-native"

export default function IntroScreen() {
  const router = useRouter()
  const videoRef = useRef<Video>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched")
        
        if (hasLaunched !== "true") {
          // First launch - show intro
          setTimeout(() => {
            // After video plays (adjust timing as needed)
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }).start(() => {
              AsyncStorage.setItem("hasLaunched", "true")
              router.replace("/home")
            })
          }, 5000) // Show intro for 5 seconds
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
  }, [])

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
        resizeMode="cover"
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
