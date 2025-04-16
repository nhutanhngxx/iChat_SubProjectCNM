import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";

import HeaderOption from "../header/HeaderOption";
import userService from "../../services/userService";
import groupService from "../../services/groupService";
import messageService from "../../services/messageService";
import { getHostIP } from "../../services/api";

const Option = ({ route }) => {
  const API_iChat = `http://${getHostIP()}:5001/api`;
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Lấy thông tin người dùng từ context
  const { id, name, avatar } = route.params || {}; // Nhận id, name, avatar từ route.params
  const [receiverInfo, setReceiverInfo] = useState(null); // Thông tin người nhận
  const [isGroup, setIsGroup] = useState(false);
  const [sharedGroups, setSharedGroups] = useState([]); // Danh sách nhóm chung giữa 2 người

  // Lấy thông tin Người đang nhắn tin
  useEffect(() => {
    const fetchReceiverInfo = async () => {
      const res = await userService.getUserById(id);

      if (res !== null) {
        setReceiverInfo(res);
      }
    };
    fetchReceiverInfo();
  }, []);

  useEffect(() => {
    const fetchSharedGroups = async () => {
      try {
        const res = await groupService.getAllGroupsByUserId(user.id);
        if (res.status === "ok") {
          const groups = res.groups || [];
          // Tìm các nhóm có receiver (id đang chat)
          const filtered = groups.filter((group) => group.members.includes(id));
          setSharedGroups(filtered);
          console.log("Nhóm chung:", filtered);
        }
      } catch (err) {
        console.error("Lỗi khi lấy nhóm:", err);
      }
    };

    if (user?.id && id) {
      fetchSharedGroups();
    }
  }, [user?.id, id]);

  useEffect(() => {
    console.log("avatar: ", avatar);
  }, []);

  // Xóa tất cả tin nhắn giữa 2 người
  const deleteChatHistory = async () => {
    try {
      const response = messageService.deleteChatHistory(user._id, id);

      if (response.status === "ok") {
        Alert.alert("Thông báo", response.message);
        navigation.navigate("MessagesStack");
      }
      if (response.status === "error") {
        Alert.alert("Thông báo", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử trò chuyện:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <HeaderOption />
      <View style={styles.profileContainer}>
        <Image
          source={typeof avatar === "string" ? { uri: avatar } : avatar}
          style={styles.avatar}
        />

        <Text style={styles.name}>{name}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 30,
          paddingVertical: 15,
        }}
      >
        <View style={{ width: 100, gap: 10, alignItems: "center" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/search.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
          <Text style={{ textAlign: "center" }}>Tìm tin nhắn</Text>
        </View>
        {receiverInfo && (
          <View style={{ width: 100, gap: 10, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ViewProfile", {
                  name: name,
                  avatar: avatar,
                })
              }
            >
              <Image
                source={require("../../assets/icons/me.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <Text>Xem hồ sơ</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1, paddingLeft: 20 }}
        contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            height: 15,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            marginHorizontal: -20,
          }}
        ></View>
        {/* 1 */}
        <View>
          <View style={styles.component}>
            <Image
              source={require("../../assets/icons/image.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Đa phương tiện, tệp tin, liên kết</Text>
          </View>
          <TouchableOpacity
            style={{ paddingLeft: 35 }}
            onPress={() => navigation.navigate("MediaStorage")}
          >
            <Image
              source={require("../../assets/icons/see-more.png")}
              style={{ width: 80, height: 80 }}
            />
          </TouchableOpacity>
        </View>
        <View>
          {receiverInfo && (
            <View style={{ gap: 15 }}>
              <View
                style={{
                  height: 15,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  marginHorizontal: -20,
                }}
              ></View>
              <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/add-group.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Tạo nhóm với {name}</Text>
              </TouchableOpacity>
              {/* 3 */}
              <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/add-friend.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Thêm {name} vào nhóm</Text>
              </TouchableOpacity>
              {/* 4 */}
              <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/friend.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>
                  Xem các nhóm chung ({sharedGroups.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* 2 */}
        </View>
        <View style={{ gap: 15 }}>
          <View
            style={{
              height: 15,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              marginHorizontal: -20,
            }}
          ></View>
          {/* 5 */}
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/storage.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Lưu trữ cuộc trò chuyện</Text>
          </TouchableOpacity>
          {receiverInfo && (
            <View>
              {/* 6 */}
              <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/delete-friend.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Xóa khỏi danh sách bạn bè</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 7 */}
          <TouchableOpacity
            style={styles.component}
            onPress={deleteChatHistory}
          >
            <Image
              source={require("../../assets/icons/delete.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Xóa lịch sử trò chuyện</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
  },
  icon: {
    width: 25,
    height: 25,
  },
  title: {
    fontSize: 16,
  },
  component: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingBottom: 5,
  },
});

export default Option;
