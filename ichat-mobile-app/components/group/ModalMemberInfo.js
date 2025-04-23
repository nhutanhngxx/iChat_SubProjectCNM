import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Avatar } from "@rneui/themed";

const ModalMemberInfo = ({
  visible,
  onClose,
  member,
  currentUserId,
  onViewProfile,
  onAppointAdmin,
  onRemoveMember,
  onAddFriend,
  onSendMessage,
  relationshipType, // "friend", "stranger"
}) => {
  if (!member) return null;

  const isCurrentUser = member.user_id === currentUserId;
  const isFriend = relationshipType === "friend";
  const isStranger = relationshipType === "stranger";

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
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  {/* Phần trống bên trái để cân bằng với nút đóng */}
                </View>
                <View style={styles.headerCenter}>
                  <Text style={styles.modalTitle}>Thông tin thành viên</Text>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <Image
                      source={require("../../assets/icons/close.png")}
                      style={{ width: 25, height: 25 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalContent}>
                {/* Thông tin thành viên */}
                <View style={styles.memberModalInfo}>
                  <View style={styles.memberModalInfo}>
                    <Avatar
                      size={50}
                      rounded
                      source={{ uri: member.avatar_path }}
                    />
                    <Text style={styles.memberModalName}>
                      {isCurrentUser ? "Bạn" : member.full_name}
                    </Text>
                  </View>
                  {/* Nút kết bạn và nhắn tin */}
                  <View style={styles.memberModalActions}>
                    {isStranger && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onAddFriend}
                      >
                        <Image
                          source={require("../../assets/icons/add-friend.png")}
                          style={styles.actionIcon}
                        />
                      </TouchableOpacity>
                    )}
                    {isFriend && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onSendMessage}
                      >
                        <Image
                          source={require("../../assets/icons/chatting.png")}
                          style={styles.actionIcon}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Các tùy chọn */}
                <View>
                  <TouchableOpacity
                    style={styles.memberModalOption}
                    onPress={onViewProfile}
                  >
                    <Text style={styles.optionText}>Xem thông tin</Text>
                  </TouchableOpacity>

                  {member.role !== "admin" && (
                    <TouchableOpacity
                      style={styles.memberModalOption}
                      onPress={onAppointAdmin}
                    >
                      <Text style={styles.optionText}>
                        Chỉ định làm quản trị viên
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!isCurrentUser && (
                    <TouchableOpacity
                      style={styles.memberModalOption}
                      onPress={onRemoveMember}
                    >
                      <Text style={[styles.optionText, styles.dangerText]}>
                        Xóa khỏi nhóm
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    alignItems: "flex-end",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 15,
  },
  memberModalInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  memberModalName: {
    fontSize: 18,
    fontWeight: "bold",
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
    gap: 10,
  },
  actionButton: {
    borderRadius: 10,
    padding: 5,
  },
  actionIcon: {
    width: 25,
    height: 25,
  },
});

export default ModalMemberInfo;
