import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import goBackIcon from "../../assets/icons/go-back.png";
import createGroupIcon from "../../assets/icons/add-group.png";
import loginDeviceIcon from "../../assets/icons/login-device.png";
import addFriendIcon from "../../assets/icons/add-friend.png";
import { Camera } from "expo-camera";
// import QRCodeScanner from "react-native-qrcode-scanner";
import { StatusBar } from "expo-status-bar";

const HeaderMessages = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const [hasPermission, setHasPermission] = useState(null);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleOpenCamera = () => {
    if (hasPermission) {
      navigation.navigate("QRScannerScreen");
    } else {
      Alert.alert("Ứng dụng cần quyền truy cập camera.");
    }
  };

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        height: 90,
        justifyContent: "space-between",
        alignItems: "flex-end",
        padding: 10,
        backgroundColor: "rgba(47, 128, 237, 0.3)",
      }}
    >
      <StatusBar style={"light"} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            gap: 15,
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => navigation.navigate("SearchScreen")}
        >
          <Image
            source={require("../../assets/icons/search.png")}
            style={{ width: 22, height: 22 }}
          />
          <TextInput
            onPress={() => navigation.navigate("SearchScreen")}
            style={
              Platform.OS === "ios"
                ? {
                    fontSize: 15,
                    color: "#2F80ED",
                    flex: 1,
                    marginRight: 20,
                    paddingLeft: 10,
                    borderRadius: 5,
                    backgroundColor: "white",
                    textAlignVertical: "center",
                    height: 30,
                  }
                : {
                    fontSize: 15,
                    color: "#2F80ED",
                    flex: 1,
                    marginRight: 20,
                    paddingLeft: 10,
                    borderRadius: 5,
                    backgroundColor: "white",
                    textAlignVertical: "center",
                    height: 38,
                  }
            }
            placeholder="Tìm kiếm"
            placeholderTextColor={"gray"}
            editable={false}
          ></TextInput>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 15 }}>
          <TouchableOpacity onPress={() => navigation.navigate("QRScanner")}>
            <Image
              source={require("../../assets/icons/qr.png")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={require("../../assets/icons/add.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Add friend */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "flex-end",
            paddingTop: 100,
          }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              width: 200,
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              marginRight: 10,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("AddFriend");
              }}
            >
              <Image source={addFriendIcon} style={{ width: 25, height: 25 }} />
              <Text style={{ fontSize: 16 }}>Thêm bạn bè</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("CreateGroup");
              }}
            >
              <Image
                source={createGroupIcon}
                style={{ width: 25, height: 25 }}
              />
              <Text style={{ fontSize: 16 }}>Tạo nhóm mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Image
                source={loginDeviceIcon}
                style={{ width: 25, height: 25 }}
              />
              <Text style={{ fontSize: 16 }}>Quản lý đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HeaderMessages;
