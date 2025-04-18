import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { UserProvider } from "./config/context/UserContext";
import { SocketProvider } from "./config/context/SocketContext";

export default function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SocketProvider>
    </UserProvider>
  );
}
