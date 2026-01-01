import { Redirect } from "expo-router"

export default function Index() {
  // Redirect from the root to the intro screen
  return <Redirect href="/intro" />
}
