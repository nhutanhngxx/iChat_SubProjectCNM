import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { Alert } from "react-native";
import { UserContext } from "./UserContext";
import { getHostIP } from "../../services/api";

// URL của server socket
const ipAdr = getHostIP();
const SOCKET_URL = `http://${ipAdr}:5001`;

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    // Khởi tạo socket với URL của server
    const socketIO = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Xử lý các sự kiện kết nối
    socketIO.on("connect", () => {
      console.log("Socket connected with ID:", socketIO.id);
      setIsConnected(true);

      // Tham gia vào phòng cá nhân để nhận thông báo
      socketIO.emit("join-user-room", user.id);
    });

    socketIO.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketIO.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
      setIsConnected(false);
    });

    // Lưu socket vào state và ref
    setSocket(socketIO);
    socketRef.current = socketIO;

    // Cleanup khi component unmount
    return () => {
      if (socketIO) {
        console.log("Cleaning up socket");
        socketIO.disconnect();
      }
    };
  }, [user?.id]);

  // ===== CHỨC NĂNG CHAT =====

  // Hàm tham gia phòng chat
  const joinChatRoom = (chatId) => {
    if (!isConnected || !socketRef.current) return;

    console.log("Joining chat room:", chatId);
    socketRef.current.emit("join-room", chatId);
  };

  // Hàm gửi tin nhắn
  const sendMessage = (messageData) => {
    if (!isConnected || !socketRef.current) {
      Alert.alert(
        "Lỗi kết nối",
        "Không thể gửi tin nhắn do mất kết nối. Vui lòng thử lại sau."
      );
      return false;
    }

    console.log("Sending message:", messageData);
    socketRef.current.emit("send-message", messageData);
    return true;
  };

  // Hàm thu hồi tin nhắn
  const recallMessage = (
    chatId,
    messageId,
    senderId,
    newContent = "Tin nhắn đã được thu hồi"
  ) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("recall-message", {
      chatId,
      messageId,
      senderId,
      newContent,
    });
    return true;
  };

  // Hàm thêm reaction
  const addReaction = (chatId, messageId, userId, reaction) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("add-reaction", {
      chatId,
      messageId,
      userId,
      reaction,
    });
    return true;
  };

  // Hàm xóa reaction
  const removeReaction = (chatId, messageId, userId) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("remove-reaction", {
      chatId,
      messageId,
      userId,
    });
    return true;
  };

  // Hàm ghim tin nhắn
  const pinMessage = (chatId, messageId, isPinned) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("pin-message", {
      chatId,
      messageId,
      isPinned,
    });
    return true;
  };

  // Hàm trả lời tin nhắn
  const replyMessage = (chatId, message) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("reply-message", {
      chatId,
      message,
    });
    return true;
  };

  // Hàm xóa toàn bộ tin nhắn
  const deleteAllMessages = (chatId, userId) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("delete-all-messages", {
      chatId,
      userId,
    });
    return true;
  };

  // ===== CHỨC NĂNG BẠN BÈ =====

  // Hàm gửi lời mời kết bạn
  const sendFriendRequest = (receiverId) => {
    if (!isConnected || !socketRef.current || !user?.id) return false;

    socketRef.current.emit("send-friend-request", {
      sender_id: user.id,
      receiver_id: receiverId,
    });
    return true;
  };

  // Hàm chấp nhận lời mời kết bạn
  const acceptFriendRequest = (senderId) => {
    if (!isConnected || !socketRef.current || !user?.id) return false;

    socketRef.current.emit("accept-friend-request", {
      sender_id: senderId,
      receiver_id: user.id,
    });
    return true;
  };

  // Hàm hủy lời mời kết bạn
  const cancelFriendRequest = (receiverId) => {
    if (!isConnected || !socketRef.current || !user?.id) return false;

    socketRef.current.emit("cancel-friend-request", {
      sender_id: user.id,
      receiver_id: receiverId,
    });
    return true;
  };

  // Hàm chặn người dùng
  const blockUser = (blockedId) => {
    if (!isConnected || !socketRef.current || !user?.id) return false;

    socketRef.current.emit("block-user", {
      blocker_id: user.id,
      blocked_id: blockedId,
    });
    return true;
  };

  // Hàm hủy kết bạn
  const unfriendUser = (friendId) => {
    if (!isConnected || !socketRef.current || !user?.id) return false;

    socketRef.current.emit("unfriend-user", {
      user_id: user.id,
      friend_id: friendId,
    });
    return true;
  };

  // ===== CHỨC NĂNG QR LOGIN =====

  // Hàm gửi thông tin đăng nhập qua QR
  const sendQRLoginInfo = (sessionId, userInfo) => {
    if (!isConnected || !socketRef.current) return false;

    socketRef.current.emit("qr-login", {
      sessionId,
      userInfo,
    });
    return true;
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        // Chat functions
        joinChatRoom,
        sendMessage,
        recallMessage,
        addReaction,
        removeReaction,
        pinMessage,
        replyMessage,
        deleteAllMessages,
        // Friend functions
        sendFriendRequest,
        acceptFriendRequest,
        cancelFriendRequest,
        blockUser,
        unfriendUser,
        // Login functions
        sendQRLoginInfo,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
