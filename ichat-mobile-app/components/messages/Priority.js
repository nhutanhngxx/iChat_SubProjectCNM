import React, { useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { NetworkInfo } from "react-native-network-info";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import groupService from "../../services/groupService";

// Tính thời gian
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Tiếng việt nè

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow(); // Hiển thị "x phút trước"
};

const Priority = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [chatList, setChatList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [allUser, setAllUser] = useState([]);

  const API_iChat = "http://172.20.10.5:5001";

  // Gộp danh sách chat và group chat và sắp xếp theo thời gian tin nhắn cuối cùng
  const listChat = chatList.concat(groupList);
  listChat.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_iChat}/users`);

      if (response.data.status === "ok" && Array.isArray(response.data.users)) {
        setAllUser(response.data.users);
      } else {
        console.error("Lỗi: API trả về dữ liệu không hợp lệ", response.data);
        setAllUser([]); // Gán rỗng nếu API lỗi
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUser([]); // Gán rỗng nếu lỗi
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lấy danh sách group chat của người dùng
  useEffect(() => {
    if (!user?.id) return;
    const fetchGroupList = async () => {
      const groups = await groupService.getAllGroupsByUserId(user.id);
      setGroupList(groups);
    };
    fetchGroupList();
    const interval = setInterval(fetchGroupList, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (allUser.length === 0 || !user?.id) return;
    fetchChatList();
  }, [user, allUser]);

  const fetchChatList = async () => {
    try {
      const response = await axios.get(`${API_iChat}/messages/${user.id}`);

      if (response.data.status === "ok" && Array.isArray(response.data.data)) {
        setChatList(formatChatList(response.data.data, allUser));
      } else {
        console.error("API không trả về dữ liệu hợp lệ:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chat:", error);
    }
  };

  // Lọc lại dữ liệu tin nhắn theo từng người dùng
  const formatChatList = (messages, allUser) => {
    if (!Array.isArray(messages)) return [];
    const chatMap = new Map();
    messages.forEach((msg) => {
      if (msg.chat_type === "private") {
        const chatUserId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const chatUser = allUser.find((u) => u._id === chatUserId);
        const fullName = chatUser ? chatUser.full_name : "Người dùng ẩn danh";
        const avatarPath =
          chatUser?.avatar_path || "https://i.ibb.co/9k8sPRMx/best-seller.png";
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
            avatar: { uri: avatarPath },
          });
        }
      } else return;
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
      fetchChatList();
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [user, allUser]);

  // Cập nhật tin nhắn thành "viewed" khi mở cuộc trò chuyện
  const markMessagesAsViewed = async (senderId) => {
    try {
      const response = await axios.put(`${API_iChat}/messages/viewed`, {
        receiverId: user.id,
        senderId,
      });

      console.log(response.data.message);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái tin nhắn:", error);
    }
  };

  const handleOpenChatting = (chat) => {
    markMessagesAsViewed(chat.id);
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
          data={listChat}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
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

export default Priority;
