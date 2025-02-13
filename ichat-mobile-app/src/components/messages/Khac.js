import React from "react";
import { Text, View, Image, TextInput } from "react-native";

const chatList = [
  {
    id: "1",
    name: "Nguyễn Thành Cương",
    message: "[Hình ảnh]",
    time: "1 phút trước",
    avatar: require("../../assets/images/avatars/avatar1.png"),
  },
  {
    id: "2",
    name: "Nguyễn Xuân Nam",
    message: "Xin chào!",
    time: "5 phút trước",
    avatar: require("../../assets/images/avatars/avatar2.png"),
  },
  {
    id: "3",
    name: "iChat_CNM_Nhom9",
    message: "Xong deadline chưa?",
    time: "10 phút trước",
    avatar: require("../../assets/images/avatars/avatar3.png"),
  },
];

const Khac = () => {
  return (
    <View style={{}}>
      <Text>Những tin nhắn Khác</Text>
    </View>
  );
};

export default Khac;
