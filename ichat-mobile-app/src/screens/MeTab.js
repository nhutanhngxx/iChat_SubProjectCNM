import React from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

const MeTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Profile Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default MeTab;
