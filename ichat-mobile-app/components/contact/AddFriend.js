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

const AddFriend = () => {
  const { user } = useContext(UserContext);
  const [countryCode, setCountryCode] = useState("+84");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
        <StatusBar style="dark" />
        {/* Header Add friend Screen */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 50,
          }}
        >
          <Image source={goBackIcon} style={{ width: 25, height: 25 }} />
          <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
            Thêm bạn bè
          </Text>
        </TouchableOpacity>

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
            marginHorizontal: 30,
            height: 50,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: "gray",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#ddd",
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
              fontSize: 16,
            }}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginLeft: 5,
            }}
            onPress={() =>
              Alert.alert("Tin nhắn", "Số điện thoại này chưa có tài khoản!")
            }
          >
            <Image source={searchIcon} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
        </View>
        {/* Sử dụng Scan mã QR để kết bạn => Quét xong chuyển sang Profile */}
        <TouchableOpacity
          onPress={() => navigation.navigate("QRScanner")}
          style={{
            marginHorizontal: 30,
            marginVertical: 10,
            paddingHorizontal: 10,
            borderWidth: 1,
            height: 50,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 10,
            borderColor: "gray",
          }}
        >
          <Image source={qrIcon} style={{ width: 30, height: 30 }} />
          <Text style={{ fontSize: 18, marginLeft: 20 }}>Quét mã QR</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddFriend;
