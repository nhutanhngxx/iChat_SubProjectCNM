import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

import LauncherScreen from "../src/screens/LauncherScreen";

export default function App() {
  return <LauncherScreen />;
}
