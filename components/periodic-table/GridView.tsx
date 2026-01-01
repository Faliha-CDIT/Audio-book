"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRef, useState } from "react"
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native"
import type { Element } from "../../context/AppContext"
import { useAppContext } from "../../context/AppContext"
import MiniPlayer from "../MiniPlayer"
import ScrollIndicator from "../ScrollIndicator"

export default function GridView() {
  const { favorites, toggleFavorite, currentElement, playElement, elements, isLoading, searchElements } =
    useAppContext()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  // For scroll indicators
  const categoryScrollViewRef = useRef<ScrollView>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [contentWidth, setContentWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Animated values for arrow opacity
  const leftArrowOpacity = useRef(new Animated.Value(0)).current
  const rightArrowOpacity = useRef(new Animated.Value(1)).current

  // Determine number of columns based on screen orientation
  const numColumns = isLandscape ? (width > 1024 ? 6 : 5) : 3

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const filteredElements = searchQuery
    ? searchElements(searchQuery).filter((element) => (selectedCategory ? element.category === selectedCategory : true))
    : elements.filter((element) => (selectedCategory ? element.category === selectedCategory : true))

  // Update arrow visibility based on scroll position
  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.x

    // Calculate if we should show left/right arrows
    const maxScrollPosition = contentWidth - containerWidth

    // Only update if needed to avoid unnecessary re-renders
    if (position <= 0 && showLeftArrow) {
      setShowLeftArrow(false)
      Animated.timing(leftArrowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    } else if (position > 0 && !showLeftArrow) {
      setShowLeftArrow(true)
      Animated.timing(leftArrowOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }

    if (position >= maxScrollPosition - 5 && showRightArrow) {
      setShowRightArrow(false)
      Animated.timing(rightArrowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    } else if (position < maxScrollPosition - 5 && !showRightArrow) {
      setShowRightArrow(true)
      Animated.timing(rightArrowOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }

  // Handle content size change
  const handleContentSizeChange = (width: any, height: any) => {
    setContentWidth(width)
  }

  // Handle layout change to get container width
  const handleCategoryLayout = (event: any) => {
    setContainerWidth(event.nativeEvent.layout.width)
  }

  const getElementColor = (category: string, isFavorite: boolean): string => {
    if (isFavorite) return "#ffd700"

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

  const renderGridItem = ({ item }: { item: Element }) => {
    const isFavorite = favorites.includes(item.number)
    const isPlaying = currentElement?.number === item.number

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          {
            backgroundColor: getElementColor(item.category, isFavorite),
            borderWidth: isPlaying ? 2 : 0,
            borderColor: isPlaying ? "#fff" : "transparent",
          },
        ]}
        onPress={() => playElement(item)}
        onLongPress={() => toggleFavorite(item.number)}
      >
        <Text style={styles.atomicNumber}>{item.number}</Text>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.elementName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading elements...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton} onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name={showSearch ? "close" : "search"} size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Grid View</Text>

        <TouchableOpacity
          style={styles.randomButton}
          onPress={() => {
            const randomElement = elements[Math.floor(Math.random() * elements.length)]
            playElement(randomElement)
          }}
        >
          <Ionicons name="shuffle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search elements..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      )}

      {selectedCategory && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterText}>Showing {selectedCategory} elements</Text>
          <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredElements}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.number.toString()}
        numColumns={numColumns}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: isLandscape ? 40 : 80 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No elements found</Text>
          </View>
        }
      />

      <View style={styles.legend} onLayout={handleCategoryLayout}>
        <View style={styles.legendHeader}>
          <Text style={styles.legendTitle}>Element Categories</Text>
          {selectedCategory && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.scrollableContainer}>
          <ScrollView
            ref={categoryScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
          >
            <View style={styles.legendItems}>
              {[
                { key: "alkali metal", color: "#ff6b6b", label: "Alkali Metals" },
                { key: "alkaline earth metal", color: "#ff9e7d", label: "Alkaline Earth" },
                { key: "transition metal", color: "#ffc75f", label: "Transition" },
                { key: "nonmetal", color: "#70a1ff", label: "Nonmetals" },
                { key: "noble gas", color: "#7f47ed", label: "Noble Gases" },
                { key: "metalloid", color: "#7bed9f", label: "Metalloids" },
                { key: "lanthanide", color: "#ff79c6", label: "Lanthanides" },
                { key: "actinide", color: "#ff5e57", label: "Actinides" },
              ].map(({ key, color, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.legendItem, selectedCategory === key && styles.selectedLegendItem]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <View style={[styles.legendColor, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Scroll indicators */}
          <ScrollIndicator
            showLeftArrow={showLeftArrow}
            showRightArrow={showRightArrow}
            leftOpacity={leftArrowOpacity}
            rightOpacity={rightArrowOpacity}
          />
        </View>
      </View>

      {currentElement && <MiniPlayer />}
    </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a2e",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  searchButton: {
    padding: 8,
  },
  randomButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#16213e",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  filterBanner: {
    backgroundColor: "#16213e",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
    textTransform: "capitalize",
  },
  clearFilterButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clearFilterText: {
    color: "#fff",
    fontSize: 12,
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 80, // Space for mini player
  },
  gridItem: {
    flex: 1,
    margin: 4,
    height: 100,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 80,
  },
  atomicNumber: {
    position: "absolute",
    top: 4,
    left: 4,
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.7)",
  },
  symbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  elementName: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.7)",
    textAlign: "center",
    marginTop: 4,
  },
  legend: {
    padding: 8,
    backgroundColor: "#1a1a2e",
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  legendTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scrollableContainer: {
    position: "relative",
  },
  legendItems: {
    flexDirection: "row",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    padding: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
  },
  selectedLegendItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
})
