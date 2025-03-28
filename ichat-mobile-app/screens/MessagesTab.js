import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  Animated,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { Tab } from "@rneui/themed";
import { TabView } from "@rneui/base";
import { Checkbox } from "react-native-paper";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

import HeaderMessages from "../components/header/HeaderMessagesTab";
import PriorityMessages from "../components/messages/Priority";
import OtherMessages from "../components/messages/Other";

import moreIcon from "../assets/icons/more.png";
import addFriendIcon from "../assets/icons/add-friend.png";
import loginDeviceIcon from "../assets/icons/login-device.png";
import unReadIcon from "../assets/icons/unread.png";
import tagIcon from "../assets/icons/tag.png";
import sortIcon from "../assets/icons/sort.png";
import addIcon from "../assets/icons/add.png";
import backIcon from "../assets/icons/go-back.png";

import { UserContext } from "../context/UserContext";

const MessagesTab = () => {
  const API_iChat = "http://172.20.10.5:5001";
  const [index, setIndex] = useState(0);
  const { user } = useContext(UserContext);
  const [modalSort, setModalSort] = useState(false);
  const [modalTags, setModalTags] = useState(false);
  const [modalAddTag, setModalAddTag] = useState(false);
  const [messageCards, setMessageCards] = useState([]);
  const [isChecked, setIsChecked] = useState({});
  const [isSelectedCard, setIsSelectedCard] = useState([]);
  // Chọn màu cho tag mới
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("gray");
  const colors = ["red", "blue", "green", "orange", "purple"];
  const [showColorPicker, setShowColorPicker] = useState(false);
  const translateY = new Animated.Value(300);

  // Thêm tag
  const createMessageCard = async (own_id, title, card_color) => {
    try {
      const response = await axios.post(`${API_iChat}/messages/message-cards`, {
        own_id,
        title,
        card_color,
      });

      if (response.data.status === "ok") {
        console.log("Tạo MessageCard thành công:", response.data.data);
        setModalAddTag(false);
        return response.data.data;
      }
    } catch (error) {
      console.error("Lỗi khi tạo MessageCard:", error.message);
    }
  };

  const handleToggleCard = (card) => {
    setIsChecked((prevChecked) => ({
      ...prevChecked,
      [card._id]: !prevChecked[card._id], // Chỉ thay đổi trạng thái của card được chọn
    }));

    setIsSelectedCard((prevSelected) => {
      if (prevSelected.some((item) => item._id === card._id)) {
        return prevSelected.filter((item) => item._id !== card._id);
      } else {
        return [...prevSelected, card];
      }
    });
  };

  // Hiển thị modal thẻ với animation
  const showTagsModal = () => {
    setModalTags(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Ẩn modal thẻ với animation
  const hideTagsModal = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalTags(false));
  };

  useEffect(() => {
    // let timeout;
    const fetchMessageCards = async () => {
      try {
        const response = await fetch(`${API_iChat}/message-cards/${user?.id}`);
        const data = await response.json();
        if (data.status === "ok") {
          setMessageCards(data.data);
        }
      } catch (error) {
        console.error("Error fetching message cards:", error);
      } finally {
        timeout = setTimeout(fetchMessageCards, 500);
      }
    };
    if (user?.id) {
      fetchMessageCards();
    }
    // return () => clearTimeout(timeout);
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} style="dark" />
      <HeaderMessages />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: "50%" }}>
          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={{
              backgroundColor: "#6166EE",
              width: "25%",
              marginHorizontal: "12%",
            }}
            variant="default"
            dense
            containerStyle={{}}
          >
            <Tab.Item
              title={"Ưu tiên"}
              titleStyle={{
                color: index === 0 ? "#6166EE" : "gray",
                fontWeight: index === 0 ? "bold" : null,
              }}
            />
            <Tab.Item
              title={"Khác"}
              titleStyle={{
                color: index === 1 ? "#6166EE" : "gray",
                fontWeight: index === 1 ? "bold" : null,
              }}
            />
          </Tab>
        </View>

        <View
          style={{
            width: "50%",
            flex: 1,
            alignItems: "flex-end",
            paddingRight: 15,
          }}
        >
          <TouchableOpacity onPress={() => setModalSort(true)}>
            <Image source={sortIcon} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>
      </View>
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PriorityMessages />
        </TabView.Item>
        <TabView.Item
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <OtherMessages />
        </TabView.Item>
      </TabView>
      {/* Modal Card */}
      <Modal
        transparent={true}
        visible={modalSort}
        onRequestClose={() => setModalSort(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "flex-end",
            paddingTop: 130,
          }}
          onPress={() => setModalSort(false)}
        >
          <View
            style={{
              width: 200,
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              marginRight: 10,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalSort(false);
              }}
            >
              <Image source={unReadIcon} style={{ width: 25, height: 25 }} />
              <Text style={{ fontSize: 16 }}>Tin nhắn chưa đọc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={() => {
                setModalSort(false);
                showTagsModal();
              }}
            >
              <Image source={tagIcon} style={{ width: 25, height: 25 }} />
              <Text style={{ fontSize: 16 }}>Thẻ phân loại</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Modal Tags - Bottom Sheet */}
      <Modal transparent={true} visible={modalTags} animationType="none">
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.tagsModal, { transform: [{ translateY }] }]}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.tagsTitle}>Chọn thẻ</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalTags(false); // Đóng modal cũ trước
                  setTimeout(() => setModalAddTag(true), 300); // Chờ một chút để tránh xung đột
                }}
              >
                <Image source={addIcon} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={messageCards}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleToggleCard(item)}
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Image
                      source={tagIcon}
                      style={{
                        width: 25,
                        height: 25,
                        tintColor: item.card_color,
                      }}
                    />
                    <Text style={{ fontSize: 16 }}>{item.title}</Text>
                  </View>
                  <Checkbox
                    status={isChecked[item._id] ? "checked" : "unchecked"}
                    color="#1E6DF7"
                    onPress={() => handleToggleCard(item)}
                  />
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
      {/* Modal thêm tag */}
      <Modal transparent={true} visible={modalAddTag}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
          }}
          onPress={() => setModalAddTag(false)}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 10,
              height: 230,
              width: "90%",
              justifyContent: "space-between",
              paddingVertical: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                height: 50,
              }}
            >
              <TouchableOpacity onPress={() => setModalAddTag(false)}>
                <Image source={backIcon} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Thêm mới Thẻ phân loại
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                Tên thẻ phân loại
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderColor: "gray",
                }}
              >
                <TextInput
                  value={tagName}
                  onChangeText={setTagName}
                  placeholder="Nhập tên thẻ phân loại"
                  style={{ height: 40, flex: 1, paddingVertical: 5 }}
                />
                <TouchableOpacity
                  onPress={() => setShowColorPicker(!showColorPicker)}
                >
                  <Image
                    source={tagIcon}
                    style={{
                      width: 30,
                      height: 30,
                      tintColor: selectedColor,
                    }}
                  />
                </TouchableOpacity>
                {showColorPicker && (
                  <View style={{ flexDirection: "row" }}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: color,
                          borderRadius: 15,
                          marginHorizontal: 5,
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 20,
                paddingTop: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
                onPress={() => {
                  setModalAddTag(false);
                  setTimeout(() => {
                    setModalTags(true);
                  }, 500);
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  createMessageCard(user.id, tagName, selectedColor)
                }
                style={{
                  backgroundColor: "gray",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  Thêm phân loại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tagsModal: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  tagsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  tagItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tagText: { fontSize: 16, color: "#333" },
});

export default MessagesTab;
