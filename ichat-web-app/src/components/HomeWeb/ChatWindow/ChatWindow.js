import React, { useState, useEffect } from "react";
import { Layout, Modal, message } from "antd";

import HelloWindow from "./HelloWindow";
import MessageArea from "./MessageArea";
import ComponentLeft from "./ComponentLeft";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  fetchChatMessages,
  updateMessages,
  getUserMessages,
} from "../../../redux/slices/messagesSlice";
import socket from "../../services/socket";
import "./ChatWindow.css";

const ChatWindow = ({ user, selectedFriend }) => {
  // Load ttin nhan tu Backend
  const dispatch = useDispatch();
  const { messages, status, chatMessages, chatStatus, userMessages } =
    useSelector((state) => state.messages);

  const [userListFromState, setUserListFromState] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const senderId = user.id || ""; // ID mặc định
  useEffect(() => {
    dispatch(fetchMessages(senderId)); // Fetch danh sách người nhận
  }, [dispatch, senderId]);

  useEffect(() => {
    // console.log("selectedUser updated:", selectedUser);
  }, [selectedUser]);

  // Process selectedFriend from props (when coming from FriendList)
  useEffect(() => {
    if (selectedFriend && !selectedUser) {
      handleSelectUser(selectedFriend);
    }
  }, [selectedFriend]);
  // Setup global socket connection and event listeners
  useEffect(() => {
    if (!user?.id) return;


    const handleReceiveMessage = (message) => {

      // Xác định message này thuộc về cuộc trò chuyện nào
      // Để ComponentLeft luôn hiển thị tin nhắn mới nhất
      dispatch(fetchMessages(user.id));

      // Nếu chưa có cuộc trò chuyện nào được mở, chỉ cập nhật sidebar
      if (!selectedUser) return;
      // Xử lý tin nhắn nhóm
      if (message.chat_type === "group" && selectedUser.chat_type === "group") {
        // Kiểm tra nếu tin nhắn thuộc về nhóm đang được xem
        if (message.receiver_id === selectedUser.id) {
          // Cập nhật tin nhắn nhóm
          dispatch(getUserMessages(selectedUser.id));
        }
        return;
      }

      // *** QUAN TRỌNG: Logic xác định đúng cuộc trò chuyện ***
      // Tin nhắn thuộc cuộc trò chuyện hiện tại nếu:
      // (người gửi hiện tại + người nhận là selected) HOẶC (người nhận hiện tại + người gửi là selected)
      const conversation1 = [user.id, selectedUser.id].sort().join("-");
      const conversation2 = [message.sender_id, message.receiver_id]
        .sort()
        .join("-");
      const isCurrentChat = conversation1 === conversation2;

      // console.log("Message belongs to current conversation?", isCurrentChat, {
      //   currentConversation: conversation1,
      //   messageConversation: conversation2,
      //   selectedUserId: selectedUser.id,
      //   currentUserId: user.id,
      //   messageSender: message.sender_id,
      //   messageReceiver: message.receiver_id,
      // });

      if (isCurrentChat) {
        // Cập nhật tin nhắn đơn lẻ trước
        dispatch(updateMessages(message));

        // Sau đó fetch toàn bộ cuộc trò chuyện để đảm bảo đồng bộ
        dispatch(
          fetchChatMessages({
            senderId: user.id,
            receiverId: selectedUser.id,
          })
        );
      } else {
        // console.log(
        //   "Message is for a different conversation - only updating sidebar"
        // );
      }
    };
    const handleReactionEvent = (data) => {

      // Luôn cập nhật danh sách sidebar
      dispatch(fetchMessages(user.id));

      // Nếu không có selectedUser, chỉ cập nhật sidebar
      if (!selectedUser || !data.chatId) return;

      // Xác định xem reaction có thuộc cuộc trò chuyện hiện tại hay không
      let currentRoomId;

      if (selectedUser.chat_type === "group") {
        currentRoomId = `group_${selectedUser.id}`;
      } else {
        const currentUserIds = [user.id, selectedUser.id].sort();
        currentRoomId = `chat_${currentUserIds[0]}_${currentUserIds[1]}`;
      }

      if (data.chatId === currentRoomId) {
        // console.log("Reaction belongs to current conversation, updating chat");
        // Cập nhật tin nhắn dựa trên loại chat
        if (selectedUser.chat_type === "group") {
          dispatch(getUserMessages(selectedUser.id));
        } else {
          dispatch(
            fetchChatMessages({
              senderId: user.id,
              receiverId: selectedUser.id,
            })
          );
        }
      }
    };
    // console.log("Setting up socket listeners for user:", user.id);
    // console.log("Selected user:", selectedUser);

    // const userIds = [user.id, selectedUser.id].sort();
    // const roomId = `chat_${userIds[0]}_${userIds[1]}`;
    // socket.emit("join-room", roomId);

    // Register listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("reaction-added", handleReactionEvent);
    socket.on("reaction-removed", handleReactionEvent);
    socket.on("message-reaction-update", handleReactionEvent);

    // Join user's global room
    // socket.emit("join-user-room", user.id);

    return () => {
      // console.log("Cleaning up global socket listeners");
      socket.off("receive-message", handleReceiveMessage);
      socket.off("reaction-added", handleReactionEvent);
      socket.off("reaction-removed", handleReactionEvent);
      socket.off("message-reaction-update", handleReactionEvent);
    };
  }, [user?.id, selectedUser, dispatch]);

  const handleSelectUser = (user) => {
    // console.log("Setting selected user to:", user);

    // Normalize the user object structure to ensure consistent properties
    const normalizedUser = {
      id: user.id,
      name: user.name,
      lastMessage: user.lastMessage || "",
      time: user.timestamp || user.time || new Date(),
      unread: user.unread || 0,
      user_status: user.user_status || "Offline",
      type: user.type || "text",
      avatar_path:
        user.avatar_path ||
        user.avatar ||
        "https://default-avatar.com/avatar.jpg",
      priority: user.priority || "",
      isLastMessageFromMe: user.isLastMessageFromMe || false,
      // This is very important - both fields are needed
      receiver_id: user.receiver_id || user.id,
      chat_type: user.chat_type || "private",
      originalMessage: user.originalMessage || "",
      sender_name: user.sender_name || "",
      admin_id: user.admin_id || null,
    };

    setSelectedUser(normalizedUser);
    // Tham gia phòng chat tương ứng
    let roomId;
    if (normalizedUser.chat_type === "group") {
      roomId = `group_${normalizedUser.id}`;
      // console.log("Joining group room:", roomId);
    } else {
      const userIds = [user.id, normalizedUser.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
      // console.log("Joining private chat room:", roomId);
    }
    socket.emit("join-room", roomId);

    if (normalizedUser.id && user.id) {
      if (normalizedUser.chat_type === "group") {
        dispatch(getUserMessages(normalizedUser.id));
      } else {
        dispatch(
          fetchChatMessages({
            senderId: user.id,
            receiverId: normalizedUser.id,
          })
        );
      }
    }
  };
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Chuyển đổi `messages` thành danh sách user phù hợp
      const formattedUsers = messages.map((msg) => ({
        id: msg.receiver_id,
        name: msg.name,
        lastMessage: msg.lastMessage,
        timestamp: msg.timestamp,
        unread: 0,
        user_status: msg.user_status || "Offline",
        type: msg.type || "text",
        avatar_path: msg.avatar_path || "https://default-avatar.com/avatar.jpg",
        priority: "priority",
        isLastMessageFromMe: msg.isLastMessageFromMe || false,
        chat_type: msg.chat_type || "private",
        originalMessage: msg.originalMessage,
        sender_name: msg.sender_name,
        admin_id: msg.admin_id,
      }));

      setUserListFromState(formattedUsers);
      // console.log("formattedUsers", formattedUsers);
    }
  }, [messages]);

  // useEffect(() => {
  //   if (selectedUser) {
  //     dispatch(fetchChatMessages({ senderId, receiverId: selectedUser.id })); // Fetch tin nhắn giữa sender và receiver
  //   }
  // }, [dispatch, senderId, selectedUser]);
  useEffect(() => {
    if (selectedUser) {
      // Kiểm tra loại chat và fetch tin nhắn phù hợp
      if (selectedUser.chat_type === "group") {
        // Nếu là chat nhóm, dùng getUserMessages để lấy tin nhắn nhóm
        // console.log("Fetching GROUP messages for:", selectedUser.id);
        dispatch(getUserMessages(selectedUser.id));
      } else {
        // Nếu là chat riêng tư (private), dùng fetchChatMessages
        // console.log(
        //   "Fetching PRIVATE messages between:",
        //   senderId,
        //   "and",
        //   selectedUser.id
        // );
        dispatch(
          fetchChatMessages({
            senderId,
            receiverId: selectedUser.id,
          })
        );
      }
    }
  }, [dispatch, senderId, selectedUser]);
  // Hàm callback để cập nhật messages
  const handleUpdateMessages = (newMessage) => {
    // Cập nhật messages ở đây (ví dụ: dispatch action hoặc cập nhật state)
    // dispatch(someActionToUpdateMessages(newMessage));
  };
  // Thêm vào cuối effect hiện tại hoặc tạo một effect mới
  useEffect(() => {
    if (!user?.id || !selectedUser?.id) return;

    // Xác định phòng dựa trên loại chat
    let roomId;
    if (selectedUser.chat_type === "group") {
      roomId = `group_${selectedUser.id}`;
      // console.log("Re-joining group room on change:", roomId);
    } else {
      const userIds = [user.id, selectedUser.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
      // console.log("Re-joining private chat room on change:", roomId);
    }

    // Tham gia phòng
    socket.emit("join-room", roomId);

    // Lắng nghe sự kiện nhóm cụ thể
    const handleGroupEvent = (data) => {
      // console.log("Group event received:", data);
      if (
        selectedUser.chat_type === "group" &&
        selectedUser.id === data.groupId
      ) {
        dispatch(getUserMessages(selectedUser.id));
      }
    };

    socket.on("group-message-update", handleGroupEvent);
    socket.on("group-member-update", handleGroupEvent);

    return () => {
      socket.off("group-message-update", handleGroupEvent);
      socket.off("group-member-update", handleGroupEvent);
    };
  }, [user?.id, selectedUser?.id, selectedUser?.chat_type, dispatch]);
  // Sửa useEffect xử lý khi người dùng rời nhóm
  useEffect(() => {
    const handleUserLeftGroup = () => {
      setSelectedUser(null); // Sửa từ selectedUser(null) thành setSelectedUser(null)
    };

    window.addEventListener("user-left-group", handleUserLeftGroup);

    return () => {
      window.removeEventListener("user-left-group", handleUserLeftGroup);
    };
  }, []);
  //global group event listeners in your existing useEffect
  useEffect(() => {
    if (!user?.id) return;

    // console.log("Setting up global group event listeners for user:", user.id);

    const handleGroupDeleted = (groupId) => {
      // console.log("Group deleted globally:", groupId);
      // Update the messages list to remove the deleted group
      dispatch(fetchMessages(user.id));

      // If the deleted group is the currently selected one, clear the selection
      if (
        selectedUser &&
        selectedUser.chat_type === "group" &&
        selectedUser.id === groupId
      ) {
        setSelectedUser(null);
        message.info("Nhóm đã bị giải tán bởi quản trị viên.");
      }
    };
    const handleMembersAdded = (data) => {
      // console.log("Members added to group globally:", data);

      // Nếu người dùng hiện tại được thêm vào nhóm
      if (Array.isArray(data.userIds) && data.userIds.includes(user.id)) {
        // Cập nhật danh sách chat trong sidebar
        dispatch(fetchMessages(user.id));

        // Hiển thị thông báo
        message.success(
          `Bạn đã được thêm vào nhóm "${data.groupName || "mới"}"`
        );
      } else {
        // Nếu không phải người dùng hiện tại, chỉ cập nhật sidebar
        dispatch(fetchMessages(user.id));
      }
    };
    const handleMemberRemoved = (data) => {
      // console.log("Member removed from group globally:", data);

      // If the current user was removed from a group
      if (data.userId === user.id) {
        dispatch(fetchMessages(user.id));

        // If the group the user was removed from is currently selected
        if (
          selectedUser &&
          selectedUser.chat_type === "group" &&
          selectedUser.id === data.groupId
        ) {
          setSelectedUser(null);
          message.info("Bạn đã bị xóa khỏi nhóm.");
        }
      } else {
        // Just update the messages list
        dispatch(fetchMessages(user.id));
      }
    };

    const handleGroupUpdated = (data) => {
      // console.log("Group updated globally:", data);
      // Update messages to show new group name/avatar
      dispatch(fetchMessages(user.id));

      // If this is the currently selected group, update its name/avatar
      if (
        selectedUser &&
        selectedUser.chat_type === "group" &&
        selectedUser.id === data.groupId
      ) {
        setSelectedUser((prev) => ({
          ...prev,
          name: data.name || prev.name,
          // Update avatar if available
          avatar_path: data.avatar
            ? `${prev.avatar_path}?t=${Date.now()}`
            : prev.avatar_path,
        }));
      }
    };

    const handleMemberLeft = (data) => {
      // console.log("Member left group globally:", data);
      dispatch(fetchMessages(user.id));
    };

    const handleAdminTransferred = (data) => {
      // console.log("Admin transferred globally:", data);
      dispatch(fetchMessages(user.id));

      // If this is the currently selected group, update admin_id
      if (
        selectedUser &&
        selectedUser.chat_type === "group" &&
        selectedUser.id === data.groupId
      ) {
        setSelectedUser((prev) => ({
          ...prev,
          admin_id: data.userId,
        }));
      }
    };

    // Register listeners
    socket.on("members-added", handleMembersAdded);
    socket.on("group-deleted", handleGroupDeleted);
    socket.on("member-removed", handleMemberRemoved);
    socket.on("group-updated", handleGroupUpdated);
    socket.on("member-left", handleMemberLeft);
    socket.on("admin-transferred", handleAdminTransferred);

    return () => {
      // Cleanup listeners
      socket.off("group-deleted", handleGroupDeleted);
      socket.off("member-removed", handleMemberRemoved);
      socket.off("group-updated", handleGroupUpdated);
      socket.off("member-left", handleMemberLeft);
      socket.off("admin-transferred", handleAdminTransferred);
      socket.off("members-added", handleMembersAdded);
    };
  }, [user?.id, selectedUser, dispatch]);

  return (
    <Layout className="chat-window">
      <ComponentLeft
        userList={userListFromState}
        setUserList={setUserListFromState}
        onSelectUser={handleSelectUser} // Truyền hàm callback để chọn user
        user={user}
      />
      {/* Hiển thị màn hình chat hoặc màn hình chào */}{" "}
      {selectedUser ? (
        <MessageArea
          key={selectedUser.id} // Thêm key để React nhận diện component
          selectedChat={selectedUser}
          messages={chatMessages}
          onUpdateMessages={handleUpdateMessages} // Truyền hàm callback
          user={user}
          onChatChange={setSelectedUser}
          onSelectUser={handleSelectUser}
        />
      ) : (
        <HelloWindow />
      )}
    </Layout>
  );
};

export default ChatWindow;
