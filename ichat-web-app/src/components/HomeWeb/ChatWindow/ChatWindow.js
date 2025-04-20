import React, { useState, useEffect } from "react";
import { Layout, Modal } from "antd";

import HelloWindow from "./HelloWindow";
import MessageArea from "./MessageArea";
import ComponentLeft from "./ComponentLeft";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  fetchChatMessages,
  updateMessages,
} from "../../../redux/slices/messagesSlice";
import socket from "../../services/socket";
import "./ChatWindow.css";

const ChatWindow = ({ user, selectedFriend }) => {
  // Load ttin nhan tu Backend
  const dispatch = useDispatch();
  const { messages, status, chatMessages, chatStatus } = useSelector(
    (state) => state.messages
  );

  const [userListFromState, setUserListFromState] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const senderId = user.id || ""; // ID mặc định
  useEffect(() => {
    dispatch(fetchMessages(senderId)); // Fetch danh sách người nhận
  }, [dispatch, senderId]);

  useEffect(() => {
    console.log("selectedUser updated:", selectedUser);
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

    console.log("Setting up socket listeners for user:", user.id);

    const handleReceiveMessage = (message) => {
      console.log("Received message globally:", message);

      // Xác định message này thuộc về cuộc trò chuyện nào
      // Bỏ dòng if (message.receiver_id !== user.id) return;

      // LUÔN cập nhật danh sách người trò chuyện trong sidebar
      // Để ComponentLeft luôn hiển thị tin nhắn mới nhất
      dispatch(fetchMessages(user.id));

      // Nếu chưa có cuộc trò chuyện nào được mở, chỉ cập nhật sidebar
      if (!selectedUser) return;

      // *** QUAN TRỌNG: Logic xác định đúng cuộc trò chuyện ***
      // Tin nhắn thuộc cuộc trò chuyện hiện tại nếu:
      // (người gửi hiện tại + người nhận là selected) HOẶC (người nhận hiện tại + người gửi là selected)
      const conversation1 = [user.id, selectedUser.id].sort().join("-");
      const conversation2 = [message.sender_id, message.receiver_id]
        .sort()
        .join("-");
      const isCurrentChat = conversation1 === conversation2;

      console.log("Message belongs to current conversation?", isCurrentChat, {
        currentConversation: conversation1,
        messageConversation: conversation2,
        selectedUserId: selectedUser.id,
        currentUserId: user.id,
        messageSender: message.sender_id,
        messageReceiver: message.receiver_id,
      });

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
        console.log(
          "Message is for a different conversation - only updating sidebar"
        );
      }
    };

    console.log("Setting up socket listeners for user:", user.id);
    console.log("Selected user:", selectedUser);

    // const userIds = [user.id, selectedUser.id].sort();
    // const roomId = `chat_${userIds[0]}_${userIds[1]}`;
    // socket.emit("join-room", roomId);

    // Register listeners
    socket.on("receive-message", handleReceiveMessage);

    // Join user's global room
    // socket.emit("join-user-room", user.id);

    return () => {
      console.log("Cleaning up global socket listeners");
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [user?.id, selectedUser, dispatch]);
  // useEffect(() => {
  //   if (!user?.id) return;

  //   console.log("Setting up socket listeners for user:", user.id);

  //   // Global listener for any message to this user
  //   const handleReceiveMessage = (message) => {
  //     console.log("Received message globally:", message);

  //     // Only process if message involves current user
  //     if (message.sender_id === user.id || message.receiver_id === user.id) {
  //       // 1. ALWAYS update the sidebar message list - this will update ComponentLeft
  //       dispatch(fetchMessages(user.id));

  //       // 2. Only update current chat messages if this message belongs to the selected conversation
  //       if (
  //         selectedUser &&
  //         ((message.sender_id === selectedUser.id &&
  //           message.receiver_id === user.id) ||
  //           (message.sender_id === user.id &&
  //             message.receiver_id === selectedUser.id))
  //       ) {
  //         console.log(
  //           "Message belongs to current conversation - updating chat messages"
  //         );
  //         dispatch(
  //           fetchChatMessages({
  //             senderId: user.id,
  //             receiverId: selectedUser.id,
  //           })
  //         );
  //       } else {
  //         console.log(
  //           "Message is for a different conversation - only updating sidebar"
  //         );
  //         // Only update the message in Redux store if it's NOT for the current conversation
  //         // This prevents invalid updates to Message.js components
  //         if (
  //           !selectedUser ||
  //           (message.sender_id !== selectedUser.id &&
  //             message.receiver_id !== selectedUser.id)
  //         ) {
  //           dispatch(updateMessages(message));
  //         }
  //       }
  //     }
  //   };

  //   // Register listeners
  //   socket.on("receive-message", handleReceiveMessage);

  //   // For reaction events - create a single handler for all reaction events
  //   const handleReactionEvent = (data) => {
  //     console.log("Reaction event received:", data);

  //     // If reaction is for the current conversation, update chat messages
  //     if (selectedUser && data.messageId) {
  //       // Create a roomId for the current conversation
  //       const currentUserIds = [user.id, selectedUser.id].sort();
  //       const currentRoomId = `chat_${currentUserIds[0]}_${currentUserIds[1]}`;

  //       // Only fetch if this reaction belongs to the current conversation
  //       if (data.chatId === currentRoomId) {
  //         dispatch(
  //           fetchChatMessages({
  //             senderId: user.id,
  //             receiverId: selectedUser.id,
  //           })
  //         );
  //       } else {
  //         // If it's another chat, just update the sidebar
  //         dispatch(fetchMessages(user.id));
  //       }
  //     } else {
  //       // If no user selected, just update sidebar
  //       dispatch(fetchMessages(user.id));
  //     }
  //   };

  //   // Set up unified reaction listeners
  //   socket.on("reaction-added", handleReactionEvent);
  //   socket.on("reaction-removed", handleReactionEvent);
  //   socket.on("message-reaction-update", handleReactionEvent); // Legacy listener

  //   // Join user's global room
  //   socket.emit("join-user-room", user.id);

  //   return () => {
  //     console.log("Cleaning up global socket listeners");
  //     socket.off("receive-message", handleReceiveMessage);
  //     socket.off("reaction-added", handleReactionEvent);
  //     socket.off("reaction-removed", handleReactionEvent);
  //     socket.off("message-reaction-update", handleReactionEvent);
  //   };
  // }, [user?.id, selectedUser, dispatch]);

  const handleSelectUser = (user) => {
    console.log("Setting selected user to:", user);

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
    };

    setSelectedUser(normalizedUser);
    if (normalizedUser.id && user.id) {
      dispatch(
        fetchChatMessages({
          senderId: user.id,
          receiverId: normalizedUser.id,
        })
      );
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
      }));

      setUserListFromState(formattedUsers);
      console.log("formattedUsers", formattedUsers);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchChatMessages({ senderId, receiverId: selectedUser.id })); // Fetch tin nhắn giữa sender và receiver
    }
  }, [dispatch, senderId, selectedUser]);
  // Hàm callback để cập nhật messages
  const handleUpdateMessages = (newMessage) => {
    // Cập nhật messages ở đây (ví dụ: dispatch action hoặc cập nhật state)
    // dispatch(someActionToUpdateMessages(newMessage));
  };

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
        />
      ) : (
        <HelloWindow />
      )}
    </Layout>
  );
};

export default ChatWindow;
