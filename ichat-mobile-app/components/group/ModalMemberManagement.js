import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { Switch } from "react-native-paper";
import { Avatar } from "@rneui/themed";
import { Tab } from "@rneui/themed";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";
import friendService from "../../services/friendService";
import ModalMemberInfo from "./ModalMemberInfo";
import ModalSelectAdmin from "./ModalSelectAdmin";
import socketService from "../../services/socketService";

const ModalMemberManagement = ({ route }) => {
  const { groupId } = route.params || {};
  const [adminGroup, setAdminGroup] = useState(false);
  const [subAdminGroup, setSubAdminGroup] = useState(false);
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [index, setIndex] = useState(0); // Tab hiện tại
  const [group, setGroup] = useState(null); // Thông tin nhóm
  const [members, setMembers] = useState([]); // Danh sách thành viên
  const [searchText, setSearchText] = useState(""); // Từ khóa tìm kiếm
  const [filteredMembers, setFilteredMembers] = useState([]); // Danh sách thành viên đã lọc
  const [friendList, setFriendList] = useState([]); // Danh sách bạn bè
  const [showSearch, setShowSearch] = useState(false); // Bật tắt hiển thị thanh tìm kiếm
  const [selectedMember, setSelectedMember] = useState(null); // Thành viên được chọn
  const [memberModalVisible, setMemberModalVisible] = useState(false); // Modal thông tin thành viên
  const [isChecked, setIsChecked] = useState(false); // Trạng thái switch phê duyệt thành viên
  const [memberRelationships, setMemberRelationships] = useState({}); // Kiểm tra mối quan hệ giữa người dùng và thành viên trong nhóm - friend, stranger
  const [selectAdminModalVisible, setSelectAdminModalVisible] = useState(false); // Modal chọn quản trị viên mới
  const [currentAdminId, setCurrentAdminId] = useState(null); // ID của quản trị viên hiện tại
  const [invitedMembers, setInvitedMembers] = useState([]); // Danh sách thành viên được mời bởi người dùng hiện tại

  console.log("Admin group:", adminGroup);
  console.log("Sub admin group:", subAdminGroup);

  // Lắng nghe sự kiện từ socket
  useEffect(() => {
    if (!groupId) return;

    socketService.joinRoom(groupId);

    // Lắng nghe sự kiện thêm/xóa thành viên
    socketService.onMemberAdded(({ groupId: receivedGroupId, userIds }) => {
      if (groupId === receivedGroupId) {
        fetchGroupMembers();
        fetchInvitedMembers();
      }
    });
    socketService.onMemberRemoved(({ groupId: receivedGroupId, userId }) => {
      if (groupId === receivedGroupId) {
        // Nếu người bị xóa là người dùng hiện tại, thông báo và chuyển hướng về Home
        if (userId === user.id) {
          Alert.alert("Thông báo", "Bạn đã bị xóa khỏi nhóm", [
            { text: "OK", onPress: () => navigation.navigate("Home") },
          ]);
          return;
        }
        fetchGroupMembers();
        // Cập nhật danh sách thành viên
        // setMembers((prev) =>
        //   prev.filter((member) => member.user_id !== userId)
        // );
        // setFilteredMembers((prev) =>
        //   prev.filter((member) => member.user_id !== userId)
        // );
      }
    });

    // Lắng nghe sự kiện chuyển quyền quản trị viên
    socketService.onAdminTransferred(
      async ({ groupId: receivedGroupId, userId }) => {
        if (groupId === receivedGroupId) {
          fetchGroupInfo();
          fetchGroupMembers();
          // Cập nhật trạng thái admin
          const isCurrentUserNewAdmin = user.id === group.admin_id;
          setAdminGroup(isCurrentUserNewAdmin);

          // Cập nhật thông tin thành viên được chọn khi modal đang hiển thị
          if (selectedMember) {
            if (selectedMember.user_id === userId) {
              setSelectedMember({
                ...selectedMember,
                role: "admin",
              });
            } else if (selectedMember.role === "admin") {
              setSelectedMember({
                ...selectedMember,
                role: "member",
              });
            }
          }
        }
      }
    );

    // Lắng nghe sự kiện cập nhật quyền thành viên
    socketService.onRoleUpdated(
      async ({ groupId: receivedGroupId, userId, role }) => {
        if (groupId === receivedGroupId) {
          const updatedMembers = await groupService.getGroupMembers(groupId);
          setMembers(updatedMembers);

          if (selectedMember && selectedMember.user_id === userId) {
            setSelectedMember({ ...selectedMember, role });
          }
        }
      }
    );

    // Lắng nghe sự kiện cập nhật trạng thái phê duyệt thành viên
    socketService.onMemberApprovalUpdated(
      ({ groupId: receivedGroupId, requireApproval }) => {
        if (groupId === receivedGroupId) {
          setIsChecked(requireApproval);
        }
      }
    );

    // Lắng nghe sự kiện thành viên được chấp nhận vào nhóm
    socketService.onMemberAccepted(({ groupId: receivedGroupId, memberId }) => {
      if (groupId === receivedGroupId) {
        fetchGroupMembers();
      }
    });

    // Lắng nghe sự kiện thành viên rời nhóm
    socketService.onMemberLeft(({ groupId: receivedGroupId, userId }) => {
      if (groupId === receivedGroupId) {
        if (userId === user.id) {
          navigation.navigate("Home");
        } else {
          fetchGroupMembers();
        }
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [groupId, user.id, navigation]);

  const fetchGroupInfo = async () => {
    try {
      const groupInfo = await groupService.getGroupById(groupId);
      const roleRes = await groupService.isGroupSubAdmin({
        groupId: groupId,
        userId: user.id,
      });
      setGroup(groupInfo);
      setAdminGroup(roleRes.isMainAdmin);
      setSubAdminGroup(roleRes.isSubAdmin);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const membersList = await groupService.getGroupMembers(groupId);
      setMembers(membersList);
      setFilteredMembers(membersList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên:", error);
    }
  };

  // Lấy thông tin nhóm và thành viên
  useEffect(() => {
    if (!groupId) return;
    fetchGroupInfo();
    fetchGroupMembers();
  }, [groupId]);

  // Lấy danh sách bạn bè và xác định mối quan hệ
  useEffect(() => {
    if (!user?.id) return;

    const fetchFriendList = async () => {
      try {
        const friends = await friendService.getFriendListByUserId(user.id);
        setFriendList(friends);

        // Xác định mối quan hệ với từng thành viên
        const relationships = {};
        members.forEach((member) => {
          if (member.user_id === user.id) {
            relationships[member.user_id] = "self";
          } else {
            // Kiểm tra xem thành viên có trong danh sách bạn bè không
            const isFriend = friends.some(
              (friend) => friend.id === member.user_id
            );
            relationships[member.user_id] = isFriend ? "friend" : "stranger";
          }
        });

        setMemberRelationships(relationships);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    };

    fetchFriendList();
  }, [user?.id, members]);

  // Lấy danh sách thành viên được mời bởi người dùng
  const fetchInvitedMembers = async () => {
    try {
      const invitedMembersList = await groupService.getInvitedMembersByUserId({
        groupId: groupId,
        userId: user.id,
      });
      setInvitedMembers(invitedMembersList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên được mời:", error);
    }
  };
  useEffect(() => {
    if (!user?.id || index !== 2) return;
    fetchInvitedMembers();
  }, [user?.id, index]);

  // Lọc thành viên theo tab
  useEffect(() => {
    if (!members.length && index !== 2) return;

    let filtered = [];

    // Lọc theo tab
    switch (index) {
      case 0: // All
        filtered = [...members];
        break;
      case 1: // Quản trị viên
        filtered = members.filter((member) => member.role === "admin");
        break;
      case 2: // Đã mời
        if (invitedMembers.length > 0) {
          // Format lại dữ liệu từ API để hiển thị
          filtered = invitedMembers.map((item) => ({
            user_id: item.member._id,
            full_name: item.member.full_name,
            avatar_path: item.member.avatar_path,
            role: "member",
            status: "approved",
            invited_by_current_user: true,
          }));
        }
        break;
      default:
        filtered = [...members];
        break;
    }

    // Lọc theo tìm kiếm
    if (searchText && filtered.length > 0) {
      filtered = filtered.filter((member) =>
        member.full_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [index, members, searchText, invitedMembers]);

  // Xử lý khi nhấn vào thành viên
  const handleMemberPress = (member) => {
    setSelectedMember(member);
    setMemberModalVisible(true);
  };

  // Đóng modal thông tin thành viên
  const closeMemberModal = () => {
    setMemberModalVisible(false);
    setSelectedMember(null);
  };

  // Cập nhật thông tin thành viên khi modal được hiển thị
  useEffect(() => {
    if (selectedMember && memberModalVisible) {
      const updatedMember = members.find(
        (m) => m.user_id === selectedMember.user_id
      );
      if (updatedMember) {
        setSelectedMember(updatedMember);
      }
    }
  }, [members, memberModalVisible]);

  // Lấy trạng thái phê duyệt thành viên
  useEffect(() => {
    if (!groupId) return;

    const fetchMemberApproval = async () => {
      try {
        const response = await groupService.checkMemberApproval(groupId);
        setIsChecked(response);
      } catch (error) {
        console.error(
          "Lỗi khi kiểm tra trạng thái phê duyệt thành viên:",
          error
        );
      }
    };

    fetchMemberApproval();
  }, [groupId]);

  // Hàm xử lý switch phê duyệt thành viên
  const handleUpdateMemberApproval = async (value) => {
    try {
      setIsChecked(value);

      const response = await groupService.updateMemberApproval({
        groupId,
        requireApproval: value,
      });

      socketService.handleUpdateMemberApproval({
        groupId,
        requireApproval: value,
      });

      if (!response) {
        setIsChecked(!value);
        Alert.alert(
          "Thông báo",
          "Không thể cập nhật trạng thái phê duyệt thành viên"
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái phê duyệt thành viên:", error);
      setIsChecked(!value);
      Alert.alert(
        "Thông báo",
        "Không thể cập nhật trạng thái phê duyệt thành viên"
      );
    }
  };

  // Xử lý khi người dùng muốn rời nhóm
  const handleLeaveGroup = () => {
    // Kiểm tra xem người dùng có phải là admin không
    const userMember = members.find((member) => member.user_id === user.id);

    if (adminGroup) {
      // Nếu là admin, hiển thị modal chọn admin mới
      const adminMember = members.find((member) => member.role === "admin");
      if (adminMember) {
        setCurrentAdminId(adminMember.user_id);
      }
      setSelectAdminModalVisible(true);
    } else {
      // Nếu không phải admin, hiển thị xác nhận rời nhóm
      confirmLeaveGroup();
    }
  };

  // Xác nhận rời nhóm
  const confirmLeaveGroup = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm này?", [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const response = await groupService.removeMember({
              groupId,
              userId: user.id,
            });

            if (response.status === "ok") {
              socketService.handleLeaveGroup({
                groupId,
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
            Alert.alert("Thông báo", "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  // Render thành viên
  const renderMemberItem = ({ item }) => {
    const isCurrentUser = item.user_id === user.id;
    let roleDisplay = "";
    if (group && String(item.user_id) === String(group.admin_id)) {
      roleDisplay = "Nhóm trưởng";
    } else if (item.role === "admin") {
      roleDisplay = "Nhóm phó";
    }
    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => handleMemberPress(item)}
      >
        <View style={styles.memberInfo}>
          <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>
              {isCurrentUser ? "Bạn" : item.full_name}
            </Text>
            <Text style={styles.memberRole}>{roleDisplay}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.memberAction}
          onPress={() => handleMemberPress(item)}
        >
          <Image
            source={require("../../assets/icons/more.png")}
            style={[styles.moreIcon, { tintColor: "#888" }]}
          />
        </TouchableOpacity>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Quản lý thành viên</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddMember", { groupId })}
          >
            <Image
              source={require("../../assets/icons/add.png")}
              style={[styles.icon, { tintColor: "white" }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={{ marginLeft: 10 }}
          >
            <Image
              source={require("../../assets/icons/search.png")}
              style={[styles.icon]}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm thành viên..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          </View>
        )}

        {/* Tabs */}
        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={styles.tabIndicator}
          variant="default"
          dense
        >
          <Tab.Item
            title="Tất cả"
            titleStyle={{
              color: index === 0 ? "white" : "rgba(255, 255, 255, 0.7)",
              fontWeight: index === 0 ? "bold" : "normal",
              fontSize: 14,
            }}
          />
          <Tab.Item
            title="Quản trị viên"
            titleStyle={{
              color: index === 1 ? "white" : "rgba(255, 255, 255, 0.7)",
              fontWeight: index === 1 ? "bold" : "normal",
              fontSize: 14,
            }}
          />
          <Tab.Item
            title="Đã mời"
            titleStyle={{
              color: index === 2 ? "white" : "rgba(255, 255, 255, 0.7)",
              fontWeight: index === 2 ? "bold" : "normal",
              fontSize: 14,
            }}
          />
        </Tab>
      </SafeAreaView>

      {/* Option */}
      {adminGroup && (
        <View style={styles.approvalContainer}>
          <View style={styles.approvalInfo}>
            <Image
              source={require("../../assets/icons/setting.png")}
              style={[styles.icon, { marginRight: 10, tintColor: "#2F80ED" }]}
            />
            <View>
              <Text style={styles.approvalTitle}>Phê duyệt thành viên</Text>
              <Text style={styles.approvalDescription}>
                Khi được bật, yêu cầu tham gia nhóm phải được duyệt bởi quản trị
                viên.
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Switch
              value={isChecked}
              onValueChange={() => handleUpdateMemberApproval(!isChecked)}
              color="#2F80ED"
            />
          </View>
        </View>
      )}
      {isChecked && (adminGroup || subAdminGroup) && (
        <TouchableOpacity
          style={styles.pendingInvitationsContainer}
          onPress={() => navigation.navigate("PendingInvitations", { groupId })}
        >
          <View style={styles.approvalInfo}>
            <Image
              source={require("../../assets/icons/notification.png")}
              style={[styles.icon, { marginRight: 10, tintColor: "#2F80ED" }]}
            />
            <View>
              <Text style={styles.approvalTitle}>Lời mời đang chờ duyệt</Text>
              <Text style={styles.approvalDescription}>
                Xem danh sách các lời mời vào nhóm đang chờ được chấp thuận
              </Text>
            </View>
          </View>
          <Image
            source={require("../../assets/icons/next.png")}
            style={[styles.icon, { tintColor: "#2F80ED" }]}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {/* Members List */}
        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.membersSectionTitle}>
              Thành viên ({filteredMembers.length})
            </Text>
          </View>

          {index === 2 && filteredMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa mời ai vào nhóm này</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.user_id.toString() + index}
              // keyExtractor={(item, index) =>
              //   `${item.chatType}_${item.id}_${index}`
              // }
              renderItem={renderMemberItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Modal thông tin thành viên */}
      <ModalMemberInfo
        visible={memberModalVisible}
        onClose={closeMemberModal}
        member={selectedMember}
        currentUserId={user.id}
        adminGroup={adminGroup}
        relationshipType={
          selectedMember
            ? memberRelationships[selectedMember.user_id] || "stranger"
            : "stranger"
        }
        // Xem thông tin thành viên
        onViewProfile={() => {
          closeMemberModal();
        }}
        // Chỉ định làm quản trị viên
        onAppointAdmin={() => {
          Alert.alert(
            "Thông báo",
            `Bạn có chắc chắn muốn chỉ định ${selectedMember?.full_name} làm quản trị viên không?`,
            [
              { text: "Hủy" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const response = await groupService.appointAdmin({
                      groupId,
                      newAdimUserId: selectedMember?.user_id,
                      userId: user?.id,
                    });

                    if (response.status === "ok") {
                      socketService.handleTransferAdmin({
                        groupId,
                        userId: selectedMember?.user_id,
                      });
                      // setAdminGroup(false);
                      Alert.alert("Thông báo", response.message);
                    } else {
                      Alert.alert(
                        "Thông báo",
                        "Chỉ định quản trị viên thất bại"
                      );
                    }
                  } catch (error) {
                    console.error("Lỗi khi chỉ định quản trị viên:", error);
                  }
                  closeMemberModal();
                },
              },
            ]
          );
        }}
        onAppointSubAdmin={() => {
          Alert.alert(
            "Thông báo",
            `Bạn có chắc chắn muốn chỉ định ${selectedMember?.full_name} làm phó nhóm không?`,
            [
              { text: "Hủy" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const response = await groupService.setRole({
                      groupId,
                      userId: selectedMember?.user_id,
                      role: "admin",
                      adminId: user.id,
                    });
                    socketService.handleSetRole({
                      groupId,
                      userId: selectedMember?.user_id,
                      role: "admin",
                    });

                    if (response.status === "ok") {
                      Alert.alert("Thông báo", "Chỉ định phó nhóm thành công!");
                    } else {
                      Alert.alert("Thông báo", "Chỉ định phó nhóm thất bại");
                    }
                  } catch (error) {
                    console.error("Lỗi khi chỉ định phó nhóm:", error);
                  }
                  closeMemberModal();
                },
              },
            ]
          );
        }}
        onRecallSubAdmin={() => {
          Alert.alert(
            "Thông báo",
            `Bạn có chắc chắn muốn thu hồi quyền phó nhóm của ${selectedMember?.full_name} không?`,
            [
              { text: "Hủy" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const response = await groupService.setRole({
                      groupId,
                      userId: selectedMember?.user_id,
                      role: "member",
                      adminId: user.id,
                    });
                    socketService.handleSetRole({
                      groupId,
                      userId: selectedMember?.user_id,
                      role: "member",
                    });

                    if (response.status === "ok") {
                      Alert.alert(
                        "Thông báo",
                        "Thu hồi quyền phó nhóm thành công!"
                      );
                    } else {
                      Alert.alert(
                        "Thông báo",
                        "Thu hồi quyền phó nhóm thất bại"
                      );
                    }
                  } catch (error) {
                    console.error("Lỗi khi thu hồi quyền phó nhóm:", error);
                  }
                  closeMemberModal();
                },
              },
            ]
          );
        }}
        // Xóa thành viên khỏi nhóm
        onRemoveMember={() => {
          Alert.alert(
            "Thông báo",
            `Bạn có chắc chắn muốn xóa ${selectedMember?.full_name} ra khỏi nhóm này không?`,
            [
              { text: "Hủy" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const response = await groupService.removeMember({
                      groupId,
                      userId: selectedMember?.user_id,
                      adminId: user.id,
                    });

                    if (response.status === "ok") {
                      socketService.handleRemoveMember({
                        groupId,
                        userId: selectedMember?.user_id,
                      });
                      Alert.alert("Thông báo", response.message);
                    } else {
                      Alert.alert("Thông báo", "Xóa thành viên thất bại");
                    }
                  } catch (error) {
                    console.error("Lỗi khi xóa thành viên khỏi nhóm:", error);
                  }
                  closeMemberModal();
                },
              },
            ]
          );
        }}
        onAddFriend={() => {
          console.log("Gửi lời mời kết bạn tới:", selectedMember?.full_name);
        }}
        onSendMessage={() => {
          console.log("Mở cuộc trò chuyện với:", selectedMember?.full_name);
          closeMemberModal();
        }}
        onLeaveGroup={handleLeaveGroup}
      />

      {/* Modal chọn quản trị viên mới */}
      <ModalSelectAdmin
        visible={selectAdminModalVisible}
        onClose={() => setSelectAdminModalVisible(false)}
        currentAdminId={currentAdminId}
        groupId={groupId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
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
  },
  icon: {
    width: 25,
    height: 25,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: "white",
  },
  tabIndicator: {
    backgroundColor: "white",
    height: 3,
    width: "15%",
    marginLeft: "9%",
  },
  // Phê duyệt thành viên
  approvalContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pendingInvitationsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
  },
  approvalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  approvalDescription: {
    fontSize: 12,
    color: "#888",
    maxWidth: "90%",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  membersSection: {
    flex: 1,
  },
  membersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  moreIcon: {
    width: 20,
    height: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberDetails: {
    marginLeft: 15,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberRole: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  memberAction: {
    padding: 5,
  },
  leaveGroupButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  leaveGroupText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ModalMemberManagement;
