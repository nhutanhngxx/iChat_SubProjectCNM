import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const friendList = [
  {
    id: "1",
    name: "Nguyễn Nhựt Anh",
    lastMessage: "[Hình ảnh]",
    time: "1 phút trước",
    avatar: require("../../assets/images/avatars/avatar1.png"),
  },
  {
    id: "2",
    name: "Trần Minh Quân",
    lastMessage: "Xin chào!",
    time: "5 phút trước",
    avatar: require("../../assets/images/avatars/avatar2.png"),
  },
  {
    id: "3",
    name: "Lê Phương Thảo",
    lastMessage: "Bạn khỏe không?",
    time: "10 phút trước",
    avatar: require("../../assets/images/avatars/avatar3.png"),
  },
];

const addRequest = 20;

const FriendTab = () => {
  const { width } = Dimensions.get("window");
  const navigation = useNavigation();

  //   const handleOpenChatting = (chat) => {
  //     navigation.navigate("Contact", { chat });
  //   };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.item_leftSide}
        // onPress={() => handleOpenChatting(item)}
      >
        <Image source={item.avatar} style={{ width: 50, height: 50 }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
      </TouchableOpacity>
      <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <Image
          source={require("../../assets/icons/phone-call.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Image
          source={require("../../assets/icons/video.png")}
          style={{ width: 25, height: 25, marginTop: 2 }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addRequest}
        onPress={() => alert("Xem danh sách lời mời kết bạn")}
      >
        <Image
          source={require("../../assets/icons/request.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Text>
          Yêu cầu kết bạn{" "}
          <Text style={{ fontWeight: "bold" }}>({addRequest})</Text>
        </Text>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={styles.activeButton}
          onPress={() => alert("Xem tất cả bạn bè")}
        >
          <Text style={styles.textActiveButton}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noActiveButton}
          onPress={() => alert("Xem tất cả bạn bè đang hoạt động")}
        >
          <Text>Đang hoạt động</Text>
        </TouchableOpacity>
      </View>

      {/* List Friends */}
      <View style={{ width: width - 40 }}>
        <FlatList
          data={friendList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10 },
  addRequest: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  activeButton: {
    marginVertical: 10,
    backgroundColor: "skyblue",
    padding: 10,
    borderRadius: 10,
  },
  textActiveButton: {
    color: "white",
    fontWeight: "bold",
  },
  noActiveButton: {
    marginVertical: 10,
    backgroundColor: "#97979740",
    padding: 10,
    borderRadius: 10,
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  item_leftSide: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});

export default FriendTab;
