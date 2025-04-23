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
  Modal,
} from "react-native";
import { Avatar } from "@rneui/themed";
import { Tab } from "@rneui/themed";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";

const ModalMemberManagement = ({ route }) => {
  const { groupId } = route.params || {};
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [index, setIndex] = useState(0);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberModalVisible, setMemberModalVisible] = useState(false);

  // Lấy thông tin nhóm và thành viên
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupInfo = async () => {
      try {
        const groupInfo = await groupService.getGroupById(groupId);
        setGroup(groupInfo);
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

    fetchGroupInfo();
    fetchGroupMembers();
  }, [groupId]);

  // Lọc thành viên theo tab
  useEffect(() => {
    if (!members.length) return;

    let filtered = [...members];

    // Lọc theo tab
    switch (index) {
      case 0: // All
        break;
      case 1: // Owner and admins
        filtered = filtered.filter((member) => member.role === "admin");
        break;
      case 2: // Invited
        filtered = filtered.filter((member) => member.status === "invited");
        break;
      case 3: // Blocked
        filtered = filtered.filter((member) => member.status === "blocked");
        break;
      default:
        break;
    }

    // Lọc theo tìm kiếm
    if (searchText) {
      filtered = filtered.filter((member) =>
        member.full_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [index, members, searchText]);

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

  // Render thành viên
  const renderMemberItem = ({ item }) => {
    const isCurrentUser = item.user_id === user.id;
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
            <Text style={styles.memberRole}>
              {isCurrentUser && item.role === "admin"
                ? "Quản trị viên"
                : "Thành viên"}
              {/* // : item.added_by // ? `Added by ${item.added_by}` // : "" } */}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.memberAction}
          onPress={() => handleMemberPress(item)}
        >
          <Image
            source={require("../../assets/icons/more.png")}
            style={styles.moreIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render các mục quản lý
  const renderManagementItem = ({ icon, title, avatars, onPress }) => (
    <TouchableOpacity style={styles.managementItem} onPress={onPress}>
      <View style={styles.managementInfo}>
        <View style={styles.managementIcon}>
          <Image source={icon} style={styles.icon} />
        </View>
        <Text style={styles.managementTitle}>{title}</Text>
      </View>
      {avatars && (
        <View style={styles.avatarContainer}>
          {avatars.map((avatar, index) => (
            <Avatar
              key={index}
              size={30}
              rounded
              containerStyle={[styles.avatar, { marginLeft: index * -10 }]}
              source={{ uri: avatar }}
            />
          ))}
          {avatars.length > 3 && (
            <View
              style={[
                styles.avatar,
                styles.moreAvatar,
                { marginLeft: 3 * -10 },
              ]}
            >
              <Text style={styles.moreAvatarText}>+{avatars.length - 3}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

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
            onPress={() => navigation.navigate("ModalAddMember", { groupId })}
          >
            <Image
              source={require("../../assets/icons/add.png")}
              style={[styles.icon, { tintColor: "white" }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Image
              source={require("../../assets/icons/search.png")}
              style={[styles.icon, { tintColor: "white" }]}
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

      <View style={styles.content}>
        {/* Management Options */}
        <View style={styles.managementOptions}>
          {renderManagementItem({
            icon: require("../../assets/icons/add.png"),
            title: "Phê duyệt thành viên",
            onPress: () => {},
          })}
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.membersSectionTitle}>
              Members ({filteredMembers.length})
            </Text>
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/more.png")}
                style={styles.moreIcon}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={renderMemberItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Modal thông tin thành viên */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={memberModalVisible}
        onRequestClose={closeMemberModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Member information</Text>
              <TouchableOpacity
                onPress={closeMemberModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <View style={styles.modalContent}>
                {/* Thông tin thành viên */}
                <View style={styles.memberModalInfo}>
                  <Avatar
                    size={80}
                    rounded
                    source={{ uri: selectedMember.avatar_path }}
                    containerStyle={styles.memberModalAvatar}
                  />
                  <Text style={styles.memberModalName}>
                    {selectedMember.user_id === user.id
                      ? "Bạn"
                      : selectedMember.full_name}
                  </Text>
                </View>

                {/* Các tùy chọn */}
                <View style={styles.memberModalOptions}>
                  <TouchableOpacity style={styles.memberModalOption}>
                    <Text style={styles.optionText}>View profile</Text>
                  </TouchableOpacity>

                  {selectedMember.role !== "admin" && (
                    <TouchableOpacity style={styles.memberModalOption}>
                      <Text style={styles.optionText}>Appoint as admin</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.memberModalOption}>
                    <Text style={styles.optionText}>Block member</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.memberModalOption}>
                    <Text style={[styles.optionText, styles.dangerText]}>
                      Remove from this group
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Nút gọi và nhắn tin */}
                <View style={styles.memberModalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Image
                      source={require("../../assets/icons/phone-call.png")}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Image
                      source={require("../../assets/icons/add.png")}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  },
  icon: {
    width: 24,
    height: 24,
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
    marginLeft: "5%",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  managementOptions: {
    marginBottom: 20,
  },
  managementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  managementInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  managementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "white",
  },
  moreAvatar: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  moreAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 15,
  },
  memberModalInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  memberModalAvatar: {
    marginBottom: 10,
  },
  memberModalName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  memberModalOptions: {
    marginBottom: 20,
  },
  memberModalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
  },
  dangerText: {
    color: "#FF3B30",
  },
  memberModalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
});

export default ModalMemberManagement;
