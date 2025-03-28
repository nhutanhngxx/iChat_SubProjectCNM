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
  ActivityIndicator,
} from "react-native";
import { Tab, TabView } from "@rneui/themed";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { NetworkInfo } from "react-native-network-info";
import { StatusBar } from "expo-status-bar";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);
  const { user } = useContext(UserContext);

  const API_iChat = "http://172.20.10.5:5001";

  const handleOpenChatting = async (selectedMessage) => {
    // Xác định ID của người đang chat với user
    const isSender = selectedMessage.sender_id === user.id;
    const chatPartnerId = isSender
      ? selectedMessage.receiver_id
      : selectedMessage.sender_id;

    try {
      // Gọi API lấy danh sách users
      const response = await axios.get(`${API_iChat}/users`);

      if (response.data.status === "ok") {
        // Tìm người dùng trong danh sách theo chatPartnerId
        const chatPartner = response.data.users.find(
          (user) => user.id === chatPartnerId
        );

        // Lấy tên và avatar của người đang chat cùng
        const chatPartnerName = chatPartner
          ? chatPartner.full_name
          : "Người ẩn danh";

        const chatPartnerAvatar =
          chatPartner?.avatar_path ||
          "https://i.ibb.co/9k8sPRMx/best-seller.png"; // Avatar mặc định nếu không có

        const chat = {
          messages: [], // Có thể gọi API để lấy tin nhắn nếu cần
          id: chatPartnerId,
          name: chatPartnerName,
          avatar: chatPartnerAvatar,
          chatType: chatPartner?.full_name ? "private" : "group",
        };
        navigation.navigate("Chatting", { chat });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
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
  const removeSearchItem = (index) => {
    setHistorySearch((prevHistory) =>
      prevHistory.filter((_, i) => i !== index)
    );
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
    setIsLoading(true);
    try {
      const [usersResponse, messagesResponse, groupsResponse] =
        await Promise.all([
          axios.get(`${API_iChat}/users?search=${searchText}`),
          axios.get(`${API_iChat}/messages?search=${searchText}`),
          axios.get(`${API_iChat}/groups?search=${searchText}`),
        ]);

      setSearchUsers(
        usersResponse.data.status === "ok" ? usersResponse.data.users : []
      );

      setSearchMessages(
        messagesResponse.data.status === "ok" ? messagesResponse.data.data : [] // Kiểm tra đúng key response
      );

      setSearchGroups(
        groupsResponse.data.status === "ok" ? groupsResponse.data.data : []
      );
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Data này là tất cả user dùng để tìm kiếm tin nhắn từ tất cả user trong database
  // Sau này sẽ giới hạn lại tìm kiếm tin nhắn từ bạn bè
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
    <View style={{ flex: 1, backgroundColor: "#0AA2F8", paddingTop: 40 }}>
      <StatusBar hidden={false} style="light" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: 50,
          backgroundColor: "#0AA2F8",
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{ width: 20, height: 20, tintColor: "white" }}
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 5,
            marginHorizontal: 5,
          }}
        >
          <TextInput
            ref={searchInputRef}
            style={{
              flex: 1,
              fontSize: 14,
              paddingHorizontal: 10,
              height: 35,
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
      {/* Hiển thị loading khi đang tìm kiếm */}
      {/* {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0AA2F8"
          style={{ marginTop: 10 }}
        />
      )} */}
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
                      uri: item.avatar_path || "https://picsum.photos/200",
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
                      {users.find((user) => user.id === item.sender_id)
                        ?.full_name || "Unknown"}
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
                      uri: item.avatar_path || "https://picsum.photos/200",
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
                      uri: item.avatar_path || "https://picsum.photos/200",
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
                      {users.find((user) => user.id === item.sender_id)
                        ?.full_name || "Unknown"}
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
                      uri: item.avatar_path || "https://picsum.photos/200",
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
