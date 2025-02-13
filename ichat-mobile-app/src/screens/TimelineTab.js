import React from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

const TimelineTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Timeline Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default TimelineTab;
