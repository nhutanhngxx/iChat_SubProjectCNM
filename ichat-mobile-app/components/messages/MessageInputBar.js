import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";

import attachmentIcon from "../../assets/icons/attachment.png";

const MessageInputBar = ({
  inputMessage,
  setInputMessage,
  selectedImages,
  setSelectedImages,
  selectedFile,
  setSelectedFile,
  selectedVideo,
  setSelectedVideo,
  sendMessage,
  pickImage,
  pickFile,
  isUploading,
}) => {
  const [videoStatus, setVideoStatus] = useState({});

  const hasText = inputMessage.trim();
  const canSend =
    hasText ||
    (selectedImages && selectedImages.length > 0) ||
    selectedFile ||
    selectedVideo;

  // Hàm cắt ngắn tên file nếu quá dài
  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(
      0,
      name.length - extension.length - 1
    );
    return `${nameWithoutExt.substring(
      0,
      maxLength - extension.length - 3
    )}...${extension}`;
  };

  // Hàm định dạng kích thước file
  const formatFileSize = (size) => {
    if (!size) return "";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.wrapper}>
      {/* Video Preview */}
      {selectedVideo && (
        <View style={styles.videoPreviewContainer}>
          <Video
            source={{ uri: selectedVideo.uri || selectedVideo }}
            style={styles.videoPreview}
            resizeMode="contain"
            shouldPlay={false}
            isLooping={true}
            useNativeControls
            onPlaybackStatusUpdate={(status) => setVideoStatus(() => status)}
          />
          {isUploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.uploadingText}>Đang tải video...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => setSelectedVideo(null)}
            >
              <Image
                source={require("../../assets/icons/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Image Preview */}
      {selectedImages && selectedImages.length > 0 && (
        <ScrollView
          horizontal
          style={styles.previewScrollContainer}
          showsHorizontalScrollIndicator={false}
        >
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.previewContainer}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => {
                  const newImages = selectedImages.filter(
                    (_, i) => i !== index
                  );
                  setSelectedImages(newImages);
                }}
              >
                <Image
                  source={require("../../assets/icons/close.png")}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* File Preview */}
      {selectedFile && (
        <View style={styles.filePreviewContainer}>
          <View style={styles.fileInfo}>
            <Image
              source={require("../../assets/icons/attachment.png")}
              style={styles.fileIcon}
            />
            <View>
              <Text style={styles.fileName}>
                {truncateFileName(selectedFile.name)}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedFile(null)}
          >
            <Image
              source={require("../../assets/icons/close.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Thanh nhập tin nhắn */}
      <View
        style={
          Platform.OS === "ios"
            ? [styles.inputContainer, { paddingVertical: 10 }]
            : [styles.inputContainer, { paddingVertical: 5 }]
        }
      >
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
            <TouchableOpacity onPress={pickFile}>
              <Image source={attachmentIcon} style={styles.icon} />
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
    paddingBottom: Platform.OS === "ios" ? 20 : 15,
    backgroundColor: "#f9f9f9",
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 10,
    // paddingVertical: 10, // android 5
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
    width: 25,
    height: 25,
    marginHorizontal: 6,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  previewImage: {
    maxHeight: 150,
    minHeight: 70,
    width: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  filePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "#ff4d4d",
  },
  previewScrollContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  previewContainer: {
    marginRight: 8,
    position: "relative",
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  videoPreviewContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    height: 200,
    backgroundColor: "#000", // Add black background
    width: "100%",
  },
  videoPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 14,
  },
});
