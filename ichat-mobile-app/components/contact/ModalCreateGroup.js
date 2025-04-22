import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Avatar } from "@rneui/themed";
import { Checkbox } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import friendService from "../../services/friendService";
import { UserContext } from "../../config/context/UserContext";
import { useNavigation } from "@react-navigation/native";
import groupService from "../../services/groupService";

const ModalCreateGroup = () => {
  const [groupList, setGroupList] = useState([]);
  const [isChecked, setIsChecked] = useState({});
  const [isDisabled, setIsDisabled] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [friendList, setFriendList] = useState([]);
  const [displayedFriendList, setDisplayedFriendList] = useState(friendList);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const handleCloseModal = () => {
    setGroupList([]);
    setIsChecked({});
    setGroupName("");
    setSearchText("");
    setDisplayedFriendList(friendList);
    navigation.goBack();
  };

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (!user?.id) return;
    const fetchFriendList = async () => {
      const friends = await friendService.getFriendListByUserId(user.id);
      setFriendList(friends);
      setDisplayedFriendList(friends);
    };
    fetchFriendList();
  }, [user?.id]);

  const handleToggleFriend = (friend) => {
    // Kiểm tra xem friend đã có trong groupList chưa
    const isExist = groupList.some((item) => item.id === friend.id);
    if (isExist) {
      // Nếu có thì xóa ra khỏi groupList
      const newGroupList = groupList.filter((item) => item.id !== friend.id);
      setGroupList(newGroupList);
      setIsChecked({ ...isChecked, [friend.id]: false });
    }
    // Nếu chưa có thì thêm vào groupList
    else {
      setGroupList([...groupList, friend]);
      setIsChecked({ ...isChecked, [friend.id]: true });
    }
  };

  const handleSearchFriend = (text) => {
    setSearchText(text);
    if (!text) {
      setDisplayedFriendList(friendList);
      return;
    }

    const newFriendList = friendList.filter((item) => {
      const itemName = item?.name || item?.full_name || "";
      return itemName.toLowerCase().includes(text.toLowerCase());
    });

    setDisplayedFriendList(newFriendList);
  };

  useEffect(() => {
    // Kiểm tra xem đã chọn thành viên và đã được đặt tên chưa
    if (groupList.length < 2 || groupName === "") {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [groupList, groupName]);

  const handleCreateGroup = async () => {
    try {
      // Tạo mảng participantIds - chứa id của các thành viên trong nhóm
      const participantIds = groupList.map((item) => item.id);
      // Gọi API tạo nhóm
      const response = await groupService.createGroup({
        groupName,
        adminId: user.id,
        participantIds,
      });
      if (response.status === "ok") {
        Alert.alert("Thông báo", "Tạo nhóm thành công", [
          {
            text: "OK",
            onPress: () => handleCloseModal(),
          },
        ]);
      } else {
        Alert.alert("Thông báo", "Tạo nhóm thất bại");
      }
    } catch (error) {
      console.error("Create group error:", error);
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleToggleFriend(item)}
    >
      <View style={styles.item_leftSide}>
        <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {item.full_name}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleToggleFriend(item)}>
        <Checkbox
          status={isChecked[item.id] ? "checked" : "unchecked"}
          onPress={() => handleToggleFriend(item)}
          color="#1E6DF7"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAddedItem = ({ item }) => (
    <TouchableOpacity
      style={{ position: "relative" }}
      onPress={() => handleToggleFriend(item)}
    >
      <Avatar size={50} rounded source={{ uri: item.avatar_path }} />
      <TouchableOpacity
        style={styles.addedItem}
        onPress={() => handleToggleFriend(item)}
      >
        <Image
          source={require("../../assets/icons/close.png")}
          style={{
            width: 25,
            height: 25,
          }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.modalView}>
          <SafeAreaView
            style={
              Platform.OS === "ios"
                ? { flexDirection: "row", alignItems: "center", gap: 10 }
                : {
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }
            }
          >
            <TouchableOpacity onPress={handleCloseModal}>
              <Image
                source={require("../../assets/icons/go-back.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  paddingTop: 10,
                }}
              >
                Tạo nhóm mới
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
          <Text style={{ textAlign: "center", fontSize: 16, paddingTop: 10 }}>
            Số người đã chọn:{" "}
            <Text style={{ fontWeight: "bold" }}>{groupList.length}</Text>
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              paddingTop: 5,
              color: "gray",
            }}
          >
            (Nhóm phải có ít nhất 3 thành viên)
          </Text>

          {/* Input Group Name */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 10,
              padding: 10,
              height: 50,
            }}
          >
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/image.png")}
                style={
                  Platform.OS === "ios"
                    ? { width: 40, height: 40 }
                    : { width: 30, height: 30 }
                }
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Đặt tên nhóm"
              style={
                Platform.OS === "ios"
                  ? { fontSize: 20, width: "80%", borderBottomWidth: 1 }
                  : {
                      fontSize: 16,
                      width: "90%",
                      height: 40,
                      borderBottomWidth: 1,
                    }
              }
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Input Search Friend To Add */}
          <View
            style={
              Platform.OS === "ios"
                ? {
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                    height: 50,
                    gap: 10,
                    padding: 10,
                    backgroundColor: "#fff5f5",
                    borderRadius: 10,
                  }
                : {
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                    height: 40,
                    gap: 10,
                    padding: 10,
                    backgroundColor: "#fff5f5",
                    borderRadius: 10,
                  }
            }
          >
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/search.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Tìm kiếm bạn bè"
              style={
                Platform.OS === "ios"
                  ? { fontSize: 16, width: "100%" }
                  : {
                      fontSize: 16,
                      width: "100%",
                      height: 40,
                    }
              }
              value={searchText}
              onChangeText={handleSearchFriend}
            />
          </View>

          {/* List Friends To Add */}
          <View style={{ flex: 1, marginBottom: 70, marginTop: 10 }}>
            <FlatList
              data={displayedFriendList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* List Friend Added  && Button Create Group*/}
          <View style={styles.bottomView}>
            <View style={{ flex: 1 }}>
              <FlatList
                data={groupList}
                renderItem={renderAddedItem}
                horizontal={true}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </View>
            <View style={Platform.OS === "ios" && { paddingBottom: 20 }}>
              <TouchableOpacity
                disabled={isDisabled}
                onPress={handleCreateGroup}
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  backgroundColor: isDisabled ? "gray" : "blue",
                  alignItems: "center",
                  borderRadius: 25,
                }}
              >
                <Image
                  source={require("../../assets/icons/send.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: "white",
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalView: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    paddingHorizontal: 12,
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
  addedItem: {
    borderRadius: 50,
    position: "absolute",
    top: -8,
    right: -5,
  },
  bottomView: {
    borderTopWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
  },
  addButton: {
    height: 50,
    width: 50,
    // justifyContent: "center",
    // alignItems: "center",
    borderRadius: 25,
    // marginLeft: 10,
  },
});

export default ModalCreateGroup;
