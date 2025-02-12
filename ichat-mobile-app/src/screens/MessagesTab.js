import React from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

const MessagesTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Messages Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default MessagesTab;
