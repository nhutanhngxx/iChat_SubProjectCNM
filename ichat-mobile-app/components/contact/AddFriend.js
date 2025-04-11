import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";

import goBackIcon from "../../assets/icons/go-back.png";
import downIcon from "../../assets/icons/down.png";
import searchIcon from "../../assets/icons/search.png";
import qrIcon from "../../assets/icons/qr.png";
import { StatusBar } from "expo-status-bar";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import { getHostIP } from "../../services/api";

const AddFriend = () => {
  const ipAdr = getHostIP();
  const API_iChat = `http://${ipAdr}:5001`;
  const { user } = useContext(UserContext);
  const [countryCode, setCountryCode] = useState("+84");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_iChat}/users`);

      if (response.data.status === "ok" && Array.isArray(response.data.users)) {
        setUsers(response.data.users); // Cập nhật state users
      } else {
        console.error("Lỗi: API trả về dữ liệu không hợp lệ", response.data);
        setUsers([]); // Gán rỗng nếu API lỗi
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Gán rỗng nếu lỗi
    }
  };

  const handleSearch = async () => {
    if (!phoneNumber) return;
    const formattedPhone = phoneNumber.startsWith("0")
      ? phoneNumber.replace(/^0/, "+84")
      : `+84${phoneNumber}`;
    const encodedPhone = encodeURIComponent(formattedPhone);

    try {
      const response = await axios.get(
        `${API_iChat}/users?search=${encodedPhone}`
      );

      console.log("Response:", response.data);

      if (response.data.status === "ok" && response.data) {
        const foundUser = response.data.users?.[0]; // Lấy người dùng đầu tiên từ danh sách
        console.log("Found user:", foundUser);

        navigation.navigate(
          "ViewProfile",
          {
            name: foundUser.full_name,
            avatar: foundUser.avatar_path,
          },
          { foundUser }
        );
      } else {
        Alert.alert("Không tìm thấy", "Số điện thoại này chưa có tài khoản!");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar style="light" />
        {/* Header Add friend Screen */}
        <View
          style={{
            width: "100%",
            height: 90,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: "#3083F9",
            padding: 10,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={goBackIcon}
              style={{ width: 25, height: 25, tintColor: "#fff" }}
            />
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Thông tin cá nhân
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mã QR của tài khoản */}
        <View style={{ alignItems: "center", marginVertical: 30 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Mã QR của bạn</Text>
          {user?.id ? (
            <QRCode value={user.phone.toString()} size={200} />
          ) : (
            <Text style={{ color: "gray" }}>Không tìm thấy mã QR</Text>
          )}
        </View>

        {/* Tìm kiếm số điện thoại => Tìm xong chuyển sang Profile */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            marginBottom: 20,
            height: 55,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: "#ccc",
            backgroundColor: "#F9F9F9",
            paddingHorizontal: 5,
          }}
        >
          <TouchableOpacity
            style={{
              height: 48,
              width: 70,
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
            }}
            onPress={() =>
              Alert.alert("Chọn quốc gia", "Chức năng này chưa có!")
            }
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {countryCode}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={{
              padding: 10,
              flex: 1,
              fontSize: 18,
            }}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity onPress={() => setPhoneNumber("")}>
              <Image
                source={require("../../assets/icons/close.png")}
                style={{ width: 20, height: 20, tintColor: "red" }}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginLeft: 5,
            }}
            onPress={handleSearch}
          >
            <Image source={searchIcon} style={{ width: 25, height: 25 }} />
          </TouchableOpacity>
        </View>
        {/* Sử dụng Scan mã QR để kết bạn => Quét xong chuyển sang Profile */}
        <TouchableOpacity
          onPress={() => navigation.navigate("QRScanner")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            paddingVertical: 12,
            paddingHorizontal: 15,
            backgroundColor: "#EAF1FF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#3083F9",
          }}
        >
          <View style={{ width: 70 }}>
            <Image
              source={qrIcon}
              style={{ width: 28, height: 28, tintColor: "#3083F9" }}
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              color: "#3083F9",
              fontWeight: "600",
            }}
          >
            Quét mã QR để kết bạn
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddFriend;
