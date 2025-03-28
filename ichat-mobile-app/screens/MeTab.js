import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from "react-native";

import HeaderPersonalProfile from "../components/header/HeaderPersonalProfile";
import { UserContext } from "../context/UserContext";
import * as ImageManipulator from "expo-image-manipulator"; // Thư viện nén ảnh

const MeTab = () => {
  const { user } = useContext(UserContext);
  const userData = useMemo(() => user, [user]);
  const [compressedAvatar, setCompressedAvatar] = useState(null);
  useEffect(() => {
    const compressImage = async () => {
      if (userData?.avatar_path) {
        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            userData.avatar_path,
            [{ resize: { width: 200, height: 200 } }],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
          );
          setCompressedAvatar(manipulatedImage.uri);
        } catch (error) {
          console.log("Lỗi nén ảnh:", error);
        }
      }
    };
    compressImage();
  }, [userData]);
  return (
    <View style={styles.container}>
      <HeaderPersonalProfile />
      <View style={styles.headerBackground} />

      {/* Tài khoản */}
      <View style={styles.profileContainer}>
        {userData ? (
          <>
            <TouchableOpacity>
              <Image
                source={
                  compressedAvatar
                    ? { uri: compressedAvatar }
                    : require("../assets/icons/new-logo.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.name}>{userData.full_name}</Text>
            <Text style={styles.updateText}>Cập nhật tiểu sử</Text>
          </>
        ) : (
          <Text style={styles.name}>Người dùng chưa đăng nhập</Text>
        )}
      </View>

      {/* Lọc nội dung đăng tải */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Image
            source={require("../assets/icons/image.png")}
            style={styles.icon}
          />
          <Text>Hình ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Image
            source={require("../assets/icons/video.png")}
            style={styles.icon}
          />
          <Text>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Image
            source={require("../assets/icons/heart.png")}
            style={styles.icon}
          />
          <Text>Yêu thích</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung đăng tải */}
      <View style={styles.postContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Suy nghĩ của bạn là gì?"
          />
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/image.png")}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.noPostContainer}>
          <Text style={styles.noPostText}>Không có bài đăng nào.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 30,
  },
  headerBackground: {
    height: 200,
    width: "100%",
    backgroundColor: "rgba(217, 217, 217, 0.5)",
  },
  profileContainer: {
    alignItems: "center",
    gap: 10,
    top: -100,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 20,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
  },
  updateText: {
    color: "blue",
  },
  filterContainer: {
    top: -80,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: {
    width: 30,
    height: 30,
  },
  postContainer: {
    top: -50,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(217, 217, 217, 0.5)",
  },
  input: {
    fontSize: 16,
    flex: 1, // Sửa lỗi hiển thị placeholder
  },
  iconSmall: {
    width: 25,
    height: 25,
  },
  noPostContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noPostText: {
    color: "gray",
  },
});

export default MeTab;
