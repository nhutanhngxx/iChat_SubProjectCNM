import React, { useRef, useState } from "react";
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

import attachmentIcon from "../../assets/icons/attachment.png";
import AudioRecorder from "./AudioRecorder";

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
  pickVideo,
  isUploading,
  onRecordComplete,
}) => {
  const videoRef = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  let recordingInterval = null;

  const hasText = inputMessage.trim();
  const hasContent = inputMessage.trim() || selectedVideo;
  const canSend =
    hasText ||
    (selectedImages && selectedImages.length > 0) ||
    selectedFile ||
    selectedVideo;

  // Hàm cắt ngắn tên file nếu quá dài
  const truncateFileName = (name, maxLength = 30) => {
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
            ref={videoRef}
            source={{ uri: selectedVideo.uri }}
            style={styles.videoPreview}
            resizeMode="contain"
            shouldPlay={false}
            isLooping={false}
            useNativeControls
            onPlaybackStatusUpdate={(status) => setVideoStatus(() => status)}
          />
          {isUploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.uploadingText}>Đang tải video...</Text>
            </View>
          ) : (
            <View style={styles.videoControls}>
              <TouchableOpacity
                style={styles.removeVideoButton}
                onPress={() => setSelectedVideo(null)}
              >
                <Image
                  source={require("../../assets/icons/close.png")}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
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
            <AudioRecorder onRecordComplete={onRecordComplete} />

            <TouchableOpacity onPress={pickImage}>
              <Image
                source={require("../../assets/icons/image.png")}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickVideo}>
              <Image
                source={require("../../assets/icons/video.png")}
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
    marginRight: 10,
    position: "relative",
    marginTop: 5,
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
    margin: 10,
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  videoControls: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
  },
  removeVideoButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
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
  recordingButton: {
    backgroundColor: "#ffe0e0",
    borderRadius: 20,
    padding: 5,
  },
  recordingDuration: {
    position: "absolute",
    top: -20,
    width: 50,
    textAlign: "center",
    fontSize: 12,
    color: "#ff4444",
  },
});
