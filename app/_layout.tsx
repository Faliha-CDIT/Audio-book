import { useFonts } from 'expo-font'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from "expo-status-bar"
import { useEffect } from 'react'
import { AppProvider } from "../context/AppContext"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Exo2-Regular': require('../assets/fonts/Exo2-Regular.ttf'),
    'Exo2-Medium': require('../assets/fonts/Exo2-Medium.ttf'),
    'Exo2-Bold': require('../assets/fonts/Exo2-Bold.ttf'),
    'Exo2-Light': require('../assets/fonts/Exo2-Light.ttf'),
    'Exo2-Thin': require('../assets/fonts/Exo2-Thin.ttf'),
    'Exo2-ExtraLight': require('../assets/fonts/Exo2-ExtraLight.ttf'),
    'Exo2-SemiBold': require('../assets/fonts/Exo2-SemiBold.ttf'),
    'Exo2-ExtraBold': require('../assets/fonts/Exo2-ExtraBold.ttf'),
    'Exo2-Black': require('../assets/fonts/Exo2-Black.ttf'),
    'Exo2-Italic': require('../assets/fonts/Exo2-Italic.ttf'),
    'Exo2-MediumItalic': require('../assets/fonts/Exo2-MediumItalic.ttf'),
    'Exo2-BoldItalic': require('../assets/fonts/Exo2-BoldItalic.ttf'),
    'Exo2-LightItalic': require('../assets/fonts/Exo2-LightItalic.ttf'),
    'Exo2-ThinItalic': require('../assets/fonts/Exo2-ThinItalic.ttf'),
    'Exo2-ExtraLightItalic': require('../assets/fonts/Exo2-ExtraLightItalic.ttf'),
    'Exo2-SemiBoldItalic': require('../assets/fonts/Exo2-SemiBoldItalic.ttf'),
    'Exo2-ExtraBoldItalic': require('../assets/fonts/Exo2-ExtraBoldItalic.ttf'),
    'Exo2-BlackItalic': require('../assets/fonts/Exo2-BlackItalic.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#0f0f1a",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="periodic-table" options={{ headerShown: false }} />
      </Stack>
    </AppProvider>
  )
}
