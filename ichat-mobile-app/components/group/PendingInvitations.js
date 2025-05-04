import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Avatar } from "@rneui/themed";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../config/context/UserContext";
import groupService from "../../services/groupService";
import socketService from "../../services/socketService";

const PendingInvitations = ({ route }) => {
  const { groupId } = route.params || {};
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lắng nghe sự kiện từ socket
  useEffect(() => {
    if (!groupId) return;
    socketService.joinRoom(groupId);

    socketService.handleRejectMember(
      ({ groupId: receivedGroupId, memberId }) => {
        if (groupId === receivedGroupId) {
          fetchPendingMembers();
        }
      }
    );

    socketService.handleAcceptMember(
      ({ groupId: receivedGroupId, memberId }) => {
        if (groupId === receivedGroupId) {
          fetchPendingMembers();
        }
      }
    );

    return () => {
      if (groupId) {
        socketService.removeAllListeners();
        socketService.leaveRoom(groupId);
      }
    };
  }, [groupId, user?.id]);

  // Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const members = await groupService.getPendingMembers(groupId);
      console.log(members);

      setPendingMembers(members);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể lấy danh sách yêu cầu tham gia");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lấy danh sách yêu cầu tham gia khi component được mount
  useEffect(() => {
    fetchPendingMembers();
  }, [groupId]);

  // Xử lý khi người dùng làm mới danh sách
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingMembers();
  };

  // Xử lý khi người dùng chấp nhận yêu cầu tham gia
  const handleAcceptRequest = async (memberId) => {
    try {
      const response = await groupService.acceptMember({
        groupId,
        memberId,
      });

      if (response) {
        socketService.handleAcceptMember({
          groupId,
          memberId,
        });
        Alert.alert("Thông báo", "Đã chấp nhận yêu cầu tham gia");
      } else {
        Alert.alert("Thông báo", "Không thể chấp nhận yêu cầu tham gia");
      }
      fetchPendingMembers();
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể chấp nhận yêu cầu tham gia");
    }
  };

  // Xử lý khi người dùng từ chối yêu cầu tham gia
  const handleRejectRequest = async (memberId) => {
    try {
      const response = await groupService.rejectMember({
        groupId,
        memberId,
      });
      console.log(response);

      if (response === "ok") {
        Alert.alert("Thông báo", "Đã từ chối yêu cầu tham gia");
      } else {
        Alert.alert("Thông báo", "Không thể từ chối yêu cầu tham gia");
      }
      fetchPendingMembers();
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu tham gia:", error);
      Alert.alert("Thông báo", "Không thể từ chối yêu cầu tham gia");
    }
  };

  // Render item cho danh sách yêu cầu tham gia
  const renderPendingMemberItem = ({ item }) => {
    return (
      <View style={styles.memberRow}>
        {/* Thông tin thành viên và người mời */}
        <View style={styles.memberInfo}>
          <Avatar size={50} rounded source={{ uri: item.member.avatar_path }} />
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.member.full_name}</Text>
            <Text style={styles.memberInvitedBy}>
              Được mời bởi: {item.invited_by.full_name}
            </Text>
          </View>
        </View>
        {/* Nút chấp nhận và từ chối */}
        <View style={styles.actionButtons}>
          <IconButton
            icon="check"
            iconColor="#2F80ED"
            size={24}
            onPress={() => handleAcceptRequest(item.user_id)}
            style={styles.actionButton}
          />
          <IconButton
            icon="close"
            iconColor="#FF0000"
            size={24}
            onPress={() => handleRejectRequest(item.user_id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  // Render khi không có yêu cầu tham gia nào
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2F80ED" />
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require("../../assets/icons/notification.png")}
          style={[styles.emptyIcon, { tintColor: "#ccc" }]}
        />
        <Text style={styles.emptyText}>Không có yêu cầu tham gia nào</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/go-back.png")}
              style={[styles.icon, { tintColor: "white" }]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lời mời đang chờ duyệt</Text>
          <View style={{ width: 25 }} />
        </View>
      </SafeAreaView>

      <FlatList
        data={pendingMembers}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderPendingMemberItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={
          pendingMembers.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2F80ED",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 15,
    textAlign: "center",
  },
  icon: {
    width: 25,
    height: 25,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberDetails: {
    marginLeft: 15,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberInvitedBy: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default PendingInvitations;
