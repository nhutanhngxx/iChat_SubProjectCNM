import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Text,
} from "react-native";
import { Tab } from "@rneui/themed";
import { TabView } from "@rneui/base";

import HeaderMessages from "../components/header/HeaderMessagesTab";
import PriorityMessages from "../components/messages/Priority";
import OtherMessages from "../components/messages/Other";

import moreIcon from "../assets/icons/more.png";
import addFriendIcon from "../assets/icons/add-friend.png";
import loginDeviceIcon from "../assets/icons/login-device.png";

import { UserContext } from "../context/UserContext";

const MessagesTab = () => {
  const [index, setIndex] = useState(0);
  const { user } = useContext(UserContext);
  const [modalCard, setModalCard] = useState(false);

  return (
    <View style={styles.container}>
      <HeaderMessages />

      {/* <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: "#6166EE",
          width: "25%",
          marginHorizontal: "12.5%",
        }}
        variant="default"
        dense
        containerStyle={{}}
      >
        <Tab.Item
          title={"Ưu tiên"}
          titleStyle={{
            color: index === 0 ? "#6166EE" : "gray",
            fontWeight: index === 0 ? "bold" : null,
          }}
          containerStyle={{
            backgroundColor: "green",
          }}
        />
        <Tab.Item
          title={"Khác"}
          titleStyle={{
            color: index === 1 ? "#6166EE" : "gray",
            fontWeight: index === 1 ? "bold" : null,
          }}
          containerStyle={{
            backgroundColor: "red",
          }}
        />
      </Tab> */}

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: "50%" }}>
          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={{
              backgroundColor: "#6166EE",
              width: "25%",
              marginHorizontal: "12%",
            }}
            variant="default"
            dense
            containerStyle={{}}
          >
            <Tab.Item
              title={"Ưu tiên"}
              titleStyle={{
                color: index === 0 ? "#6166EE" : "gray",
                fontWeight: index === 0 ? "bold" : null,
              }}
            />
            <Tab.Item
              title={"Khác"}
              titleStyle={{
                color: index === 1 ? "#6166EE" : "gray",
                fontWeight: index === 1 ? "bold" : null,
              }}
            />
          </Tab>
        </View>

        <View
          style={{
            width: "50%",
            flex: 1,
            alignItems: "flex-end",
            paddingRight: 15,
          }}
        >
          <TouchableOpacity onPress={() => setModalCard(true)}>
            <Image source={moreIcon} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>
      </View>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PriorityMessages />
        </TabView.Item>
        <TabView.Item
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <OtherMessages />
        </TabView.Item>
      </TabView>

      {/* Modal Card */}
      <Modal
        transparent={true}
        visible={modalCard}
        onRequestClose={() => setModalCard(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "flex-end",
            paddingTop: 100,
          }}
          onPress={() => setModalCard(false)}
        >
          <View
            style={{
              width: 200,
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              marginRight: 10,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Image source={addFriendIcon} style={{ width: 25, height: 25 }} />
              <Text style={{ fontSize: 16 }}>Tin nhắn chưa đọc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Image
                source={loginDeviceIcon}
                style={{ width: 25, height: 25 }}
              />
              <Text style={{ fontSize: 16 }}>Thẻ phân loại</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
