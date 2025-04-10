import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert, // ← Thêm Alert từ React Native
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HeaderAccountSecurity from "../header/HeaderAccountSecurity";
import { StatusBar } from "expo-status-bar";

const AccountSecurity = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <HeaderAccountSecurity />
      <ScrollView contentContainerStyle={styles.list}>
        <SecurityItem
          icon="person-outline"
          label="Thông tin tài khoản"
          onPress={() => navigation.navigate("ProfileInformation")}
        />
        <SecurityItem
          icon="call-outline"
          label="Quản lý số điện thoại"
          onPress={() => navigation.navigate("ChangePhoneNumber")}
        />
        <SecurityItem
          icon="qr-code-outline"
          label="Mã QR đăng nhập"
          onPress={() => navigation.navigate("AddFriend")}
        />
        <SecurityItem
          icon="key-outline"
          label="Thay đổi mật khẩu"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <SecurityItem
          icon="time-outline"
          label="Lịch sử thay đổi"
          onPress={() =>
            Alert.alert("Lịch sử thay đổi", "Chức năng này hiện chưa khả dụng")
          }
        />
        <SecurityItem
          icon="trash-outline"
          label="Xóa tài khoản"
          onPress={() =>
            Alert.alert(
              "Xóa tài khoản",
              "Bạn có chắc chắn muốn xóa tài khoản không?",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Xóa",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert("Tính năng này hiện chưa khả dụng");
                    // Xử lý xóa tài khoản ở đây
                  },
                },
              ]
            )
          }
          danger
        />
      </ScrollView>
    </View>
  );
};

const SecurityItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Ionicons name={icon} size={24} color={danger ? "#ff4d4f" : "#3083F9"} />
    <Text style={[styles.label, danger && { color: "#ff4d4f" }]}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3083F9",
  },
  list: {
    gap: 16,
    padding: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6fb",
    padding: 16,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
});

export default AccountSecurity;
