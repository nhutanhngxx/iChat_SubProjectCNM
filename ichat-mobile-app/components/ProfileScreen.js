import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
