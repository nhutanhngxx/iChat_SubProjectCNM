import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Tab } from "@rneui/themed";
import { TabView } from "@rneui/base";

import HeaderMessages from "../components/header/HeaderMessagesTab";
import UutienMessages from "../components/messages/UuTien";
import KhacMessages from "../components/messages/Khac";

const MessagesTab = ({ setUser }) => {
  const [index, setIndex] = useState(0);
  return (
    <View style={styles.container}>
      <HeaderMessages />
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: "skyblue",
          width: "25%",
          marginHorizontal: "12.5%",
          marginBottom: 5,
        }}
        variant="default"
        dense
      >
        <Tab.Item
          title={"Ưu tiên"}
          titleStyle={{ color: "black", fontWeight: "bold" }}
        ></Tab.Item>
        <Tab.Item
          title={"Khác"}
          titleStyle={{ color: "black", fontWeight: "bold" }}
        />
      </Tab>
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item>
          <UutienMessages />
        </TabView.Item>
        <TabView.Item>
          <KhacMessages />
        </TabView.Item>
      </TabView>
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
