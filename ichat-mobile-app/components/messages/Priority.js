import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  AppState,
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
import socketService from "../../services/socketService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

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

  const getTimeAgo = (timestamp) => {
    return dayjs(timestamp).fromNow();
  };

  useEffect(() => {
    // Lắng nghe sự kiện nhận tin nhắn mới
    socketService.onReceiveMessage((messageData) => {
      if (!messageData) return;

      setChatList((prevChats) => {
        return prevChats
          .map((chat) => {
            // Kiểm tra nếu tin nhắn thuộc về chat này
            if (
              chat.id === messageData.sender_id ||
              chat.id === messageData.receiver_id
            ) {
              // Định dạng nội dung tin nhắn cuối
              let lastMessageContent = messageData.content;
              if (messageData.type === "file") {
                lastMessageContent = "Tệp đính kèm";
              } else if (messageData.type === "image") {
                lastMessageContent = "Hình ảnh";
              }

              // Cập nhật thông tin chat
              return {
                ...chat,
                lastMessage: lastMessageContent,
                lastMessageTime: new Date(messageData?.timestamp).getTime(),
                time: getTimeAgo(new Date(messageData?.timestamp)),
              };
            }
            return chat;
          })
          .sort((a, b) => b.lastMessageTime - a.lastMessageTime); // Sắp xếp lại theo thời gian
      });
    });

    // Cleanup function
    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  // Nhận selectedChat từ SearchScreen
  const selectedChat = route.params?.selectedChat || null;

  // Gộp danh sách chat và group chat và sắp xếp theo thời gian tin nhắn cuối cùng
  const listChat = chatList.concat(groupList);
  listChat.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  // Hàm helper để format nội dung tin nhắn
  const formatMessageContent = (msg) => {
    if (!msg) return "";
    switch (msg.type) {
      case "file":
        return "[Tệp đính kèm]";
      case "image":
        return "[Hình ảnh]";
      case "video":
        return "[Video]";
      case "audio":
        return "[Tệp âm thanh]";
      default:
        return msg.content;
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadAllData = async () => {
      try {
        const [usersResponse, friendsResponse] = await Promise.all([
          userService.getAllUser(),
          friendService.getFriendListByUserId(user.id),
          // groupService.getAllGroupsByUserId(user.id),
        ]);
        setAllUser(usersResponse || []);
        setFriendList(friendsResponse || []);
        // setGroupList(groupsResponse || []);

        const messagesResponse = await messageService.getMessagesByUserId(
          user.id
        );
        const formattedChats = formatChatList(
          messagesResponse,
          usersResponse,
          friendsResponse
        );

        let finalChats = [...formattedChats];
        if (
          selectedChat &&
          !formattedChats.some((chat) => chat.id === selectedChat.id)
        ) {
          finalChats = [
            {
              ...selectedChat,
              lastMessage: "",
              lastMessageTime: Date.now(),
              time: getTimeAgo(Date.now()),
            },
            ...formattedChats,
          ];
        }

        setChatList(finalChats);

        // Lấy danh sách nhóm
        const groupsResponse = await groupService.getAllGroupsByUserId(user.id);
        if (groupsResponse) {
          // Format tin nhắn cuối cùng cho mỗi nhóm
          const formattedGroups = await Promise.all(
            groupsResponse.map(async (group) => {
              const groupMessages = await messageService.getMessagesByGroupId(
                group.id
              );
              // Lọc tin nhắn chưa bị xóa
              const availableMessages = groupMessages.filter(
                (msg) => !msg.isdelete?.includes(user.id)
              );
              const lastMessage =
                availableMessages[availableMessages.length - 1];

              if (lastMessage) {
                const sender = usersResponse.find(
                  (u) => u._id === lastMessage.sender_id
                );
                // Nếu đó là thông báo, thì không hiển thị tên người gửi
                if (lastMessage.type === "notify") {
                  return {
                    ...group,
                    lastMessage: formatMessageContent(lastMessage),
                    lastMessageTime: new Date(lastMessage.timestamp).getTime(),
                    time: getTimeAgo(new Date(lastMessage.timestamp)),
                  };
                } else {
                  // Nếu không phải thông báo, hiển thị tên người gửi
                  const senderName = sender ? sender.full_name : "Thành viên";
                  const content = formatMessageContent(lastMessage);

                  return {
                    ...group,
                    lastMessage: `${senderName}: ${content}`,
                    lastMessageTime: new Date(lastMessage.timestamp).getTime(),
                    time: getTimeAgo(new Date(lastMessage.timestamp)),
                  };
                }
              }

              return group;
            })
          );

          setGroupList(formattedGroups);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    loadAllData();

    const interval = setInterval(loadAllData, 3000); // Cập nhật 3 giây
    return () => clearInterval(interval);
  }, [user?.id, selectedChat]);

  // Tự động mở Chatting nếu có selectedChat
  useEffect(() => {
    if (selectedChat) {
      handleOpenChatting(selectedChat);
      // Xóa selectedChat khỏi route params để tránh mở lại
      navigation.setParams({ selectedChat: undefined });
    }
  }, [selectedChat]);

  // Lọc lại dữ liệu tin nhắn theo từng người dùng
  const formatChatList = (messages, allUser, friendListData, groupListData) => {
    if (!Array.isArray(messages)) return [];
    // if (!Array.isArray(friendList) || friendList.length === 0) return [];

    const friendList = friendListData || [];
    const groupList = groupListData || [];
    const chatMap = new Map();

    messages.forEach((msg) => {
      if (msg.chat_type === "private" && !msg.isdelete?.includes(user.id)) {
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
            "https://i.ibb.co/9k8sPRMx/best-seller.pnghttps://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png";
          const lastMessageTime = new Date(msg?.timestamp).getTime();
          const timeDiff = getTimeAgo(lastMessageTime);

          // Kiểm tra xem đã có chat trong Map chưa
          const existingChat = chatMap.get(chatUserId);

          // Chỉ cập nhật nếu tin nhắn này mới hơn tin nhắn cuối cùng hiện tại
          if (!existingChat || lastMessageTime > existingChat.lastMessageTime) {
            chatMap.set(chatUserId, {
              id: chatUserId,
              name: fullName,
              lastMessage: formatMessageContent(msg),
              lastMessageTime: lastMessageTime,
              time: timeDiff,
              avatar: { uri: avatarPath },
              chatType: "private",
              unreadCount: existingChat ? existingChat.unreadCount : 0,
            });
          }
        }
      }
    });
    return Array.from(chatMap.values());
  };

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

  const handleOpenChatting = async (chat) => {
    markMessagesAsViewed(chat.id);
    if (chat.chatType === "private") {
      try {
        // const friends = await friendService.getFriendListByUserId(user.id);
        const blockStatus = await friendService.checkBlockStatus(
          user.id,
          chat.id
        );

        // Xác định typeChat dựa trên trạng thái chặn
        let typeChat = "normal";

        if (blockStatus.isBlocked) {
          typeChat = "blocked";
        } else {
          // Kiểm tra xem có phải bạn bè không
          const isFriend = friendList.some(
            (friend) => friend.id === chat.id || friend._id === chat.id
          );

          if (!isFriend) {
            typeChat = "not-friend";
          }
        }

        navigation.navigate("Chatting", { chat, typeChat });
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái chặn:", error);
        navigation.navigate("Chatting", { chat });
      }
    } else {
      // Nếu là nhóm chat, mở bình thường
      navigation.navigate("Chatting", { chat });
    }
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
          <Image source={item.avatar} style={styles.avatar} />
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
          // keyExtractor={(item) => item.id.toString()}
          keyExtractor={(item, index) => `${item.chatType}_${item.id}_${index}`}
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
