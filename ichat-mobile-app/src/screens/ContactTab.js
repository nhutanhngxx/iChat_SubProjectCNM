import React from "react";
import { Text, View, Button, SafeAreaView, StyleSheet } from "react-native";

const ContactTab = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Contact Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default ContactTab;
