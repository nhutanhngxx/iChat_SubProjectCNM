import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HeaderMessages = ({ setUser }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.headerContainer}>
      {/* Nút Setting mở modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={require("../../assets/icons/setting.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Modal với các chức năng */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Tùy chọn: Xem & chỉnh sửa thông tin */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ProfileInformation");
              }}
            >
              <Image
                source={require("../../assets/icons/me.png")}
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Thông tin tài khoản</Text>
            </TouchableOpacity>

            {/* Tùy chọn: Đăng xuất */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setModalVisible(false);
                // Thêm logic logout
                navigation.navigate("Launcher");
              }}
            >
              <Image
                source={require("../../assets/icons/cancel.png")}
                style={styles.optionIcon}
              />
              <Text style={[styles.optionText, { color: "red" }]}>
                Đăng xuất
              </Text>
            </TouchableOpacity>

            {/* Nút Hủy */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HeaderMessages;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingRight: 10,
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    justifyContent: "flex-end",
  },
  icon: {
    width: 25,
    height: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    width: "90%",
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
