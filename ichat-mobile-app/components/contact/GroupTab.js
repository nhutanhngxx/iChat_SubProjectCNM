import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";

const GroupTab = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const [groupList, setGroupList] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user?.id) return;
    const fetchGroupList = async () => {
      const groups = await groupService.getAllGroupsByUserId(user.id);
      setGroupList(groups);
    };
    fetchGroupList();
    const interval = setInterval(fetchGroupList, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

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
        <Image source={item.avatar} style={{ width: 50, height: 50 }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {item.name.length > 15 ? `${item.name.slice(0, 20)}...` : item.name}
        </Text>
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <Text style={{ fontSize: 12 }}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addNewGroupButton}
        onPress={() => {
          navigation.navigate("CreateGroup");
        }}
      >
        <Image
          source={require("../../assets/icons/add-group.png")}
          style={{ width: 20, height: 20, marginTop: 2 }}
        />
        <Text style={{ fontSize: 16, color: "#2F80ED" }}>Tạo nhóm mới</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 16 }}>
          Nhóm đã tham gia{" "}
          <Text
            style={{ fontWeight: "bold", color: "rgba(47, 128, 237, 0.5)" }}
          >
            ({groupList.length})
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.recentActive}
          onPress={() => Alert.alert("Xem tất cả bạn bè đang hoạt động")}
        >
          <Image
            source={require("../../assets/icons/sort.png")}
            style={{ width: 15, height: 15, marginTop: 2 }}
          />
          <Text style={{ fontSize: 14 }}>Hoạt động gần đây</Text>
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
  container: { paddingHorizontal: 20 },
  addNewGroupButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
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
