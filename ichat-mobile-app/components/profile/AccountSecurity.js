import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HeaderAccountSecurity from "../header/HeaderAccountSecurity";

const AccountSecurity = () => {
  const navigation = useNavigation();
  const handlePress = (feature) => {
    console.log("Navigate to:", feature);
  };

  return (
    <View style={styles.container}>
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
          onPress={() => handlePress("QRCode")}
        />
        <SecurityItem
          icon="key-outline"
          label="Thay đổi mật khẩu"
          onPress={() => handlePress("ChangePassword")}
        />
        <SecurityItem
          icon="time-outline"
          label="Lịch sử thay đổi"
          onPress={() => handlePress("History")}
        />
        <SecurityItem
          icon="trash-outline"
          label="Xóa tài khoản"
          onPress={() => handlePress("DeleteAccount")}
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
