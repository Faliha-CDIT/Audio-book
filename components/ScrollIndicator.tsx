import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { Animated, StyleSheet, View } from "react-native"

interface ScrollIndicatorProps {
  showLeftArrow: boolean
  showRightArrow: boolean
  leftOpacity?: Animated.Value
  rightOpacity?: Animated.Value
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  showLeftArrow,
  showRightArrow,
  leftOpacity = new Animated.Value(showLeftArrow ? 1 : 0),
  rightOpacity = new Animated.Value(showRightArrow ? 1 : 0),
}) => {
  return (
    <View style={styles.container}>
      {showLeftArrow && (
        <Animated.View style={[styles.arrowContainer, styles.leftArrow, { opacity: leftOpacity }]}>
          <View style={styles.arrowBackground}>
            <Ionicons name="play-back-outline" size={20} color="#fff" />
          </View>
        </Animated.View>
      )}

      {showRightArrow && (
        <Animated.View style={[styles.arrowContainer, styles.rightArrow, { opacity: rightOpacity }]}>
          <View style={styles.arrowBackground}>
            <Ionicons name="play-forward-outline" size={20} color="#fff" />
          </View>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none", // Allow touches to pass through
  },
  arrowContainer: {
    position: "absolute",
    top: "50%",
    marginTop: -15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  leftArrow: {
    left: 0,
  },
  rightArrow: {
    right: 0,
  },
  arrowBackground: {
    backgroundColor: "rgba(22, 33, 62, 0.8)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ScrollIndicator

