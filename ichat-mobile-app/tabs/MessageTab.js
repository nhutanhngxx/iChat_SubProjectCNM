import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Message Tab</Text>
    </View>
  );
};

export default MessageTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
