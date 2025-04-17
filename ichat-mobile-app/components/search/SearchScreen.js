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
  Platform,
} from "react-native";
import { Tab, TabView } from "@rneui/themed";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../config/context/UserContext";
import { StatusBar } from "expo-status-bar";
import { getHostIP } from "../../services/api";
import { ActivityIndicator } from "react-native-paper";
import friendService from "../../services/friendService";
import FriendButton from "../common/FriendButton";
import userService from "../../services/userService";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);
  const { user } = useContext(UserContext);

  const ipAdr = getHostIP();
  const API_iChat = `http://${ipAdr}:5001/api`;

  // const handleOpenChatting = async (selectedItem) => {
  //   // Check friendship status first
  //   try {
  //     const friendships = await friendService.getFriendListByUserId({
  //       userId: user.id,
  //     });
  //     const isFriend = friendships.some(
  //       (friend) =>
  //         friend.id === selectedItem.id || friend._id === selectedItem.id
  //     );

  //     console.log("isFriend:", isFriend);

  //     if (!isFriend) {
  //       // Alert.alert(
  //       //   "Thông báo",
  //       //   "Bạn cần kết bạn với người này trước khi bắt đầu cuộc trò chuyện",
  //       //   [{ text: "OK" }]
  //       // );
  //       console.log("Không là bạn bè");

  //       return;
  //     }

  //     try {
  //       let chatPartnerId, chatPartnerName, chatPartnerAvatar, messageId;

  //       if (selectedItem.content) {
  //         // Search result is a message
  //         const isSender = selectedItem.sender_id === user.id;
  //         chatPartnerId = isSender
  //           ? selectedItem.receiver_id
  //           : selectedItem.sender_id;
  //         messageId = selectedItem.id; // Store message ID for scrolling

  //         // Get user info from the loaded users list
  //         const chatPartner = users.find((u) => u.id === chatPartnerId);
  //         chatPartnerName = chatPartner
  //           ? chatPartner.full_name
  //           : "Người ẩn danh";
  //         chatPartnerAvatar =
  //           chatPartner?.avatar_path ||
  //           "https://i.ibb.co/9k8sPRMx/best-seller.png";
  //       } else {
  //         // Search result is a user
  //         chatPartnerId = selectedItem.id;
  //         chatPartnerName = selectedItem.full_name || "Người ẩn danh";
  //         chatPartnerAvatar =
  //           selectedItem.avatar_path ||
  //           "https://i.ibb.co/9k8sPRMx/best-seller.png";
  //       }

  //       const chat = {
  //         id: chatPartnerId,
  //         name: chatPartnerName,
  //         avatar: { uri: chatPartnerAvatar },
  //         chatType: "private",
  //         messageId: messageId || null, // Pass messageId for messages
  //       };

  //       navigation.navigate("Home", {
  //         screen: "Messages",
  //         params: { chat },
  //       });
  //     } catch (error) {
  //       console.error("Error opening chat:", error);
  //       // Alert.alert("Error", "Unable to open chat. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error checking friendship status:", error);
  //     // Alert.alert(
  //     //   "Error",
  //     //   "Unable to check friendship status. Please try again."
  //     // );
  //   }
  // };

  const handleOpenChatting = async (selectedItem) => {
    console.log("Đã chọn:", selectedItem);

    try {
      // Kiểm tra trạng thái bạn bè
      console.log("Bắt đầu kiểm tra trạng thái bạn bè...");
      const friendships = await friendService.getFriendListByUserId({
        userId: user.id,
      });

      const isFriend = friendships.some(
        (friend) =>
          friend.id === selectedItem.id || friend._id === selectedItem.id
      );

      console.log("Kết quả kiểm tra bạn bè:", isFriend);

      // if (!isFriend) {
      //   console.log("Không thể mở trò chuyện: Người dùng chưa là bạn bè");
      //   return;
      // }

      // Xử lý thông tin đối tác trò chuyện
      console.log("Xử lý thông tin đối tác trò chuyện...");
      let chatPartnerId, chatPartnerName, chatPartnerAvatar, messageId;

      if (
        selectedItem.content &&
        selectedItem.sender_id &&
        selectedItem.receiver_id
      ) {
        // Đầu vào là tin nhắn
        console.log("Đầu vào là tin nhắn");
        const isSender = selectedItem.sender_id === user.id;
        chatPartnerId = isSender
          ? selectedItem.receiver_id
          : selectedItem.sender_id;
        messageId = selectedItem.id;

        const chatPartner = users.find((u) => u.id === chatPartnerId);
        chatPartnerName = chatPartner?.full_name || "Người ẩn danh";
        chatPartnerAvatar =
          chatPartner?.avatar_path ||
          "https://i.ibb.co/9k8sPRMx/best-seller.png";
      } else {
        // Đầu vào là người dùng
        console.log("Đầu vào là người dùng");
        chatPartnerId = selectedItem.id;
        chatPartnerName = selectedItem.full_name || "Người ẩn danh";
        chatPartnerAvatar =
          selectedItem.avatar_path ||
          "https://i.ibb.co/9k8sPRMx/best-seller.png";
      }

      // Tạo đối tượng chat
      console.log("Tạo đối tượng chat và điều hướng...");
      const chat = {
        id: chatPartnerId,
        name: chatPartnerName,
        avatar: { uri: chatPartnerAvatar },
        chatType: "private",
        messageId: messageId || null,
        lastMessage: "",
        lastMessageTime: "",
        time: "",
        unreadCount: "",
      };

      console.log("Đối tượng chat:", chat);

      // Điều hướng đến màn hình trò chuyện
      // navigation.navigate("Home", {
      //   screen: "Messages",
      //   params: { chat },
      // });

      navigation.navigate("Chatting", { chat });

      console.log("Mở trò chuyện thành công");
    } catch (error) {
      console.error("Lỗi khi xử lý mở trò chuyện:", error);
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
  const [sentRequests, setSentRequests] = useState([]);
  const [listFriend, setListFriend] = useState([]);

  const handleResultPress = (item) => {
    saveSearchHistory(searchText); // Lưu lại từ khoá đã dùng
    navigateToDetail(item); // Điều hướng đến trang chi tiết
  };

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

  // Hàm xử lý gửi lời mời kết bạn
  const handleSendFriendRequest = async (receiverId) => {
    try {
      const response = await friendService.sendFriendRequest({
        senderId: user.id,
        receiverId,
      });
      if (response.status === "ok") {
        // Tìm kiếm người dùng vừa được gửi lời mời kết bạn
        const user = await userService.getUserById(receiverId);

        if (!user) {
          Alert.alert("Thông báo", "Không tìm thấy người dùng này");
          return;
        } else {
          const newSentRequest = {
            id: user.id,
            full_name: user.full_name,
            avatar_path: user.avatar_path,
          };

          setSentRequests((prev) => [...prev, newSentRequest]);
          Alert.alert(
            "Thông báo",
            `Đã gửi lời mời kết bạn đến ${user.full_name}`,
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Thông báo",
          response.message || "Không thể gửi lời mời kết bạn"
        );
      }
    } catch (error) {
      console.error("Lỗi gửi lời mời kết bạn:", error);
      Alert.alert("Thông báo", "Đã xảy ra lỗi khi gửi lời mời kết bạn");
    }
  };

  // Hàm xử lý hủy lời mời kết bạn
  const handleCancelFriendRequest = (itemId) => {
    setSentRequests((prev) =>
      prev.filter((req) => req.id !== itemId && req._id !== itemId)
    );
  };

  // Hàm xử lý làm mới danh sách bạn bè và lời mời kết bạn
  const refreshFriendRequests = () => {
    fetchFriendRequests();
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

      // if (usersResponse.error) {
      //   setSearchUsers([]);
      // } else if (
      //   usersResponse.data?.status === "ok" &&
      //   Array.isArray(usersResponse.data.users)
      // ) {
      //   setSearchUsers(usersResponse.data.users);
      // } else {
      //   setSearchUsers([]);
      // }

      if (
        usersResponse.data?.status === "ok" &&
        Array.isArray(usersResponse.data.users)
      ) {
        // Nếu tìm kiếm bằng tên (không phải số điện thoại), chỉ hiển thị bạn bè
        if (!/^(\+)?\d+$/.test(finalSearchQuery)) {
          const filteredUsers = usersResponse.data.users.filter((searchUser) =>
            listFriend.some(
              (friend) =>
                friend.id === searchUser.id || friend._id === searchUser.id
            )
          );
          setSearchUsers(filteredUsers);
        } else {
          // Nếu tìm bằng số điện thoại, hiển thị tất cả kết quả
          setSearchUsers(usersResponse.data.users);
        }
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

  // Lấy danh sách bạn bè và lời mời kết bạn đã gửi
  const fetchFriendRequests = async () => {
    try {
      const friendList = await friendService.getFriendListByUserId(user.id);
      setListFriend(friendList);
      const sentRequests = await friendService.getSentRequestsByUserId(user.id);
      setSentRequests(sentRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      setSentRequests([]);
      setFriendList([]);
    }
  };

  // Gọi fetchFriendRequests khi component được mount
  useEffect(() => {
    fetchFriendRequests();
  }, []);

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
        style={
          Platform.OS === "ios"
            ? {
                flexDirection: "row",
                alignItems: "flex-end",
                width: "100%",
                padding: 10,
                height: 90,
              }
            : {
                flexDirection: "row",
                alignItems: "flex-end",
                width: "100%",
                paddingHorizontal: 10,
                height: 80,
              }
        }
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
              style={
                Platform.OS === "ios"
                  ? {
                      flex: 1,
                      fontSize: 15,
                      paddingHorizontal: 10,
                      textAlignVertical: "center",
                      height: 30,
                    }
                  : {
                      flex: 1,
                      fontSize: 15,
                      paddingHorizontal: 10,
                      textAlignVertical: "center",
                      height: 40,
                    }
              }
              placeholder="Tìm kiếm"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                saveSearchHistory(searchText);
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
        <View
          style={
            Platform.OS === "ios"
              ? { padding: 10, backgroundColor: "white" }
              : {
                  padding: 10,
                  marginTop: 10,
                  backgroundColor: "white",
                }
          }
        >
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
                    style={
                      Platform.OS === "ios"
                        ? {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                            paddingHorizontal: 5,
                          }
                        : {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 5,
                            paddingHorizontal: 5,
                          }
                    }
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
            data={[
              ...searchMessages.filter((message) => message.type !== "image"),
              ...searchUsers,
              ...searchGroups,
            ]}
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
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                    gap: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onPress={() => handleOpenChatting(item)}
                >
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => handleOpenChatting(item)}
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
                    </View>
                  </TouchableOpacity>
                  <FriendButton
                    userId={user?.id}
                    itemId={item.id}
                    fullName={item.full_name}
                    sentRequests={sentRequests}
                    listFriend={listFriend}
                    onSendRequest={handleSendFriendRequest}
                    onCancelRequest={handleCancelFriendRequest}
                    refreshRequests={refreshFriendRequests}
                  />
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
              data={searchMessages.filter(
                (message) => message.type !== "image"
              )}
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
                    justifyContent: "space-between",
                  }}
                  // onPress={() => handleOpenChatting(item)}
                >
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => handleOpenChatting(item)}
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
                    </View>
                  </TouchableOpacity>
                  <FriendButton
                    userId={user?.id}
                    itemId={item.id}
                    fullName={item.full_name}
                    sentRequests={sentRequests}
                    listFriend={listFriend}
                    onSendRequest={handleSendFriendRequest}
                    onCancelRequest={handleCancelFriendRequest}
                    refreshRequests={refreshFriendRequests}
                  />
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
