import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import groupService from "../../services/groupService";
import socketService from "../../services/socketService";

const ModalRenameGroup = ({ visible, onClose, groupId, currentName }) => {
  const [newGroupName, setNewGroupName] = useState(currentName);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setNewGroupName(currentName);
  }, [visible, currentName]);

  // Cập nhật giá trị mới khi modal được hiển thị
  useEffect(() => {
    setNewGroupName(currentName);
  }, [visible, currentName]);

  // Hàm xử lý đổi tên nhóm
  const handleRenameGroup = async () => {
    if (newGroupName.trim() === currentName) {
      onClose();
      return;
    }
    setLoading(true);
    try {
      const response = await groupService.renameGroup({
        groupId,
        name: newGroupName.trim(),
      });

      if (response.status === "ok") {
        console.log("ModalRenameGroup - Emitting group update via socket");
        socketService.handleUpdateGroup({
          groupId,
          name: newGroupName.trim(),
          avatar: "",
        });
        Alert.alert("Thông báo", "Đổi tên nhóm thành công", [
          { text: "OK", onPress: onClose },
        ]);
      } else {
        Alert.alert("Thông báo", "Đổi tên nhóm thất bại");
      }
    } catch (error) {
      console.error("Rename group error:", error);
      Alert.alert("Lỗi", "Không thể đổi tên nhóm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalView}>
              <Text style={styles.title}>Đổi tên nhóm</Text>

              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Nhập tên nhóm mới"
                placeholderTextColor="#999"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    (!newGroupName.trim() || loading) && styles.disabledButton,
                  ]}
                  onPress={handleRenameGroup}
                  disabled={!newGroupName.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Lưu</Text>
                  )}
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff3300",
  },
  saveButton: {
    backgroundColor: "#1E6DF7",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ModalRenameGroup;
