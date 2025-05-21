import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import friendService from "../../services/friendService";
import { getHostIP } from "../../services/api";
import { StatusBar } from "expo-status-bar";
import messageService from "../../services/messageService";
import axios from "axios";
import Constants from "expo-constants";

const ForwardMessageScreen = () => {
  // const API_iChat = `http://${getHostIP()}:5001/api/messages`;
  const API_iChat = `${Constants.expoConfig.extra.apiUrl}/api/messages`;
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(UserContext);
  const { message } = route.params;
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [friends, setFriends] = useState([]);

  // Chọn bạn bè để gửi tin nhắn
  const toggleSelectFriend = (id) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendService.getFriendListByUserId(user.id);
        setFriends(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    };
    fetchFriends();
  }, []);

  // Chuyển tiếp tin nhắn
  // const handleForwardMessage = async () => {
  //   if (selectedFriendIds.length === 0) {
  //     Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người nhận.");
  //     return;
  //   }

  //   try {
  //     for (const receiverId of selectedFriendIds) {
  //       await messageService.forwardMessage(message._id, receiverId, user.id);
  //     }

  //     Alert.alert("Thông báo", "Tin nhắn đã được chuyển tiếp thành công.");
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Lỗi khi chuyển tiếp:", error);
  //     Alert.alert("Lỗi", "Không thể chuyển tiếp đến một số người.");
  //   }
  // };

  const handleForwardMessage = async () => {
    if (selectedFriendIds.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người nhận.");
      return;
    }

    try {
      const successfulForwards = [];
      const failedForwards = [];

      for (const receiverId of selectedFriendIds) {
        try {
          // Tạo FormData với thông tin tin nhắn
          const formData = new FormData();
          formData.append("sender_id", user.id);
          formData.append("receiver_id", receiverId);
          formData.append("content", message.content);
          formData.append("type", message.type);
          formData.append("chat_type", "private");
          formData.append("forwarded", "true");
          formData.append("original_message_id", message._id);

          // Nếu là hình ảnh hoặc file, thêm vào formData
          if (message.type === "image" || message.type === "file") {
            formData.append("file", {
              uri: message.content,
              type:
                message.type === "image"
                  ? "image/jpeg"
                  : "application/octet-stream",
              name: message.fileName || "forwarded_file",
            });
          }

          const response = await axios.post(
            `${API_iChat}/send-message`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.status === "error") {
            throw new Error(response.data.message);
          }

          successfulForwards.push(receiverId);
        } catch (err) {
          console.error("Lỗi khi chuyển tiếp cho người dùng:", receiverId, err);
          failedForwards.push(receiverId);
        }
      }

      if (successfulForwards.length > 0) {
        const successMessage = `Tin nhắn đã được chuyển tiếp thành công đến ${successfulForwards.length} người.`;
        if (failedForwards.length > 0) {
          Alert.alert(
            "Thông báo",
            `${successMessage}\nKhông thể chuyển tiếp đến ${failedForwards.length} người.`
          );
        } else {
          Alert.alert("Thành công", successMessage);
        }
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn đến bất kỳ ai.");
      }
    } catch (error) {
      console.error("Lỗi khi chuyển tiếp:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chuyển tiếp tin nhắn.");
    }
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriendIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleSelectFriend(item.id)}
      >
        <Image source={{ uri: item.avatar_path }} style={styles.avatar} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.friendName}>{item.full_name}</Text>
          <Text
            style={[
              styles.friendStatus,
              { color: item.status === "Online" ? "green" : "gray" },
            ]}
          >
            {item.status}
          </Text>
        </View>
        {isSelected && (
          <Image
            source={require("../../assets/icons/close.png")}
            style={{ width: 20, height: 20, tintColor: "#007bff" }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View
        style={
          Platform.OS === "ios"
            ? {
                flexDirection: "row",
                alignItems: "flex-end",
                width: "100%",
                padding: 10,
                height: 90,
                backgroundColor: "#007bff",
              }
            : {
                flexDirection: "row",
                alignItems: "flex-end",
                width: "100%",
                paddingHorizontal: 10,
                height: 80,
                backgroundColor: "#007bff",
              }
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={{
                width: 25,
                height: 25,
                tintColor: "white",
              }}
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>
            Chuyển tiếp tin nhắn
          </Text>
        </View>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFriend}
        style={styles.list}
      />

      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          padding: 10,
          zIndex: 10,
          elevation: 10,
        }}
      >
        <Text style={styles.messagePreview}>
          {message.type === "text"
            ? message.content
            : message.type === "image"
            ? "Hình ảnh"
            : "Tệp tin"}
        </Text>

        <TouchableOpacity
          style={styles.forwardButton}
          onPress={handleForwardMessage}
        >
          <Text style={styles.buttonText}>
            Chuyển tiếp ({selectedFriendIds.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForwardMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  messagePreview: {
    fontStyle: "italic",
    color: "#555",
    marginBottom: 15,
  },
  list: {
    flexGrow: 0,
    marginBottom: 20,
  },
  friendItem: {
    padding: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  friendItemSelected: {
    backgroundColor: "#e0f0ff",
  },
  friendName: {
    fontSize: 16,
  },
  forwardButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
