import React from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import friendService from "../../services/friendService";

const FriendButton = ({
  userId,
  itemId,
  fullName,
  sentRequests,
  listFriend,
  onSendRequest,
  onCancelRequest,
  refreshRequests,
}) => {
  // Nếu là chính mình, không hiển thị nút
  if (userId === itemId) return null;

  // Kiểm tra xem người dùng này đã là bạn bè hay chưa
  const isFriend = listFriend.some(
    (friend) => friend.id === itemId || friend._id === itemId
  );

  // Kiểm tra xem đã gửi lời mời kết bạn hay chưa
  const isPending = sentRequests.some(
    (request) => request.id === itemId || request._id === itemId
  );

  // Hàm xử lý thu hồi lời mời kết bạn
  const handleCancelRequest = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn thu hồi lời mời kết bạn?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Thu hồi",
        onPress: async () => {
          try {
            const response = await friendService.cancelFriendRequest({
              senderId: userId,
              receiverId: itemId,
            });

            if (response.status === "ok") {
              if (onCancelRequest) {
                onCancelRequest(itemId);
              }

              if (refreshRequests) {
                refreshRequests();
              }

              Alert.alert("Thành công", "Đã thu hồi lời mời kết bạn");
            }
          } catch (error) {
            console.error("Lỗi khi thu hồi lời mời kết bạn:", error);
            Alert.alert("Lỗi", "Không thể thu hồi lời mời kết bạn");
          }
        },
      },
    ]);
  };

  if (isFriend) {
    // Hiển thị nút "Bạn bè" khi đã là bạn bè
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#4CAF50",
          borderRadius: 5,
          paddingVertical: 5,
          paddingHorizontal: 10,
        }}
        disabled={true}
      >
        <Text style={{ color: "white", fontWeight: "500" }}>
          <Image
            source={require("../../assets/icons/contact.png")}
            style={{
              width: 10,
              height: 10,
              tintColor: "white",
            }}
          />{" "}
          Bạn bè
        </Text>
      </TouchableOpacity>
    );
  } else if (isPending) {
    // Hiển thị nút "Đã gửi" và "Thu hồi" khi đã gửi lời mời
    return (
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 14,
            color: "#888",
            marginBottom: 5,
          }}
        >
          Đã gửi
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#f44336",
            borderRadius: 5,
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
          onPress={handleCancelRequest}
        >
          <Text style={{ color: "white", fontWeight: "500" }}>
            <Image
              source={require("../../assets/icons/cancel.png")}
              style={{
                width: 10,
                height: 10,
                tintColor: "white",
              }}
            />{" "}
            Thu hồi
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    // Hiển thị nút "Kết bạn" khi chưa gửi lời mời
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#0AA2F8",
          borderRadius: 5,
          paddingVertical: 5,
          paddingHorizontal: 10,
        }}
        onPress={() => onSendRequest(itemId)}
      >
        <Text style={{ color: "white", fontWeight: "500" }}>
          <Image
            source={require("../../assets/icons/add-friend.png")}
            style={{
              width: 10,
              height: 10,
              tintColor: "white",
            }}
          />{" "}
          Kết bạn
        </Text>
      </TouchableOpacity>
    );
  }
};

export default FriendButton;
