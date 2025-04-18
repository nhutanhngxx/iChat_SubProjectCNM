import React, { useState } from "react";
import { Avatar, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { sendFriendRequest } from "../../../redux/slices/friendSlice";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { checkBlockingStatus } from "../../../redux/slices/friendSlice";
import { useEffect } from "react";
import "./UserInfoCard.css";

const UserInfoCard = ({ user, onClose, onSelectUser }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [friendsData, setFriendsData] = useState([]);

  // Thêm các state để theo dõi trạng thái lời mời kết bạn
  // const [isSentRequest, setIsSentRequest] = useState([]);
  // const [isReceiveRequest, setIsReceiveRequest] = useState([]);

  // const [blockingStatus, setBlockingStatus] = useState({
  //   isBlocking: false,  // currentUser đang chặn người kia
  //   isBlocked: false    // currentUser đang bị người kia chặn
  // });

  // console.log("block ", blockingStatus);

  const isFriend = (userId) => {
    return friendsData.some((friend) => friend.id === userId);
  };



  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await dispatch(getUserFriends(currentUser.id)).unwrap();
        setFriendsData(result.friends);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    }

    if (currentUser?.id) {
      fetchFriends();
    }
  }, [dispatch, currentUser, friendsData]);

  // useEffect(() => {
  //   const checkBlocking = async () => {
  //     try {
  //       const result = await dispatch(checkBlockingStatus({
  //         userId: currentUser.id,
  //         otherUserId: user.id
  //       })).unwrap();

  //       setBlockingStatus({
  //         isBlocking: result.isBlocking,
  //         isBlocked: result.isBlocked
  //       });
  //     } catch (error) {
  //       console.error("Lỗi khi kiểm tra trạng thái chặn:", error);
  //     }
  //   };

  //   if (currentUser?.id && user?.id) {
  //     checkBlocking();
  //   }
  // }, [dispatch, currentUser?.id, user?.id]);

  //Chuyển qua chat
  const handleChat = () => {
    const normalizedUser = {
      id: user.id,
      name: user.full_name || user.name,
      lastMessage: "",
      time: new Date(),
      unread: 0,
      user_status: user.user_status || "Offline",
      type: "text",
      avatar_path: user.avatar_path || "https://default-avatar.com/avatar.jpg",
      priority: "",
      isLastMessageFromMe: false,
      receiver_id: user.id  // This is very important
    };
    onSelectUser(normalizedUser); // Gọi hàm onSelectUser với user hiện tại
    onClose(false); // Đóng modal sau khi chọn người dùng
  };

  const onAddFriend = async () => {
    // Kiểm tra không thể kết bạn với chính mình
    if (currentUser.id === user.id) {
      message.error("Không thể kết bạn với chính mình");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        sendFriendRequest({
          senderId: currentUser.id,
          receiverId: user.id,

        })
      ).unwrap();

      console.log("Result from sendFriendRequest:", result);

      if (result.status === "ok") {
        message.success("Lời mời kết bạn đã được gửi");
        onClose(); // Đóng modal sau khi gửi thành công
      }
    } catch (error) {
      // Xử lý các trường hợp lỗi cụ thể từ backend
      const errorMessage = error?.message;

      switch (errorMessage) {
        case "Hai người đã là bạn bè":
          message.error("Hai người đã là bạn bè");
          break;
        case "Lời mời kết bạn đang chờ duyệt":
          message.warning("Lời mời kết bạn đang chờ duyệt");
          break;
        case "Bạn hoặc người kia đã chặn nhau":
          message.error("Không thể kết bạn do một trong hai người đã chặn");
          break;
        case "Không thể gửi lời mời kết bạn cho chính mình":
          message.error("Không thể gửi lời mời kết bạn cho chính mình");
          break;
        default:
          message.error("Đã xảy ra lỗi khi gửi lời mời kết bạn");
          console.error("Friend request error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };



  // Format ngày tham gia
  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="user-info-card">
      <div className="user-header">
        <div className="cover-photo">
          <img
            src={user.cover_path}
            alt="Cover"
            style={{ width: "100%", height: "150px", objectFit: "cover" }}
          />
        </div>
        <Avatar
          size={80}
          src={user.avatar_path}
          className="user-avatar"
          style={{ border: "2px solid white", marginTop: "-40px" }}
        />
        <h2 className="user-name">{user.full_name}</h2>
        <p className="join-date">
          Tham gia Zalo: {formatJoinDate(user.created_at)}
        </p>
      </div>

      <div className="user-actions">
        {!isFriend(user.id) && (
          <Button
            type="primary"
            block
            onClick={onAddFriend}
            loading={isLoading}

          >
            Kết bạn
          </Button>
        )}

        <Button block onClick={handleChat}>
          Nhắn tin
        </Button>
      </div>

      <div className="user-details">
        <div className="detail-item">
          <span className="label">Điện thoại:</span>
          <span className="value">{user.phone}</span>
        </div>
        <div className="detail-item">
          <span className="label">Trạng thái:</span>
          <span className="value">{user.status}</span>
        </div>
        <div className="detail-item">
          <span className="label">Giới tính:</span>
          <span className="value">{user.gender}</span>
        </div>
        <div className="detail-item">
          <span className="label">Ngày sinh:</span>
          <span className="value">{user.dobFormatted}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
