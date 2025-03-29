import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Appbar, Button, Checkbox } from "react-native-paper";

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

const ModalCreateGroup = ({ isVisible, onClose }) => {
  const [groupList, setGroupList] = useState([]);
  const [isChecked, setIsChecked] = useState({});
  const [isDisabled, setIsDisabled] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [displayedFriendList, setDisplayedFriendList] = useState(friendList);

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
    // Lọc ra những friend có tên chứa searchText
    setSearchText(text);
    const newFriendList = friendList.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
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

  const handleCreateGroup = () => {
    alert(
      `Tạo nhóm ${groupName} thành công!` +
        "\n" +
        "Danh sách thành viên: " +
        groupList.map((item) => item.id).join(", ")
    );
    // Reset state
    setGroupList([]);
    setIsChecked({});
    setGroupName("");
    setSearchText("");
    setDisplayedFriendList(friendList);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleToggleFriend(item)}
    >
      <View style={styles.item_leftSide}>
        <Image source={item.avatar} style={{ width: 50, height: 50 }} />
        <Text style={{ fontWeight: "500", fontSize: 16 }}>{item.name}</Text>
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
      <Image source={item.avatar} style={{ width: 50, height: 50 }} />
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
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.container}>
        <View style={styles.modalView}>
          <SafeAreaView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require("../../assets/icons/go-back.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                Tạo nhóm mới
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
          <Text style={{ textAlign: "center", fontSize: 16, paddingTop: 10 }}>
            Số người đã chọn:{" "}
            <Text style={{ fontWeight: "bold" }}>{groupList.length}</Text>
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
                style={{ width: 40, height: 40 }}
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Đặt tên nhóm"
              style={{ fontSize: 20, width: "100%" }}
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Input Search Friend To Add */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
              height: 50,
              gap: 10,
              padding: 10,
              backgroundColor: "#fff5f5",
              borderRadius: 10,
            }}
          >
            <TouchableOpacity>
              <Image
                source={require("../../assets/icons/search.png")}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Tìm kiếm bạn bè"
              style={{ fontSize: 16, width: "100%" }}
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
            <View style={{ paddingBottom: 20 }}>
              <TouchableOpacity
                disabled={isDisabled}
                onPress={handleCreateGroup}
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  backgroundColor: groupList.length < 2 ? "gray" : "blue",
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
