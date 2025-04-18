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

    const socketIO = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketIO.on("connect", () => {
      console.log("Socket connected on Socket Context:", socketIO.id);
      setIsConnected(true);
      socketIO.emit("join-user-room", user.id);
    });

    socketIO.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketIO);
    socketRef.current = socketIO;

    return () => {
      if (socketIO) {
        socketIO.disconnect();
      }
    };
  }, [user?.id]);

  // Các hàm xử lý chat
  const joinChatRoom = (chatId) => {
    if (!isConnected || !socketRef.current) return;
    socketRef.current.emit("join-room", chatId);
  };

  const sendMessage = (messageData) => {
    if (!isConnected || !socketRef.current) {
      Alert.alert("Lỗi kết nối", "Không thể gửi tin nhắn. Vui lòng thử lại.");
      return false;
    }
    socketRef.current.emit("send-message", messageData);
    return true;
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinChatRoom,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
