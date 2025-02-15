import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EnterOTPScreen from "../screens/EnterOTPScreen";

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
        children={(props) => <LauncherScreen {...props} />}
      />
      <Stack.Screen
        name="Login"
        children={(props) => <LoginScreen {...props} />}
      />
      <Stack.Screen
        name="Register"
        children={(props) => <RegisterScreen {...props} />}
      />
      <Stack.Screen
        name="EnterOTP"
        children={(props) => <EnterOTPScreen {...props} />}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
