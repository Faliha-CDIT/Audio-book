"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MiniPlayer from "../components/MiniPlayer"
import PeriodicTableApp from "../components/PeriodicTableApp"
import { Fonts } from "../constants/Fonts"
import { AppProvider } from "../context/AppContext"

type Section = "home" | "periodic-table" | "library" | "discover" | "profile"

export default function AudioBookApp() {
  const [activeSection, setActiveSection] = useState<Section>("home")

  const renderHomeSection = () => (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Welcome to AudioBook Hub</Text>
        <Text style={styles.heroSubtitle}>Discover amazing audio content</Text>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Content</Text>

        <TouchableOpacity style={styles.featuredCard} onPress={() => setActiveSection("periodic-table")}>
          <View style={styles.cardIcon}>
            <Ionicons name="flask" size={32} color="#3498db" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Periodic Table Podcast</Text>
            <Text style={styles.cardDescription}>
              Explore the fascinating world of chemistry through interactive audio stories about each element
            </Text>
            <View style={styles.cardStats}>
              <Text style={styles.statText}>118 Episodes</Text>
              <Text style={styles.statText}>• Science</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featuredCard}>
          <View style={styles.cardIcon}>
            <Ionicons name="book" size={32} color="#e74c3c" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Classic Literature</Text>
            <Text style={styles.cardDescription}>Timeless stories narrated by professional voice actors</Text>
            <View style={styles.cardStats}>
              <Text style={styles.statText}>50+ Books</Text>
              <Text style={styles.statText}>• Literature</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featuredCard}>
          <View style={styles.cardIcon}>
            <Ionicons name="school" size={32} color="#f39c12" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Educational Series</Text>
            <Text style={styles.cardDescription}>Learn new skills and expand your knowledge</Text>
            <View style={styles.cardStats}>
              <Text style={styles.statText}>25+ Courses</Text>
              <Text style={styles.statText}>• Education</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Continue Listening</Text>
        <View style={styles.recentItem}>
          <View style={styles.recentIcon}>
            <Ionicons name="play-circle" size={24} color="#3498db" />
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentTitle}>Hydrogen - The Beginning</Text>
            <Text style={styles.recentSubtitle}>Periodic Table Podcast</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "35%" }]} />
            </View>
          </View>
        </View>
      </View> */}
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
      case "periodic-table":
        return (
          <AppProvider>
            <PeriodicTableApp onBack={() => setActiveSection("home")} />
          </AppProvider>
        )
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
      {/* Header */}
      <View style={styles.header}>
        {activeSection === "periodic-table" ? (
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection("home")}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>AudioBook Hub</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.headerTitle}>AudioBook Hub</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Mini Player */}
      <MiniPlayer />

      {/* Bottom Navigation */}
      {activeSection !== "periodic-table" && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, activeSection === "home" && styles.activeNavItem]}
            onPress={() => setActiveSection("home")}
          >
            <Ionicons name="home" size={24} color={activeSection === "home" ? "#3498db" : "#ccc"} />
            <Text style={[styles.navText, activeSection === "home" && styles.activeNavText]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeSection === "library" && styles.activeNavItem]}
            onPress={() => setActiveSection("library")}
          >
            <Ionicons name="library" size={24} color={activeSection === "library" ? "#3498db" : "#ccc"} />
            <Text style={[styles.navText, activeSection === "library" && styles.activeNavText]}>Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeSection === "discover" && styles.activeNavItem]}
            onPress={() => setActiveSection("discover")}
          >
            <Ionicons name="compass" size={24} color={activeSection === "discover" ? "#3498db" : "#ccc"} />
            <Text style={[styles.navText, activeSection === "discover" && styles.activeNavText]}>Discover</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeSection === "profile" && styles.activeNavItem]}
            onPress={() => setActiveSection("profile")}
          >
            <Ionicons name="person" size={24} color={activeSection === "profile" ? "#3498db" : "#ccc"} />
            <Text style={[styles.navText, activeSection === "profile" && styles.activeNavText]}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#16213e",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: "#ccc",
    textAlign: "center",
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
  featuredCard: {
    flexDirection: "row",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#ccc",
    lineHeight: 20,
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: "row",
  },
  statText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#888",
  },
  recentSection: {
    padding: 16,
  },
  recentItem: {
    flexDirection: "row",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  recentIcon: {
    marginRight: 16,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#ccc",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#2c3e50",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
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
    color: "#3498db",
  },
})
