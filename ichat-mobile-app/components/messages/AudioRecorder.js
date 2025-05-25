import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const AudioRecorder = ({ onRecordComplete }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (recording) {
        cancelRecording();
      }
    };
  }, []);

  async function startRecording() {
    try {
      // Yêu cầu quyền ghi âm
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền ghi âm để thực hiện tính năng này"
        );
        return;
      }

      // Cấu hình audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Tạo recording mới
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);

      // Bắt đầu đếm thời gian
      const interval = setInterval(() => {
        setRecordingDuration((duration) => duration + 1);
      }, 1000);

      // Lưu interval ID để clear
      newRecording._intervalId = interval;
    } catch (err) {
      console.error("Lỗi khi bắt đầu ghi âm:", err);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm");
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      // Dừng đếm thời gian
      if (recording._intervalId) {
        clearInterval(recording._intervalId);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Reset states
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);

      // Gửi file audio về component cha
      if (uri && onRecordComplete) {
        onRecordComplete({
          uri,
          duration: recordingDuration,
          type: "audio/m4a",
          name: `audio-${Date.now()}.m4a`,
        });
      }
    } catch (err) {
      console.error("Lỗi khi dừng ghi âm:", err);
      Alert.alert("Lỗi", "Không thể dừng ghi âm");
    }
  }

  async function cancelRecording() {
    try {
      if (!recording) return;

      // Dừng đếm thời gian
      if (recording._intervalId) {
        clearInterval(recording._intervalId);
      }

      await recording.stopAndUnloadAsync();

      // Reset states mà không gửi file audio
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Lỗi khi hủy ghi âm:", err);
      Alert.alert("Lỗi", "Không thể hủy ghi âm");
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {!isRecording ? (
        <TouchableOpacity onPress={startRecording} style={styles.button}>
          <Ionicons name="mic" size={24} color="#007AFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.recordingContainer}>
          <TouchableOpacity
            onPress={cancelRecording}
            style={[styles.button, styles.cancelButton]}
          >
            <Ionicons name="close" size={20} color="#ff4444" />
          </TouchableOpacity>

          <Text style={styles.duration}>
            {formatDuration(recordingDuration)}
          </Text>

          <TouchableOpacity
            onPress={stopRecording}
            style={[styles.button, styles.stopButton]}
          >
            <Ionicons name="checkmark" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    width: 25,
    height: 25,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe0e0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#fff",
    marginRight: 8,
  },
  stopButton: {
    backgroundColor: "#fff",
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    color: "#ff4444",
    fontWeight: "500",
    minWidth: 35,
    textAlign: "center",
  },
});

export default AudioRecorder;
