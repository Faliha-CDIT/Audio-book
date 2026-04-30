"use client"

import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import BookMiniPlayer from "../../components/BookMiniPlayer"
import { useBookContext, type Book, type Chapter } from "../../context/BookContext"

// Generate chapters for a book
const generateChapters = (bookId: string, count: number): Chapter[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${bookId}-chapter-${i + 1}`,
    bookId,
    title: `Chapter ${i + 1}`,
    number: i + 1,
    audio_url: null, // You can add actual audio URLs here
    duration: 180000, // 3 minutes default
  }))
}

const BOOKS_INFO: Record<string, Book> = {
  "5": {
    id: "5",
    title: "Cover Case",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("5", 12),
  },
  "2": {
    id: "2",
    title: "Chalachitra Sidhandangal",
    cover: require("../../assets/images/Hasthalikhitham.jpg"),
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("2", 15),
  },
  "3": {
    id: "3",
    title: "Hasthalikhitham",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("3", 10),
  },
  "4": {
    id: "4",
    title: "Kumaranasan Vijnankosham",
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("4", 20),
  },
  "8": {
    id: "8",
    title: "Vaikom",
    cover: require("../../assets/images/vaikom cover-1.jpg"),
    author: "Film Theorist",
    description: "A deep dive into film theory.",
    chapters: generateChapters("8", 13),
  },
}

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { playChapter } = useBookContext()

  // SECURITY: Sanitize and validate deep link input to prevent DoS (CWE-400)
  const sanitizedId = (id || "").substring(0, 50).trim()
  const book = BOOKS_INFO[sanitizedId]

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>Book not found</Text>
      </SafeAreaView>
    )
  }

  const handleChapterPress = async (chapter: Chapter) => {
    await playChapter(chapter, book)
    router.push({
      pathname: "/book-details/chapter-detail",
      params: {
        bookId: book.id,
        chapterId: chapter.id,
      },
    })
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
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {book.cover && <Image source={book.cover} style={styles.cover} />}
        
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={styles.description}>{book.description}</Text>

        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          {book.chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              style={styles.chapterItem}
              onPress={() => handleChapterPress(chapter)}
            >
              <View style={styles.chapterNumber}>
                <Text style={styles.chapterNumberText}>{chapter.number}</Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color="#F500E2" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BookMiniPlayer />
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
    paddingBottom: 100,
  },
  cover: {
    width: 200,
    height: 300,
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  author: {
    color: "#aaa",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  chaptersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213e",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  chapterNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F500E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chapterNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
})
