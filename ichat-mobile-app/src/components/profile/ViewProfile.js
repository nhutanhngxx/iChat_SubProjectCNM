import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderViewProfile from "../header/HeaderViewProfile";

const ViewProfile = ({ route }) => {
  const navigation = useNavigation();
  const { name, avatar } = route.params || {};
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderViewProfile />
      <View
        style={{
          height: 80,
          width: "100%",
          backgroundColor: "rgba(217, 217, 217, 0.5)",
        }}
      ></View>
      <View style={{ alignItems: "center", gap: 10, top: -50 }}>
        <Image
          source={typeof avatar === "string" ? { uri: avatar } : avatar}
          style={styles.avatar}
        />
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>{name}</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Không có hoạt động nào. Bắt đầu một cuộc trò chuyện mới</Text>
        {/* <TouchableOpacity
          style={{
            bottom: 10,
            right: 20,
            position: "absolute",
          }}
        >
          <Image
            source={require("../../assets/icons/chatting.png")}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { width: 100, height: 100, borderRadius: 50 },
});

export default ViewProfile;
