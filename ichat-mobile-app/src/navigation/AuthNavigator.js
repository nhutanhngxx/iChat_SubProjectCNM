import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ setUser }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Launcher"
        component={(props) => <LauncherScreen {...props} setUser={setUser} />}
      />
      <Stack.Screen
        name="Login"
        component={(props) => <LoginScreen {...props} setUser={setUser} />}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
