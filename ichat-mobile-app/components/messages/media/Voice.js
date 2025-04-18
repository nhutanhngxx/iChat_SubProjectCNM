import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

const VoiceTab = () => {
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const handlePlayVoice = (voiceId) => {
    // TODO: Implement voice playback logic
    setCurrentlyPlaying(voiceId === currentlyPlaying ? null : voiceId);
  };

  const renderVoiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.voiceContainer}
      onPress={() => handlePlayVoice(item.id)}
    >
      <View style={styles.voiceIconContainer}>
        <Image
          source={
            currentlyPlaying === item.id
              ? require("../../../assets/icons/close.png")
              : require("../../../assets/icons/close.png")
          }
          style={styles.voiceIcon}
        />
      </View>
      <View style={styles.voiceInfo}>
        <View style={styles.voiceDetails}>
          <Text style={styles.voiceDuration}>{item.duration}</Text>
          <Text style={styles.voiceSender}>{item.sender}</Text>
          <Text style={styles.voiceDate}>{item.date}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${currentlyPlaying === item.id ? 50 : 0}%` },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê Ghi âm</Text>
        <Text style={styles.count}>{voiceMessages.length} voice</Text>
      </View>
      <FlatList
        data={voiceMessages}
        renderItem={renderVoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.voiceList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  count: {
    color: "#666",
  },
  voiceList: {
    padding: 10,
  },
  voiceContainer: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  voiceIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceIcon: {
    width: 24,
    height: 24,
  },
  voiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voiceDetails: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  voiceDuration: {
    fontSize: 14,
    fontWeight: "500",
  },
  voiceSender: {
    fontSize: 12,
    color: "#666",
  },
  voiceDate: {
    fontSize: 12,
    color: "#666",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#eee",
    borderRadius: 2,
  },
  progress: {
    height: "100%",
    backgroundColor: "#2980b9",
    borderRadius: 2,
  },
});

export default VoiceTab;
