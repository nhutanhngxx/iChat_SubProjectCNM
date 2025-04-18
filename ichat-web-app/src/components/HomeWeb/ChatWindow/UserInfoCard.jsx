import React, { useState } from "react";
import { Avatar, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getSentFriendRequests, getReceivedFriendRequests, getUserFriends, sendFriendRequest, getBlockedUsers } from "../../../redux/slices/friendSlice";

import { useEffect } from "react";
import "./UserInfoCard.css";

const UserInfoCard = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [sentRequestData, setSentRequestData] = useState([]);
  const [receiveRequestData, setReceiveRequestData] = useState([]);
  const [acceptData, setAcceptData] = useState([]);
  const [blockData, setBlockData] = useState([]);

  const isSentRequest = sentRequestData?.some(request => request.id === user.id);
  const isReceiveRequest = receiveRequestData?.some(request => request.id === user.id);
  const isAccept = acceptData?.some(request => request.id === user.id);
  const isBlocked = blockData?.some(request => request.id === user.id);

  console.log("isReceiveRequest: ", isReceiveRequest);
  console.log("isSentRequest: ", isSentRequest);
  console.log("isAccept: ", isAccept);
  console.log("isBlocked: ", isBlocked);

  useEffect(() => {
    const fetchList = async () => {
      try {

        const resultSentRequest = await dispatch(getSentFriendRequests(currentUser.id)).unwrap();
        setSentRequestData(resultSentRequest.friendRequests);

        const resultReceiveRequest = await dispatch(getReceivedFriendRequests(currentUser.id)).unwrap();
        setReceiveRequestData(resultReceiveRequest.friendRequests);

        const resultFriends = await dispatch(getUserFriends(currentUser.id)).unwrap();
        setAcceptData(resultFriends.friends);

        const resultBlockedUsers = await dispatch(getBlockedUsers(currentUser.id)).unwrap();
        setBlockData(resultBlockedUsers.data);

      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    }

    if (currentUser?.id) {
      fetchList();
    }
  }, [dispatch, currentUser]);




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
        {!isAccept && (
          <Button
            type="primary"
            block
            onClick={onAddFriend}
            loading={isLoading}
            disabled={isSentRequest || isReceiveRequest || isBlocked}
          >
            {isSentRequest && "Đang chờ chấp nhận"}
            {isReceiveRequest && "Đã nhận lời mời kết bạn"}
            {isBlocked && "Bạn đang bị chặn"}
            {!isSentRequest && !isReceiveRequest && !isBlocked && "Kết bạn"}
          </Button>
        )}

        <Button block>
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



