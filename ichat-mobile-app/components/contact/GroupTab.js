import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Dimensions } from "react-native";
import ModalCreateGroup from "./ModalCreateGroup";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";
import { Avatar } from "@rneui/themed";
import groupService from "../../services/groupService";

const GroupTab = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const [isShowModal, setIsShowModal] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user?.id) return;

    const fetchGroupList = async () => {
      const groups = await groupService.getAllGroupsByUserId(user.id);
      setGroupList(groups);
    };
    fetchGroupList();
    const interval = setInterval(fetchGroupList, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleOpenModal = () => {
    setIsShowModal(true);
  };

  const handleCloseModal = () => {
    setIsShowModal(false);
  };

  const handleOpenChatting = (chat) => {
    navigation.navigate("Chatting", { chat });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleOpenChatting(item)}
      key={item.id}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={item.avatar} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <Text style={{ fontSize: 12 }}>{item.time}</Text>
      </View>
    </TouchableOpacity>
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
          <Text style={{ fontWeight: "bold" }}>({groupList.length})</Text>
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
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
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
