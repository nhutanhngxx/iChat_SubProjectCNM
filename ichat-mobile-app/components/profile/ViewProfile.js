import React, { useState, useEffect, useContext } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderViewProfile from "../header/HeaderViewProfile";
import { UserContext } from "../../context/UserContext";

const ViewProfile = ({ route }) => {
  const navigation = useNavigation();
  const { name, avatar } = route.params || {};
  const { user } = useContext(UserContext);
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderViewProfile />
      <View
        style={{
          height: 200,
          width: "100%",
          backgroundColor: "rgba(217, 217, 217, 0.5)",
        }}
      ></View>
      <View style={{ alignItems: "center", gap: 10, top: -100 }}>
        <Image
          source={typeof avatar === "string" ? { uri: avatar } : avatar}
          style={styles.avatar}
        />
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>{name}</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Không có hoạt động nào. Bắt đầu một cuộc trò chuyện mới</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { width: 200, height: 200, borderRadius: 100 },
});

export default ViewProfile;
