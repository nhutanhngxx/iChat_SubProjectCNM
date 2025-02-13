import React from "react";
import { Text, View, Image, StyleSheet, SafeAreaView } from "react-native";

const Chatting = ({ route }) => {
  const { chat } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      {chat ? (
        <View style={styles.chatHeader}>
          <Image source={chat.avatar} style={styles.avatar} />
          <Text style={styles.name}>{chat.name}</Text>
        </View>
      ) : (
        <Text>Không có dữ liệu chat</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    padding: 20,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
});

export default Chatting;
