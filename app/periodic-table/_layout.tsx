// import { Ionicons } from "@expo/vector-icons"
// import AntDesign from "@expo/vector-icons/AntDesign"
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
// import { Tabs } from "expo-router"
// import { useAppContext } from "../../context/AppContext"

// export default function PeriodicTableLayout() {
//   const { currentElement } = useAppContext()

//   return (
//     <Tabs
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: "#1a1a2e",
//         },
//         headerTintColor: "#fff",
//         headerTitleStyle: {
//           fontWeight: "bold",
//         },
//         tabBarStyle: {
//           backgroundColor: "#1a1a2e",
//           borderTopColor: "#16213e",
//         },
//         tabBarActiveTintColor: "#3498db",
//         tabBarInactiveTintColor: "#ccc",
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Periodic Table",
//           tabBarLabel: "Table",
//           tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="grid"
//         options={{
//           title: "Periodic Table",
//           tabBarLabel: "Grid",
//           tabBarIcon: ({ color, size }) => <Ionicons name="apps-outline" size={size} color={color} />,
//         }}
//       />

//       <Tabs.Screen
//         name="favorites"
//         options={{
//           title: "Favorites",
//           tabBarLabel: "Favorites",
//           tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="element-detail"
//         options={{
//           title: currentElement ? currentElement.name : "Element Details",
//           tabBarLabel: "Element Detail",
//           tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="details" size={size} color={color} />,
//         }}
//       />
//     </Tabs>
//   )
// }

import { Ionicons } from "@expo/vector-icons"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { Tabs, useRouter } from "expo-router"
import { Pressable } from "react-native"
import { Fonts } from "../../constants/Fonts"
import { useAppContext } from "../../context/AppContext"


export default function PeriodicTableLayout() {
  const { currentElement } = useAppContext()
  const router = useRouter()

  return (
    <Tabs
    screenOptions={{
      headerStyle: {
        backgroundColor: "#1a1a2e",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
       // fontFamily: Fonts.regular,
      },
      tabBarStyle: {
        backgroundColor: "#1a1a2e",
        borderTopColor: "#16213e",
      },
      tabBarActiveTintColor: "#F500E2",
      tabBarInactiveTintColor: "#ccc",
      tabBarLabelStyle: {
        fontFamily: Fonts.regular,
        fontSize: 12,
      },
    }}
  >
  
      <Tabs.Screen
        name="index"
        options={{
          title: "Periodic Table",
          tabBarLabel: "Table",
          tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
           headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="grid"
        options={{
          title: "Periodic Table",
          tabBarLabel: "Grid",
          tabBarIcon: ({ color, size }) => <Ionicons name="apps-outline" size={size} color={color} />,
           headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarLabel: "Favorites",
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
           headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="element-detail"
        options={{
          title: currentElement ? currentElement.name : "Element Details",
          tabBarLabel: "Element Detail",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="details" size={size} color={color} />,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  )
}
