import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import React from "react";
import { View, Image } from "react-native";
import MessageTab from "../screens/MessagesTab";
import ContactTab from "../screens/ContactTab";
import TimelineTab from "../screens/TimelineTab";
import MeTab from "../screens/MeTab";
import Chatting from "../components/messages/Chatting";
import Option from "../components/messages/Options";
import MediaStorage from "../components/messages/MediaStorage";
import SearchScreen from "../components/search/SearchScreen";
import ViewProfile from "../components/profile/ViewProfile";

import ProfileInformation from "../components/profile/ProfileInformation";
import ChangeInformation from "../components/profile/ChangeInformation";

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesStack" component={MessageTab} />
      <Stack.Screen
        name="Chatting"
        component={Chatting}
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen name="Option" component={Option} />
      <Stack.Screen name="MediaStorage" component={MediaStorage} />
      <Stack.Screen
        name="ViewProfile"
        component={ViewProfile}
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
};

const MeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MeTab" component={MeTab} />
    <Stack.Screen
      name="ProfileInformation"
      component={ProfileInformation}
      options={{
        animation: "none",
      }}
    />
    <Stack.Screen
      name="ChangeInformation"
      component={ChangeInformation}
      options={{
        animation: "none",
      }}
    />
  </Stack.Navigator>
);

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
                  tintColor: focused ? null : "rgba(0, 0, 0, 0.25)",
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
      <BottomTab.Screen
        name="Messages"
        children={(props) => <ChatStack {...props} setUser={setUser} />}
      />
      <BottomTab.Screen
        name="Contact"
        children={(props) => <ContactTab {...props} setUser={setUser} />}
      />
      <BottomTab.Screen
        name="Timeline"
        children={(props) => <TimelineTab {...props} setUser={setUser} />}
      />
      <BottomTab.Screen
        name="Me"
        children={(props) => <MeStack {...props} setUser={setUser} />}
      />
    </BottomTab.Navigator>
  );
};

export default AppNavigator;
