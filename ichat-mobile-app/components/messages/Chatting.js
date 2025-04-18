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
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import axios from "axios";
import messageService from "../../services/messageService";
import groupService from "../../services/groupService";
import MessageInputBar from "../../components/messages/MessageInputBar";

import { getHostIP } from "../../services/api";
import friendService from "../../services/friendService";
import socketService from "../../services/socketService";
// import { SocketContext } from "../../config/context/SocketContext";

const renderReactionIcons = (reactions) => {
  const icons = {
    like: require("../../assets/icons/emoji-like.png"),
    love: require("../../assets/icons/emoji-love.png"),
    haha: require("../../assets/icons/emoji-haha.png"),
    wow: require("../../assets/icons/emoji-surprised.png"),
    sad: require("../../assets/icons/emoji-cry.png"),
    angry: require("../../assets/icons/emoji-angry.png"),
  };

  const counts = reactions.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.reactionsWrapper}>
      {Object.entries(counts).map(([type, count]) => (
        <View key={type} style={styles.reactionItem}>
          <Image source={icons[type]} style={{ width: 15, height: 15 }} />
        </View>
      ))}
    </View>
  );
};

const Chatting = ({ route }) => {
  const ipAdr = getHostIP();
  const API_iChat = `http://${ipAdr}:5001/api/messages/`;
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const { chat } = route.params || {};
  const flatListRef = useRef(null); // "friend" | "not-friend" | "blocked" dùng để kiểm tra trạng thái bạn bè giữa 2 người dùng
  const [typeChat, setTypeChat] = useState(route.params?.typeChat || "friend");
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  // Kiểm tra trạng thái chặn giữa 2 người dùng
  const [blockStatus, setBlockStatus] = useState({
    isBlocked: false,
    blockedByTarget: false,
    blockedByUser: false,
  });

  const [socketConnected, setSocketConnected] = useState(false);

  // Thêm useEffect để quản lý socket connection và events
  useEffect(() => {
    if (!user?.id || !chat?.id) return;

    // Tạo roomId cho chat
    const userIds = [user.id, chat.id].sort();
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;

    console.log("Joining room:", roomId);

    // Lắng nghe sự kiện kết nối
    socketService.connect(() => {
      console.log("Socket connected to room:", roomId);
      setSocketConnected(true);
    });

    // Join room
    socketService.joinRoom(roomId);

    // Lắng nghe tin nhắn mới
    socketService.onReceiveMessage((data) => {
      console.log("Received new message:", data);
      if (data.chatId === roomId) {
        setMessages((prevMessages) => {
          // Kiểm tra tin nhắn đã tồn tại chưa
          const messageExists = prevMessages.some(
            (msg) => msg._id === data._id
          );
          if (!messageExists) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
      }
    });

    // Gửi tin nhắn
    socketService.handleSendMessage((messageData, roomId) => {
      console.log("Sending message:", messageData);
      socketService.handleSendMessage(messageData, roomId);
    });

    socketService.handleRecallMessage((data) => {
      console.log("Recalled message event received:", data);
      if (data.chatId === roomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === data.messageId ? data : msg))
        );
      }
    });

    // Cleanup function
    return () => {
      console.log("Leaving room:", roomId);
      socketService.leaveRoom(roomId);
      socketService.removeAllListeners();
      socketService.disconect();
    };
  }, [user?.id, chat?.id]);

  const getFileNameFromUrl = (url) => {
    // Tách URL theo dấu '/' và lấy phần cuối cùng
    const fileName = url.split("/").pop();

    // Tách tên file theo dấu '-'
    const parts = fileName.split("-");

    // Loại bỏ các phần không cần thiết (mã ID, timestamp)
    parts.shift(); // Loại bỏ mã ID (như: "3fag")
    parts.shift(); // Loại bỏ timestamp (như: "1744646086633")

    // Nối lại các phần còn lại để lấy tên file đầy đủ
    return parts.join("-");
  };

  // Hàm chọn tệp từ thiết bị
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log("Đã chọn tệp:", result);

      if (result.assets !== null) {
        const file = {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: result.assets[0].mimeType || "application/octet-stream",
          size: result.assets[0].size,
        };
        setSelectedFile(file);
        console.log("File: ", file);
      }
    } catch (err) {
      console.error("Lỗi khi chọn tệp:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn tệp.");
    }
  };

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền bị từ chối",
        "Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Lỗi khi chọn ảnh:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

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
    const userIds = [user.id, chat.id].sort();
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;
    if (!selectedMessage) return;

    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }

    try {
      const response = await axios.put(
        `${API_iChat}/recall/${selectedMessage._id}`,
        {
          userId: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.data) {
        const recalledMessage = {
          ...response.data.data,
          chatId: roomId,
        };
        console.log(socketService.handleRecallMessage(recalledMessage));

        socketService.handleSendMessage(recalledMessage);
      }

      // if (response.data?.status === "ok") {
      //   setMessages((prevMessages) =>
      //     prevMessages.map((msg) =>
      //       msg._id === selectedMessage._id
      //         ? { ...msg, content: "Tin nhắn đã được thu hồi" }
      //         : msg
      //     )
      //   );
      // } else {
      //   console.error("Thu hồi tin nhắn thất bại:", response.data);
      // }
    } catch (error) {
      // console.error("Lỗi khi thu hồi tin nhắn:", error);
      Alert.alert("Thông báo", "Tin nhắn này không thể thu hồi.");
    } finally {
      setModalVisible(false);
    }
  };

  const handleReaction = async (reactionType) => {
    const userIds = [user.id, chat.id].sort();
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;

    if (!selectedMessage) return;

    if (typeChat !== "not-friend") {
      try {
        const response = await messageService.addReaction(
          selectedMessage._id,
          user.id,
          reactionType
        );

        console.log("Phản hồi từ server:", response.updatedMessage);
        // console.log("Room: ", roomId);

        if (response.updatedMessage) {
          socketService.handleAddReaction({
            chatId: roomId,
            messageId: selectedMessage._id,
            userId: user.id,
            reaction: reactionType,
          });
        }

        // if (response?.updatedMessage) {
        //   // Cập nhật lại toàn bộ object message theo kết quả từ server
        //   setMessages((prevMessages) =>
        //     prevMessages.map((msg) =>
        //       msg._id === selectedMessage._id ? response.updatedMessage : msg
        //     )
        //   );
        // }
      } catch (error) {
        console.error("Lỗi khi gửi reaction:", error);
        Alert.alert("Lỗi", "Không thể gửi reaction.");
      } finally {
        setModalVisible(false);
      }
    } else {
      Alert.alert(
        "Thông báo",
        "Bạn không thể gửi reaction trong cuộc trò chuyện này."
      );
      setModalVisible(false);
    }
  };

  // Load tin nhắn trò chuyện
  if (chat?.chatType === "private") {
    useEffect(() => {
      if (chat?.id && user?.id) {
        const fetchMessages = async () => {
          try {
            const response = await messageService.getPrivateMessages({
              userId: user.id,
              chatId: chat.id,
            });
            // Lọc tin nhắn trước khi set state
            const filteredMessages = response.filter((message) => {
              // Nếu không có mảng isdelete hoặc mảng rỗng thì hiển thị tin nhắn
              if (
                !Array.isArray(message.isdelete) ||
                message.isdelete.length === 0
              ) {
                return true;
              }
              // Không hiển thị tin nhắn nếu id người dùng nằm trong mảng isdelete
              return !message.isdelete.some(
                (id) => id === user.id || id === String(user.id)
              );
            });
            setMessages(filteredMessages);
          } catch (error) {
            console.error("Lỗi khi lấy tin nhắn:", error);
          }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 500);
        return () => clearInterval(interval);
      }
    }, [user, chat]);
  } else {
    useEffect(() => {
      // const fetchMessages = async () => {
      //   const messages = await messageService.getMessagesByGroupId(chat.id);
      //   const members = await groupService.getGroupMembers(chat.id);
      //   setMessages(messages);
      //   setGroupMembers(members);
      // };
      // fetchMessages();
      // const interval = setInterval(fetchMessages, 500);
      // return () => clearInterval(interval);
    }, [user, chat]);
  }

  // Click vào để reply
  const handleReply = (selectedMessage) => {
    setReplyMessage(selectedMessage);
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

  useEffect(() => {
    if (route.params?.typeChat) {
      setTypeChat(route.params.typeChat);
    }
  }, [route.params?.typeChat]);

  // Kiểm tra trạng thái chặn giữa 2 người dùng
  useEffect(() => {
    const checkIfBlocked = async () => {
      if (chat?.id && user?.id && chat.chatType === "private") {
        try {
          const status = await friendService.checkBlockStatus(user.id, chat.id);
          setBlockStatus(status);

          // Nếu người dùng bị chặn, thay đổi typeChat
          if (status.isBlocked) {
            // Cập nhật typeChat thành "blocked"
            setTypeChat("blocked");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra trạng thái chặn:", error);
        }
      }
    };

    checkIfBlocked();
  }, [chat, user]);

  const sendMessage = async () => {
    if (!socketService.connect()) {
      Alert.alert("Thông báo", "Đang kết nối lại với server...");
      return;
    }
    // Kiểm tra trạng thái trò chuyện
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể gửi tin nhắn cho ${chat.name} vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }

    try {
      // Tạo roomId cho chat
      const userIds = [user.id, chat.id].sort();
      const roomId = `chat_${userIds[0]}_${userIds[1]}`;

      // Gửi tin nhắn văn bản hoặc reply
      if (inputMessage.trim() || replyMessage) {
        console.log("Gửi tin nhắn văn bản/reply...");
        console.log("replyMessage:", replyMessage);

        const textMessage = {
          sender_id: user.id,
          receiver_id: chat.id,
          content: inputMessage.trim() || replyMessage.content,
          type: "text",
          chat_type: chat?.chatType === "group" ? "group" : "private",
          reply_to: replyMessage?._id || null,
        };

        const apiEndpoint = replyMessage
          ? `${API_iChat}/reply`
          : `${API_iChat}/send-message`;

        const textResponse = await axios.post(apiEndpoint, textMessage);

        console.log("Phản hồi từ server:", textResponse.data.data);

        if (textResponse.data.data) {
          const messageToSend = {
            ...textResponse.data.data,
            chatId: roomId,
          };
          console.log(socketService.handleSendMessage(messageToSend));

          socketService.handleSendMessage(messageToSend);
        }

        // Cập nhật danh sách tin nhắn // Tạm thời khóa lại
        // setMessages((prev) => [...prev, textResponse.data.message]);
        setInputMessage("");
        setReplyMessage(null);
        console.log("Gửi tin nhắn văn bản thành công");
      }

      // Gửi hình ảnh hoặc file nếu có
      if (selectedImage || selectedFile) {
        console.log("Chuẩn bị gửi hình ảnh/file...");
        const formData = new FormData();
        // Thêm ảnh vào FormData
        if (selectedImage) {
          console.log("Selected image path:", selectedImage);
          formData.append("image", {
            uri: selectedImage,
            name: `photo-${Date.now()}.jpg`,
            type: "image/jpeg",
          });
        }
        // Thêm file vào FormData
        if (selectedFile) {
          formData.append("file", {
            uri: selectedFile.uri,
            name: selectedFile.name || `file-${Date.now()}`,
            type: selectedFile.type || "application/octet-stream",
          });
        }
        // Thêm các thông tin khác
        formData.append("sender_id", user.id);
        formData.append("receiver_id", chat.id);
        formData.append(
          "type",
          selectedImage && selectedFile
            ? "media"
            : selectedImage
            ? "image"
            : "file"
        );
        formData.append(
          "chat_type",
          chat?.chatType === "group" ? "group" : "private"
        );

        // In formData
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const uploadResponse = await axios.post(
          `${API_iChat}/send-message`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          }
        );
        console.log("Phản hồi từ server:", uploadResponse.data.data);

        if (uploadResponse.data.data) {
          const messageToSend = {
            ...uploadResponse.data.data,
            chatId: roomId,
          };
          console.log(socketService.handleSendMessage(messageToSend));

          socketService.handleSendMessage(messageToSend);
        }

        // Xóa trạng thái ảnh/file sau khi gửi thành công
        setSelectedImage(null);
        setSelectedFile(null);
        console.log("Gửi hình ảnh/file thành công");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn/hình ảnh/file:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi tin nhắn hoặc tệp. Vui lòng thử lại."
      );
    }
  };

  const handleForwardMessage = async () => {
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message =
        "Bạn không thể chuyển tiếp tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể chuyển tiếp tin nhắn vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể chuyển tiếp tin nhắn vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }

    navigation.navigate("ForwardMessage", {
      message: selectedMessage,
    });

    setModalVisible(false);
  };

  // Hanlde xóa mềm- xóa tin nhắn 1 phía
  const handleSoftDelete = async () => {
    if (typeChat === "not-friend" || typeChat === "blocked") {
      let message = "Bạn không thể xóa tin nhắn trong cuộc trò chuyện này.";

      if (typeChat === "blocked") {
        if (blockStatus.blockedByTarget) {
          message = `Bạn không thể xóa tin nhắn vì bạn đã bị chặn.`;
        } else if (blockStatus.blockedByUser) {
          message = `Bạn không thể xóa tin nhắn vì bạn đã chặn người này.`;
        }
      }

      Alert.alert("Thông báo", message);
      return;
    }
    try {
      const response = await messageService.softDeleteMessagesForUser(
        user.id,
        selectedMessage._id
      );
      if (response.data !== null) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== selectedMessage._id)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa mềm tin nhắn:", error);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header của Chatting */}
      <View style={styles.chatHeader}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../../assets/icons/go-back.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>

            <View style={{ marginLeft: 10, gap: 2 }}>
              <Text style={styles.name}>{chat.name}</Text>
              {/* <Text style={{ fontSize: 12, color: "gray" }}>
                {chat.status === "Online" ? "Đang hoạt động" : "Ngoại tuyến"}
              </Text> */}
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
              onPress={() => {
                navigation.navigate("Option", {
                  id: chat.id,
                  name: chat.name,
                  avatar: chat.avatar,
                });
              }}
            >
              <Image
                source={require("../../assets/icons/option.png")}
                style={styles.iconsInHeader}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {typeChat === "blocked" && (
        <View
          style={
            Platform.OS === "ios"
              ? [styles.blockedContainer, { padding: 10 }]
              : [styles.blockedContainer, { padding: 5 }]
          }
        >
          <Text style={styles.blockedText}>
            {blockStatus.blockedByTarget
              ? `Bạn đã bị ${chat.name} chặn`
              : `Bạn đã chặn ${chat.name}`}
          </Text>
        </View>
      )}
      {typeChat === "not-friend" && (
        <View
          style={
            Platform.OS === "ios"
              ? [styles.blockedContainer, { padding: 10 }]
              : [styles.blockedContainer, { padding: 5 }]
          }
        >
          <Text style={styles.blockedText}>
            Bạn không thể gửi tin nhắn trong cuộc trò chuyện này.
          </Text>
        </View>
      )}

      {/* Tin nhắn sẽ được hiển thị ở vùng nay */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          // keyExtractor={(item) => item._id}
          keyExtractor={(item, index) => item._id?.toString() || `msg-${index}`}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isLastMessage = index === messages.length - 1;
            const isMyMessage = item.sender_id === user.id;
            const isRecalled = item.content === "Tin nhắn đã được thu hồi";
            const repliedMessage = item.reply_to
              ? messages.find((msg) => msg._id === item.reply_to)
              : null;
            return (
              <View>
                <TouchableOpacity
                  onLongPress={() => handleLongPress(item)}
                  delayLongPress={300}
                  style={[
                    styles.message,
                    item.sender_id === user.id
                      ? styles.myMessage
                      : styles.theirMessage,
                    item.reactions?.length > 0 && { marginBottom: 15 }, // Thêm marginBottom nếu có reactions
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
                          : chat.chatType === "group"
                          ? getMemberName(repliedMessage.sender_id)
                          : chat.name}
                        :
                      </Text>

                      {repliedMessage.type === "text" && (
                        <Text
                          style={styles.replyText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {repliedMessage.content}
                        </Text>
                      )}

                      {repliedMessage.type === "image" && (
                        <Text style={styles.replyText}>[Hình ảnh]</Text>
                      )}

                      {repliedMessage.type === "file" && (
                        <View style={styles.replyFileContainer}>
                          <Image
                            source={require("../../assets/icons/attachment.png")}
                            style={styles.replyFileIcon}
                          />
                          <Text
                            style={styles.replyFileName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {repliedMessage.fileName || "Tệp đính kèm"}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {item.type === "image" ? (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ViewImageChat", {
                          imageUrl: item.content,
                        })
                      }
                    >
                      <Image
                        source={{ uri: item.content }}
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: 10,
                          marginTop: 5,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : item.type === "file" ? (
                    <TouchableOpacity
                      style={styles.fileContainer}
                      onPress={() => {
                        Alert.alert("Thông báo", "Hãy tải hoặc mở file về máy");
                      }}
                    >
                      <Image
                        source={require("../../assets/icons/attachment.png")}
                        style={styles.fileIcon}
                      />
                      <Text
                        style={styles.fileName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {getFileNameFromUrl(item.content) || "Tệp đính kèm"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        isRecalled && styles.recalledText,
                      ]}
                    >
                      {item.content}
                    </Text>
                  )}

                  {/* Hiển thị thời gian hh:mm gửi tin nhắn */}
                  {isLastMessage && (
                    <Text style={styles.timestamp}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}

                  {/* Hiển thị reactions */}
                  {Array.isArray(item.reactions) &&
                    item.reactions.length > 0 && (
                      <View
                        style={[
                          styles.reactionsContainer,
                          isMyMessage
                            ? styles.reactionsRight
                            : styles.reactionsLeft,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.reactionsWrapper}
                          onPress={() => Alert.alert("Đã thả react")}
                        >
                          {renderReactionIcons(item.reactions)}
                        </TouchableOpacity>
                      </View>
                    )}
                </TouchableOpacity>

                {/* Hiển thị trạng thái của tin nhắn: Đã gửi, Đã nhận, Đã xem */}
                {isLastMessage && item.sender_id === user.id && (
                  <View style={styles.statusWrapper}>
                    <Text style={styles.statusText}>
                      {item.status === "sent"
                        ? "Đã gửi"
                        : item.status === "received"
                        ? "Đã nhận"
                        : "Đã xem"}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Modal Thao Tác Tin Nhắn */}
        <Modal visible={modalVisible} transparent animationType="none">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedMessage?.content === "Tin nhắn đã được thu hồi" ? (
                  // Chỉ hiển thị chức năng Xóa
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
                        onPress={handleSoftDelete}
                      >
                        <Image
                          source={require("../../assets/icons/delete-message.png")}
                          style={styles.icon}
                        />
                        <Text style={styles.modalOption}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Hiển thị tất cả chức năng như hiện tại
                  <>
                    {/* Thả reaction */}
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
                      <TouchableOpacity onPress={() => handleReaction("like")}>
                        <Image
                          source={require("../../assets/icons/emoji-like.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("haha")}>
                        <Image
                          source={require("../../assets/icons/emoji-haha.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("love")}>
                        <Image
                          source={require("../../assets/icons/emoji-love.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("sad")}>
                        <Image
                          source={require("../../assets/icons/emoji-cry.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("wow")}>
                        <Image
                          source={require("../../assets/icons/emoji-surprised.png")}
                          style={styles.iconEmoji}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReaction("angry")}>
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
                          onPress={handleForwardMessage}
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
                          onPress={handleSoftDelete}
                        >
                          <Image
                            source={require("../../assets/icons/delete-message.png")}
                            style={styles.icon}
                          />
                          <Text style={styles.modalOption}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Hiển thị tin nhắn gốc khi ĐANG TRẢ LỜI */}
        {replyMessage && (
          <View style={styles.replyPreview}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyPreviewText}>
                Đang trả lời tin nhắn của{" "}
                {replyMessage.sender_id === user.id
                  ? "Bạn"
                  : getMemberName(replyMessage.sender_id)}
                :
              </Text>
              {replyMessage.type === "text" && (
                <Text
                  style={styles.replyPreviewText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {replyMessage.content}
                </Text>
              )}
              {replyMessage.type === "image" && (
                <Image
                  source={{ uri: replyMessage.content }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 6,
                    marginTop: 4,
                  }}
                />
              )}
              {replyMessage.type === "file" && (
                <View style={styles.replyFileContainer}>
                  <Image
                    source={require("../../assets/icons/attachment.png")}
                    style={styles.replyFileIcon}
                  />
                  <Text
                    style={styles.replyFileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {replyMessage.fileName || "Tệp đính kèm"}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setReplyMessage(null)}>
              <Text style={styles.cancelReply}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thanh soạn/gửi tin nhắn */}
        <MessageInputBar
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          sendMessage={sendMessage}
          pickImage={pickImage}
          pickFile={pickFile}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    height: 90,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 20,
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
    // marginBottom: i
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
    maxWidth: "80%",
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
  replyFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  replyFileIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  replyFileName: {
    fontSize: 13,
    color: "#444",
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    paddingVertical: 3,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 10,
    height: 70,
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
    backgroundColor: "#f0f0f0",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  recalledText: {
    fontStyle: "italic",
    color: "#888",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6e6fa",
    borderRadius: 8,
    marginTop: 5,
  },
  fileIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  fileName: {
    color: "#333",
    fontSize: 14,
    flexShrink: 1,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: -16,
    marginBottom: 5,
    zIndex: 10,
    elevation: 5,
  },
  reactionsLeft: {
    left: 5,
    alignSelf: "flex-start",
  },
  reactionsRight: {
    right: 5,
    alignSelf: "flex-end",
  },
  reactionsWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 2,
    elevation: 2,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 2,
  },
  reactionIcon: {
    fontSize: 10,
  },
  statusWrapper: {
    alignSelf: "flex-end",
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    color: "#555",
  },
  blockedContainer: {
    backgroundColor: "#f9d7d7",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  blockedText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  notFriendContainer: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  notFriendText: {
    color: "#757575",
    fontSize: 14,
  },
});

export default Chatting;
