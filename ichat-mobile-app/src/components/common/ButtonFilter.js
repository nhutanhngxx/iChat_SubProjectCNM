import React from "react";
import { Text, TouchableOpacity, StyleSheet, Image, View } from "react-native";

const ButtonFilter = ({ title, icon, onPress, isActive = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isActive && styles.activeButton]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={[styles.text, isActive && styles.activeText]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "white",
    alignItems: "center",
    marginHorizontal: 5,
    width: "auto",
  },
  activeButton: {
    backgroundColor: "#6200ea",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 15,
    // fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
});

export default ButtonFilter;
