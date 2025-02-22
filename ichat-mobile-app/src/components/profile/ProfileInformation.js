import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import avatar from "../../assets/images/avatars/avatar1.png";

const ProfileInformation = () => {
  const navigation = useNavigation();
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
      <View
        style={{
          backgroundColor: "#fff",
          paddingRight: 10,
          paddingTop: 5,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          height: 50,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Thông tin cá nhân
        </Text>
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
        <Image source={avatar} style={{ width: 80, height: 80 }} />
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>
          Nguyễn Nhựt Anh
        </Text>
      </View>

      {/* Thông tin */}
      <View style={{ padding: 20, gap: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Thông tin cá nhân
        </Text>
        <View style={styles.container}>
          <Text style={styles.title}>Giới tính</Text>
          <Text style={styles.value}>Nam</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Ngày sinh</Text>
          <Text style={styles.value}>17/03/2003</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Số điện thoại</Text>
          <Text style={styles.value}>+84 93 934 24 95</Text>
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
                fontSize: 18,
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
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#FF0000" }}
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
    opacity: 0.5,
    width: 150,
  },
  value: {
    fontSize: 16,
  },
});
