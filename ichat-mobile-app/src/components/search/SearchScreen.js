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
import { UserContext } from "@/src/context/UserContext";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);
  const { user } = useContext(UserContext);

  const handleOpenChatting = async (selectedMessage) => {
    console.log(selectedMessage);

    // Xác định ID của người đang chat với user
    const isSender = selectedMessage.sender_id === user.id;
    const chatPartnerId = isSender
      ? selectedMessage.receiver_id
      : selectedMessage.sender_id;

    try {
      // Gọi API lấy danh sách users
      const response = await axios.get("http://172.20.10.5:5001/users");

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
  const [isLoading, setIsLoading] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchMessages, setSearchMessages] = useState([]);
  const [users, setUsers] = useState([]);

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
      const [usersResponse, messagesResponse] = await Promise.all([
        axios.get(`http://172.20.10.5:5001/users?search=${searchText}`),
        axios.get(`http://172.20.10.5:5001/messages?search=${searchText}`),
      ]);

      setSearchUsers(
        usersResponse.data.status === "ok" ? usersResponse.data.users : []
      );

      setSearchMessages(
        messagesResponse.data.status === "ok" ? messagesResponse.data.data : [] // Kiểm tra đúng key response
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
      console.log("Fetching users...");
      const response = await axios.get("http://172.20.10.5:5001/users");

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

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Thanh tìm kiếm */}
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
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0AA2F8"
          style={{ marginTop: 10 }}
        />
      )}

      {/* Tabs kết quả tìm kiếm */}
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
          titleStyle={{ fontSize: 16, fontWeight: "500" }}
        />
        <Tab.Item
          title="Tin nhắn"
          titleStyle={{ fontSize: 16, fontWeight: "500" }}
        />
        <Tab.Item
          title="Tài khoản"
          titleStyle={{ fontSize: 16, fontWeight: "500" }}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        {/* Tab "Tất cả" */}
        <TabView.Item style={{ width: "100%", padding: 10 }}>
          <FlatList
            data={[...searchMessages, ...searchUsers]}
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
                    // backgroundColor: "green",
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
                <View
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
                </View>
              )
            }
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
          />
        </TabView.Item>

        {/* Tab "Tin nhắn" */}
        <TabView.Item style={{ width: "100%", padding: 10 }}>
          {searchMessages.length > 0 ? (
            <FlatList
              data={searchMessages}
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
        <TabView.Item style={{ width: "100%", padding: 10 }}>
          {searchUsers.length > 0 ? (
            <FlatList
              data={searchUsers}
              renderItem={({ item }) => (
                <View
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
                      alignItems: "center",
                    }}
                  />
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {item.full_name}
                    </Text>
                    {/* <Text style={{ color: "gray" }}>{item.phone}</Text> */}
                  </View>
                </View>
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
