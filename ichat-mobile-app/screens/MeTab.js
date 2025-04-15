import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";

import HeaderPersonalProfile from "../components/header/HeaderPersonalProfile";
import { UserContext } from "../config/context/UserContext";
import * as ImageManipulator from "expo-image-manipulator"; // Thư viện nén ảnh
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";

const MeTab = () => {
  const { user } = useContext(UserContext);
  const userData = useMemo(() => user, [user]);
  const [compressedAvatar, setCompressedAvatar] = useState(null);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền bị từ chối",
        "Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt!"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Lỗi khi chọn ảnh:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

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
      <StatusBar style="dark" />
      <HeaderPersonalProfile />
      <View style={styles.headerBackground}>
        <Image
          source={user.cover_path ? { uri: user.cover_path } : avatar}
          style={styles.headerBackground}
        />
      </View>
      {/* Tài khoản */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
          <Image
            source={user.avatar_path ? { uri: user.avatar_path } : avatar}
            style={{ width: 200, height: 200, borderRadius: 1000 }}
            onError={(e) =>
              console.log("Lỗi khi tải ảnh:", e.nativeEvent.error)
            }
          />
        </TouchableOpacity>

        <Text style={styles.name}>{userData.full_name}</Text>
        <Text style={styles.updateText}>Cập nhật tiểu sử</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAvatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ảnh đại diện</Text>
            <Image
              source={
                selectedImage
                  ? { uri: selectedImage }
                  : user.avatar_path
                  ? { uri: user.avatar_path }
                  : avatar
              }
              style={{
                width: 150,
                height: 150,
                borderRadius: 100,
                marginBottom: 15,
              }}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={pickImageFromLibrary}
            >
              <Text style={styles.buttonText}>Chọn ảnh từ thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "gray" }]}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.buttonText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerBackground: {
    height: 200,
    width: "100%",
    // backgroundColor: "rgba(217, 217, 217, 0.5)",
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default MeTab;
