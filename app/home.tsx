"use client"
import MiniPlayer from "@/components/MiniPlayer"
import { useAppContext } from "@/context/AppContext"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { usePathname, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Fonts } from "../constants/Fonts"

type Section = "home" | "library" | "discover" | "profile"

interface Book {
  id: string
  title: string
  cover: any
  route: string
}

const BOOKS: Book[] = [
  { id: "1", title: "Cover Case", cover: require("../assets/images/cover case.jpg"), route: "/book-details/1" },
  { id: "2", title: "Chalachitra Sidhandangal", cover: require("../assets/images/cover  chalachitra sidhandangal-3.jpg"), route: "/book-details/2" },
  { id: "3", title: "Hasthalikhitham", cover: require("../assets/images/Hasthalikhitham.jpg"), route: "/book-details/3" },
  { id: "4", title: "Kumaranasan Vijnankosham", cover: require("../assets/images/Kumaranasan Vijnankosham_FINAL COVER.jpg"), route: "/book-details/4" },
  { id: "5", title: "Nirmithabudhi", cover: require("../assets/images/Nirmithabudhi.jpg"), route: "/book-details/5" },
  { id: "6", title: "Parinamam", cover: require("../assets/images/parinamam.jpg"), route: "/book-details/6" },
  { id: "7", title: "Samoohasasthram", cover: require("../assets/images/Samoohasasthram.jpg"), route: "/book-details/7" },
  { id: "8", title: "Vaikom", cover: require("../assets/images/vaikom cover-1.jpg"), route: "/book-details/8" },
  { id: "9", title: "Jyothisastram", cover: require("../assets/images/jyothisastram.jpg"), route: "/book-details/9" },
]

export default function AudioBookApp() {
  const [activeSection, setActiveSection] = useState<Section>("home")
  const router = useRouter()
  const pathname = usePathname()
  const { isPlaying, currentElement, sound } = useAppContext()
  
  const SCREEN_WIDTH = Dimensions.get("window").width
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<ScrollView>(null)

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % BOOKS.length
      setCurrentSlide(nextSlide)
      sliderRef.current?.scrollTo({ x: nextSlide * SCREEN_WIDTH, animated: true })
    }, 4000) // change every 4 seconds

    return () => clearInterval(interval)
  }, [currentSlide, BOOKS.length])


  const renderHomeSection = () => (
    <ScrollView style={styles.homeContainer}>
      <View style={[styles.heroSection, { paddingHorizontal: 0 }]}>
        <View style={[styles.heroContent, { paddingHorizontal: 24 }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroTextBlock}>
              {/* <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.heroTitle}>AudioBook Hub</Text>
              <Text style={styles.heroSubtitle}>Discover amazing audio content</Text> */}
              <Text style={styles.welcomeText}>സ്വാഗതം</Text>
              <Text style={styles.heroTitle}>ആഡിയോബുക്ക് ഹബ്</Text>
              <Text style={styles.heroSubtitle}>അദ്ഭുതകരമായ ഓഡിയോ ഉള്ളടക്കം കണ്ടെത്തൂ</Text>
            </View>

            {/* QR Code Button */}
            <TouchableOpacity style={styles.qrButton} onPress={() => router.push("/qr-code")}>
              <Ionicons name="qr-code" size={20} color="#fff" />
              <Text style={styles.qrButtonText}>Share via QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.sliderContainer}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
              setCurrentSlide(idx)
            }}
          >
            {bookCovers.map((src, i) => (
              <View key={i} style={{ width: SCREEN_WIDTH }}>
                <Image source={src} style={styles.sliderImage} contentFit="cover" />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {bookCovers.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentSlide && styles.activeDot]} />
            ))}
          </View>
        </View> */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
              setCurrentSlide(idx)
            }}
          >
            {BOOKS.map((book, i) => (
              <TouchableOpacity 
                key={i} 
                style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}
                onPress={() => router.push(book.route)}
              >
                <Image source={book.cover} style={styles.sliderImage} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {BOOKS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentSlide && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Content</Text>

        <View style={styles.cardGrid}>
          {BOOKS.map((book) => (
            <TouchableOpacity 
              key={book.id}
              style={styles.featuredCardTeal} 
              onPress={() => router.push(book.route)}
            >
              <View style={styles.cardIconTop}>
                <Image
                  source={book.cover}
                  style={{ width: 220, height: 220 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )

  const renderLibrarySection = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="library" size={64} color="#ccc" />
      <Text style={styles.placeholderTitle}>Your Library</Text>
      <Text style={styles.placeholderText}>Your saved audiobooks and podcasts will appear here</Text>
    </View>
  )

  const renderDiscoverSection = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="compass" size={64} color="#ccc" />
      <Text style={styles.placeholderTitle}>Discover</Text>
      <Text style={styles.placeholderText}>Explore new audiobooks and podcasts</Text>
    </View>
  )

  const renderProfileSection = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="person-circle" size={64} color="#ccc" />
      <Text style={styles.placeholderTitle}>Profile</Text>
      <Text style={styles.placeholderText}>Manage your account and preferences</Text>
    </View>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return renderHomeSection()
      case "library":
        return renderLibrarySection()
      case "discover":
        return renderDiscoverSection()
      case "profile":
        return renderProfileSection()
      default:
        return renderHomeSection()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
  {/* Mini Player */}
      <MiniPlayer />

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeSection === "home" && styles.activeNavItem]}
          onPress={() => setActiveSection("home")}
        >
          <Ionicons name="home" size={24} color={activeSection === "home" ? "#F500E2" : "#ccc"} />
          <Text style={[styles.navText, activeSection === "home" && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === "library" && styles.activeNavItem]}
          onPress={() => setActiveSection("library")}
        >
          <Ionicons name="library" size={24} color={activeSection === "library" ? "#F500E2" : "#ccc"} />
          <Text style={[styles.navText, activeSection === "library" && styles.activeNavText]}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === "discover" && styles.activeNavItem]}
          onPress={() => setActiveSection("discover")}
        >
          <Ionicons name="compass" size={24} color={activeSection === "discover" ? "#F500E2" : "#ccc"} />
          <Text style={[styles.navText, activeSection === "discover" && styles.activeNavText]}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === "profile" && styles.activeNavItem]}
          onPress={() => setActiveSection("profile")}
        >
          <Ionicons name="person" size={24} color={activeSection === "profile" ? "#F500E2" : "#ccc"} />
          <Text style={[styles.navText, activeSection === "profile" && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 24,
    alignItems: "stretch",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  heroTextBlock: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#ccc",
    opacity: 0.9,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: "#fff",
    textAlign: "left",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: "#ccc",
    textAlign: "left",
    opacity: 0.95,
  },
  sliderContainer: {
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 12,
  },
  videoPlayer: {
    width: Dimensions.get("window").width,
    height: 500,
    backgroundColor: "#000",
  },
  sliderImage: {
    width: Dimensions.get("window").width,
    height: 240,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#F500E2",
  },
  featuredSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginBottom: 16,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featuredCardTeal: {
    width: "48%",
    borderRadius: 12,
    // paddingVertical: 8,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cardIconTop: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#16213e",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    // Additional styling for active nav item if needed
  },
  navText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#ccc",
    marginTop: 4,
  },
  activeNavText: {
    color: "#F500E2",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
    alignSelf: "flex-start",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
})
