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
        children={(props) => <LauncherScreen {...props} setUser={setUser} />}
      />
      <Stack.Screen
        name="Login"
        children={(props) => <LoginScreen {...props} setUser={setUser} />}
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="Register"
        children={(props) => <RegisterScreen {...props} setUser={setUser} />}
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="EnterOTP"
        children={(props) => <EnterOTPScreen {...props} setUser={setUser} />}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
