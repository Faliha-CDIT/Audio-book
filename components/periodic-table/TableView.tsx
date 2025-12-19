"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { type Element, useAppContext } from "../../context/AppContext"
import MiniPlayer from "../MiniPlayer"
import ScrollIndicator from "../ScrollIndicator"

const { width, height } = Dimensions.get("window")
const isLandscape = width > height
const windowWidth = Dimensions.get("window").width

const ELEMENT_SIZE = isLandscape ? Math.min(windowWidth / 14, 40) : Math.min(windowWidth / 8, 60)
const GAP_SIZE = isLandscape ? 1.5 : 2.8

export default function TableView() {
  const { favorites, toggleFavorite, currentElement, playElement, elements, isLoading, searchElements } =
    useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orientation, setOrientation] = useState(isLandscape)

  // For scroll indicators
  const legendScrollViewRef = useRef<ScrollView>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [contentWidth, setContentWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  // Animated values for arrow opacity
  const leftArrowOpacity = useRef(new Animated.Value(0)).current
  const rightArrowOpacity = useRef(new Animated.Value(1)).current

  // For zooming and panning
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      const newIsLandscape = window.width > window.height
      setOrientation(newIsLandscape)
    })

    return () => subscription?.remove()
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateX.setOffset(panPosition.x)
        translateY.setOffset(panPosition.y)
        translateX.setValue(0)
        translateY.setValue(0)
      },
      onPanResponderMove: Animated.event([null, { dx: translateX, dy: translateY }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        translateX.flattenOffset()
        translateY.flattenOffset()

        const updatePosition = () => {
          translateX.removeAllListeners()
          translateY.removeAllListeners()

          translateX.addListener(({ value }) => {
            setPanPosition((prev) => ({ ...prev, x: value }))
          })

          translateY.addListener(({ value }) => {
            setPanPosition((prev) => ({ ...prev, y: value }))
          })
        }

        updatePosition()
      },
    }),
  ).current

  useEffect(() => {
    const setupListeners = () => {
      translateX.addListener(({ value }) => {
        setPanPosition((prev) => ({ ...prev, x: value }))
      })

      translateY.addListener(({ value }) => {
        setPanPosition((prev) => ({ ...prev, y: value }))
      })
    }

    setupListeners()

    return () => {
      translateX.removeAllListeners()
      translateY.removeAllListeners()
    }
  }, [translateX, translateY])

  const maxRow = Math.max(...elements.map((e) => e.ypos))
  const maxCol = Math.max(...elements.map((e) => e.xpos))

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const filteredElements = searchQuery
    ? searchElements(searchQuery).filter((element) => (selectedCategory ? element.category === selectedCategory : true))
    : selectedCategory
      ? elements.filter((element) => element.category === selectedCategory)
      : elements

  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.x
    const maxScrollPosition = contentWidth - containerWidth

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

  const handleContentSizeChange = (width: any, height: any) => {
    setContentWidth(width)
  }

  const handleLegendLayout = (event: any) => {
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

  const renderElement = (element: Element) => {
    if (!element) return null

    const isFavorite = favorites.includes(element.number)
    const isPlaying = currentElement?.number === element.number

    return (
      <TouchableOpacity
        key={element.number}
        style={[
          styles.element,
          {
            backgroundColor: getElementColor(element.category, isFavorite),
            borderWidth: isPlaying ? 2 : 0,
            borderColor: isPlaying ? "#fff" : "transparent",
          },
        ]}
        onPress={() => playElement(element)}
        onLongPress={() => toggleFavorite(element.number)}
      >
        <Text style={[styles.atomicNumber, { fontSize: ELEMENT_SIZE * 0.2 }]}>{element.number}</Text>
        <Text style={[styles.symbol, { fontSize: ELEMENT_SIZE * 0.4 }]}>{element.symbol}</Text>
        <Text style={[styles.elementName, { fontSize: ELEMENT_SIZE * 0.18 }]} numberOfLines={1}>
          {element.name.length > (orientation ? 3 : 5)
            ? element.name.substring(0, orientation ? 2 : 4) + "."
            : element.name}
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
      {/* Header */}
      <View style={[styles.header, orientation && styles.headerLandscape]}>
        <TouchableOpacity style={styles.searchButton} onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name={showSearch ? "close" : "search"} size={orientation ? 18 : 24} color="#fff" />
        </TouchableOpacity>

        {!orientation && <Text style={styles.headerTitle}>Periodic Table</Text>}

        <TouchableOpacity
          style={styles.randomButton}
          onPress={() => {
            const randomElement = elements[Math.floor(Math.random() * elements.length)]
            playElement(randomElement)
          }}
        >
          <Ionicons name="shuffle" size={orientation ? 18 : 24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={[styles.searchContainer, orientation && styles.searchContainerLandscape]}>
          <TextInput
            style={[styles.searchInput, orientation && styles.searchInputLandscape]}
            placeholder="Search elements..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery && (
            <ScrollView style={[styles.searchResults, orientation && styles.searchResultsLandscape]}>
              {filteredElements.map((element) => (
                <TouchableOpacity
                  key={element.number}
                  style={[styles.searchResultItem, orientation && styles.searchResultItemLandscape]}
                  onPress={() => {
                    playElement(element)
                    setSearchQuery("")
                    setShowSearch(false)
                  }}
                >
                  <View
                    style={[
                      styles.searchResultSymbol,
                      orientation && styles.searchResultSymbolLandscape,
                      { backgroundColor: getElementColor(element.category, false) },
                    ]}
                  >
                    <Text
                      style={[styles.searchResultSymbolText, orientation && styles.searchResultSymbolTextLandscape]}
                    >
                      {element.symbol}
                    </Text>
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={[styles.searchResultName, orientation && styles.searchResultNameLandscape]}>
                      {element.name}
                    </Text>
                    <Text style={[styles.searchResultNumber, orientation && styles.searchResultNumberLandscape]}>
                      #{element.number}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {selectedCategory && (
        <View style={[styles.filterBanner, orientation && styles.filterBannerLandscape]}>
          <Text style={[styles.filterText, orientation && styles.filterTextLandscape]}>
            {orientation ? selectedCategory : `Showing ${selectedCategory} elements`}
          </Text>
          <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Table */}
      <View style={[styles.tableWrapper, orientation && styles.tableWrapperLandscape]}>
        <ScrollView
          style={styles.scrollView}
          horizontal={true}
          contentContainerStyle={[styles.tableContainer, orientation && styles.tableContainerLandscape]}
          maximumZoomScale={3}
          minimumZoomScale={1.0}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.periodicTable}
            showsVerticalScrollIndicator={true}
          >
            <Animated.View
              style={[
                styles.periodicTable,
                {
                  width: maxCol * (ELEMENT_SIZE + GAP_SIZE),
                  height: maxRow * (ELEMENT_SIZE + GAP_SIZE) + (orientation ? 10 : 10),
                },
              ]}
              {...panResponder.panHandlers}
            >
              {elements.map((element) =>
                selectedCategory ? (
                  element.category === selectedCategory && (
                    <View
                      key={element.number}
                      style={[
                        styles.elementWrapper,
                        {
                          left: (element.xpos - 1) * (ELEMENT_SIZE + GAP_SIZE),
                          top: (element.ypos - 1) * (ELEMENT_SIZE + GAP_SIZE),
                          width: ELEMENT_SIZE,
                          height: ELEMENT_SIZE,
                        },
                      ]}
                    >
                      {renderElement(element)}
                    </View>
                  )
                ) : (
                  <View
                    key={element.number}
                    style={[
                      styles.elementWrapper,
                      {
                        left: (element.xpos - 1) * (ELEMENT_SIZE + GAP_SIZE),
                        top: (element.ypos - 1) * (ELEMENT_SIZE + GAP_SIZE),
                        width: ELEMENT_SIZE,
                        height: ELEMENT_SIZE,
                      },
                    ]}
                  >
                    {renderElement(element)}
                  </View>
                ),
              )}
            </Animated.View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={[styles.legend, orientation && styles.legendLandscape]} onLayout={handleLegendLayout}>
        {!orientation && (
          <View style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Element Categories</Text>
            {selectedCategory && (
              <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.scrollableContainer}>
          <ScrollView
            ref={legendScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
          >
            <View style={styles.legendItems}>
              {[
                { key: "alkali metal", color: "#ff6b6b", label: orientation ? "Alkali" : "Alkali Metals" },
                { key: "alkaline earth metal", color: "#ff9e7d", label: orientation ? "Alkaline" : "Alkaline Earth" },
                { key: "transition metal", color: "#ffc75f", label: orientation ? "Trans." : "Transition" },
                { key: "nonmetal", color: "#70a1ff", label: orientation ? "Non-M" : "Nonmetals" },
                { key: "noble gas", color: "#7f47ed", label: orientation ? "Noble" : "Noble Gases" },
                { key: "metalloid", color: "#7bed9f", label: orientation ? "Metal." : "Metalloids" },
                { key: "lanthanide", color: "#ff79c6", label: orientation ? "Lanth." : "Lanthanides" },
                { key: "actinide", color: "#ff5e57", label: orientation ? "Actin." : "Actinides" },
              ].map(({ key, color, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.legendItem, selectedCategory === key && styles.selectedLegendItem]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <View
                    style={[styles.legendColor, orientation && styles.legendColorLandscape, { backgroundColor: color }]}
                  />
                  <Text style={[styles.legendText, orientation && styles.legendTextLandscape]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollIndicator
            showLeftArrow={showLeftArrow}
            showRightArrow={showRightArrow}
            leftOpacity={leftArrowOpacity}
            rightOpacity={rightArrowOpacity}
          />
        </View>
      </View>

      {currentElement && (
        <View style={orientation && styles.miniPlayerLandscape}>
          <MiniPlayer />
        </View>
      )}
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
  headerLandscape: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  searchButton: {
    padding: 6,
  },
  randomButton: {
    padding: 6,
  },
  searchContainer: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContainerLandscape: {
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#16213e",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInputLandscape: {
    height: 32,
    fontSize: 14,
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 8,
    backgroundColor: "#16213e",
    borderRadius: 8,
  },
  searchResultsLandscape: {
    maxHeight: 150,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  searchResultItemLandscape: {
    padding: 8,
  },
  searchResultSymbol: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultSymbolLandscape: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  searchResultSymbolText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  searchResultSymbolTextLandscape: {
    fontSize: 14,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    color: "#fff",
  },
  searchResultNameLandscape: {
    fontSize: 14,
  },
  searchResultNumber: {
    fontSize: 12,
    color: "#ccc",
  },
  searchResultNumberLandscape: {
    fontSize: 10,
  },
  filterBanner: {
    backgroundColor: "#16213e",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterBannerLandscape: {
    padding: 4,
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
    textTransform: "capitalize",
  },
  filterTextLandscape: {
    fontSize: 12,
  },
  tableWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0f0f1a",
  },
  tableWrapperLandscape: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tableContainer: {
    padding: 4,
    paddingTop: 15,
  },
  tableContainerLandscape: {
    padding: 2,
    paddingTop: 5,
    paddingLeft: 20,
  },
  periodicTable: {
    position: "relative",
    minWidth: "100%",
    minHeight: "100%",
  },
  elementWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  element: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  atomicNumber: {
    position: "absolute",
    top: 1,
    left: 1,
    color: "rgba(0, 0, 0, 0.7)",
  },
  symbol: {
    fontWeight: "bold",
    color: "#000",
  },
  elementName: {
    color: "rgba(0, 0, 0, 0.7)",
    position: "absolute",
    bottom: 1,
    textAlign: "center",
  },
  legend: {
    padding: 8,
    backgroundColor: "#1a1a2e",
  },
  legendLandscape: {
    padding: 3,
    minHeight: 28,
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
  legendColorLandscape: {
    width: 8,
    height: 8,
    marginRight: 2,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
  },
  legendTextLandscape: {
    fontSize: 9,
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
  selectedLegendItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    padding: 2,
  },
  scrollableContainer: {
    position: "relative",
  },
  miniPlayerLandscape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1000,
  },
})
