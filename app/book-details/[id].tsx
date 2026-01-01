
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
    description: "A compelling story that explores the depths of human emotions and relationships. Dive into a world where every chapter reveals new perspectives and insights.",
    chapters: 12,
    duration: "6 hours 45 minutes",
    language: "Malayalam",
  },
  "2": {
    id: "2",
    title: "Chalachitra Sidhandangal",
    cover: require("../../assets/images/cover  chalachitra sidhandangal-3.jpg"),
    author: "Film Theorist",
    description: "Explore the fascinating world of cinema through the lens of theory and practice. This comprehensive guide covers the fundamentals of filmmaking.",
    chapters: 15,
    duration: "8 hours 30 minutes",
    language: "Malayalam",
  },
  "3": {
    id: "3",
    title: "Hasthalikhitham",
    cover: require("../../assets/images/Hasthalikhitham.jpg"),
    author: "Palmistry Expert",
    description: "Discover the ancient science of palmistry and how it can reveal insights about your personality and future. Learn the art of hand reading.",
    chapters: 10,
    duration: "5 hours 20 minutes",
    language: "Malayalam",
  },
  "4": {
    id: "4",
    title: "Kumaranasan Vijnankosham",
    cover: require("../../assets/images/Kumaranasan Vijnankosham_FINAL COVER.jpg"),
    author: "Kumaran",
    description: "A treasury of scientific knowledge presented in an accessible manner. Perfect for those seeking to expand their understanding of various scientific concepts.",
    chapters: 20,
    duration: "10 hours 15 minutes",
    language: "Malayalam",
  },
  "5": {
    id: "5",
    title: "Nirmithabudhi",
    cover: require("../../assets/images/Nirmithabudhi.jpg"),
    author: "Philosopher",
    description: "An exploration of consciousness and the nature of mind. Delve into philosophical musings on creativity and human potential.",
    chapters: 14,
    duration: "7 hours 40 minutes",
    language: "Malayalam",
  },
  "6": {
    id: "6",
    title: "Parinamam",
    cover: require("../../assets/images/parinamam.jpg"),
    author: "Author Name",
    description: "A story about transformation and change. Follow the journey of characters as they navigate life's pivotal moments.",
    chapters: 11,
    duration: "6 hours 10 minutes",
    language: "Malayalam",
  },
  "7": {
    id: "7",
    title: "Samoohasasthram",
    cover: require("../../assets/images/Samoohasasthram.jpg"),
    author: "Sociologist",
    description: "Understanding society and its complexities. An in-depth look at social structures, relationships, and collective behavior.",
    chapters: 16,
    duration: "8 hours 50 minutes",
    language: "Malayalam",
  },
  "8": {
    id: "8",
    title: "Vaikom",
    cover: require("../../assets/images/vaikom cover-1.jpg"),
    author: "Historical Novelist",
    description: "A historical narrative centered around Vaikom. Explore the rich heritage and cultural significance of this important location.",
    chapters: 13,
    duration: "7 hours 5 minutes",
    language: "Malayalam",
  },
  "9": {
    id: "9",
    title: "Jyothisastram",
    cover: require("../../assets/images/jyothisastram.jpg"),
    author: "Astrologer",
    description: "An introduction to astrology and its principles. Understand the celestial influences on human life and destiny.",
    chapters: 12,
    duration: "6 hours 30 minutes",
    language: "Malayalam",
  },
}

export default function BookDetailsScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  
  const book = BOOKS_INFO[id as string]

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Not Found</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#F500E2" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.coverContainer}>
          <Image source={book.cover} style={styles.coverImage} contentFit="cover" />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="book" size={20} color="#3498db" />
              <Text style={styles.statLabel}>{book.chapters}</Text>
              <Text style={styles.statValue}>Chapters</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#3498db" />
              <Text style={styles.statLabel}>{book.duration}</Text>
              <Text style={styles.statValue}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="language" size={20} color="#3498db" />
              <Text style={styles.statLabel}>{book.language}</Text>
              <Text style={styles.statValue}>Language</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this book</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={24} color="#fff" />
              <Text style={styles.playButtonText}>Start Listening</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sampleButton}>
              <Ionicons name="headset" size={24} color="#3498db" />
              <Text style={styles.sampleButtonText}>Listen to Sample</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Books</Text>
            <View style={styles.relatedBooksContainer}>
              <View style={styles.relatedBookItem}>
                <View style={styles.relatedBookCover} />
                <Text style={styles.relatedBookTitle}>Book Title</Text>
              </View>
              <View style={styles.relatedBookItem}>
                <View style={styles.relatedBookCover} />
                <Text style={styles.relatedBookTitle}>Book Title</Text>
              </View>
              <View style={styles.relatedBookItem}>
                <View style={styles.relatedBookCover} />
                <Text style={styles.relatedBookTitle}>Book Title</Text>
              </View>
            </View>
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
    marginHorizontal: 8,
  },
  placeholder: {
    width: 44,
  },
  favoriteButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  author: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  statValue: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
  },
  ctaContainer: {
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  sampleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16213e",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#3498db",
    gap: 8,
  },
  sampleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3498db",
  },
  relatedSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#16213e",
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  relatedBooksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  relatedBookItem: {
    flex: 1,
    alignItems: "center",
  },
  relatedBookCover: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#16213e",
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedBookTitle: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
  },
})
