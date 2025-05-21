import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import { StatusBar } from "expo-status-bar";

import avatar from "../../assets/images/avatars/avatar1.png";
import goBackIcon from "../../assets/icons/go-back.png";

const ProfileInformation = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 10) return phone;
    return phone.slice(0, 5) + "***" + phone.slice(-3);
  };

  useEffect(() => {
    console.log("User từ Context:", user);
  }, [user]);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      });
    };
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          width: "100%",
          height: 90,
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "flex-end",
          backgroundColor: "#3083F9",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={goBackIcon}
            style={{ width: 25, height: 25, tintColor: "#fff" }}
          />
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Thông tin cá nhân
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          paddingLeft: 10,
          paddingTop: 30,
        }}
      >
        <Image
          source={user.avatar_path ? { uri: user.avatar_path } : avatar}
          style={{ width: 80, height: 80, borderRadius: 40 }}
          onError={(e) => console.log("Lỗi khi tải ảnh:", e.nativeEvent.error)}
        />

        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
          {user.full_name}
        </Text>
      </View>

      {/* Thông tin */}
      <View style={{ padding: 20, gap: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Thông tin cá nhân
        </Text>
        <View style={styles.container}>
          <Text style={styles.title}>Giới tính</Text>
          <Text style={styles.value}>
            {user.gender
              ? user.gender === "Male"
                ? "Nam"
                : user.gender === "Female"
                ? "Nữ"
                : user.gender
              : "Chưa cập nhật"}
          </Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Ngày sinh</Text>
          <Text style={styles.value}>
            {user.dobFormatted || "Chưa cập nhật"}
          </Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Số điện thoại</Text>
          <Text style={styles.value}>{maskPhoneNumber(user.phone)}</Text>
        </View>
        {/* Button chức năng */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 30,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(217, 217, 217, 0.5)",
              padding: 15,
              borderRadius: 20,
            }}
            onPress={() => navigation.navigate("ChangeInformation")}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#3237DA",
                textAlign: "center",
              }}
            >
              Chỉnh sửa thông tin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(217, 217, 217, 0.5)",
              padding: 15,
              borderRadius: 20,
            }}
            onPress={() =>
              Alert.alert(
                "Xóa tài khoản",
                "Bạn có chắc chắn muốn xóa tài khoản không?",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                      Alert.alert("Tính năng này hiện chưa khả dụng");
                      // Xử lý xóa tài khoản ở đây
                    },
                  },
                ]
              )
            }
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#FF0000" }}
            >
              Xóa tài khoản
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileInformation;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.5)",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    width: 150,
  },
  value: {
    fontSize: 16,
    opacity: 0.5,
  },
});
