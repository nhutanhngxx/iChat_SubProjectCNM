import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const chatList = [
  {
    id: "1",
    name: "Nguyễn Nhựt Anh",
    message: "[Hình ảnh]",
    time: "1 phút trước",
    avatar: require("../../assets/images/avatars/avatar1.png"),
  },
  {
    id: "2",
    name: "Trần Minh Quân",
    message: "Xin chào!",
    time: "5 phút trước",
    avatar: require("../../assets/images/avatars/avatar2.png"),
  },
  {
    id: "3",
    name: "Lê Phương Thảo",
    message: "Bạn khỏe không?",
    time: "10 phút trước",
    avatar: require("../../assets/images/avatars/avatar3.png"),
  },
];

const UuTien = () => {
  const navigation = useNavigation();

  const handleOpenChatting = (chat) => {
    alert("Open Chatting");
    navigation.navigate("Chatting", { chat });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handleOpenChatting(item)}
    >
      <View style={styles.infoContainer}>
        <Image source={item.avatar} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.message}</Text>
        </View>
      </View>
      <View>
        <Text>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={chatList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UuTien;
