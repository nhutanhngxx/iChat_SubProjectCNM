import { View, Platform, Image } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MessageTab from "../screens/MessagesTab";
import ContactTab from "../screens/ContactTab";
import TimelineTab from "../screens/TimelineTab";
import MeTab from "../screens/MeTab";

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
  const { buildHref } = useLinkBuilder();
  const icons = {
    Messages: require("../assets/icons/chatting.png"),
    Contact: require("../assets/icons/contact.png"),
    Timeline: require("../assets/icons/timeline.png"),
    Me: require("../assets/icons/me.png"),
  };

  return (
    <View
      style={{
        flexDirection: "row",
        height: 80,
        borderColor: "#ddd",
        backgroundColor: "white",
        paddingBottom: 10,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={icons[route.name]}
              style={{
                width: 24,
                height: 24,
                tintColor: isFocused ? undefined : "gray",
              }}
            />
            <Text
              style={{
                fontSize: 12,
                color: isFocused ? "#2F80ED" : "gray",
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

function MyTabs({ setUser }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#282c34",
          height: 70,
          paddingBottom: 10,
          position: "absolute",
        },
        tabBarActiveTintColor: "#FFD700",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
      }}
    >
      <Tab.Screen
        name="Messages"
        children={(props) => <MessageTab {...props} setUser={setUser} />}
        options={{
          headerShown: false,
          title: "Tin nhắn",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
        }}
      />
      <Tab.Screen
        name="Contact"
        children={(props) => <ContactTab {...props} setUser={setUser} />}
        options={{
          headerShown: false,
          title: "Liên hệ",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
        }}
      />
      <Tab.Screen
        name="Timeline"
        children={(props) => <TimelineTab {...props} setUser={setUser} />}
        options={{
          headerShown: false,
          title: "Timeline",
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
        }}
      />
      <Tab.Screen
        name="Me"
        children={(props) => <MeTab {...props} setUser={setUser} />}
        options={{
          headerShown: false,
          title: "Hồ sơ",
          headerStyle: { backgroundColor: "#28a745" },
          headerTintColor: "#fff",
        }}
      />
    </Tab.Navigator>
  );
}

export default MyTabs;
