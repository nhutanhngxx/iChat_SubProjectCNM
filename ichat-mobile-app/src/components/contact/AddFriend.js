import React, { useEffect, useState } from "react";
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

import goBackIcon from "../../assets/icons/go-back.png";
import downIcon from "../../assets/icons/down.png";
import searchIcon from "../../assets/icons/search.png";
import qrIcon from "../../assets/icons/qr.png";

const AddFriend = () => {
  const [countryCode, setCountryCode] = useState("+84");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation();

  //   const handleSearch = () => {
  //     const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  //     if (phoneNumber.length < 9) {
  //       Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ.");
  //       return;
  //     }

  //     // Gọi API kiểm tra tài khoản
  //     fetch(`https://your-api.com/search-user?phone=${fullPhoneNumber}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.success) {
  //           navigation.navigate("ProfileScreen", { userId: data.user.id });
  //         } else {
  //           Alert.alert("Không tìm thấy", "Số điện thoại không tồn tại.");
  //         }
  //       })
  //       .catch((err) => Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm kiếm."));
  //   };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header Add friend Screen */}
        <View
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
        </View>

        {/* Mã QR của tài khoản */}
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: "black",
            margin: 30,
            alignSelf: "center",
            borderRadius: 10,
          }}
        ></View>

        {/* Tìm kiếm số điện thoại => Tìm xong chuyển sang Profile */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 30,
            height: 50,
            borderWidth: 1.5,
            borderRadius: 10,
            borderColor: "gray",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#ddd",
              height: 47,
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
            borderWidth: 1.5,
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
