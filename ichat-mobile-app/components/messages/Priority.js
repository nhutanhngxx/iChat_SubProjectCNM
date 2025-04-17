import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";
import userService from "../../services/userService";
import messageService from "../../services/messageService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import friendService from "../../services/friendService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow();
};

const Priority = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(UserContext);
  const [chatList, setChatList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [allUser, setAllUser] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const longPressTimeout = useRef(null);
  const isLongPress = useRef(false);

  // Nhận selectedChat từ SearchScreen
  const selectedChat = route.params?.selectedChat || null;

  // console.log("Selected chat: ", selectedChat);
  // console.log("Route params: ", route.params);

  // Gộp danh sách chat và group chat và sắp xếp theo thời gian tin nhắn cuối cùng
  const listChat = chatList.concat(groupList);
  listChat.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAllUser();
        const friends = await friendService.getFriendListByUserId(user.id);
        setFriendList(friends);
        if (response) {
          setAllUser(response);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  // Lọc lại dữ liệu tin nhắn theo từng người dùng
  const formatChatList = (messages, allUser) => {
    if (!Array.isArray(messages)) return [];
    if (!Array.isArray(friendList) || friendList.length === 0) return [];

    const chatMap = new Map();

    messages.forEach((msg) => {
      if (msg.chat_type === "private") {
        // Bỏ qua tin nhắn đã bị xóa với user hiện tại
        if (msg.isdelete?.includes(user.id)) {
          return;
        }

        const chatUserId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        const isFriend = friendList.some(
          (friend) => friend.id === chatUserId || friend._id === chatUserId
        );

        if (isFriend) {
          const chatUser = allUser.find((u) => u._id === chatUserId);
          const fullName = chatUser ? chatUser.full_name : "Người dùng ẩn danh";
          const avatarPath =
            chatUser?.avatar_path ||
            "https://i.ibb.co/9k8sPRMx/best-seller.png";
          const lastMessageTime = new Date(msg.timestamp).getTime();
          const timeDiff = getTimeAgo(lastMessageTime);

          // Kiểm tra xem đã có chat trong Map chưa
          const existingChat = chatMap.get(chatUserId);

          // Chỉ cập nhật nếu tin nhắn này mới hơn tin nhắn cuối cùng hiện tại
          if (!existingChat || lastMessageTime > existingChat.lastMessageTime) {
            chatMap.set(chatUserId, {
              id: chatUserId,
              name: fullName,
              lastMessage:
                msg.type === "image"
                  ? "Hình ảnh"
                  : msg.type === "file"
                  ? "Tệp đính kèm"
                  : msg.content,
              lastMessageTime: lastMessageTime,
              time: timeDiff,
              avatar: { uri: avatarPath },
              chatType: "private",
              unreadCount: existingChat ? existingChat.unreadCount : 0, // Giữ nguyên số tin nhắn chưa đọc
            });
          }
        }
      }
    });

    return Array.from(chatMap.values());
  };

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

  const fetchChatList = async () => {
    try {
      const response = await messageService.getMessagesByUserId(user.id);
      let formattedChats = formatChatList(response, allUser);

      // Nếu có selectedChat và nó không tồn tại trong chatList, thêm vào
      if (
        selectedChat &&
        !formattedChats.some((chat) => chat.id === selectedChat.id)
      ) {
        formattedChats = [
          {
            ...selectedChat,
            lastMessage: "", // Không có tin nhắn gần đây
            lastMessageTime: Date.now(), // Sử dụng thời gian hiện tại để xếp đầu
            time: getTimeAgo(Date.now()),
          },
          ...formattedChats,
        ];
      }

      setChatList(formattedChats);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chat:", error);
    }
  };

  useEffect(() => {
    if (allUser.length === 0 || !user?.id) return;
    fetchChatList();
  }, [user, allUser]);

  useEffect(() => {
    if (!user?.id) return;

    // Gọi fetch lần đầu tiên
    fetchChatList();

    // Thiết lập interval để fetch tin nhắn mới mỗi 1 giây
    const interval = setInterval(fetchChatList, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [user, allUser]);

  // Tự động mở Chatting nếu có selectedChat
  useEffect(() => {
    if (selectedChat) {
      handleOpenChatting(selectedChat);
      // Xóa selectedChat khỏi route params để tránh mở lại
      navigation.setParams({ selectedChat: undefined });
    }
  }, [selectedChat]);

  // Cập nhật tin nhắn thành "viewed" khi mở cuộc trò chuyện
  const markMessagesAsViewed = async (senderId) => {
    try {
      const response = await messageService.updateMessagesViewedStatus({
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

  const handlePress = (item) => {
    if (!isLongPress.current) {
      handleOpenChatting(item);
    }
    isLongPress.current = false;
  };

  const handleLongPress = (item) => {
    isLongPress.current = true;
    setSelectedItem(item);
    setShowOptions(true);
  };

  const handlePressIn = (item) => {
    longPressTimeout.current = setTimeout(() => {
      handleLongPress(item);
    }, 200);
  };

  const handlePressOut = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity
        style={[
          styles.container,
          selectedItem?.id === item.id && showOptions && styles.selectedItem,
        ]}
        onPress={() => handlePress(item)}
        onPressIn={() => handlePressIn(item)}
        onPressOut={handlePressOut}
        delayLongPress={200}
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

  const handleDeleteChat = async (chatId) => {
    setShowOptions(false);
    try {
      // Lấy tất cả tin nhắn giữa 2 người
      const messages = await messageService.getPrivateMessages({
        userId: user.id,
        chatId,
      });
      const chatMessages = messages.filter(
        (msg) =>
          (msg.sender_id === chatId && msg.receiver_id === user.id) ||
          (msg.sender_id === user.id && msg.receiver_id === chatId)
      );

      // Xóa từng tin nhắn một
      for (const message of chatMessages) {
        await messageService.softDeleteMessagesForUser(user.id, message._id);
      }

      // Cập nhật lại danh sách chat
      setChatList((prevChats) =>
        prevChats.filter((chat) => chat.id !== chatId)
      );

      // Đóng modal
      setShowOptions(false);

      // Thông báo thành công
      Alert.alert("Thông báo", "Đã xóa cuộc trò chuyện thành công");
    } catch (error) {
      console.error("Lỗi khi xóa cuộc trò chuyện:", error);
      Alert.alert(
        "Thông báo",
        "Không thể xóa cuộc trò chuyện. Vui lòng thử lại sau."
      );
    }
  };

  const renderOptionsModal = () => (
    <Modal
      transparent={true}
      visible={showOptions}
      onRequestClose={() => setShowOptions(false)}
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowOptions(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setShowOptions(false);
            }}
          >
            <Text>Đánh dấu chưa đọc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setShowOptions(false);
            }}
          >
            <Text>Ghim cuộc trò chuyện</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, styles.deleteOption]}
            onPress={() => {
              Alert.alert(
                "Xác nhận",
                "Bạn có chắc chắn muốn xóa cuộc trò chuyện này?",
                [
                  {
                    text: "Hủy",
                    style: "cancel",
                  },
                  {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => handleDeleteChat(selectedItem.id),
                  },
                ]
              );
            }}
          >
            <Text style={styles.deleteText}>Xóa cuộc trò chuyện</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.wrapper}>
      {listChat.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Hiện không có cuộc trò chuyện nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listChat}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItem({ item })}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        />
      )}
      {renderOptionsModal()}
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
  selectedItem: {
    backgroundColor: "#f0f0f0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "75%",
    gap: 15,
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: "#ff4d4f",
  },
});

export default Priority;
