import { Redirect } from "expo-router"

export default function Index() {
  // Redirect from the root to the intro screen
  return <Redirect href="/intro" />
}
// "use client"

// import MiniPlayer from "@/components/MiniPlayer"
// import { Image } from "expo-image"
// import { useRouter } from "expo-router"
// import { useEffect, useRef, useState } from "react"
// import {
//   Dimensions,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity
// } from "react-native"

// interface Book {
//   id: string
//   title: string
//   cover: any
// }

// const BOOKS: Book[] = [
//   { id: "1", title: "Cover Case", cover: require("../assets/images/cover case.jpg") },
//   { id: "2", title: "Chalachitra Sidhandangal", cover: require("../assets/images/cover  chalachitra sidhandangal-3.jpg") },
//   { id: "3", title: "Hasthalikhitham", cover: require("../assets/images/Hasthalikhitham.jpg") },
// ]

// export default function HomeScreen() {
//   const router = useRouter()
//   const SCREEN_WIDTH = Dimensions.get("window").width
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const sliderRef = useRef<ScrollView>(null)

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const next = (currentSlide + 1) % BOOKS.length
//       setCurrentSlide(next)
//       sliderRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true })
//     }, 4000)

//     return () => clearInterval(timer)
//   }, [currentSlide])

//   const handleBookPress = (id: string) => {
//     if (id === "1") {
//       router.push("/periodic-table")
//     } else {
//       router.push(`/book-details/${id}`)
//     }
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView>
//         <ScrollView
//           ref={sliderRef}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//         >
//           {BOOKS.map((book) => (
//             <TouchableOpacity
//               key={book.id}
//               style={{ width: SCREEN_WIDTH }}
//               onPress={() => handleBookPress(book.id)}
//             >
//               <Image source={book.cover} style={styles.image} contentFit="contain" />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         <MiniPlayer />
//       </ScrollView>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#0f0f1a" },
//   image: { width: "100%", height: 300 },
// })
