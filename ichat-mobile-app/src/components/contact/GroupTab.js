import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Dimensions } from "react-native";
import ModalCreateGroup from "../ModalCreateGroup";

const groupList = [
  {
    id: "1",
    name: "iChat_CNM",
    lastMessage: "[Hình ảnh]",
    time: "1 phút trước",
    avatar: require("../../assets/images/avatars/avatar1.png"),
  },
  {
    id: "2",
    name: "DHKTPM17C",
    lastMessage: "Xin chào!",
    time: "5 phút trước",
    avatar: require("../../assets/images/avatars/avatar2.png"),
  },
];

const numberGroup = groupList.length;

const GroupTab = () => {
  const { width } = Dimensions.get("window");
  const [isShowModal, setIsShowModal] = useState(false);

  const handleOpenModal = () => {
    setIsShowModal(true);
  };

  const handleCloseModal = () => {
    setIsShowModal(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.item_leftSide}>
        <Image source={item.avatar} style={{ width: 50, height: 50 }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <Text style={{ fontSize: 12 }}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ModalCreateGroup isVisible={isShowModal} onClose={handleCloseModal} />

      <TouchableOpacity
        style={styles.addNewGroupButton}
        onPress={() => handleOpenModal()}
      >
        <Image
          source={require("../../assets/icons/add-group.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Text>Tạo nhóm</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 13 }}>
          Nhóm đã tham gia{" "}
          <Text style={{ fontWeight: "bold" }}>({numberGroup})</Text>
        </Text>

        <TouchableOpacity
          style={styles.recentActive}
          onPress={() => alert("Xem tất cả bạn bè đang hoạt động")}
        >
          <Image
            source={require("../../assets/icons/sort.png")}
            style={{ width: 15, height: 15, marginTop: 2 }}
          />
          <Text style={{ fontSize: 12, fontWeight: "600" }}>
            Hoạt động gần đây
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Friends */}
      <View style={{ width: width - 40 }}>
        <FlatList
          data={groupList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10 },
  addNewGroupButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginVertical: 5,
  },
  recentActive: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
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

export default GroupTab;
