import React from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const MessageInputBar = ({
  inputMessage,
  setInputMessage,
  selectedImage,
  setSelectedImage,
  sendMessage,
  pickImage,
}) => {
  const hasText = inputMessage.trim();
  const canSend = hasText || selectedImage;

  return (
    <View style={styles.wrapper}>
      {/* Hiển thị ảnh đã chọn nếu có */}
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setSelectedImage(null)}>
            <Image
              source={require("../../assets/icons/close.png")} // Nên có icon "X" nhỏ
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Thanh nhập tin nhắn */}
      <View style={styles.inputContainer}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/icons/gif.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Tin nhắn"
          placeholderTextColor="#999"
        />

        {!hasText && (
          <>
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/microphone.png")}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage}>
              <Image
                source={require("../../assets/icons/image.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          </>
        )}

        {canSend && (
          <TouchableOpacity onPress={sendMessage}>
            <Image
              source={require("../../assets/icons/send.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MessageInputBar;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 6,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "red",
  },
});
