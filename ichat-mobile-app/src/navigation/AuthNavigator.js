import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LauncherScreen from "../screens/LauncherScreen";
import LoginScreen from "../screens/LoginScreen";
import UuTien from "../components/messages/UuTien";
import Chatting from "../components/messages/Chatting";
import Khac from "../components/messages/Khac";

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
      <Stack.Screen
        name="UuTien"
        component={(props) => <UuTien {...props} setUser={setUser} />}
      />
      <Stack.Screen
        name="Khac"
        component={(props) => <Khac {...props} setUser={setUser} />}
      />{" "}
      <Stack.Screen
        name="Chatting"
        component={(props) => <Chatting {...props} setUser={setUser} />}
      />
      {/* <Stack.Screen name="UuTien" component={UuTien} />
      <Stack.Screen name="Khac" component={Khac} />
      <Stack.Screen name="Chatting" component={Chatting} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
