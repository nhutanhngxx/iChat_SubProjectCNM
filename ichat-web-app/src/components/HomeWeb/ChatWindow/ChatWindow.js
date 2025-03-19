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
    console.log("Messages:", messages);

    const [userListFromState, setUserListFromState] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const senderId = user.id || "67c0acf193390020eefc9ff2"; // ID mặc định
    useEffect(() => {
        dispatch(fetchMessages(senderId)); // Fetch danh sách người nhận
    }, [dispatch, senderId]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            // Chuyển đổi `messages` thành danh sách user phù hợp
            const formattedUsers = messages.map((msg) => ({
                id: msg.receiver_id,
                name: msg.name,
                lastMessage: msg.lastMessage,
                timestamp: msg.timestamp,
                unread: msg.unread || 0,
                user_status: msg.user_status || "Offline",
                type: msg.type || "text",
                avatar_path: msg.avatar_path || "https://default-avatar.com/avatar.jpg",
                priority: "priority",
            }));

            setUserListFromState(formattedUsers);
            console.log("formattedUsers", formattedUsers);
        }
    }, [messages]);
    // // Lấy tin nhắn giữa sender và receiver
    // Khi chọn một user, lọc tin nhắn giữa senderId và receiverId
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

    return ( <
        Layout className = "chat-window" >
        <
        ComponentLeft userList = { userListFromState }
        setUserList = { setUserListFromState }
        onSelectUser = { setSelectedUser }
        />

        { /* Hiển thị màn hình chat hoặc màn hình chào */ } {
            selectedUser ? ( <
                MessageArea selectedChat = { selectedUser }
                messages = { chatMessages }
                onUpdateMessages = { handleUpdateMessages } // Truyền hàm callback
                user = { user }
                />
            ) : ( <
                HelloWindow / >
            )
        } <
        /Layout>
    )
};

export default ChatWindow;