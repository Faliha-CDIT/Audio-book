import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface BookInfo {
  id: string
  title: string
  cover: any
  author: string
  description: string
  chapters: number
  duration: string
  language: string
}

const BOOKS_INFO: Record<string, BookInfo> = {
  "1": {
    id: "1",
    title: "Cover Case",
    cover: require("../../assets/images/cover case.jpg"),
    author: "Unknown Author",
    description:
      "A compelling story that explores the depths of human emotions and relationships. Dive into a world where every chapter reveals new perspectives and insights.",
    chapters: 12,
    duration: "6 hours 45 minutes",
    language: "Malayalam",
  },
  "2": {
    id: "2",
    title: "Chalachitra Sidhandangal",
    cover: require("../../assets/images/cover  chalachitra sidhandangal-3.jpg"),
    author: "Film Theorist",
    description:
      "Explore the fascinating world of cinema through the lens of theory and practice. This comprehensive guide covers the fundamentals of filmmaking.",
    chapters: 15,
    duration: "8 hours 30 minutes",
    language: "Malayalam",
  },
  "3": {
    id: "3",
    title: "Hasthalikhitham",
    cover: require("../../assets/images/Hasthalikhitham.jpg"),
    author: "Palmistry Expert",
    description:
      "Discover the ancient science of palmistry and how it can reveal insights about your personality and future.",
    chapters: 10,
    duration: "5 hours 20 minutes",
    language: "Malayalam",
  },
  "4": {
    id: "4",
    title: "Kumaranasan Vijnankosham",
    cover: require("../../assets/images/Kumaranasan Vijnankosham_FINAL COVER.jpg"),
    author: "Kumaran",
    description:
      "A treasury of scientific knowledge presented in an accessible manner.",
    chapters: 20,
    duration: "10 hours 15 minutes",
    language: "Malayalam",
  },
  "5": {
    id: "5",
    title: "Nirmithabudhi",
    cover: require("../../assets/images/Nirmithabudhi.jpg"),
    author: "Philosopher",
    description:
      "An exploration of consciousness and the nature of mind.",
    chapters: 14,
    duration: "7 hours 40 minutes",
    language: "Malayalam",
  },
  "6": {
    id: "6",
    title: "Parinamam",
    cover: require("../../assets/images/parinamam.jpg"),
    author: "Author Name",
    description:
      "A story about transformation and change.",
    chapters: 11,
    duration: "6 hours 10 minutes",
    language: "Malayalam",
  },
  "7": {
    id: "7",
    title: "Samoohasasthram",
    cover: require("../../assets/images/Samoohasasthram.jpg"),
    author: "Sociologist",
    description:
      "Understanding society and its complexities.",
    chapters: 16,
    duration: "8 hours 50 minutes",
    language: "Malayalam",
  },
  "8": {
    id: "8",
    title: "Vaikom",
    cover: require("../../assets/images/vaikom cover-1.jpg"),
    author: "Historical Novelist",
    description:
      "A historical narrative centered around Vaikom.",
    chapters: 13,
    duration: "7 hours 5 minutes",
    language: "Malayalam",
  },
  "9": {
    id: "9",
    title: "Jyothisastram",
    cover: require("../../assets/images/jyothisastram.jpg"),
    author: "Astrologer",
    description:
      "An introduction to astrology and its principles.",
    chapters: 12,
    duration: "6 hours 30 minutes",
    language: "Malayalam",
  },
}

export default function BookDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const book = BOOKS_INFO[String(id)]

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Not Foundssssssssssssssss</Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>

        <Ionicons name="heart-outline" size={24} color="#F500E2" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={book.cover} style={styles.coverImage} />

        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>📘 {book.chapters} Chapters</Text>
          <Text style={styles.statText}>⏱ {book.duration}</Text>
          <Text style={styles.statText}>🌐 {book.language}</Text>
        </View>

        <Text style={styles.sectionTitle}>About this book</Text>
        <Text style={styles.description}>{book.description}</Text>

        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={22} color="#fff" />
          <Text style={styles.playText}>Start Listening</Text>
        </TouchableOpacity>
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
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#1a1a2e",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  author: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "bold",
  },
  description: {
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 24,
  },
  playButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
  },
  playText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
})
