import React, { useContext, useEffect, useRef, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Tab, TabView } from "@rneui/themed";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../config/context/UserContext";
import { StatusBar } from "expo-status-bar";
import { getHostIP } from "../../services/api";
import { ActivityIndicator } from "react-native-paper";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);
  const { user } = useContext(UserContext);

  const ipAdr = getHostIP();
  const API_iChat = `http://${ipAdr}:5001/api`;

  const handleOpenChatting = async (selectedItem) => {
    try {
      let chatPartnerId, chatPartnerName, chatPartnerAvatar, messageId;

      if (selectedItem.content) {
        // Search result is a message
        const isSender = selectedItem.sender_id === user.id;
        chatPartnerId = isSender
          ? selectedItem.receiver_id
          : selectedItem.sender_id;
        messageId = selectedItem.id; // Store message ID for scrolling

        // Get user info from the loaded users list
        const chatPartner = users.find((u) => u.id === chatPartnerId);
        chatPartnerName = chatPartner ? chatPartner.full_name : "Người ẩn danh";
        chatPartnerAvatar =
          chatPartner?.avatar_path ||
          "https://i.ibb.co/9k8sPRMx/best-seller.png";
      } else {
        // Search result is a user
        chatPartnerId = selectedItem.id;
        chatPartnerName = selectedItem.full_name || "Người ẩn danh";
        chatPartnerAvatar =
          selectedItem.avatar_path ||
          "https://i.ibb.co/9k8sPRMx/best-seller.png";
      }

      const chat = {
        id: chatPartnerId,
        name: chatPartnerName,
        avatar: { uri: chatPartnerAvatar },
        chatType: "private",
        messageId: messageId || null, // Pass messageId for messages
      };

      // Navigate to the Messages screen in TabNavigator
      navigation.navigate("Home", {
        screen: "Messages",
        params: { selectedChat: chat },
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert("Error", "Unable to open chat. Please try again.");
    }
  };

  useEffect(() => {
    if (route.params?.autoFocus) {
      searchInputRef.current?.focus();
    }
  }, [route.params]);

  const [searchText, setSearchText] = useState("");
  const [index, setIndex] = useState(0);

  // Lưu trữ lịch sử Tìm kiếm
  const [indexSearch, setIndexSearch] = useState(0);
  const [historySearch, setHistorySearch] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchMessages, setSearchMessages] = useState([]);
  const [searchGroups, setSearchGroups] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Hàm lưu lịch sử tìm kiếm
  const saveSearchHistory = async (text) => {
    if (!text.trim()) return;
    try {
      const existingHistory = await AsyncStorage.getItem("searchHistory");
      let newHistory = existingHistory ? JSON.parse(existingHistory) : [];
      if (!newHistory.includes(text)) {
        newHistory.unshift(text);
        if (newHistory.length > 10) newHistory.pop(); // Giới hạn lại lưu trữ
      }
      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
      setHistorySearch(newHistory);
    } catch (error) {
      console.error("Lỗi lưu lịch sử tìm kiếm", error);
    }
  };

  // Hàm tải lịch sử tìm kiếm từ AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("searchHistory");
      if (savedHistory) {
        setHistorySearch(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử tìm kiếm", error);
    }
  };

  // Hàm xóa lịch sử tìm kiếm
  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem("searchHistory");
      setHistorySearch([]);
    } catch (error) {
      console.error("Lỗi xóa lịch sử tìm kiếm", error);
    }
  };

  // Xóa 1 item khỏi lịch sử tìm kiếm
  const removeSearchItem = async (indexToRemove) => {
    try {
      const newHistory = historySearch.filter((_, i) => i !== indexToRemove);
      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
      setHistorySearch(newHistory);
    } catch (error) {
      console.error("Lỗi xóa 1 item khỏi lịch sử:", error);
    }
  };

  // Xử lý tìm kiếm tự động khi searchText thay đổi
  useEffect(() => {
    if (searchText.trim().length > 0) {
      handleSearch();
    } else {
      setSearchUsers([]);
      setSearchMessages([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (searchText.trim().length === 0) {
      setSearchUsers([]);
      setSearchMessages([]);
      return;
    }

    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 500); // Chờ 500ms sau khi người dùng ngừng nhập

    return () => clearTimeout(delaySearch); // Xóa timeout nếu user tiếp tục nhập
  }, [searchText]);

  // Hàm gọi API tìm kiếm
  const handleSearch = async () => {
    if (!searchText || typeof searchText !== "string") {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung tìm kiếm.");
      return;
    }

    setIsLoading(true);
    let finalSearchQuery = searchText.trim();

    console.log("Search query:", finalSearchQuery);

    // Kiểm tra xem có phải là số điện thoại hay không
    if (/^(\+)?\d+$/.test(finalSearchQuery)) {
      if (finalSearchQuery.startsWith("0")) {
        finalSearchQuery = finalSearchQuery.replace(/^0/, "+84"); // Thay thế 0 bằng +84
      } else if (!finalSearchQuery.startsWith("+")) {
        finalSearchQuery = `+84${finalSearchQuery}`; // Thêm +84 nếu không có
      }
    }

    console.log("Final search query:", finalSearchQuery);

    try {
      // Tìm kiếm người dùng, tin nhắn và nhóm
      let usersResponse = { data: { users: [] } };
      let messagesResponse = { data: { messages: [] } };

      try {
        usersResponse = await axios.get(
          `${API_iChat}/users?search=${encodeURIComponent(finalSearchQuery)}`
        );
      } catch (error) {
        console.error("Lỗi tìm kiếm người dùng:", error);
      }

      try {
        messagesResponse = await axios.get(
          `${API_iChat}/messages/search/${user.id}?search=${finalSearchQuery}`
        );
      } catch (error) {
        console.error("Lỗi tìm kiếm tin nhắn:", error);
      }

      if (usersResponse.error) {
        setSearchUsers([]);
      } else if (
        usersResponse.data?.status === "ok" &&
        Array.isArray(usersResponse.data.users)
      ) {
        setSearchUsers(usersResponse.data.users);
      } else {
        setSearchUsers([]);
      }

      if (
        messagesResponse.data?.status === "ok" &&
        Array.isArray(messagesResponse.data.messages)
      ) {
        setSearchMessages(messagesResponse.data.messages);
      } else {
        setSearchMessages([]);
      }
    } catch (error) {
      console.error("Lỗi tổng quát khi tìm kiếm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_iChat}/users`);

      if (response.data.status === "ok" && Array.isArray(response.data.users)) {
        setUsers(response.data.users); // Cập nhật state users
      } else {
        console.error("Lỗi: API trả về dữ liệu không hợp lệ", response.data);
        setUsers([]); // Gán rỗng nếu API lỗi
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Gán rỗng nếu lỗi
    }
  };

  // Gọi fetchUsers khi component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Ẩn tabBar sau khi vào Screen Search
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      });
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0AA2F8" }}>
      <StatusBar hidden={false} style="light" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          width: "100%",
          padding: 10,
          height: 90,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={{
                width: 25,
                height: 25,
                tintColor: "white",
              }}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 5,
              marginLeft: 5,
            }}
          >
            <TextInput
              ref={searchInputRef}
              style={{
                flex: 1,
                fontSize: 15,
                paddingHorizontal: 10,
                textAlignVertical: "center",
                height: 30,
              }}
              placeholder="Tìm kiếm"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                saveSearchHistory(searchText);
                setSearchText("");
              }}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Image
                  source={require("../../assets/icons/close.png")}
                  style={{ width: 20, height: 20, marginRight: 5 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tabs kết quả tìm kiếm */}
      {searchText && (
        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{
            backgroundColor: "skyblue",
            width: "15%",
            marginHorizontal: "9%",
          }}
        >
          <Tab.Item
            title="Tất cả"
            titleStyle={{ fontSize: 16, fontWeight: "500", color: "white" }}
          />
          <Tab.Item
            title="Tin nhắn"
            titleStyle={{ fontSize: 16, fontWeight: "500", color: "white" }}
          />
          <Tab.Item
            title="Tài khoản"
            titleStyle={{ fontSize: 16, fontWeight: "500", color: "white" }}
          />
        </Tab>
      )}
      {!searchText && (
        <View style={{ padding: 10, backgroundColor: "white" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Lịch sử tìm kiếm
          </Text>
          {historySearch.length > 0 ? (
            <>
              <FlatList
                data={historySearch}
                keyExtractor={(item, indexSearch) => indexSearch.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSearchText(item)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      paddingHorizontal: 5,
                    }}
                  >
                    {/* Tên lịch sử tìm kiếm */}
                    <TouchableOpacity onPress={() => setSearchText(item)}>
                      <Text style={{ fontSize: 16 }}>{item}</Text>
                    </TouchableOpacity>

                    {/* Nút xóa */}
                    <TouchableOpacity
                      onPress={() => removeSearchItem(index)}
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: "red", fontWeight: "bold" }}>
                        Xóa
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />

              {/* Nút xóa lịch sử tìm kiếm */}
              <TouchableOpacity
                onPress={clearSearchHistory}
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "red", fontWeight: "bold" }}>
                  Xóa tất cả lịch sử tìm kiếm
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ fontSize: 16, color: "gray", textAlign: "center" }}>
              Không có tìm kiếm gì gần đây
            </Text>
          )}
        </View>
      )}
      <TabView value={index} onChange={setIndex} animationType="spring">
        {/* Tab "Tất cả" */}
        <TabView.Item
          style={{ width: "100%", padding: 10, backgroundColor: "white" }}
        >
          <FlatList
            data={[...searchMessages, ...searchUsers, ...searchGroups]}
            renderItem={({ item }) =>
              item.content ? (
                // Tin nhắn
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleOpenChatting(item)}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    gap: 5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: item.avatar_path || item.sender_id?.avatar_path,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ gap: 5 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {item.sender_id.full_name || "Unknown"}
                    </Text>
                    <Text>{item.content}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                // Tài khoản
                <TouchableOpacity
                  onPress={() => handleOpenChatting(item)}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    gap: 5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: item.sender_id?.avatar_path || item.avatar_path,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {item.full_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
          />
        </TabView.Item>
        {/* Tab "Tin nhắn" */}
        <TabView.Item
          style={{ width: "100%", padding: 10, backgroundColor: "white" }}
        >
          {searchMessages.length > 0 ? (
            <FlatList
              data={searchMessages}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleOpenChatting(item)}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    gap: 5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: item.sender_id?.avatar_path || item.avatar_path,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ gap: 5 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      {item.sender_id.full_name || "Unknown"}
                    </Text>
                    <Text>{item.content}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: "gray",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Không tìm thấy tin nhắn phù hợp
            </Text>
          )}
        </TabView.Item>

        {/* Tab "Tài khoản" */}
        <TabView.Item
          style={{ width: "100%", padding: 10, backgroundColor: "white" }}
        >
          {searchUsers.length > 0 ? (
            <FlatList
              data={searchUsers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    gap: 5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  // onPress={() => handleOpenChatting(item)}
                >
                  <Image
                    source={{
                      uri: item.sender_id?.avatar_path || item.avatar_path,
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  />
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {item.full_name}
                    </Text>
                    {/* <Text style={{ color: "gray" }}>{item.phone}</Text> */}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: "gray",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Không tìm thấy tài khoản phù hợp
            </Text>
          )}
        </TabView.Item>
      </TabView>
    </View>
  );
};

export default SearchScreen;
