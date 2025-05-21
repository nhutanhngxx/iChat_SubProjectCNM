import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderViewProfile from "../header/HeaderViewProfile";
import { UserContext } from "../../config/context/UserContext";
import { getHostIP } from "../../services/api";
import friendService from "../../services/friendService";
import Constants from "expo-constants";

const ViewProfile = ({ route }) => {
  // const API_iChat = `http://${getHostIP()}:5001/api`;
  const API_iChat = `${Constants.expoConfig.extra.apiUrl}/api`;
  const navigation = useNavigation();
  const { foundUser } = route.params || {};
  const { user } = useContext(UserContext);
  const [isFriend, setIsFriend] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);

  const checkFriendship = async () => {
    try {
      const friends = await friendService.getFriendListByUserId(user.id);
      const isUserFriend = friends.some(
        (friend) => friend.id === foundUser.id || friend._id === foundUser.id
      );
      setIsFriend(isUserFriend);
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái bạn bè:", error);
    }
  };

  useEffect(() => {
    checkFriendship();
  }, []);

  const handleSendMessage = () => {
    const chat = {
      id: foundUser._id,
      name: foundUser.full_name,
      avatar: { uri: foundUser.avatar_path },
      chatType: "private",
    };
    navigation.navigate("Chatting", { chat });
  };

  const handleAddFriend = async () => {
    try {
      const resp = await friendService.sendFriendRequest({
        senderId: user.id,
        receiverId: foundUser._id,
      });
      setHasSentRequest(true);
      Alert.alert("Thông báo", "Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      Alert.alert("Không thể gửi lời mời kết bạn. Vui lòng thử lại sau.");
    }
  };

  const handleCancelRequest = async () => {
    try {
      const resp = await friendService.cancelFriendRequest({
        senderId: user.id,
        receiverId: foundUser._id,
      });
      if (resp.status === "ok") {
        setHasSentRequest(false);
        Alert.alert("Thông báo", "Đã thu hồi lời mời kết bạn!");
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi lời mời kết bạn:", error);
      Alert.alert(
        "Thông báo",
        "Không thể thu hồi lời mời kết bạn. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderViewProfile />
      <View
        style={{
          height: 200,
          width: "100%",
        }}
      >
        <Image
          source={{ uri: foundUser?.cover_path || user.cover_path }}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View style={{ alignItems: "center", gap: 20, top: -100 }}>
        <Image source={{ uri: foundUser.avatar_path }} style={styles.avatar} />
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {foundUser.full_name}
        </Text>

        <View style={styles.buttonContainer}>
          {foundUser.id !== user.id && (
            <>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleSendMessage}
              >
                <Text style={styles.buttonText}>Nhắn tin</Text>
              </TouchableOpacity>

              {!isFriend && !hasSentRequest && (
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={handleAddFriend}
                >
                  <Text style={styles.buttonText}>Kết bạn</Text>
                </TouchableOpacity>
              )}

              {!isFriend && hasSentRequest && (
                <TouchableOpacity
                  style={styles.cancelRequestButton}
                  onPress={handleCancelRequest}
                >
                  <Text style={styles.buttonText}>Thu hồi</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Không có hoạt động nào. Bắt đầu một cuộc trò chuyện mới</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  messageButton: {
    backgroundColor: "#0084ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addFriendButton: {
    backgroundColor: "#44bd32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  cancelRequestButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

export default ViewProfile;
