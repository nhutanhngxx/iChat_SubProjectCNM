import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LauncherScreen from "../src/screens/LauncherScreen";
import HomeScreen from "../src/screens/HomeScreen";
import LoginScreen from "../src/screens/LoginScreen";

export default function App() {
  const Stack = createNativeStackNavigator();
  const ButtomTab = createBottomTabNavigator();
  return (
    <ButtomTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#00bdd6",
        // tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <ButtomTab.Screen name="Launcher" component={LauncherScreen} />
      <ButtomTab.Screen name="Login" component={LoginScreen} />
      <ButtomTab.Screen name="Home" component={HomeScreen} />
    </ButtomTab.Navigator>
  );
}
