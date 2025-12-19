"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MiniPlayer from "../../components/MiniPlayer"
import { Fonts } from "../../constants/Fonts"
import type { Element } from "../../context/AppContext"
import { useAppContext } from "../../context/AppContext"

// Define allowed categories
type ElementCategory =
  | "alkali metal"
  | "alkaline earth metal"
  | "transition metal"
  | "post-transition metal"
  | "metalloid"
  | "nonmetal"
  | "noble gas"
  | "lanthanide"
  | "actinide"
  | "unknown"

export default function FavoritesScreen() {
  const router = useRouter()
  const { favorites, toggleFavorite, currentElement, playElement, elements, isLoading } = useAppContext()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading elements...</Text>
      </View>
    )
  }

  const favoriteElements = elements.filter((el) => favorites.includes(el.number))

  const getElementColor = (category: ElementCategory | string) => {
    switch (category) {
      case "alkali metal":
        return "#ff6b6b"
      case "alkaline earth metal":
        return "#ff9e7d"
      case "transition metal":
        return "#ffc75f"
      case "post-transition metal":
        return "#f9f871"
      case "metalloid":
        return "#7bed9f"
      case "nonmetal":
        return "#70a1ff"
      case "noble gas":
        return "#7f47ed"
      case "lanthanide":
        return "#ff79c6"
      case "actinide":
        return "#ff5e57"
      default:
        return "#c8d6e5"
    }
  }

  const renderFavoriteItem = ({ item }: { item: Element }) => {
    const isPlaying = currentElement?.number === item.number

    return (
      <TouchableOpacity
        style={[
          styles.favoriteItem,
          {
            borderWidth: isPlaying ? 2 : 0,
            borderColor: isPlaying ? "#3498db" : "transparent",
          },
        ]}
        onPress={() => playElement(item)}
        onLongPress={() => toggleFavorite(item.number)}
      >
        <View style={[styles.favoriteSymbolContainer, { backgroundColor: getElementColor(item.category) }]}>
          <Text style={styles.favoriteSymbol}>{item.symbol}</Text>
          <Text style={styles.favoriteNumber}>{item.number}</Text>
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          {item.malayalam_name && <Text style={styles.favoriteMalayalamName}>{item.malayalam_name}</Text>}
          <Text style={styles.favoriteCategory}>{item.category}</Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => toggleFavorite(item.number)}>
          <Ionicons name="close-circle" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>AudioBook Hub</Text>
        </TouchableOpacity> */}

        {favoriteElements.length > 0 && (
          <TouchableOpacity
            style={styles.playAllButton}
            onPress={() => {
              if (favoriteElements.length > 0) {
                playElement(favoriteElements[0])
              }
            }}
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      {favoriteElements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Add elements to favorites by clicking the ⭐</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteElements}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )} 

      <View style={styles.miniPlayerSpace}>{currentElement && <MiniPlayer />}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a2e",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
    marginLeft: 8,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playAllText: {
    color: "#fff",
    marginLeft: 4,
    fontFamily: Fonts.bold,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for mini player
  },
  favoriteItem: {
    flexDirection: "row",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  favoriteSymbolContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  favoriteSymbol: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#000",
  },
  favoriteNumber: {
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    top: 2,
    left: 2,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  favoriteMalayalamName: {
    fontSize: 12,
    color: "#ddd",
    marginTop: 2,
  },
  favoriteCategory: {
    fontSize: 12,
    color: "#ccc",
    textTransform: "capitalize",
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
  miniPlayerSpace: {
    height: 65,
    backgroundColor: "transparent",
  },
})
