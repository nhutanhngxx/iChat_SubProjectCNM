import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

const CustomButton = ({
  title,
  onPress,
  backgroundColor,
  textColor = "white",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor }]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 25,
    width: 297,
    height: 50,
  },
  text: {
    fontWeight: "700",
    fontSize: 16,
  },
});

export default CustomButton;
