import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeaderPersonalProfile from "../components/header/HeaderPersonalProfile";

const MeTab = ({ navigation, setUser }) => {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderPersonalProfile setUser={setUser} />
      <View
        style={{
          height: 80,
          width: "100%",
          backgroundColor: "rgba(217, 217, 217, 0.5)",
        }}
      ></View>
      {/* Tài khoản */}
      <View style={{ alignItems: "center", gap: 10, top: -50 }}>
        <Image source={require("../assets/images/avatars/avatar1.png")} />
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
          Nguyễn Nhựt Anh
        </Text>
        <Text style={{ color: "blue" }}>Cập nhật tiểu sử</Text>
      </View>
      {/* Lọc nội dung đăng tải: Hình ảnh, Video, Nhiều yêu thích */}
      <View
        style={{
          top: -30,
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "110",
            borderRadius: 10,
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/icons/image.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "90",
            borderRadius: 10,
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/icons/video.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: 5,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            width: "150",
            borderRadius: 10,
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/icons/heart.png")}
            style={{ width: 30, height: 30 }}
          />
          <Text>Nhiều yêu thích</Text>
        </TouchableOpacity>
      </View>
      {/* Nội dung đăng tải */}
      <View style={{ top: -10, flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: 30,
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
            backgroundColor: "rgba(217, 217, 217, 0.5)",
          }}
        >
          <TextInput
            style={{ fontSize: 16 }}
            placeholder="Suy nghĩ của bạn là gì?"
          />
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/image.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <Text style={{ color: "gray" }}>Không có bài đăng nào.</Text>
        </View>
      </View>
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
