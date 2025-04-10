import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import goBackIcon from "../../assets/icons/go-back.png";
import { StatusBar } from "expo-status-bar";

const ChangePasswordScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_iChat = "http://172.20.65.58:5001/auth";

  const handleChangePassword = async () => {
    setIsLoading(true);
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không trùng khớp.");
      return;
    }

    try {
      const response = await axios.put(`${API_iChat}/change-password`, {
        userId: user.id,
        currentPassword,
        newPassword,
      });

      if (response.data.status === "ok") {
        Alert.alert("Thành công", "Đổi mật khẩu thành công.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", response.data.message || "Không thể đổi mật khẩu.");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đổi mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={goBackIcon}
                style={{ width: 25, height: 25, tintColor: "#fff" }}
              />
              <Text style={styles.headerTitle}>Thay đổi mật khẩu</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, flex: 1, paddingTop: 10 }}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.5 }]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 90,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#3083F9",
    padding: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#3083F9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChangePasswordScreen;
