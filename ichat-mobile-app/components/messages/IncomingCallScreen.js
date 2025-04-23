import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

const IncomingCallScreen = ({
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  isVisible,
  callerId,
  roomId,
}) => {
  const pulseAnim = new Animated.Value(1);
  const [ringtone, setRingtone] = useState(null);

  useEffect(() => {
    if (isVisible) {
      startPulseAnimation();
      startRingtone();
      startVibration();
    } else {
      stopRingtone();
      Vibration.cancel();
    }
    return () => {
      stopRingtone();
      Vibration.cancel();
    };
  }, [isVisible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startVibration = () => {
    Vibration.vibrate([500, 1000, 500, 1000], true);
  };

  const startRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/thap-trap-tu-do.mp3"),
        { isLooping: true }
      );
      setRingtone(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  const stopRingtone = async () => {
    if (ringtone) {
      await ringtone.stopAsync();
      await ringtone.unloadAsync();
      setRingtone(null);
    }
  };

  const handleRejectCall = () => {
    stopRingtone();
    onDecline(callerId, roomId);
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Avatar với hiệu ứng pulse */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={
              callerAvatar
                ? { uri: callerAvatar }
                : "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png"
            }
            style={styles.avatar}
          />
        </Animated.View>

        {/* Thông tin người gọi */}
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callStatus}>Cuộc gọi đến...</Text>

        {/* Nút điều khiển */}
        <View style={styles.buttonContainer}>
          {/* Nút từ chối */}
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleRejectCall}
          >
            <Ionicons
              name="call"
              size={30}
              color="white"
              style={styles.declineIcon}
            />
          </TouchableOpacity>

          {/* Nút chấp nhận */}
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={onAccept}
          >
            <Ionicons
              name="call"
              size={30}
              color="white"
              style={styles.acceptIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    width: width * 0.8,
  },
  avatarContainer: {
    marginBottom: 30,
    borderRadius: 75,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  callStatus: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  declineButton: {
    backgroundColor: "#ff4444",
    transform: [{ rotate: "135deg" }],
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    transform: [{ rotate: "135deg" }],
  },
  declineIcon: {
    transform: [{ rotate: "-135deg" }],
  },
  acceptIcon: {
    transform: [{ rotate: "-135deg" }],
  },
});

export default IncomingCallScreen;
