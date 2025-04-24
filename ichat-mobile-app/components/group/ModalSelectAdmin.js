import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "@rneui/themed";
import groupService from "../../services/groupService";
import socketService from "../../services/socketService";

const ModalSelectAdmin = ({ visible, onClose, groupId, currentAdminId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState(members);
  const navigation = useNavigation();

  // Lắng nghe sự kiện từ socket
  useEffect(() => {
    if (visible && groupId) {
      socketService.joinRoom(groupId);
    }
    return () => {
      if (groupId) {
        socketService.leaveRoom(groupId);
      }
    };
  }, [visible, groupId]);

  // Cập nhật searchText khi modal được hiển thị
  useEffect(() => {
    setSearchText("");
  }, [visible]);

  // Lấy danh sách thành viên của nhóm
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupMembers = async () => {
      const membersList = await groupService.getGroupMembers(groupId);
      setMembers(membersList);
    };

    fetchGroupMembers();
  }, [groupId]);

  // Lọc thành viên theo từ khóa tìm kiếm
  useEffect(() => {
    if (!members) return;

    let filtered = [...members];

    // Loại bỏ admin hiện tại khỏi danh sách
    filtered = filtered.filter((member) => member.user_id !== currentAdminId);

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      filtered = filtered.filter((member) =>
        member.full_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [members, searchText, currentAdminId]);

  // Xử lý khi chọn thành viên
  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
  };

  // Xử lý khi nhấn nút "Chọn và tiếp tục"
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (selectedMemberId) {
        const response = await groupService.appointAdmin({
          groupId,
          newAdimUserId: selectedMemberId,
          userId: currentAdminId,
        });
        await groupService.removeMember({ groupId, userId: currentAdminId });
        if (response.status === "ok") {
          socketService.handleTransferAdmin({
            groupId,
            userId: selectedMemberId,
          });
          Alert.alert("Thông báo", response.message, [
            {
              text: "OK",
              onPress: () => {
                onClose();
                navigation.navigate("Home");
              },
            },
          ]);
        } else {
          Alert.alert("Thông báo", "Chỉ định quản trị viên thất bại");
        }
      }
    } catch (error) {
      console.error("Lỗi khi chỉ định quản trị viên:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render item thành viên
  const renderMemberItem = ({ item }) => {
    const isSelected = item.user_id === selectedMemberId;

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => handleSelectMember(item.user_id)}
      >
        <View style={styles.memberInfo}>
          <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
          <Text style={styles.memberName}>{item.full_name}</Text>
        </View>
        <View style={styles.radioContainer}>
          <View
            style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}></View>
                <View style={styles.headerCenter}>
                  <Text style={styles.modalTitle}>
                    Chọn quản trị viên mới trước khi rời nhóm
                  </Text>
                </View>
                <View style={styles.headerRight}></View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Image
                    source={require("../../assets/icons/search.png")}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
              </View>

              {/* Members List */}
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={renderMemberItem}
                style={styles.membersList}
              />

              {/* Bottom Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    !selectedMemberId && styles.disabledButton,
                  ]}
                  onPress={handleConfirm}
                  disabled={!selectedMemberId}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Chọn và tiếp tục
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    onClose();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 20,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    width: 30,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 30,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    fontSize: 16,
    marginLeft: 10,
  },
  radioContainer: {
    padding: 5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#2F80ED",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2F80ED",
  },
  buttonsContainer: {
    padding: 15,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: "#2F80ED",
  },
  disabledButton: {
    backgroundColor: "#B0C4DE",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ModalSelectAdmin;
