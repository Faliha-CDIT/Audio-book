import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useRouter } from "expo-router"
import { useRef } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import QRCode from "react-native-qrcode-svg"

export default function QRCodeScreen() {
  const router = useRouter()
  const qrRef = useRef<any>(null)
  const { width } = useWindowDimensions()

  // Get app link dynamically from app.json
  const scheme = Constants.expoConfig?.scheme || "audiobook"
  const appLink = `${scheme}://home`
  const qrSize = Math.min(width - 80, 280)

  const handleSaveQR = async () => {
    try {
      if (qrRef.current) {
        qrRef.current.toDataURL((data: string) => {
          // For mobile, you could integrate with sharing or save to camera roll
          // For now, just show a success message
          alert("QR code is ready to share!")
        })
      }
    } catch (error) {
      console.error("Error preparing QR code:", error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share App via QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Scan this QR code to open the app</Text>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBackground}>
              <QRCode
                ref={qrRef}
                value={appLink}
                size={qrSize}
                color="#000"
                backgroundColor="#fff"
                quietZone={10}
              />
            </View>
          </View>

          {/* App Link Display */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>App Link:</Text>
            <Text style={styles.linkText}>{appLink}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Ask others to scan this QR code</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>They'll be automatically taken to the app</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Share on social media or print it out</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleSaveQR}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.buttonText}>Share QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButtonStyle} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#3498db" />
              <Text style={[styles.buttonText, { color: "#3498db" }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#16213e",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    textAlign: "center",
  },
  qrContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  qrBackground: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  linkContainer: {
    width: "100%",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  linkLabel: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#3498db",
    fontFamily: "monospace",
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3498db",
    marginRight: 12,
    minWidth: 24,
  },
  instructionText: {
    fontSize: 14,
    color: "#ccc",
    flex: 1,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  backButtonStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
