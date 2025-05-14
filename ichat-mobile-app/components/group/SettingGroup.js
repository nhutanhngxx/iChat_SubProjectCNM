import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Switch,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Avatar } from "@rneui/themed";
import { IconButton, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";
import socketService from "../../services/socketService";
import * as ImagePicker from "expo-image-picker";

const SettingGroup = ({ route }) => {
  const { groupId } = route.params || {};
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Group configuration states
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [allowAddMembers, setAllowAddMembers] = useState(true);
  const [allowChangeName, setAllowChangeName] = useState(true);
  const [allowChangeAvatar, setAllowChangeAvatar] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);

  // Lắng nghe sự kiện từ socket
  useEffect(() => {
    if (!groupId) return;
    socketService.joinRoom(groupId);

    socketService.onMemberApprovalUpdated(({ groupId: receivedGroupId }) => {
      if (groupId === receivedGroupId) {
        fetchGroupDetails();
      }
    });

    socketService.onGroupUpdated(({ groupId: receivedGroupId }) => {
      if (groupId === receivedGroupId) {
        fetchGroupDetails();
      }
    });

    socketService.onRoleUpdated(
      ({ groupId: receivedGroupId, userId, role }) => {
        if (groupId === receivedGroupId) {
          if (userId === user.id) {
            setIsAdmin(role === "admin");
            setIsSubAdmin(role === "sub_admin");
          }
        }
      }
    );

    socketService.onMemberLeft(({ groupId: receivedGroupId, userId }) => {
      if (groupId === receivedGroupId) {
        if (userId === user.id) {
          navigation.navigate("Home");
        } else {
          fetchPendingMembers();
        }
      }
    });

    socketService.handleRejectMember(({ groupId: receivedGroupId }) => {
      if (groupId === receivedGroupId) {
        fetchPendingMembers();
      }
    });

    socketService.handleAcceptMember(({ groupId: receivedGroupId }) => {
      if (groupId === receivedGroupId) {
        fetchPendingMembers();
      }
    });

    return () => {
      if (groupId) {
        socketService.removeAllListeners();
        socketService.leaveRoom(groupId);
      }
    };
  }, [groupId, user?.id]);

  // Lấy thông tin nhóm
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const group = await groupService.getGroupById(groupId);
      const groupMembers = await groupService.getGroupMembers(groupId);

      if (group) {
        setGroupName(group.name);
        setGroupAvatar(group.avatar);
        setAllowAddMembers(group.require_approval);
        setAllowChangeName(group.allow_change_name);
        setAllowChangeAvatar(group.allow_change_avatar);

        // Kiểm tra quyền của người dùng hiện tại trong nhóm
        const currentUserMember = groupMembers.find(
          (member) => member.user_id === user.id
        );
        if (currentUserMember) {
          setIsAdmin(currentUserMember.role === "admin");
          setIsSubAdmin(currentUserMember.role === "sub_admin");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
      Alert.alert("Thông báo", "Không thể lấy thông tin nhóm");
    }
  };

  // Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
  const fetchPendingMembers = async () => {
    try {
      const members = await groupService.getPendingMembers(groupId);
      setPendingMembers(members);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể lấy danh sách yêu cầu tham gia");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lấy thông tin nhóm và danh sách yêu cầu tham gia khi component được mount
  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchPendingMembers();
    }
  }, [groupId]);

  // Xử lý khi người dùng làm mới danh sách
  const handleRefresh = () => {
    setRefreshing(true);
    fetchGroupDetails();
    fetchPendingMembers();
  };

  // Xử lý khi người dùng thay đổi tên nhóm
  const handleUpdateGroupName = async () => {
    try {
      if (!groupName.trim()) {
        Alert.alert("Thông báo", "Tên nhóm không được để trống");
        return;
      }

      const response = await groupService.renameGroup({
        groupId,
        name: groupName.trim(),
        currentUserId: user.id,
      });

      if (response.status === "ok") {
        socketService.handleUpdateGroup({
          groupId,
          name: groupName.trim(),
          avatar: "",
        });
        Alert.alert("Thông báo", "Đổi tên nhóm thành công");
      } else {
        Alert.alert("Thông báo", "Đổi tên nhóm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đổi tên nhóm:", error);
      Alert.alert("Thông báo", "Không thể đổi tên nhóm");
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
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setGroupAvatar(imageUri);

        // Cập nhật ảnh đại diện nhóm
        const response = await groupService.updateGroupAvatar({
          groupId,
          avatar: imageUri,
          currentUserId: user.id,
        });

        if (response && response.status === "ok") {
          socketService.handleUpdateGroup({
            groupId,
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

  // Xử lý khi người dùng thay đổi cài đặt nhóm
  const handleUpdateGroupSettings = async () => {
    try {
      const response = await groupService.updateGroupSettings({
        groupId,
        allow_add_members: allowAddMembers,
        allow_change_name: allowChangeName,
        allow_change_avatar: allowChangeAvatar,
        currentUserId: user.id,
      });

      if (response && response.status === "ok") {
        Alert.alert("Thông báo", "Cập nhật cài đặt nhóm thành công");
      } else {
        Alert.alert("Thông báo", "Cập nhật cài đặt nhóm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật cài đặt nhóm:", error);
      Alert.alert("Thông báo", "Không thể cập nhật cài đặt nhóm");
    }
  };

  // Xử lý khi người dùng chấp nhận yêu cầu tham gia
  const handleAcceptRequest = async (memberId) => {
    try {
      const response = await groupService.acceptMember({
        groupId,
        memberId,
        adminId: user.id,
      });

      if (response) {
        socketService.handleAcceptMember({
          groupId,
          memberId,
        });
        Alert.alert("Thông báo", "Đã chấp nhận yêu cầu tham gia");
      } else {
        Alert.alert("Thông báo", "Không thể chấp nhận yêu cầu tham gia");
      }
      fetchPendingMembers();
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể chấp nhận yêu cầu tham gia");
    }
  };

  // Xử lý khi người dùng từ chối yêu cầu tham gia
  const handleRejectRequest = async (memberId) => {
    try {
      const response = await groupService.rejectMember({
        groupId,
        memberId,
        adminId: user.id,
      });
      console.log(response);

      if (response === "ok") {
        Alert.alert("Thông báo", "Đã từ chối yêu cầu tham gia");
      } else {
        Alert.alert("Thông báo", "Không thể từ chối yêu cầu tham gia");
      }
      fetchPendingMembers();
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể từ chối yêu cầu tham gia");
    }
  };

  // Render item cho danh sách yêu cầu tham gia
  const renderPendingMemberItem = ({ item }) => {
    return (
      <View style={styles.memberRow} key={item.user_id}>
        {/* Thông tin thành viên và người mời */}
        <View style={styles.memberInfo}>
          <Avatar size={50} rounded source={{ uri: item.member.avatar_path }} />
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.member.full_name}</Text>
            <Text style={styles.memberInvitedBy}>
              Được mời bởi: {item.invited_by.full_name}
            </Text>
          </View>
        </View>
        {/* Nút chấp nhận và từ chối */}
        <View style={styles.actionButtons}>
          <IconButton
            icon="check"
            iconColor="#2F80ED"
            size={24}
            onPress={() => handleAcceptRequest(item.user_id)}
            style={styles.actionButton}
          />
          <IconButton
            icon="close"
            iconColor="#FF0000"
            size={24}
            onPress={() => handleRejectRequest(item.user_id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={[styles.icon, { tintColor: "white" }]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt nhóm</Text>
          <View style={{ width: 25 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F80ED" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {/* Phần thông tin nhóm */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin nhóm</Text>
              <View style={styles.groupInfoContainer}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={handlePickAvatar}
                  disabled={!isAdmin && !isSubAdmin && !allowChangeAvatar}
                >
                  <Avatar
                    size={80}
                    rounded
                    source={
                      groupAvatar
                        ? { uri: groupAvatar }
                        : require("../../assets/icons/gif.png")
                    }
                  />
                  {(isAdmin || isSubAdmin || allowChangeAvatar) && (
                    <View style={styles.editAvatarButton}>
                      <Image
                        source={require("../../assets/icons/image.png")}
                        style={styles.cameraIcon}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.groupNameContainer}>
                  <TextInput
                    style={styles.groupNameInput}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Tên nhóm"
                    editable={isAdmin || isSubAdmin || allowChangeName}
                  />
                  {(isAdmin || isSubAdmin || allowChangeName) && (
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleUpdateGroupName}
                    >
                      <Text style={styles.saveButtonText}>Lưu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Phần cài đặt quyền (chỉ hiển thị cho admin) */}
            {isAdmin && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quyền thành viên</Text>

                <View style={styles.permissionItem}>
                  <Text style={styles.permissionText}>
                    Cho phép thành viên thêm bạn vào nhóm (Phê duyệt thành viên)
                  </Text>
                  <Switch
                    value={allowAddMembers}
                    onValueChange={setAllowAddMembers}
                    color="#2F80ED"
                  />
                </View>

                <View style={styles.permissionItem}>
                  <Text style={styles.permissionText}>
                    Cho phép thành viên đổi tên nhóm
                  </Text>
                  <Switch
                    value={allowChangeName}
                    onValueChange={setAllowChangeName}
                    color="#2F80ED"
                  />
                </View>

                <View style={styles.permissionItem}>
                  <Text style={styles.permissionText}>
                    Cho phép thành viên đổi ảnh nhóm
                  </Text>
                  <Switch
                    value={allowChangeAvatar}
                    onValueChange={setAllowChangeAvatar}
                    color="#2F80ED"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveSettingsButton}
                  onPress={handleUpdateGroupSettings}
                >
                  <Text style={styles.saveSettingsButtonText}>Lưu cài đặt</Text>
                </TouchableOpacity>
              </View>
            )}

            <Divider style={styles.divider} />

            {/* Phần quản lý thành viên */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quản lý thành viên</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() =>
                  navigation.navigate("MemberManagement", { groupId })
                }
              >
                <Image
                  source={require("../../assets/icons/friend.png")}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Danh sách thành viên</Text>
                {/* <Image
                  source={require("../../assets/icons/next.png")}
                  style={styles.nextIcon}
                /> */}
              </TouchableOpacity>

              {(isAdmin || isSubAdmin) && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => navigation.navigate("AddMember", { groupId })}
                >
                  <Image
                    source={require("../../assets/icons/add.png")}
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>Thêm thành viên</Text>
                  {/* <Image
                    source={require("../../assets/icons/gif.png")}
                    style={styles.nextIcon}
                  /> */}
                </TouchableOpacity>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Phần yêu cầu tham gia đang chờ duyệt */}
            {/* {(isAdmin || isSubAdmin) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Yêu cầu tham gia đang chờ duyệt
                </Text>

                {pendingMembers.length > 0 ? (
                  pendingMembers.map((item) =>
                    renderPendingMemberItem({ item })
                  )
                ) : (
                  <View style={styles.emptyPendingContainer}>
                    <Image
                      source={require("../../assets/icons/notification.png")}
                      style={[styles.emptyIcon, { tintColor: "#ccc" }]}
                    />
                    <Text style={styles.emptyText}>
                      Không có yêu cầu tham gia nào
                    </Text>
                  </View>
                )}
              </View>
            )} */}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2F80ED",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 15,
    textAlign: "center",
  },
  icon: {
    width: 25,
    height: 25,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  // Group info styles
  groupInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    width: 16,
    height: 16,
    tintColor: "white",
  },
  groupNameContainer: {
    flex: 1,
  },
  groupNameInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#2F80ED",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Permission styles
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  permissionText: {
    fontSize: 16,
    flex: 1,
    paddingRight: 10,
  },
  saveSettingsButton: {
    backgroundColor: "#2F80ED",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveSettingsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Option button styles
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  nextIcon: {
    width: 20,
    height: 20,
    tintColor: "#888",
  },
  // Pending members styles
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberDetails: {
    marginLeft: 15,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberInvitedBy: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyPendingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default SettingGroup;
