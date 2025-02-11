import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import HomeScreen from "../screens/HomeScreen";
import MessageScreen from "../screens/MessageScreen";

const ButtomTab = createBottomTabNavigator();

const AppNavigator = ({ setUser }) => {
  return (
    <ButtomTab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ButtomTab.Screen
        name="Home"
        component={(props) => <HomeScreen {...props} setUser={setUser} />}
      />
      <ButtomTab.Screen
        name="Message"
        component={(props) => <MessageScreen {...props} setUser={setUser} />}
      />
    </ButtomTab.Navigator>
  );
};

export default AppNavigator;
