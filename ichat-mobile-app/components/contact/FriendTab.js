import { useNavigation } from "@react-navigation/native";
import { Avatar } from "@rneui/themed";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Dimensions } from "react-native";
import { UserContext } from "../../config/context/UserContext";
import friendService from "../../services/friendService";

const FriendTab = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const [friendList, setFriendList] = useState([]);
  const [addRequest, setAddRequest] = useState(0);
  const { user } = useContext(UserContext);

  // Lấy danh sách lời mời kết bạn đã nhận
  useEffect(() => {
    if (!user?.id) return;
    const fetchFriendRequest = async () => {
      const requests = await friendService.getReceivedRequestsByUserId(user.id);
      setAddRequest(requests.length);
    };
    fetchFriendRequest();
    const interval = setInterval(fetchFriendRequest, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Lấy danh sách bạn bè và số lượng yêu cầu kết bạn
  useEffect(() => {
    if (!user?.id) return;
    const fetchFriendList = async () => {
      const friends = await friendService.getFriendListByUserId(user.id);
      // console.log("Friend List: ", friends);

      setFriendList(friends);
    };
    fetchFriendList();
    const interval = setInterval(fetchFriendList, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Mở cuộc trò chuyện
  const handleOpenChatting = (chat) => {
    // Chuẩn bị thông tin chat giống như trong Priority
    const chatInfo = {
      id: chat.id || chat._id,
      name: chat.full_name,
      avatar: {
        uri: chat.avatar_path || "https://i.ibb.co/9k8sPRMx/best-seller.png",
      },
      chatType: "private",
      lastMessageTime: Date.now(),
    };

    // Kiểm tra trạng thái block trước khi chuyển màn hình
    const checkBlockAndNavigate = async () => {
      try {
        const blockStatus = await friendService.checkBlockStatus(
          user.id,
          chatInfo.id
        );

        let typeChat = "normal";
        if (blockStatus.isBlocked) {
          typeChat = "blocked";
        }

        navigation.navigate("Chatting", {
          chat: chatInfo,
          typeChat,
        });
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái chặn:", error);
        navigation.navigate("Chatting", {
          chat: chatInfo,
          typeChat: "normal",
        });
      }
    };

    checkBlockAndNavigate();
  };

  // Render danh sách bạn bè
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleOpenChatting(item)}
      key={item.id}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {item.full_name}
        </Text>
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <Image
          source={require("../../assets/icons/phone-call.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Image
          source={require("../../assets/icons/video.png")}
          style={{ width: 25, height: 25, marginTop: 2 }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addRequest}
        onPress={() => navigation.navigate("FriendRequest")}
      >
        <Image
          source={require("../../assets/icons/request.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Text style={{ fontSize: 16 }}>
          Yêu cầu kết bạn
          <Text style={{ fontWeight: "bold" }}> ({addRequest})</Text>
        </Text>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={styles.activeButton}
          onPress={() => Alert.alert("Xem tất cả bạn bè")}
        >
          <Text style={styles.textActiveButton}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noActiveButton}
          onPress={() => Alert.alert("Xem tất cả bạn bè đang hoạt động")}
        >
          <Text>Đang hoạt động</Text>
        </TouchableOpacity>
      </View>

      {/* List Friends */}
      <View style={{ width: width - 40 }}>
        <FlatList
          data={friendList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: "100%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  addRequest: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  activeButton: {
    marginVertical: 10,
    backgroundColor: "skyblue",
    padding: 10,
    borderRadius: 10,
  },
  textActiveButton: {
    color: "white",
    fontWeight: "bold",
  },
  noActiveButton: {
    marginVertical: 10,
    backgroundColor: "#97979740",
    padding: 10,
    borderRadius: 10,
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  item_leftSide: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});

export default FriendTab;
