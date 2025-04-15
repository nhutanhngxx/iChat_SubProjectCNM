import { useNavigation } from "@react-navigation/native";
import { Avatar, Tab, TabView } from "@rneui/themed";
import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { IconButton } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import settingIcon from "../../assets/icons/setting.png";

import { UserContext } from "../../config/context/UserContext";
import friendService from "../../services/friendService";

// Tab "Đã nhận"
const RequestRecieve = () => {
  const [listRequest, setListRequest] = useState([]);
  const { user } = useContext(UserContext);

  // Lấy danh sách lời mời kết bạn đã nhận
  useEffect(() => {
    if (!user?.id) return;
    const fetchFriendRequest = async () => {
      const requests = await friendService.getReceivedRequestsByUserId(user.id);
      setListRequest(requests);
    };
    fetchFriendRequest();
    const interval = setInterval(fetchFriendRequest, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Xem thông tin của người gửi lời mời kết bạn
  const handleViewProfile = (item) => {
    Alert.alert("Xem thông tin", item.full_name);
  };

  // Chấp nhận lời mời kết bạn
  const handleAcceptRequest = (item) => {
    Alert.alert("Thông báo", `Bạn có muốn kết bạn với ${item.full_name}?`, [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            await friendService.acceptFriendRequest({
              senderId: item.id,
              receiverId: user.id,
            });
            setListRequest((prev) => prev.filter((r) => r.id !== item.id));
          } catch (error) {
            Alert.alert("Lỗi", error.message || "Lỗi chưa rõ");
          }
        },
      },
    ]);
  };

  // Từ chối lời mời kết bạn
  const handleDeclineRequest = (item) => {
    Alert.alert(
      "Thông báo",
      `Bạn có muốn từ chối lời mời kết bạn từ ${item.full_name}?`,
      [
        { text: "Hủy" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await friendService.cancelFriendRequest({
                senderId: item.id,
                receiverId: user.id,
              });
              setListRequest((prev) => prev.filter((r) => r.id !== item.id));
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Lỗi chưa rõ");
            }
          },
        },
      ]
    );
  };

  // Hiển thị danh sách lời mời kết bạn
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item_container}
      onPress={() => handleViewProfile(item)}
      key={item.id}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {item.full_name}
        </Text>
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
      {listRequest.length === 0 ? (
        <View>
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Không có lời mời kết bạn nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={listRequest}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

// Tab "Đã gửi"
const RequestSend = () => {
  const [listRequest, setListRequest] = useState([]);
  const { user } = useContext(UserContext);

  // Lấy danh sách lời mời kết bạn đã gửi
  useEffect(() => {
    if (!user?.id) return;
    const fetchFriendRequest = async () => {
      const requests = await friendService.getSentRequestsByUserId(user.id);
      setListRequest(requests);
    };
    fetchFriendRequest();
    const interval = setInterval(fetchFriendRequest, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Xem thông tin của người nhận lời mời kết bạn
  const handleViewProfile = (item) => {
    Alert.alert("Xem thông tin", item.full_name);
  };

  // Thu hồi lời mời kết bạn (có thể hiện modal xác nhận)
  const handleRecallRequest = async (item) => {
    Alert.alert(
      "Thông báo",
      `Bạn có muốn thu hồi lời mời kết bạn cho ${item.full_name}?`,
      [
        { text: "Hủy" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await friendService.cancelFriendRequest({
                senderId: user.id,
                receiverId: item.id,
              });
              setListRequest((prev) => prev.filter((r) => r.id !== item.id));
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Lỗi chưa rõ");
            }
          },
        },
      ]
    );
  };

  // Hiển thị danh sách lời mời kết bạn
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item_container}
      onPress={() => handleViewProfile(item)}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {item.full_name}
        </Text>
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
      {listRequest.length === 0 ? (
        <View>
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Không có lời mời kết bạn nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={listRequest}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
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
    Alert.alert(
      "Cài đặt lời mời kết bạn",
      "Chức năng này chưa được phát triển",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 40, backgroundColor: "white" }}>
      <StatusBar style="dark" />
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 50,
          backgroundColor: "#fff",
          justifyContent: "space-between",
          paddingRight: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <TouchableOpacity onPress={onClose}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>

          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
            Lời mời kết bạn
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleOpenSettingRequest()}>
          <Image source={settingIcon} style={{ height: 25, width: 25 }} />
        </TouchableOpacity>
        {/* <IconButton
          style={{ position: "absolute", right: 0 }}
          icon={"cog-outline"}
          size={20}
          onPress={() => handleOpenSettingRequest()}
        /> */}
      </View>

      {/* List Friend Request */}
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
            <RequestRecieve />
          </TabView.Item>
          <TabView.Item>
            <RequestSend />
          </TabView.Item>
        </TabView>
      </SafeAreaView>
    </View>
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
