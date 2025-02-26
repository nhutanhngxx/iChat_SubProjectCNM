import React, { useState } from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

import HeaderContactTab from "../components/header/HeaderContactTab";
import FriendTab from "../components/contact/FriendTab";
import GroupTab from "../components/contact/GroupTab";
import { Tab } from "@rneui/themed";
import { TabView } from "@rneui/base";

const ContactTab = () => {
  const [index, setIndex] = useState(0);
  return (
    <SafeAreaView style={styles.container}>
      <HeaderContactTab />
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
          title={"Friend"}
          titleStyle={{ color: "black", fontWeight: "bold" }}
        ></Tab.Item>
        <Tab.Item
          title={"Group"}
          titleStyle={{ color: "black", fontWeight: "bold" }}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item>
          <FriendTab />
        </TabView.Item>
        <TabView.Item>
          <GroupTab />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default ContactTab;
