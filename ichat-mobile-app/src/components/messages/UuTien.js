import React, { useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "@/src/context/UserContext";
import axios from "axios";

// Tính thời gian
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Tiếng việt nè

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow(); // Hiển thị "X phút trước"
};

const UuTien = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [chatList, setChatList] = useState([]);
  const [allUser, setAllUser] = useState([]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await axios.get("http://192.168.1.51:5001/users");
      console.log("User data from API:", response.data);
      setAllUser(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (allUser.length === 0 || !user?.id) return;
    console.log("Fetching chat list for user ID:", user.id);
    fetchChatList();
  }, [user, allUser]);

  const fetchChatList = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.51:5001/messages/${user.id}`
      );

      if (response.data.status === "ok" && Array.isArray(response.data.data)) {
        setChatList(formatChatList(response.data.data, allUser));
      } else {
        console.error("API không trả về dữ liệu hợp lệ:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chat:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc lại dữ liệu tin nhắn theo từng người dùng
  const formatChatList = (messages, allUser) => {
    if (!Array.isArray(messages)) return [];

    const chatMap = new Map();

    messages.forEach((msg) => {
      const chatUserId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const chatUser = allUser.find((u) => u._id === chatUserId);
      const fullName = chatUser ? chatUser.full_name : "Người dùng ẩn danh";

      const lastMessageTime = new Date(msg.timestamp).getTime();
      const timeDiff = getTimeAgo(lastMessageTime);

      if (
        !chatMap.has(chatUserId) ||
        lastMessageTime > chatMap.get(chatUserId).lastMessageTime
      ) {
        chatMap.set(chatUserId, {
          id: chatUserId,
          name: fullName,
          lastMessage: msg.type === "image" ? "[Hình ảnh]" : msg.content,
          lastMessageTime: lastMessageTime,
          time: timeDiff,
          avatar: require("../../assets/images/avatars/avatar1.png"),
        });
      }
    });

    // return Array.from(chatMap.values());
    return Array.from(chatMap.values()).sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );
  };

  useEffect(() => {
    if (!user?.id) return;

    // Gọi fetch lần đầu tiên
    fetchChatList();

    // Thiết lập interval để fetch tin nhắn mới mỗi 5 giây
    const interval = setInterval(() => {
      console.log("Fetching chat list at:", new Date().toLocaleTimeString());
      fetchChatList();
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [user, allUser]);

  const handleOpenChatting = (chat) => {
    console.log("Received chat:", chat);
    console.log("Type of chat:", typeof chat);

    navigation.navigate("Chatting", { chat });
  };

  const renderItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => handleOpenChatting(item)}
      >
        <View style={styles.infoContainer}>
          {item.avatar && <Image source={item.avatar} style={styles.avatar} />}
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.lastMessage}</Text>
          </View>
        </View>
        <View>
          <Text>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      {chatList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Hiện không có cuộc trò chuyện nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            console.log("Rendering item:", item);
            return renderItem({ item });
          }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});

export default UuTien;
