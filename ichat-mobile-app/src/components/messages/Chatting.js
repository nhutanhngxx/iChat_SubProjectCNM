import React, { useState, useEffect } from "react";
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

const Chatting = ({ route }) => {
  const navigation = useNavigation();
  const [inputMessage, setInputMessage] = useState("");
  const { chat } = route.params || {};
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello!", sender: "them" },
    { id: "2", text: "Hi, how are you?", sender: "me" },
    { id: "3", text: "I am good, thank you!", sender: "them" },
  ]);

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

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { id: Date.now().toString(), text: inputMessage, sender: "me" },
      ]);
      setInputMessage("");
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
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.sender === "me" ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
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
});

export default Chatting;
