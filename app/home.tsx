"use client"
import MiniPlayer from "@/components/MiniPlayer"
import { Ionicons } from "@expo/vector-icons"
import { ResizeMode, Video } from "expo-av"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Fonts } from "../constants/Fonts"

type Section = "home" | "library" | "discover" | "profile"

interface Book {
  id: string
  title: string
  cover: any
}

const BOOKS: Book[] = [
  { id: "1", title: "Cover Case", cover: require("../assets/images/cover case.jpg") },
  { id: "2", title: "Chalachitra Sidhandangal", cover: require("../assets/images/cover  chalachitra sidhandangal-3.jpg") },
  { id: "3", title: "Hasthalikhitham", cover: require("../assets/images/Hasthalikhitham.jpg") },
  { id: "4", title: "Kumaranasan Vijnankosham", cover: require("../assets/images/Kumaranasan Vijnankosham_FINAL COVER.jpg") },
  { id: "5", title: "Nirmithabudhi", cover: require("../assets/images/Nirmithabudhi.jpg") },
  { id: "6", title: "Parinamam", cover: require("../assets/images/parinamam.jpg") },
  { id: "7", title: "Samoohasasthram", cover: require("../assets/images/Samoohasasthram.jpg") },
  { id: "8", title: "Vaikom", cover: require("../assets/images/vaikom cover-1.jpg") },
  { id: "9", title: "Jyothisastram", cover: require("../assets/images/jyothisastram.jpg") },
]

export default function AudioBookApp() {
  const [activeSection, setActiveSection] = useState<Section>("home")
  const router = useRouter()
  
  const SCREEN_WIDTH = Dimensions.get("window").width
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<ScrollView>(null)
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const previewVideoRef = useRef<Video>(null)

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % BOOKS.length
      setCurrentSlide(nextSlide)
      sliderRef.current?.scrollTo({ x: nextSlide * SCREEN_WIDTH, animated: true })
    }, 4000) // change every 4 seconds

    return () => clearInterval(interval)
  }, [currentSlide, SCREEN_WIDTH])

  // Handle book navigation - Cover Case goes to periodic-table, others go to book-details
  const handleBookPress = (bookId: string) => {
    if (bookId === "1") {
      // Cover Case - navigate to periodic-table
      router.push("/periodic-table")
    } else {
      // Other books - navigate to book-details
      // router.push({
      //   pathname: "/book-details/[id]",
      //   params: { id: bookId }
      // })
    }
  }


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
              <Text style={styles.heroTitle}>ഓഡിയോ ബുക്ക്</Text>
              <Text style={styles.heroSubtitle}>അദ്ഭുതകരമായ ഓഡിയോ ഉള്ളടക്കം കണ്ടെത്തൂ</Text>
            </View>

            {/* QR Code Button */}
            {/* <TouchableOpacity style={styles.qrButton} onPress={() => router.push("/qr-code")}>
              <Ionicons name="qr-code" size={20} color="#fff" />
              <Text style={styles.qrButtonText}>Share via QR</Text>
            </TouchableOpacity> */}
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
                // onPress={() => handleBookPress(book.id)}
              >
                <View style={styles.imageContainer}>
                  <Image source={book.cover} style={styles.sliderImage} contentFit="contain" />
                  {/* {book.id !== "1" && (
                    <View style={styles.ribbonContainer}>
                      <View style={styles.ribbonShadow} />
                      <View style={styles.ribbonBody}>
                        <View style={styles.ribbonTop} />
                        <View style={styles.ribbonBottom} />
                        <Text style={styles.ribbonText}>COMING SOON</Text>
                        <View style={styles.ribbonTail} />
                      </View>
                    </View>
                  )} */}
                </View>
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
          {/* Video Card - sarva_2.mp4 */}
          <TouchableOpacity 
            style={styles.featuredCardTeal}
            onPress={() => setShowVideoPreview(true)}
          >
            <View style={styles.cardIconTop}>
              <View style={styles.featuredVideoContainer}>
                <Video
                  source={require("../assets/images/sarva_2.mp4")}
                  style={styles.featuredVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                  useNativeControls={false}
                />
                <View style={styles.videoPlayOverlay}>
                  <Ionicons name="play-circle" size={48} color="#fff" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {BOOKS.map((book) => (
            <TouchableOpacity 
              key={book.id}
              style={styles.featuredCardTeal} 
              onPress={() => handleBookPress(book.id)}
            >
              <View style={styles.cardIconTop}>
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={book.cover}
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                  />
                  {book.id !== "1" && (
                    <View style={styles.ribbonContainerSmall}>
                      <View style={styles.ribbonShadowSmall} />
                      <View style={styles.ribbonBodySmall}>
                        <View style={styles.ribbonTopSmall} />
                        <View style={styles.ribbonBottomSmall} />
                        <Text style={styles.ribbonTextSmall}>COMING SOON</Text>
                        <View style={styles.ribbonTailSmall} />
                      </View>
                    </View>
                  )}
                </View>
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
      
      {/* Video Preview Modal */}
      <Modal
        visible={showVideoPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowVideoPreview(false)
          previewVideoRef.current?.pauseAsync()
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowVideoPreview(false)
                previewVideoRef.current?.pauseAsync()
              }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <Video
              ref={previewVideoRef}
              source={require("../assets/images/sarva_2.mp4")}
              style={styles.previewVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={false}
              useNativeControls={true}
            />
          </View>
        </View>
      </Modal>

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
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
  },
  sliderImage: {
    width: Dimensions.get("window").width,
    height: 240,
  },
  ribbonContainer: {
    position: "absolute",
    top: 10,
    right: -20,
    width: 200,
    height: 40,
    transform: [{ rotate: "45deg" }],
    zIndex: 10,
    overflow: "visible",
  },
  ribbonShadow: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 200,
    height: 45,
    backgroundColor: "rgba(128, 128, 128, 0.4)",
    borderRadius: 1,
  },
  ribbonBody: {
    position: "relative",
    width: 200,
    height: 45,
    backgroundColor: "#DC143C",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  ribbonTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "#FF1744",
  },
  ribbonBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#B71C1C",
  },
  ribbonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    zIndex: 3,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ribbonTail: {
    position: "absolute",
    right: -15,
    top: "50%",
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: "transparent",
    borderBottomWidth: 10,
    borderBottomColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "#B71C1C",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  featuredImageContainer: {
    position: "relative",
    width: 220,
    height: 220,
  },
  featuredVideoContainer: {
    position: "relative",
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  featuredVideo: {
    width: "100%",
    height: "100%",
  },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  ribbonContainerSmall: {
    position: "absolute",
    top: 25,
    left: 0,
    width: 100,
    height: 25,
    transform: [{ rotate: "-30deg" }],
    zIndex: 10,
    overflow: "visible",
  },
  ribbonShadowSmall: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 60,
    height: 28,
    // backgroundColor: "rgba(128, 128, 128, 0.4)",
    borderRadius: 1,
  },
  ribbonBodySmall: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 110,
    height: 25,
    backgroundColor: "#DC143C",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  ribbonTopSmall: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#FF1744",
  },
  ribbonBottomSmall: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#B71C1C",
  },
  ribbonTextSmall: {
    color: "#fff",
    fontSize: 9,
    fontFamily: Fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 2,
    zIndex: 3,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ribbonTailSmall: {
    position: "absolute",
    right: -12,
    top: "40%",
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    borderRightWidth: 12,
    borderRightColor: "#B71C1C",
    transform: [{ translateY: -8 }],
    zIndex: 1,
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
    fontFamily: Fonts.semiBold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 600,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  previewVideo: {
    width: "100%",
    height: "100%",
  },
})
