import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { NetworkInfo } from "react-native-network-info";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import messageService from "../../services/messageService";
import groupService from "../../services/groupService";

const Chatting = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const { chat } = route.params || {};
  const flatListRef = useRef(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const [ipAddress, setIpAddress] = useState("");
  useEffect(() => {
    NetworkInfo.getIPAddress().then((ip) => {
      setIpAddress(ip);
    });
  }, []);

  const API_iChat = "http://172.20.10.5:5001";

  // Hàm lấy tên thành viên từ ID để hiển thị trên tin nhắn nhóm
  const getMemberName = useCallback(
    (memberId) => {
      const member = groupMembers.find((m) => m._id === memberId);
      return member?.full_name || "Unknown";
    },
    [groupMembers]
  );

  // Hiển thị modal khi ấn giữ tin nhắn
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  // Copy tin nhắn
  const handleCopyMessage = () => {
    Clipboard.setString(selectedMessage?.content);
    setModalVisible(false);
  };

  // Thu hồi tin nhắn (Xóa nội dung tin nhắn đã gửi)
  const handleRecallMessage = async () => {
    if (!selectedMessage) return;

    try {
      const response = await axios.put(
        `${API_iChat}/recall/${selectedMessage._id}`
      );

      if (response.data?.status === "ok") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === selectedMessage._id
              ? { ...msg, content: "Tin nhắn đã được thu hồi" }
              : msg
          )
        );
      } else {
        console.error("Thu hồi tin nhắn thất bại:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    } finally {
      setModalVisible(false);
    }
  };

  if (chat?.chatType === "group") {
    useEffect(() => {
      const fetchMessages = async () => {
        const messages = await messageService.getMessagesByGroupId(chat.id);
        const members = await groupService.getGroupMembers(chat.id);
        setMessages(messages);
        setGroupMembers(members);
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
      // }
    }, [user, chat]);
  } else {
    useEffect(() => {
      if (chat?.id && user?.id) {
        const fetchMessages = async () => {
          try {
            const response = await axios.get(
              `${API_iChat}/messages/${user.id}/${chat.id}`
            );
            if (response.data.status === "ok") {
              setMessages(response.data.data);
            }
          } catch (error) {
            console.error("Lỗi khi lấy tin nhắn:", error);
          }
        };
        const interval = setInterval(fetchMessages, 100);
        return () => clearInterval(interval);
      }
    }, [user, chat]);
  }

  // Click vào để reply
  const handleReply = (message) => {
    setReplyMessage(message);
    setModalVisible(false); // Ẩn modal sau khi chọn reply
  };

  // Tắt Tabbar ngay sau khi vào màn hình Chatting
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      });
    };
  }, []);

  // Cuộn xuống cuối khi có tin nhắn mới ngay lập tức
  // useEffect(() => {
  //   if (flatListRef.current && messages.length > 0) {
  //     flatListRef.current.scrollToEnd({ animated: false });
  //   }
  // }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const newMessage = {
          sender_id: user.id,
          receiver_id: chat.id,
          content: inputMessage,
          type: "text",
          chat_type: chat?.chatType === "group" ? "group" : "private",
          reply_to: replyMessage ? replyMessage._id : null,
        };

        const response = await axios.post(
          `${API_iChat}/messages/reply`,
          newMessage
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          response.data.newMessage,
        ]);

        // Xóa input và tin nhắn đang reply
        setInputMessage("");
        setReplyMessage(null);
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header của Chatting */}
      <View style={styles.chatHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>

          <View style={{ marginLeft: 10, gap: 2 }}>
            <Text style={styles.name}>{chat.name}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>
              {chat.status === "Online" ? "Đang hoạt động" : "Ngoại tuyến"}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
            paddingRight: 10,
          }}
        >
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/phone-call.png")}
              style={styles.iconsInHeader}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/video.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Option", {
                id: chat.id,
                name: chat.name,
                avatar: chat.avatar,
              })
            }
          >
            <Image
              source={require("../../assets/icons/option.png")}
              style={styles.iconsInHeader}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tin nhắn sẽ được hiển thị ở vùng nay */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isLastMessage = index === messages.length - 1;
            const isMyMessage = item.sender_id === user.id;
            const isRecalled = item.content === "Tin nhắn đã được thu hồi";
            const repliedMessage = item.reply_to
              ? messages.find((msg) => msg._id === item.reply_to)
              : null;
            return (
              <TouchableOpacity
                onLongPress={() => handleLongPress(item)}
                style={[
                  styles.message,
                  item.sender_id === user.id
                    ? styles.myMessage
                    : styles.theirMessage,
                ]}
              >
                {/* Tên người gửi */}
                {!isMyMessage && chat.chatType === "group" && (
                  <Text style={styles.replySender}>
                    {getMemberName(item.sender_id)}
                  </Text>
                )}
                {/* Hiển thị tin nhắn Reply => Hiển thị tin nhắn gốc trước */}
                {repliedMessage && (
                  <View style={styles.replyContainer}>
                    <Text style={styles.replySender}>
                      {repliedMessage.sender_id === user.id
                        ? "Bạn"
                        : getMemberName(repliedMessage.sender_id)}
                      :
                    </Text>
                    <Text
                      style={styles.replyText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {repliedMessage.content}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isRecalled && styles.recalledText,
                  ]}
                >
                  {item.content}
                </Text>
                {/* Hiển thị thời gian hh:mm gửi tin nhắn */}
                {isLastMessage && (
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                )}
                {/* Hiển thị trạng thái của tin nhắn: Đã gửi, Đã nhận, Đã xem */}
                {isLastMessage && item.sender_id === user.id && (
                  <Text style={styles.status}>
                    {item.status === "sent"
                      ? "Đã gửi"
                      : item.status === "received"
                      ? "Đã nhận"
                      : "Đã xem"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          } // Cuộn khi nội dung thay đổi
          // onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })} // Cuộn tin nhắn mới nhất
        />

        {/* Modal Thao Tác Tin Nhắn */}
        <Modal visible={modalVisible} transparent animationType="none">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View
                  style={[
                    styles.row,
                    {
                      backgroundColor: "white",
                      width: "100%",
                      borderRadius: 10,
                      padding: 10,
                    },
                  ]}
                >
                  <TouchableOpacity>
                    <Image
                      source={require("../../assets/icons/emoji-haha.png")}
                      style={styles.iconEmoji}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      source={require("../../assets/icons/emoji-love.png")}
                      style={styles.iconEmoji}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      source={require("../../assets/icons/emoji-cry.png")}
                      style={styles.iconEmoji}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      source={require("../../assets/icons/emoji-surprised.png")}
                      style={styles.iconEmoji}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      source={require("../../assets/icons/emoji-angry.png")}
                      style={styles.iconEmoji}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: "white",
                    width: "100%",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleReply(selectedMessage)}
                    >
                      <Image
                        source={require("../../assets/icons/reply-message.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Trả lời</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => console.log("Chuyển tiếp tin nhắn")}
                    >
                      <Image
                        source={require("../../assets/icons/forward-message.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Chuyển tiếp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => console.log("Ghim tin nhắn")}
                    >
                      <Image
                        source={require("../../assets/icons/pin.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Ghim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRecallMessage(selectedMessage)}
                    >
                      <Image
                        source={require("../../assets/icons/recall.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Thu hồi</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => console.log("Xem chi tiết tin nhắn")}
                    >
                      <Image
                        source={require("../../assets/icons/details.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => console.log("Lưu vào Cloud")}
                    >
                      <Image
                        source={require("../../assets/icons/save-cloud.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Lưu vào Cloud</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleCopyMessage}
                    >
                      <Image
                        source={require("../../assets/icons/copy.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Sao chép</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => console.log("Xóa tin nhắn vĩnh viễn")}
                    >
                      <Image
                        source={require("../../assets/icons/delete-message.png")}
                        style={styles.icon}
                      />
                      <Text style={styles.modalOption}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Hiển thị tin nhắn gốc khi ĐANG TRẢ LỜI */}
        {replyMessage && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyPreviewText}>
              Đang trả lời tin nhắn của {}: {replyMessage.content}
            </Text>
            <TouchableOpacity onPress={() => setReplyMessage(null)}>
              <Text style={styles.cancelReply}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thanh soạn/gửi tin nhắn */}
        <View style={styles.inputContainer}>
          <Image
            source={require("../../assets/icons/gif.png")}
            style={{ width: 30, height: 30 }}
          />
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Tin nhắn"
          />
          {!inputMessage.trim() ? (
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/microphone.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          ) : null}
          {!inputMessage.trim() ? (
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/image.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          ) : null}
          {inputMessage.trim() ? (
            <TouchableOpacity onPress={sendMessage}>
              <Image
                source={require("../../assets/icons/send.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    height: 50,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "#E4E8F3",
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D2EFFD",
    borderWidth: 1,
    borderColor: "#C5DDE5",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  replyContainer: {
    backgroundColor: "#f0f0f0",
    borderLeftWidth: 2,
    borderLeftColor: "#007AFF",
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  replySender: {
    fontSize: 16,
    paddingBottom: 3,
    color: "#F75E40",
  },
  replyText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  messageText: {
    fontSize: 16,
    paddingVertical: 3,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  replyPreviewText: {
    flex: 1,
    fontStyle: "italic",
    color: "#555",
  },
  cancelReply: {
    color: "red",
    marginLeft: 10,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    backgroundColor: "white",
    gap: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    padding: 10,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  iconsInHeader: {
    width: 18,
    height: 18,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    alignSelf: "flex-start",
    marginTop: 2,
    opacity: 0.8,
    paddingTop: 5,
  },
  status: {
    fontSize: 12,
    color: "blue",
    alignSelf: "flex-end",
    marginTop: 2,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeModal: { fontSize: 18, color: "red", marginTop: 10, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  modalContent: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
  icon: {
    width: 25,
    height: 25,
  },
  modalOption: {
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
    opacity: 0.8,
  },
  iconEmoji: {
    width: 40,
    height: 40,
  },
  recalledMessage: {
    backgroundColor: "#f0f0f0", // Màu xám nhạt
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  recalledText: {
    fontStyle: "italic",
    color: "#888", // Màu xám nhạt cho nội dung tin nhắn thu hồi
  },
});

export default Chatting;
