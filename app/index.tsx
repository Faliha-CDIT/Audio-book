import { Redirect } from "expo-router"

export default function Index() {
  // Redirect from the root to the home screen
  return <Redirect href="/home" />
}
