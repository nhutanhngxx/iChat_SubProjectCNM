import { Image, Text, TouchableOpacity } from "react-native";

// Component hiển thị nút kết bạn theo trạng thái
const FriendButton = ({
  userId,
  itemId,
  fullName,
  listFriend,
  sentRequests,
  onSendRequest,
}) => {
  // Nếu là chính mình, không hiển thị nút
  if (userId === itemId) return null;

  // T r ng th i kh c nhau
  const status = listFriend.includes(itemId)
    ? "friend"
    : sentRequests.includes(itemId)
    ? "pending"
    : "none";

  // Hiển thị nút t ng th i
  return (
    <TouchableOpacity
      style={{
        backgroundColor:
          status === "accepted"
            ? "#4CAF50"
            : status === "pending"
            ? "#888"
            : "#0AA2F8",
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        opacity: status === "none" ? 1 : 0.5,
      }}
      onPress={
        status === "none" ? () => onSendRequest(itemId, fullName) : undefined
      }
      disabled={status !== "none"}
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
        {status === "accepted"
          ? "Bạn bè"
          : status === "pending"
          ? "Đã gửi"
          : "Thêm bạn bè"}
      </Text>
    </TouchableOpacity>
  );
};

export default FriendButton;
