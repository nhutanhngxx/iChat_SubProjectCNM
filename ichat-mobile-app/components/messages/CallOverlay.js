import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CallOverlay = ({
  isVisible,
  callStatus,
  duration,
  isMuted,
  onEndCall,
  onToggleMute,
  callerName,
}) => {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isVisible) {
      startPulseAnimation();
    }
    return () => {
      pulseAnim.stopAnimation();
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

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated circle with pulse effect */}
        <Animated.View
          style={[
            styles.circleContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.circle} />
        </Animated.View>

        {/* Call information */}
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.statusText}>
          {callStatus === "connecting"
            ? "Đang kết nối..."
            : callStatus === "ongoing"
            ? `${duration}`
            : "Đang gọi..."}
        </Text>

        {/* Control buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isMuted ? styles.mutedButton : styles.muteButton,
            ]}
            onPress={onToggleMute}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={30}
              color="white"
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.endCallButton]}
            onPress={onEndCall}
          >
            <Ionicons
              name="call"
              size={30}
              color="white"
              style={styles.endCallIcon}
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
  circleContainer: {
    marginBottom: 30,
    borderRadius: 75,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#4CAF50",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  statusText: {
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    transform: [{ rotate: "135deg" }],
  },
  muteButton: {
    backgroundColor: "#4CAF50",
  },
  mutedButton: {
    backgroundColor: "#888",
  },
  endCallButton: {
    backgroundColor: "#ff4444",
  },
  icon: {
    transform: [{ rotate: "-135deg" }],
  },
  endCallIcon: {
    transform: [{ rotate: "-135deg" }],
  },
});

export default CallOverlay;
