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
import friendService from "../../services/friendService";

const Option = ({ route }) => {
  // const API_iChat = `http://${getHostIP()}:5001/api`;
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Lấy thông tin người dùng từ context
  const { id, name, avatar } = route.params || {}; // Nhận id, name, avatar từ route.params
  const [receiverInfo, setReceiverInfo] = useState(null); // Thông tin người nhận
  const [receiverGroup, setReceiverGroup] = useState([]); // Thông tin nhóm
  const [isGroup, setIsGroup] = useState(false);
  const [adminGroup, setAdminGroup] = useState(null);
  const [sharedGroups, setSharedGroups] = useState([]); // Danh sách nhóm chung giữa 2 người

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      try {
        const userRes = await userService.getUserById(id);
        console.log("User response:", userRes);
        if (!userRes || !userRes._id) {
          const groupRes = await groupService.getGroupById(id);
          console.log("Group response:", groupRes);
          if (groupRes && groupRes._id) {
            setReceiverGroup(groupRes);
            setIsGroup(true);
            if (user.id === groupRes.admin_id) {
              setAdminGroup(true);
            } else {
              setAdminGroup(false);
            }
          } else {
            console.log("Không tìm thấy thông tin user hoặc group");
          }
        } else {
          setReceiverInfo(userRes);
          setIsGroup(false);
        }
      } catch (error) {
        console.error("Lỗi khi fetch thông tin:", error);
      }
    };
    if (id) {
      fetchReceiverInfo();
    }
  }, [id]);

  console.log("User: ", receiverInfo);
  console.log("Group: ", receiverGroup);
  console.log("Admin: ", adminGroup);

  // Xóa tất cả tin nhắn giữa 2 người
  const handleDeleteChatHistory = async () => {
    Alert.alert(
      "Thông báo",
      "Bạn có chắc chắn muốn xóa lịch sử trò chuyện không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await messageService.softDeleteMessagesForUser(
                user.id,
                id
              );
              if (response.status === "ok") {
                Alert.alert("Thông báo", response.message, [
                  { text: "OK", onPress: () => navigation.navigate("Home") },
                ]);
              }
              if (response.status === "error") {
                Alert.alert("Thông báo", response.message);
              }
            } catch (error) {
              console.error("Lỗi khi xóa lịch sử trò chuyện:", error);
            }
          },
        },
      ]
    );
  };

  // Hủy kết bạn
  const handleUnfriend = async (unfriendUserId) => {
    Alert.alert("Thông báo", "Bạn có chắc chắn muốn hủy kết bạn không?", [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const response = await friendService.unfriendUser({
              userId: user.id,
              friendId: unfriendUserId,
            });
            if (response.status === "ok") {
              Alert.alert("Thông báo", response.message, [
                { text: "OK", onPress: () => navigation.navigate("Home") },
              ]);
            }
            if (response.status === "error") {
              Alert.alert("Thông báo", response.message);
            }
          } catch (error) {
            console.error("Lỗi khi hủy kết bạn:", error);
          }
        },
      },
    ]);
  };

  // Chặn người dùng: hủy kết bạn và chuyển status thành blocked
  const handleBlockUser = async (blockedUserId) => {
    Alert.alert("Thông báo", "Bạn sẽ hủy kết bạn và chặn người dùng này!", [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const response = await friendService.blockUser({
              blockedUserId,
              userId: user.id,
            });
            if (response.status === "ok") {
              Alert.alert("Thông báo", response.message, [
                { text: "OK", onPress: () => navigation.navigate("Home") },
              ]);
            }
            if (response.status === "error") {
              Alert.alert("Thông báo", response.message);
            }
          } catch (error) {
            console.error("Lỗi khi chặn người dùng:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <HeaderOption />
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: receiverInfo?.avatar_path || receiverGroup?.avatar,
          }}
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
                  foundUser: receiverInfo,
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
        {/* 1. Đa phương tiện, hình ảnh, liên kết */}
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

        {/* Dành cho chat 1-1 */}
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
                  Xem các nhóm chung ({sharedGroups?.length || 0})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {adminGroup === true && (
          <View
            style={{
              height: 15,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              marginHorizontal: -20,
            }}
          ></View>
        )}
        {adminGroup === true && (
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/storage.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Cài đặt nhóm</Text>
          </TouchableOpacity>
        )}

        {adminGroup === true && (
          <TouchableOpacity style={styles.component}>
            <Image
              source={require("../../assets/icons/add-friend.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Thêm thành viên</Text>
          </TouchableOpacity>
        )}

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

          {/* 6 */}
          {receiverInfo && (
            <TouchableOpacity
              style={styles.component}
              onPress={() => handleUnfriend(id)}
            >
              <Image
                source={require("../../assets/icons/delete-friend.png")}
                style={styles.icon}
              />
              <Text style={styles.title}>Xóa khỏi danh sách bạn bè</Text>
            </TouchableOpacity>
          )}

          {/* 7 */}
          <TouchableOpacity
            style={styles.component}
            onPress={handleDeleteChatHistory}
          >
            <Image
              source={require("../../assets/icons/delete.png")}
              style={styles.icon}
            />
            <Text style={{ color: "red", fontSize: 16 }}>
              Xóa lịch sử trò chuyện
            </Text>
          </TouchableOpacity>

          {receiverGroup && !receiverInfo && (
            <TouchableOpacity style={styles.component}>
              <Image
                source={require("../../assets/icons/out-group.png")}
                style={styles.icon}
              />
              <Text style={{ color: "red", fontSize: 16 }}>Rời khỏi nhóm</Text>
            </TouchableOpacity>
          )}

          {adminGroup === true && (
            <TouchableOpacity style={styles.component}>
              <Image
                source={require("../../assets/icons/delete-group.png")}
                style={{ width: 25, height: 25 }}
              />
              <Text style={{ color: "red", fontSize: 16 }}>Xóa nhóm</Text>
            </TouchableOpacity>
          )}

          {/* 8 */}
          {receiverInfo && (
            <TouchableOpacity
              style={styles.component}
              onPress={() => handleBlockUser(id)}
            >
              <Image
                source={require("../../assets/icons/details.png")}
                style={styles.icon}
              />
              <Text style={styles.title}>Chặn người dùng</Text>
            </TouchableOpacity>
          )}
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
