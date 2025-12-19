"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Fonts } from "../constants/Fonts"
import ElementDetailView from "./periodic-table/ElementDetailView"
import FavoritesView from "./periodic-table/FavoritesView"
import GridView from "./periodic-table/GridView"
import TableView from "./periodic-table/TableView"

type TabType = "table" | "grid" | "favorites" | "detail"

interface PeriodicTableAppProps {
  onBack: () => void
}

export default function PeriodicTableApp({ onBack }: PeriodicTableAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("table")

  const renderContent = () => {
    switch (activeTab) {
      case "table":
        return <TableView />
      case "grid":
        return <GridView />
      case "favorites":
        return <FavoritesView />
      case "detail":
        return <ElementDetailView />
      default:
        return <TableView />
    }
  }

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TabButton
          icon="grid-outline"
          label="Table"
          active={activeTab === "table"}
          onPress={() => setActiveTab("table")}
        />
        <TabButton
          icon="apps-outline"
          label="Grid"
          active={activeTab === "grid"}
          onPress={() => setActiveTab("grid")}
        />
        <TabButton
          icon="star-outline"
          label="Favorites"
          active={activeTab === "favorites"}
          onPress={() => setActiveTab("favorites")}
        />
        <TabButton
          icon="information-circle-outline"
          label="Details"
          active={activeTab === "detail"}
          onPress={() => setActiveTab("detail")}
        />
      </View>
    </View>
  )
}

interface TabButtonProps {
  icon: string
  label: string
  active: boolean
  onPress: () => void
}

function TabButton({ icon, label, active, onPress }: TabButtonProps) {
  return (
    <View style={[styles.tabButton, active && styles.activeTab]}>
      <Ionicons name={icon as any} size={24} color={active ? "#3498db" : "#ccc"} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#16213e",
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  tabText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#ccc",
    marginTop: 4,
  },
  activeTabText: {
    color: "#3498db",
  },
})
