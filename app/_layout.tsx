import * as Device from 'expo-device'
import { useFonts } from 'expo-font'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from 'react'
import { Alert, Platform, Text, View } from 'react-native'
import { AppProvider } from "../context/AppContext"
import { BookProvider } from "../context/BookContext"

import * as FileSystem from 'expo-file-system'
import JailMonkey from 'jail-monkey'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Security Constants
const ROOT_PATHS = [
  '/system/app/Superuser.apk',
  '/sbin/su',
  '/system/bin/su',
  '/system/xbin/su',
  '/data/local/xbin/su',
  '/data/local/bin/su',
  '/system/sd/xbin/su',
  '/system/bin/failsafe/su',
  '/data/local/su',
  '/su/bin/su',
  '/system/bin/magisk',
  '/data/local/tmp/magisk',
]

const INSTRUMENTATION_PATHS = [
  '/data/local/tmp/re.frida.server',
  '/data/local/tmp/frida-server',
  '/data/local/tmp/frida',
]

export const linking = {
  prefixes: ['audiobook://', 'https://audiobook.app'],
  config: {
    screens: {
      index: '',
      home: 'home',
      'periodic-table': 'periodic-table',
      'qr-code': 'qr-code',
      'book-details': {
        path: 'book-details/:id',
      },
    },
  },
}


export default function RootLayout() {
  const [securityViolated, setSecurityViolated] = useState(false)
  const [violationType, setViolationType] = useState('')
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
    const checkSecurity = async () => {
      // 1. Skip security checks in development mode (Expo Go / npm start)
      if (__DEV__) return;

      // 2. Skip security checks if running on an emulator to allow testing APKs
      const isDevice = Device.isDevice;
      if (!isDevice) return;

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // 1. JailMonkey Native Security Checks
        if (JailMonkey.isJailBroken()) {
          handleViolation('Device integrity compromise detected (Root/Jailbreak).')
          return
        }

        if (JailMonkey.hookDetected()) {
          handleViolation('Dynamic instrumentation (Frida/Xposed) detected.')
          return
        }

        // 2. Experimental Device Check (Fallback)
        const isRooted = await Device.isRootedExperimentalAsync()
        if (isRooted) {
          handleViolation('Device integrity compromise detected (Root/Jailbreak).')
          return
        }

        // 2. Path-based Root Detection
        for (const path of ROOT_PATHS) {
          try {
            const info = await FileSystem.getInfoAsync(path)
            if (info.exists) {
              handleViolation(`Unauthorized binary detected: ${path}`)
              return
            }
          } catch (e) {
            // Ignore errors for inaccessible paths
          }
        }

        // 3. Instrumentation Detection (Frida/Server)
        for (const path of INSTRUMENTATION_PATHS) {
          try {
            const info = await FileSystem.getInfoAsync(path)
            if (info.exists) {
              handleViolation(`Instrumentation server detected: ${path}`)
              return
            }
          } catch (e) {
            // Ignore errors
          }
        }

        // 4. Debugging check for Production builds
        if (!__DEV__) {
          const isDevice = Device.isDevice
          if (!isDevice) {
            // Optional: Block emulators in production if required
            // handleViolation('Application cannot run on an emulator in production.')
          }
        }
      }
    }

    const handleViolation = (reason: string) => {
      console.warn('Security Violation:', reason)
      setViolationType(reason)
      setSecurityViolated(true)
      Alert.alert(
        "Security Violation",
        "The application cannot run on this device due to a security policy violation (Root/Instrumentation detected).",
        [{ text: "OK", onPress: () => { } }]
      )
    }

    if (fontsLoaded) {
      checkSecurity()
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  if (securityViolated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#ff4444', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          Security Violation
        </Text>
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 40 }}>
          The application cannot run on this device due to a security policy violation (Root/Instrumentation detected).
        </Text>
        {__DEV__ && (
          <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
            Violation Detail: {violationType}
          </Text>
        )}
      </View>
    )
  }

  return (
    <AppProvider>
      <BookProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#0f0f1a",
            },
          }}
        >
          <Stack.Screen name="intro" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="periodic-table" options={{ headerShown: false }} />
          <Stack.Screen name="qr-code" options={{ headerShown: false }} />
          <Stack.Screen name="book-details" options={{ headerShown: false }} />
        </Stack>
      </BookProvider>
    </AppProvider>
  )
}
