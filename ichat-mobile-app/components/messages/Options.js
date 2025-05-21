import React, { useState, useEffect, useContext, useCallback } from "react";
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
import * as ImagePicker from "expo-image-picker";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";

import HeaderOption from "../header/HeaderOption";
import userService from "../../services/userService";
import groupService from "../../services/groupService";
import messageService from "../../services/messageService";
import friendService from "../../services/friendService";
import ModalRenameGroup from "../group/ModalRenameGroup";
import ModalSelectAdmin from "../group/ModalSelectAdmin";
import socketService from "../../services/socketService";
import { Avatar } from "@rneui/themed";

const Option = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Lấy thông tin người dùng từ context
  const { id, name, avatar } = route.params || {}; // Nhận id, name, avatar từ route.params
  const [receiverInfo, setReceiverInfo] = useState(null); // Thông tin người nhận
  const [receiverGroup, setReceiverGroup] = useState([]); // Thông tin nhóm
  const [isGroup, setIsGroup] = useState(false); // Kiểm tra xem có phải nhóm không
  const [adminGroup, setAdminGroup] = useState(null); // Kiểm tra xem có phải nhóm trưởng của nhóm không
  const [subAdminGroup, setSubAdminGroup] = useState(null); // Kiểm tra xem có phải nhóm phó phụ của nhóm không
  const [sharedGroups, setSharedGroups] = useState([]); // Danh sách nhóm chung giữa 2 người
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false); // Modal đổi tên nhóm
  const [isSelectAdminModalVisible, setIsSelectAdminModalVisible] =
    useState(false); // Modal chọn quản trị viên mới trước khi rời khỏi nhóm

  const [updatedAvatar, setUpdatedAvatar] = useState(null);

  // Lắng nghe sự kiện từ socket
  useEffect(() => {
    if (!id) return;

    socketService.joinRoom(id);

    // Lắng nghe sự kiện cập nhật thông tin nhóm
    socketService.onGroupUpdated(
      ({
        groupId,
        name,
        avatar,
        allow_change_name,
        allow_change_avatar,
        require_approval,
      }) => {
        if (id === groupId) {
          setReceiverGroup((prev) => ({
            ...prev,
            name: name || prev.name,
            avatar: avatar || prev.avatar,
            allow_change_name: allow_change_name,
            allow_change_avatar: allow_change_avatar,
            require_approval: require_approval,
          }));
        }
      }
    );

    // Lắng nghe sự kiện chuyển quyền quản trị viên
    socketService.onAdminTransferred(({ groupId, userId }) => {
      if (id === groupId) {
        // Update admin status if current user is the new admin
        if (userId === user.id) {
          setAdminGroup(true);
        } else if (adminGroup) {
          // If current user was admin and now someone else is
          setAdminGroup(false);
        }
      }
    });

    // Lắng nghe sự kiện cập nhật quyền thành viên
    socketService.onRoleUpdated(({ groupId, userId, role }) => {
      if (id === groupId && userId === user.id) {
        // Update subAdmin status if role changed for current user
        setSubAdminGroup(role === "admin");
      }
    });

    return () => {
      socketService.leaveRoom(id);
      socketService.removeAllListeners();
    };
  }, [id, user.id, adminGroup, subAdminGroup]);

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      try {
        const userRes = await userService.getUserById(id);
        if (!userRes || !userRes._id) {
          const groupRes = await groupService.getGroupById(id);
          const roleRes = await groupService.isGroupSubAdmin({
            groupId: id,
            userId: user.id,
          });

          if (groupRes && groupRes._id) {
            setReceiverGroup(groupRes);
            setIsGroup(true);
            setAdminGroup(roleRes.isMainAdmin);
            setSubAdminGroup(roleRes.isSubAdmin);
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
  }, [id, name, avatar, user.id]);

  useFocusEffect(
    useCallback(() => {
      // Chỉ fetch lại thông tin nhóm nếu đã xác định là nhóm
      const fetchGroupInfo = async () => {
        if (id && isGroup) {
          try {
            console.log("Fetching group info on focus...");
            const groupRes = await groupService.getGroupById(id);
            const roleRes = await groupService.isGroupSubAdmin({
              groupId: id,
              userId: user.id,
            });

            if (groupRes && groupRes._id) {
              console.log("Group info fetched:", groupRes);
              console.log("Role info:", roleRes);
              setReceiverGroup(groupRes);
              setAdminGroup(roleRes.isMainAdmin);
              setSubAdminGroup(roleRes.isSubAdmin);
            }
          } catch (error) {
            console.error("Lỗi khi fetch thông tin nhóm:", error);
          }
        }
      };

      // Thêm một khoảng thời gian nhỏ để đảm bảo isGroup đã được xác định
      const timer = setTimeout(() => {
        fetchGroupInfo();
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }, [id, user.id, isGroup])
  );

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

  // Xóa nhóm
  const handleDeleteGroup = async () => {
    Alert.alert("Thông báo", "Bạn có chắc chắn muốn xóa nhóm này không?", [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const response = await groupService.deleteGroup(id);
            if (response.status === "ok") {
              Alert.alert("Thông báo", response.message, [
                { text: "OK", onPress: () => navigation.navigate("Home") },
              ]);
            }
            if (response.status === "error") {
              Alert.alert("Thông báo", response.message);
            }
          } catch (error) {
            console.error("Lỗi khi xóa nhóm:", error);
          }
        },
      },
    ]);
  };

  // Rời khỏi nhóm
  const handleLeaveGroup = async () => {
    try {
      // const isAdmin = user.id === receiverGroup.admin_id;

      if (adminGroup) {
        // Nếu là admin chính, hiển thị modal chọn admin mới
        setIsSelectAdminModalVisible(true);
      } else {
        // Nếu là thành viên thường, hiển thị xác nhận rời nhóm
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
          { text: "Hủy" },
          {
            text: "Xác nhận",
            onPress: async () => {
              try {
                const response = await groupService.removeMember({
                  groupId: id,
                  userId: user.id,
                });

                if (response.status === "ok") {
                  socketService.handleLeaveGroup({
                    groupId: id,
                    userId: user.id,
                  });
                  Alert.alert("Thông báo", "Rời nhóm thành công.", [
                    { text: "OK", onPress: () => navigation.navigate("Home") },
                  ]);
                } else {
                  Alert.alert(
                    "Thông báo",
                    "Không thể rời khỏi nhóm. Vui lòng thử lại sau."
                  );
                }
              } catch (error) {
                console.error("Lỗi khi rời nhóm:", error);
                Alert.alert(
                  "Thông báo",
                  "Đã có lỗi xảy ra. Vui lòng thử lại sau."
                );
              }
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý rời nhóm:", error);
      Alert.alert("Thông báo", "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  // Xử lý khi người dùng chọn ảnh đại diện mới cho nhóm
  const handlePickAvatar = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Thông báo",
          "Cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        // Tạo đối tượng formData để gửi ảnh
        const formData = new FormData();
        // Lấy tên file từ URI
        const filename = imageUri.split("/").pop();
        // Đoán mime type
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        // Tạo đối tượng file
        const fileToUpload = {
          uri: imageUri,
          name: filename,
          type: type,
        };

        // Cập nhật ảnh đại diện nhóm
        const response = await groupService.updateGroupAvatar({
          groupId: id,
          avatar: fileToUpload,
          currentUserId: user.id,
        });

        if (response && response.status === "ok") {
          setUpdatedAvatar(imageUri);
          socketService.handleUpdateGroup({
            groupId: id,
            name: "",
            avatar: true,
          });
          Alert.alert("Thông báo", "Cập nhật ảnh đại diện nhóm thành công");
        } else {
          Alert.alert("Thông báo", "Cập nhật ảnh đại diện nhóm thất bại");
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện nhóm:", error);
      Alert.alert("Thông báo", "Không thể cập nhật ảnh đại diện nhóm");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <HeaderOption />
      <View style={styles.profileContainer}>
        {/* <Image
          source={{
            uri: receiverInfo?.avatar_path || receiverGroup?.avatar,
          }}
          style={styles.avatar}
        />
        {!receiverGroup.allow_change_avatar && !adminGroup && !subAdminGroup ? (
          <></>
        ) : (
          <View style={styles.changeAvatarContainer}>
            <TouchableOpacity onPress={handlePickAvatar}>
              <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Hiển thị ảnh */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handlePickAvatar}
          disabled={
            !receiverGroup.allow_change_avatar && !adminGroup && !subAdminGroup
          }
        >
          <Avatar
            size={80}
            rounded
            source={
              updatedAvatar
                ? { uri: updatedAvatar }
                : receiverInfo?.avatar_path
                ? { uri: receiverInfo.avatar_path }
                : receiverGroup?.avatar &&
                  typeof receiverGroup.avatar === "string"
                ? { uri: receiverGroup.avatar }
                : require("../../assets/icons/gif.png")
            }
          />
          {(receiverGroup.allow_change_avatar ||
            adminGroup ||
            subAdminGroup) && (
            <View style={styles.editAvatarButton}>
              <Image
                source={require("../../assets/icons/image.png")}
                style={styles.cameraIcon}
              />
            </View>
          )}
        </TouchableOpacity>
        {/* Hiển thị tên */}
        {!isGroup && <Text style={styles.name}>{name}</Text>}
        {/* Nút chỉnh sửa tên nhóm */}
        {isGroup && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={styles.name}>
              {receiverGroup?.name.length > 15
                ? `${receiverGroup.name.slice(0, 18)}...`
                : receiverGroup.name}
            </Text>

            {receiverGroup.allow_change_name || adminGroup || subAdminGroup ? (
              <TouchableOpacity onPress={() => setIsRenameModalVisible(true)}>
                <Image
                  source={require("../../assets/icons/edit.png")}
                  style={[styles.icon, { marginTop: 10 }]}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      {/* Function under Avatar - User */}
      {!isGroup && (
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
      )}

      {/* Function under Avatar - Group */}
      {isGroup && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            paddingVertical: 15,
          }}
        >
          {/* 1. Tìm tin nhắn */}
          <View style={{ width: 100, gap: 10, alignItems: "center" }}>
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/search.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <Text style={{ textAlign: "center" }}>Tìm tin nhắn</Text>
          </View>
          {/* 2. Thêm thành viên */}
          <View style={{ width: 105, gap: 10, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddMember", { groupId: id })}
            >
              <Image
                source={require("../../assets/icons/add-friend.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <Text>Thêm thành viên</Text>
          </View>
          {/* 3. Đổi ảnh nhóm */}
          {(receiverGroup?.allow_change_avatar ||
            adminGroup ||
            subAdminGroup) && (
            <View style={{ width: 105, gap: 10, alignItems: "center" }}>
              <TouchableOpacity onPress={handlePickAvatar}>
                <Image
                  source={require("../../assets/icons/image.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <Text>Đổi ảnh đại diện</Text>
            </View>
          )}
        </View>
      )}

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
              <TouchableOpacity
                style={styles.component}
                onPress={() => {
                  navigation.navigate("CreateGroup", { friendId: id });
                }}
              >
                <Image
                  source={require("../../assets/icons/add-group.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Tạo nhóm với {name}</Text>
              </TouchableOpacity>
              {/* 3 */}
              {/* <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/add-friend.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Thêm {name} vào nhóm</Text>
              </TouchableOpacity> */}
              {/* 4 */}
              {/* <TouchableOpacity style={styles.component}>
                <Image
                  source={require("../../assets/icons/friend.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>
                  Xem các nhóm chung ({sharedGroups?.length || 0})
                </Text>
              </TouchableOpacity> */}
            </View>
          )}
        </View>

        {/* Dành cho nhóm */}
        {isGroup && (
          <View style={{ gap: 15 }}>
            <View
              style={{
                height: 15,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                marginHorizontal: -20,
              }}
            ></View>
            {adminGroup && (
              <TouchableOpacity
                style={styles.component}
                onPress={() =>
                  navigation.navigate("SettingGroup", { groupId: id })
                }
              >
                <Image
                  source={require("../../assets/icons/setting.png")}
                  style={styles.icon}
                />
                <Text style={styles.title}>Cài đặt nhóm</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.component}
              onPress={() =>
                navigation.navigate("MemberManagement", {
                  groupId: id,
                  adminGroup,
                })
              }
            >
              <Image
                source={require("../../assets/icons/friend.png")}
                style={styles.icon}
              />
              <Text style={styles.title}>Danh sách thành viên</Text>
            </TouchableOpacity>
          </View>
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
            <TouchableOpacity
              style={styles.component}
              onPress={handleLeaveGroup}
            >
              <Image
                source={require("../../assets/icons/out-group.png")}
                style={styles.icon}
              />
              <Text style={{ color: "red", fontSize: 16 }}>Rời khỏi nhóm</Text>
            </TouchableOpacity>
          )}

          {adminGroup && !subAdminGroup && (
            <TouchableOpacity
              style={styles.component}
              onPress={handleDeleteGroup}
            >
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

      {/* Modal Rename Group */}
      <ModalRenameGroup
        visible={isRenameModalVisible}
        onClose={() => setIsRenameModalVisible(false)}
        groupId={id}
        currentName={receiverGroup?.name || ""}
        currentUserId={user.id}
      />

      {/* Modal Select Admin Before Leave */}
      <ModalSelectAdmin
        visible={isSelectAdminModalVisible}
        onClose={() => {
          setIsSelectAdminModalVisible(false);
        }}
        groupId={id}
        currentAdminId={user.id}
      />
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
  avatarContainer: {
    marginRight: 15,
    position: "relative",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2F80ED",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
});

export default Option;
