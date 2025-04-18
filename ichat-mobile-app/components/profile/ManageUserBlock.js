import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { UserContext } from "../../config/context/UserContext";
import goBackIcon from "../../assets/icons/go-back.png";
import friendService from "../../services/friendService";

const ManageUserBlock = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await friendService.getBlockedUsersByUserId(user.id);
      console.log("Blocked users:", response.data);

      console.log("Response:", response.data);
      setBlockedUsers(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chặn:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng bị chặn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async (blockedUserId) => {
    Alert.alert(
      "Bỏ chặn người dùng",
      "Bạn có chắc chắn muốn bỏ chặn người dùng này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await friendService.unblockUser({
                blockedUserId,
                userId: user.id,
              });

              if (response.status === "ok") {
                setBlockedUsers((prevUsers) =>
                  prevUsers.filter((user) => user.id !== blockedUserId)
                );
                Alert.alert("Thông báo", "Đã bỏ chặn người dùng thành công");
              }
            } catch (error) {
              console.error("Lỗi khi bỏ chặn người dùng:", error);
              Alert.alert(
                "Lỗi",
                "Không thể bỏ chặn người dùng. Vui lòng thử lại sau."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.avatar_path }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item.id)}
        disabled={isLoading}
      >
        <Text style={styles.unblockText}>Bỏ chặn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={goBackIcon}
            style={{ width: 25, height: 25, tintColor: "#fff" }}
          />
          <Text style={styles.headerTitle}>Danh sách chặn</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20, flex: 1 }}>
        {blockedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn chưa chặn người dùng nào</Text>
          </View>
        ) : (
          <>
            <View style={styles.noticeBox}>
              <Text style={styles.sectionTitle}>Thông tin</Text>
              <Text style={styles.notice}>
                • Người dùng bị chặn sẽ không thể:
              </Text>
              <Text style={styles.notice}>- Nhắn tin cho bạn</Text>
              <Text style={styles.notice}>- Thêm bạn vào nhóm</Text>
              <Text style={styles.notice}>
                - Xem trạng thái hoạt động của bạn
              </Text>
            </View>

            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 90,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#3083F9",
    padding: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noticeBox: {
    backgroundColor: "#e6f0ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  notice: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  listContainer: {
    gap: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6fb",
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  unblockButton: {
    backgroundColor: "#ff4d4f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unblockText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ManageUserBlock;
