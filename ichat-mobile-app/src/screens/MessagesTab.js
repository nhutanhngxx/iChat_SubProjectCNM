import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import HeaderMessages from "../components/tabs/HeaderMessagesTab";
import UutienMessages from "../components/messages/UuTien";
import KhacMessages from "../components/messages/Khac";

const MessagesTab = ({setUser}) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = [
    { key: "uutien", title: "Ưu tiên" },
    { key: "khac", title: "Khác" },
  ];

  // const renderScene = ({ route }) => {
  //   if (route.key === routes[index].key) {
  //     return route.key === "uutien" ? <UutienMessages /> : <KhacMessages />;
  //   }
  //   return null; // Không render tab không được chọn
  // };

  const renderScene = ({ route }) => {
    if (route.key === "uutien" && index === 0) {
      console.log("uu tien: ", index);
      console.log("key: ", route.key);
      return <UutienMessages />;
    }
    if (route.key === "khac" && index === 1) {
      console.log("key: ", route.key);
      console.log("khac: ", index);
      return <KhacMessages />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <HeaderMessages />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        lazy
        lazyPlaceholder={() => (
          <ActivityIndicator size="large" color="#2F80ED" />
        )}
        // renderTabBar={(props) => (
        //   <TabBar
        //     {...props}
        //     indicatorStyle={{ backgroundColor: "#2F80ED" }}
        //     tabStyle={{ backgroundColor: "white" }}
        //   />
        // )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default MessagesTab;
