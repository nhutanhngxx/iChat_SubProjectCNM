import React, { useState, useEffect, useContext, useRef } from "react";
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
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "@/src/context/UserContext";
import axios from "axios";

const Chatting = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const { chat } = route.params || {}; // Lấy thông tin từ màn hình MessageTab/UuTien
  const flatListRef = useRef(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.37:5001/messages/${user.id}/${chat.id}`
      );
      if (response.data.status === "ok") {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  useEffect(() => {
    if (chat?.id && user?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [user, chat]);

  useEffect(() => {
    console.log(chat);
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
    // Cuộn xuống cuối khi có tin nhắn mới
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const newMessage = {
          sender_id: user.id,
          receiver_id: chat.id,
          content: inputMessage,
          type: "text",
          chat_type: "private",
        };

        console.log("Dữ liệu gửi đi:", newMessage);

        const response = await axios.post(
          "http://192.168.1.37:5001/send-message",
          newMessage
        );

        console.log("Phản hồi từ server:", response.data);

        if (response.data.message !== "Message sent successfully") {
          throw new Error(`Lỗi khi gửi tin nhắn: ${response.data.message}`);
        }

        // Cập nhật danh sách tin nhắn bằng dữ liệu từ API
        setMessages((prevMessages) => [...prevMessages, response.data.data]);

        // Xóa input
        setInputMessage("");
      } catch (error) {
        console.error(
          "Lỗi khi gửi tin nhắn:",
          error.response?.data || error.message
        );
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
          <Text style={styles.name}>{chat.name}</Text>
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

      {/* Load tin nhắn */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        {/* <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.sender_id === user.id
                  ? styles.myMessage
                  : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
        /> */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <View
                style={[
                  styles.message,
                  item.sender_id === user.id
                    ? styles.myMessage
                    : styles.theirMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {isLastMessage && item.sender_id === user.id && (
                  <Text style={styles.status}>
                    {item.status === "sent"
                      ? "Đã gửi"
                      : item.status === "received"
                      ? "Đã nhận"
                      : "Đã xem"}
                  </Text>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          } // Cuộn khi nội dung thay đổi
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })} // Cuộn tin nhắn mới nhất
        />

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
    backgroundColor: "rgba(217, 217, 217, 0.5)",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageText: {
    fontSize: 16,
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
    alignSelf: "flex-end",
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
});

export default Chatting;
