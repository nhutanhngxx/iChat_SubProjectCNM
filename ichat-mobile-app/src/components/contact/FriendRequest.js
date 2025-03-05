import { useNavigation } from "@react-navigation/native";
import { Avatar, Tab, TabView } from "@rneui/themed";
import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  View,
  StyleSheet,
} from "react-native";
import { IconButton } from "react-native-paper";

const friendRequest = [
  {
    id: "1",
    name: "Nguyễn Nhựt Anh",
    lastMessage: "[Hình ảnh]",
    time: "1 phút trước",
    avatar: require("../../assets/images/avatars/avatar1.png"),
  },
  {
    id: "2",
    name: "Trần Minh Quân",
    lastMessage: "Xin chào!",
    time: "5 phút trước",
    avatar: require("../../assets/images/avatars/avatar2.png"),
  },
  {
    id: "3",
    name: "Lê Phương Thảo",
    lastMessage: "Bạn khỏe không?",
    time: "10 phút trước",
    avatar: require("../../assets/images/avatars/avatar3.png"),
  },
];

const RequestAdd = () => {
  const handleViewProfile = (item) => {
    alert("View profile of: " + item.name);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item_container}
      onPress={() => handleViewProfile(item)}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={item.avatar} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <IconButton
          icon={"check"}
          iconColor="#2F80ED"
          size={20}
          onPress={() => handleAcceptRequest(item)}
        />
        <IconButton
          icon={"close"}
          iconColor="#FF0000"
          size={20}
          onPress={() => handleDeclineRequest(item)}
        />
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
      <FlatList
        data={friendRequest}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const RequestSend = () => {
  const handleViewProfile = (item) => {
    alert("View profile of: " + item.name);
  };

  const handleRecallRequest = (item) => {
    alert("Recall request from: " + item.name);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item_container}
      onPress={() => handleViewProfile(item)}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={item.avatar} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={{
          display: "flex",
          flexDirection: "row",
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: "red",
        }}
        onPress={() => handleRecallRequest(item)}
      >
        <Text style={{ fontWeight: "bold", color: "red" }}>Thu hồi</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  return (
    <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
      <FlatList
        data={friendRequest}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const FriendRequest = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);

  const onClose = () => {
    navigation.goBack();
  };

  const handleOpenSettingRequest = () => {
    alert("Open setting request");
  };

  const handleAcceptRequest = (item) => {
    alert("Accept request from: " + item.name);
  };

  const handleDeclineRequest = (item) => {
    alert("Decline request from: " + item.name);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <SafeAreaView
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          height: 50,
          backgroundColor: "#fff",
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity onPress={onClose}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
            Lời mời kết bạn
          </Text>
        </View>
        <IconButton
          style={{ position: "absolute", right: 0 }}
          icon={"cog-outline"}
          size={20}
          onPress={() => handleOpenSettingRequest()}
        />
      </SafeAreaView>

      {/* List Friend Request */}
      {/* <RequestAdd /> */}
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{
            backgroundColor: "#6166EE",
            width: "25%",
            marginHorizontal: "12.5%",
          }}
          variant="default"
          dense
        >
          <Tab.Item
            title={"Đã nhận"}
            titleStyle={{
              color: index === 0 ? "#6166EE" : "gray",
              fontWeight: index === 0 ? "bold" : null,
            }}
          ></Tab.Item>
          <Tab.Item
            title={"Đã gửi"}
            titleStyle={{
              color: index === 1 ? "#6166EE" : "gray",
              fontWeight: index === 1 ? "bold" : null,
            }}
          />
        </Tab>

        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item>
            <RequestAdd />
          </TabView.Item>
          <TabView.Item>
            <RequestSend />
          </TabView.Item>
        </TabView>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item_container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  item_leftSide: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});

export default FriendRequest;
