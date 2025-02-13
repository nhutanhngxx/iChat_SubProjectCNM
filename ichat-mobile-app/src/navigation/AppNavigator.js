import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { View, Image } from "react-native";
import MessageTab from "../screens/MessagesTab";
import ContactTab from "../screens/ContactTab";
import TimelineTab from "../screens/TimelineTab";
import MeTab from "../screens/MeTab";

const BottomTab = createBottomTabNavigator();

const AppNavigator = ({ setUser }) => {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = {
            Messages: require("../assets/icons/chatting.png"),
            Contact: require("../assets/icons/contact.png"),
            Timeline: require("../assets/icons/timeline.png"),
            Me: require("../assets/icons/me.png"),
          };

          return (
            <View style={{ alignItems: "center" }}>
              <Image
                source={icons[route.name]}
                style={{
                  width: 20,
                  height: 20,
                  // tintColor: focused ? "#2F80ED" : "gray",
                }}
              />
              {focused && (
                <View
                  style={{
                    width: 25,
                    height: 3,
                    backgroundColor: "#2F80ED",
                    borderRadius: 2,
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: "#2F80ED",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      })}
    >
      <BottomTab.Screen name="Messages" component={MessageTab} />
      <BottomTab.Screen name="Contact" component={ContactTab} />
      <BottomTab.Screen name="Timeline" component={TimelineTab} />
      <BottomTab.Screen name="Me" component={MeTab} />
    </BottomTab.Navigator>
  );
};

export default AppNavigator;