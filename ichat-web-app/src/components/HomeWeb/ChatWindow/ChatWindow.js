import React, { useState, useEffect } from "react";
import { Layout, Modal } from "antd";

import HelloWindow from "./HelloWindow";
import MessageArea from "./MessageArea";
import ComponentLeft from "./ComponentLeft";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  fetchChatMessages,
} from "../../../redux/slices/messagesSlice";
import "./ChatWindow.css";

const ChatWindow = ({ user }) => {
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
  // // Lấy tin nhắn giữa sender và receiver
  // Khi chọn một user, lọc tin nhắn giữa senderId và receiverId
  // useEffect(() => {
  //     if (messages && messages.length > 0) {
  //       const updatedUsers = messages.map((msg) => ({
  //         id: msg.receiver_id,
  //         name: msg.name,
  //         lastMessage: msg.lastMessage,
  //         timestamp: msg.timestamp,
  //         unread: msg.unread || 0,
  //         user_status: msg.user_status || "Offline",
  //         avatar_path: msg.avatar_path || "https://default-avatar.com/avatar.jpg",
  //       }));

  //       setUserListFromState((prevUsers) => {
  //         const mergedUsers = [...prevUsers];

  //         updatedUsers.forEach((newUser) => {
  //           const index = mergedUsers.findIndex((u) => u.id === newUser.id);
  //           if (index === -1) {
  //             mergedUsers.unshift(newUser);
  //           } else {
  //             mergedUsers[index] = newUser; // Cập nhật tin nhắn mới nhất
  //           }
  //         });

  //         return mergedUsers;
  //       });
  //     }
  //   }, [messages]);

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
