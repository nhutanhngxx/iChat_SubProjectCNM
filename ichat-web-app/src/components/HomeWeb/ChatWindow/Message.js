import React, { useState, useEffect, useRef, useMemo } from "react";
import { Avatar, Button, Modal, Alert } from "antd";
import { UserAddOutlined, DownloadOutlined } from "@ant-design/icons";
import { message as antMessage } from "antd";
import ReactPlayer from "react-player/lazy";
import "./Message.css";
import {
  LikeOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  MoreOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import {
  recallToMessage,
  fetchMessages,
  updateMessages,
  handleSoftDelete,
  addReactionToMessage,
  removeReactionFromMessage,
  getUserMessages,
} from "../../../redux/slices/messagesSlice";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../services/socket";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { SmileOutlined } from "@ant-design/icons";
import { Tooltip, Popover } from "antd";
import { fetchChatMessages } from "../../../redux/slices/messagesSlice";
import ShareDialog from "./ShareDialog";
// import { LikeOutlined, CheckOutlined } from "@ant-design/icons";

const Message = ({
  message,
  allMessages,
  selectedChat,
  isSender,
  user,
  onReplyToMessage,
}) => {
  // Mở ảnh
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Thêm state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [threeDotsMenuVisible, setThreeDotsMenuVisible] = useState(false);
  const messageRef = useRef(null);
  const chatMessages = useSelector((state) => state.messages.chatMessages);
  const dispatch = useDispatch();

  // các state hiển thị modal ảnh
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [groupImages, setGroupImages] = useState([]);

  // Thêm state vào component Message để theo dõi xem đã render nhóm ảnh này chưa
  const [isFirstInGroup, setIsFirstInGroup] = useState(true);
  //Kiểm tra tin nhắn có phải là link không
  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Thêm useEffect để kiểm tra xem message này có phải là tin nhắn đầu tiên trong nhóm không
  useEffect(() => {
    if (
      message.type === "image" &&
      message.is_group_images &&
      message.group_id
    ) {
      // Tìm message đầu tiên trong nhóm có cùng group_id
      const firstMessageInGroup = allMessages.find(
        (msg) =>
          msg.type === "image" &&
          msg.group_id === message.group_id &&
          msg.is_group_images
      );

      // Nếu ID của message hiện tại không phải ID của message đầu tiên, đừng render
      setIsFirstInGroup(firstMessageInGroup?._id === message._id);
    }
  }, [message, allMessages]);

  // Thêm useEffect để kiểm tra tin nhắn đầu tiên trong nhóm chính xác hơn
  useEffect(() => {
    if (
      message.type === "image" &&
      message.is_group_images &&
      message.group_id
    ) {
      // Tìm tất cả tin nhắn cùng group_id và sắp xếp theo timestamp
      const sameGroupMessages = allMessages
        .filter(
          (msg) => msg.type === "image" && msg.group_id === message.group_id
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Kiểm tra nếu tin nhắn hiện tại là tin nhắn CỰC CŨ nhất trong nhóm
      setIsFirstInGroup(sameGroupMessages[0]?._id === message._id);
    } else {
      setIsFirstInGroup(false);
    }
  }, [message, allMessages]);

  // Thêm useEffect để tìm các ảnh cùng nhóm
  useEffect(() => {
    // Chỉ xử lý khi tin nhắn là ảnh và có is_group_images = true
    if (
      message.type === "image" &&
      message.is_group_images &&
      message.group_id &&
      Array.isArray(allMessages)
    ) {
      // Tìm tất cả ảnh có cùng group_id
      const imagesInSameGroup = allMessages.filter(
        (msg) => msg.type === "image" && msg.group_id === message.group_id
      );

      setGroupImages(imagesInSameGroup);
    } else {
      setGroupImages([]);
    }
  }, [message, allMessages]);

  // Thêm state để lưu trữ tất cả media từ cuộc trò chuyện
  const [allMedia, setAllMedia] = useState([]);

  // Tải tất cả ảnh và video từ cuộc trò chuyện
  useEffect(() => {
    if (Array.isArray(allMessages)) {
      // Lọc ra tất cả media (ảnh và video) từ cuộc trò chuyện
      const mediaMessages = allMessages.filter(
        (msg) => msg.type === "image" || msg.type === "video"
      );
      setAllMedia(mediaMessages);
    }
  }, [allMessages]);

  // Sửa lại hàm mở modal để tìm index hiện tại trong danh sách tất cả media
  const handleOpenMediaModal = () => {
    const currentIndex = allMedia.findIndex(
      (media) => media._id === message._id
    );
    setCurrentImageIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsImageModalOpen(true);
  };

  // Hàm mở modal và đặt ảnh được chọn là ảnh hiện tại
  const handleOpenImageModal = (initialIndex = 0) => {
    setCurrentImageIndex(initialIndex);
    setIsImageModalOpen(true);
  };

  // Hàm thay đổi ảnh đang xem trong modal
  const handleChangeImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Hàm tải ảnh
  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `image-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const findRepliedMessage = (replyId) => {
    if (!replyId) return null;
    if (!Array.isArray(allMessages)) return null;

    // Chuẩn hóa ID thành chuỗi để so sánh
    const replyIdStr = String(replyId).trim();

    // Thử một số cách định dạng ID khác nhau
    const exactMatch = allMessages.find((msg) => {
      const msgId = String(msg._id || msg.id || "").trim();
      return msgId === replyIdStr;
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Thử tìm trong chatMessages - FIX HERE
    if (Array.isArray(chatMessages)) {
      const messageFromRedux = chatMessages.find(
        (msg) => String(msg._id) === replyIdStr
      );

      if (messageFromRedux) {
        return messageFromRedux;
      }
    }

    // Debug info
    // console.log("Reply message not found:", {
    //   replyId,
    //   replyIdType: typeof replyId,
    //   allMessagesCount: allMessages?.length || 0,
    //   sampleIds: (allMessages || [])
    //     .slice(0, 3)
    //     .map((m) => ({ id: m._id, content: m.content?.substring(0, 20) })),
    // });

    return null;
  };
  // Lấy thông tin thành viên trog nhóm
  // Thêm state để lưu thông tin người gửi
  const [senderInfo, setSenderInfo] = useState({
    full_name: "Đang tải...",
    avatar_path: null,
  });

  // Fetch thông tin người gửi khi message thay đổi hoặc khi là tin nhắn nhóm
  useEffect(() => {
    // Chỉ fetch khi là tin nhắn nhóm và không phải tin nhắn của mình
    if (
      selectedChat?.chat_type === "group" &&
      !isSender &&
      message?.sender_id
    ) {
      const fetchSenderInfo = async () => {
        try {
          // Kiểm tra nếu đã có thông tin người dùng trong cache
          const response = await fetch(
            `http://${window.location.hostname}:5001/api/users/${message.sender_id}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch sender info");
          }

          const data = await response.json();

          if (data && data.user) {
            setSenderInfo({
              full_name: data.user.full_name || "Người dùng",
              avatar_path: data.user.avatar_path,
            });
          }
        } catch (error) {
          console.error("Error fetching sender info:", error);
          setSenderInfo({ full_name: "Người dùng", avatar_path: null });
        }
      };

      fetchSenderInfo();
    }
  }, [selectedChat?.chat_type, isSender, message?.sender_id]);

  const [friends, setFriends] = useState([]);
  // Lấy danh sách bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await dispatch(
          getUserFriends(user._id || user.id)
        ).unwrap();
        setFriends(result);
        // console.log(
        //   "friends from Search component",
        //   user._id || user.id,
        //   result
        // );
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bạn bè:", err);
      }
    };

    if (user._id || user.id) {
      fetchFriends();
    }
  }, [dispatch, user._id, user.id]);
  // Kiêm tra xem người dùng đã là bạn hay chưa
  const isFriend = (userId) => {
    return friends.friends.some((friend) => friend.id === userId);
  };
  // state for friendship check and modal
  const [isFriendWithReceiver, setIsFriendWithReceiver] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const checkIsFriend = () => {
    if (selectedChat?.chat_type === "group") {
      return true;
    }

    if (!friends || !friends.friends || !Array.isArray(friends.friends)) {
      return false;
    }

    const receiverId = selectedChat?.id || message.sender_id;
    if (receiverId === user.id) return true; // User is always "friends" with themself

    const result = friends.friends.some(
      (friend) =>
        friend.id === receiverId ||
        friend._id === receiverId ||
        String(friend.id) === String(receiverId)
    );
    return result;
  };
  // Check friendship status when component mounts or selectedChat changes
  useEffect(() => {
    if (friends && friends.friends) {
      const result = checkIsFriend();
      setIsFriendWithReceiver(result);
    }
  }, [friends, selectedChat]);
  // State reaction
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  // Function to send friend request

  // const isInteractionDisabled = !isFriendWithReceiver;
  // Chỉ áp dụng cho chat riêng tư (không phải chat nhóm)
  const isInteractionDisabled =
    !isFriendWithReceiver && selectedChat?.chat_type !== "group";
  //Thu hồi tin nhắn

  const handleRecall = async () => {
    try {
      const key = "recallMessage";
      antMessage.loading({ content: "Đang thu hồi tin nhắn...", key });

      if (!message._id) {
        console.error("Missing message ID:", message);
        antMessage.error("Không thể thu hồi: ID tin nhắn không hợp lệ");
        return;
      }

      // console.log("Attempting to recall message:", {
      //   messageId: message._id,
      //   userId: user?.id || user?._id,
      // });

      // Pass both IDs as an object
      const result = await dispatch(
        recallToMessage({
          messageId: message._id,
          userId: user?.id || user?._id,
        })
      ).unwrap();

      // console.log("Recall result:", result);

      // Notify other users via socket
      let roomId;
      if (selectedChat.chat_type === "group") {
        roomId = `group_${selectedChat.id}`;
      } else {
        const userIds = [user.id, selectedChat.id].sort();
        roomId = `chat_${userIds[0]}_${userIds[1]}`;
      }

      socket.emit("recall-message", {
        chatId: roomId,
        messageId: message._id,
        senderId: user.id || user._id,
        newContent: "Tin nhắn đã được thu hồi",
      });

      // Show success message
      antMessage.success({
        content: "Đã thu hồi tin nhắn",
        key,
        duration: 2,
      });

      // Refresh messages
      dispatch(fetchMessages(user.id || user._id));
      dispatch(updateMessages(result.data));
      closeContextMenu();
      setThreeDotsMenuVisible(false);
    } catch (error) {
      console.error("Error recalling message:", error);
      antMessage.error({
        content:
          error.message || "Không thể thu hồi tin nhắn. Vui lòng thử lại.",
        duration: 2,
      });
    }
  };
  // Add this back to your useEffect socket setup
  useEffect(() => {
    if (!selectedChat?.id || !user?.id) return;

    let roomId;
    if (selectedChat.chat_type === "group") {
      roomId = `group_${selectedChat.id}`;
    } else {
      const userIds = [user.id, selectedChat.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
    }

    // Join the consistent room
    socket.emit("join-room", roomId);

    const handleRecalledMessage = (data) => {
      // Update the recalled message in your Redux store
      if (data.messageId) {
        // Create an updated message object
        const updatedMessage = {
          _id: data.messageId,
          content: data.newContent || "Tin nhắn đã được thu hồi",
          recall: true,
        };

        dispatch(updateMessages(updatedMessage));
        dispatch(fetchMessages(user.id));
      }
    };

    socket.on("message-recalled", handleRecalledMessage);

    return () => {
      socket.off("message-recalled", handleRecalledMessage);
    };
  }, [selectedChat?.id, user?.id, dispatch]);
  // Kiểm tra xem người dùng có phải là người gửi tin nhắn không
  const canRecall =
    isSender && new Date() - new Date(message.timestamp) < 30 * 60 * 1000;
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
  const [fileInfo, setFileInfo] = useState({
    name: "",
    extension: "",
    size: "",
  });
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const fileUrl = message.content;
        const fileName = decodeURIComponent(fileUrl.split("/").pop());
        const fileExtension = fileName.split(".").pop();
        const parts = fileName.split("-");
        const originalName = parts.slice(2).join("-");

        // HEAD request để lấy metadata
        const response = await fetch(fileUrl, { method: "HEAD" });

        const sizeHeader = response.headers.get("Content-Length");

        setFileInfo({
          name: originalName,
          extension: fileExtension,
          size: sizeHeader
            ? formatBytes(Number(sizeHeader))
            : "Không rõ dung lượng",
        });
      } catch (error) {
        console.error("Lỗi khi xử lý file:", error);
        setFileInfo({
          name: "Không xác định",
          extension: "unknown",
          size: "Không xác định (CORS bị chặn?)",
        });
      }
    };

    if (message.type === "file") {
      fetchFileInfo();
    }
  }, [message]);
  const formatBytes = (bytes) => {
    if (!bytes) return "Không rõ dung lượng";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(message.content);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileInfo.name || "file_tai_ve";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
    }
  };
  // Add this handler for right-click
  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent default context menu
    setContextMenuVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // Add this to close the context menu
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  // Add event listener to close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuVisible && !event.target.closest(".context-menu")) {
        closeContextMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenuVisible]);
  // Handler functions for message actions
  const handleReply = () => {
    onReplyToMessage(message);
    closeContextMenu();
  };

  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleShare = () => {
    // Implement share functionality
    setShareDialogOpen(true);
    closeContextMenu();
  };

  const handlePin = () => {
    // Implement pin functionality
    closeContextMenu();
  };

  const handleDelete = async () => {
    try {
      const key = "deleteMessage";
      antMessage.loading({ content: "Đang xóa tin nhắn...", key });

      // Call the handleSoftDelete action
      const result = await dispatch(
        handleSoftDelete({
          userId: user._id || user.id,
          messageId: message._id || message.id,
        })
      ).unwrap();
      // Cập nhật Redux store với tin nhắn đã được xóa
      if (selectedChat.chat_type === "group") {
        dispatch(getUserMessages(selectedChat.id));
      }
      dispatch(updateMessages(result));
      // Gọi fetchMessages sau khi đã cập nhật store
      await dispatch(fetchMessages(user.id || user._id)); // Show success message
      antMessage.success({
        content: "Đã xóa tin nhắn thành công!",
        key,
        duration: 2,
      });

      // Enable socket notification (optional)
      const userIds = [user.id, selectedChat.id].sort();
      const roomId = `chat_${userIds[0]}_${userIds[1]}`;
      socket.emit("message-deleted", {
        chatId: roomId,
        messageId: message._id,
        userId: user._id,
      });

      // Close menu
      closeContextMenu();
    } catch (error) {
      // Show error message
      antMessage.error({
        content: "Xóa tin nhắn thất bại!",
        duration: 3,
      });
      console.error("Delete error:", error);
    }
  };

  const handleCopy = () => {
    // Copy message content to clipboard
    navigator.clipboard.writeText(message.content);
    closeContextMenu();
  };

  const handleReaction = async (reaction) => {
    try {
      if (isInteractionDisabled && !isSender) {
        return; // Don't allow reactions if interaction is disabled
      }

      const userId = user._id || user.id;

      // Always ADD the reaction - never remove automatically based on existing reactions
      await dispatch(
        addReactionToMessage({
          messageId: message._id,
          user_id: userId,
          reaction_type: reaction,
        })
      ).unwrap();

      antMessage.success({
        content: `Đã thêm biểu cảm ${getReactionEmoji(reaction)}`,
        duration: 1,
      });

      // // Create room ID
      // const userIds = [user.id, selectedChat.id].sort();
      // const roomId = `chat_${userIds[0]}_${userIds[1]}`;
      // Tạo roomId khác nhau cho chat 1-1 và nhóm
      let roomId;
      if (selectedChat.chat_type === "group") {
        roomId = `group_${selectedChat.id}`; // Định dạng roomId cho nhóm
      } else {
        const userIds = [user.id, selectedChat.id].sort();
        roomId = `chat_${userIds[0]}_${userIds[1]}`; // Định dạng roomId cho chat 1-1
      }
      // Emit add-reaction event
      const payload = {
        chatId: roomId,
        messageId: message._id,
        userId: userId,
        reaction: reaction, // Match server parameter name
      };

      socket.emit("add-reaction", payload);
      dispatch(fetchMessages(user.id)); // Fetch updated messages
      // Close menus
      closeContextMenu();
      setShowReactionPicker(false);
    } catch (error) {
      console.error("Reaction error:", error);
      antMessage.error("Không thể thực hiện biểu cảm. Vui lòng thử lại.");
    }
  };

  // Add a separate function for removing reactions
  const handleRemoveReaction = async (reaction) => {
    try {
      const userId = user._id || user.id;

      await dispatch(
        removeReactionFromMessage({
          messageId: message._id,
          userId: userId,
          reaction_type: reaction,
        })
      ).unwrap();

      antMessage.success({
        content: `Đã bỏ biểu cảm ${getReactionEmoji(reaction)}`,
        duration: 1,
      });

      let roomId;
      if (selectedChat.chat_type === "group") {
        roomId = `group_${selectedChat.id}`;
      } else {
        const userIds = [user.id, selectedChat.id].sort();
        roomId = `chat_${userIds[0]}_${userIds[1]}`;
      }

      // Format payload exactly as server expects it
      const payload = {
        chatId: roomId,
        messageId: message._id,
        userId: userId,
      };

      dispatch(fetchMessages(user._id)); // Fetch updated messages
      socket.emit("remove-reaction", payload);
    } catch (error) {
      console.error("Error removing reaction:", error);
      antMessage.error("Không thể bỏ biểu cảm. Vui lòng thử lại.");
    }
  };
  // 1. First, separate room joining to its own useEffect that runs first
  useEffect(() => {
    if (!selectedChat?.id || !user?.id) return;

    let roomId;
    if (selectedChat.chat_type === "group") {
      roomId = `group_${selectedChat.id}`;
    } else {
      const userIds = [user.id, selectedChat.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
    }

    socket.emit("join-room", roomId);

    // No return cleanup needed for joining
  }, [selectedChat?.id, user?.id]);
  const getReactionEmoji = (type) => {
    const map = {
      like: "👍",
      love: "❤️",
      haha: "😂",
      wow: "😮",
      sad: "😢",
      angry: "😠",
    };
    return map[type] || type; // Return the type if not in map (for direct emoji usage)
  };

  // Helper function to check if user has reacted with a specific reaction
  const hasUserReacted = (reaction_type) => {
    if (!message.reactions) return false;
    const userId = user._id || user.id;
    return message.reactions.some(
      (r) => r.reaction_type === reaction_type && r.user_id === userId
    );
  };

  // Helper function to count reactions by type
  const countReactions = () => {
    if (!message.reactions || !Array.isArray(message.reactions)) return {};

    // Group reactions by type and count them
    return message.reactions.reduce((counts, reaction) => {
      const type = reaction.reaction_type;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});
  };
  // xử lý cả menu ngữ cảnh và menu ba chấm
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close context menu when clicking outside
      if (contextMenuVisible && !event.target.closest(".context-menu")) {
        closeContextMenu();
      }

      // Close three-dots menu when clicking outside
      if (
        threeDotsMenuVisible &&
        !event.target.closest(".three-dots-menu") &&
        !event.target.closest(".three-dots")
      ) {
        setThreeDotsMenuVisible(false);
      }
    };

    // Add event listener when either menu is showing
    if (contextMenuVisible || threeDotsMenuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenuVisible, threeDotsMenuVisible]); // Add threeDotsMenuVisible to dependencies
  // Khi fetch tin nhắn cho cuộc trò chuyện, thêm tham số để lấy cả tin nhắn đã reply
  const fetchMessagesData = async () => {
    if (user?.id && selectedChat?.id) {
      try {
        const response = await dispatch(
          fetchChatMessages({
            senderId: user.id,
            receiverId: selectedChat.id,
            includeRepliedMessages: true, // Thêm tham số này
          })
        ).unwrap();

        // Xử lý thành công
      } catch (error) {
        // Xử lý lỗi
      }
    }
  };

  // Thêm state để lưu tin nhắn reply đã fetch riêng
  const [repliedMessageData, setRepliedMessageData] = useState(null);

  // Sửa lại component RepliedMessage để sử dụng state
  const RepliedMessage = ({ reply }) => {
    const [fetchedMessage, setFetchedMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchAttempted, setFetchAttempted] = useState(false);

    if (!reply) return null;

    // Sử dụng tin nhắn từ allMessages hoặc từ fetch riêng
    const repliedMessage = findRepliedMessage(reply) || fetchedMessage;

    // if (isLoading) {
    //   return (
    //     <div className="replied-message" style={{ opacity: 0.7 }}>
    //       <div className="replied-content">
    //         <p className="replied-text-loading">Đang tải tin nhắn...</p>
    //       </div>
    //     </div>
    //   );
    // }

    if (!repliedMessage) {
      return (
        <div className="replied-message" style={{ opacity: 0.5 }}>
          <div className="replied-content">
            <p className="replied-text-not-found">
              Tin nhắn đã bị xóa hoặc thu hồi
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="replied-message">
        <div className="replied-content">
          {repliedMessage.type === "text" ? (
            <p className="replied-text">{repliedMessage.content}</p>
          ) : repliedMessage.type === "image" ? (
            <div className="replied-image">
              <img src={repliedMessage.content} alt="replied" width="50" />
            </div>
          ) : repliedMessage.type === "video" ? (
            <div className="replied-video">
              <span>🎬 Video</span>
            </div>
          ) : repliedMessage.type === "audio" ? (
            <div className="replied-audio">
              <span>🎵 Audio</span>
            </div>
          ) : repliedMessage.type === "file" ? (
            <p className="replied-file">📄 File</p>
          ) : (
            <p>Unsupported reply type</p>
          )}
        </div>
      </div>
    );
  };
  useEffect(() => {
    // console.log("Message component rendered with:", {
    //   messageId: message._id,
    //   replyTo: message.reply_to || null,
    //   allMessagesCount: allMessages?.length || 0,
    // });

    if (message.reply_to) {
      const found = findRepliedMessage(message.reply_to);
      // console.log(
      //   "Replied message found:",
      //   found ? "Yes" : "No",
      //   found ? { content: found.content } : null
      // );
    }
  }, [message, allMessages]);
  useEffect(() => {
    if (!selectedChat?.id || !user?.id) return;

    let roomId;
    if (selectedChat.chat_type === "group") {
      roomId = `group_${selectedChat.id}`;
    } else {
      const userIds = [user.id, selectedChat.id].sort();
      roomId = `chat_${userIds[0]}_${userIds[1]}`;
    }
    socket.emit("join-room", roomId);
    return () => {
      // socket.off("message-reaction-update", handleMessageReaction);
    };
  }, [selectedChat?.id, user?.id, dispatch]);
  // if (message.type === "image" && message.is_group_images && message.group_id) {
  //   // Tìm tất cả tin nhắn cùng group_id và sắp xếp theo timestamp
  //   const sameGroupMessages = allMessages
  //     .filter(
  //       (msg) => msg.type === "image" && msg.group_id === message.group_id
  //     )
  //     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  //   // Nếu không phải tin nhắn đầu tiên trong nhóm, không render gì cả
  //   if (
  //     sameGroupMessages.length > 0 &&
  //     sameGroupMessages[0]?._id !== message._id
  //   ) {
  //     return null;
  //   }
  // }
  const isFirstImageInGroup = useMemo(() => {
    if (
      message.type === "image" &&
      message.is_group_images &&
      message.group_id &&
      Array.isArray(allMessages)
    ) {
      const sameGroupMessages = allMessages
        .filter(
          (msg) => msg.type === "image" && msg.group_id === message.group_id
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return (
        sameGroupMessages.length > 0 &&
        sameGroupMessages[0]?._id === message._id
      );
    }
    return true; // Nếu không phải ảnh nhóm, luôn trả về true để render
  }, [message, allMessages]);

  // Và sau đó kiểm tra
  if (
    message.type === "image" &&
    message.is_group_images &&
    !isFirstImageInGroup
  ) {
    return null;
  }
  if (message.type === "notify") {
    return (
      <div
        id={`message-${message._id}`}
        className="message-notification-container"
      >
        <div className="message-notification">
          <span>{message.content}</span>
          <div className="message-notification-time">
            {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        id={`message-${message._id}`} // thêm id để scroll tin nhắn
        className={`message ${isSender ? "sent" : "received"} ${
          !isFriendWithReceiver && !isSender ? "not-friend-message" : ""
        }`}
        onContextMenu={
          isInteractionDisabled && !isSender
            ? (e) => e.preventDefault()
            : handleContextMenu
        }
        onMouseEnter={
          isInteractionDisabled && !isSender ? null : () => setIsHovered(true)
        }
        onMouseLeave={
          isInteractionDisabled && !isSender ? null : () => setIsHovered(false)
        }
        ref={messageRef}
        style={{
          display: "flex",
          marginBottom:
            message.reactions && message.reactions.length > 0
              ? "15px"
              : undefined,
        }}
      >
        {!isSender && (
          <div className="avatar-message">
            <Avatar
              size={32}
              src={
                selectedChat.chat_type === "group" && senderInfo.avatar_path
                  ? senderInfo.avatar_path
                  : selectedChat.avatar_path
              }
              className="profile-avatar-message"
            />
          </div>
        )}

        <div className="message-column">
          {/* Hiển thị tên người gửi nếu là tin nhắn nhóm và không phải người dùng hiện tại */}
          {selectedChat.chat_type === "group" && !isSender && (
            <div className="sender-name">{senderInfo.full_name}</div>
          )}
          {message.reply_to && <RepliedMessage reply={message.reply_to} />}
          {message.type === "image" ? (
            <>
              {/* Chỉ hiển thị nhóm ảnh nếu đây là ảnh đầu tiên trong nhóm */}
              {message.is_group_images &&
              isFirstInGroup &&
              groupImages.length > 0 ? (
                <div className="grouped-images-container">
                  <div className="grouped-images-grid">
                    {groupImages.slice(0, 3).map((img, index) => (
                      <div
                        key={img._id || index}
                        className="grouped-image-item"
                        onClick={() => handleOpenMediaModal()}
                      >
                        <img
                          src={img.content}
                          alt={`Group image ${index + 1}`}
                          className="grouped-image"
                        />
                        {index === 2 && groupImages.length > 3 && (
                          <div className="more-images-overlay">
                            <span>+{groupImages.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="image-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ) : message.is_group_images && !isFirstInGroup ? null : (
                <div
                  className="message-image-container"
                  onClick={handleOpenMediaModal}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={message.content}
                    alt="Message image"
                    className="message-image"
                  />
                  <span className="image-hd">HD</span>
                  <span className="image-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Modal xem tất cả media của cuộc trò chuyện */}
              <Modal
                open={isImageModalOpen}
                footer={null}
                onCancel={() => setIsImageModalOpen(false)}
                centered
                width="80%"
                className="image-group-modal"
                bodyStyle={{ padding: 0 }}
              >
                <div className="image-viewer-container">
                  {/* Phần hiển thị media chính ở giữa */}
                  <div className="main-image-section">
                    {allMedia[currentImageIndex] && (
                      <>
                        {allMedia[currentImageIndex].type === "image" ? (
                          <img
                            src={allMedia[currentImageIndex].content}
                            alt="Selected media"
                            className="main-image"
                          />
                        ) : allMedia[currentImageIndex].type === "video" ? (
                          <div className="video-player-wrapper">
                            <ReactPlayer
                              url={allMedia[currentImageIndex].content}
                              controls
                              width="100%"
                              height="80vh"
                              style={{ maxHeight: "80vh" }}
                              config={{
                                file: {
                                  attributes: {
                                    controlsList: "nodownload",
                                    disablePictureInPicture: true,
                                  },
                                },
                              }}
                            />
                          </div>
                        ) : null}
                        <div className="image-controls">
                          <button
                            className="download-button"
                            onClick={() =>
                              downloadImage(allMedia[currentImageIndex].content)
                            }
                          >
                            <DownloadOutlined /> Tải xuống
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Danh sách thumbnail bên phải */}
                  <div className="thumbnails-section">
                    <h4>Tất cả media ({allMedia.length})</h4>
                    <div className="thumbnails-container">
                      {allMedia.map((media, index) => (
                        <div
                          key={media._id || index}
                          className={`thumbnail-item ${
                            index === currentImageIndex ? "active" : ""
                          }`}
                          onClick={() => handleChangeImage(index)}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.content}
                              alt={`Thumbnail ${index + 1}`}
                              className="thumbnail-image"
                            />
                          ) : media.type === "video" ? (
                            <div className="video-thumbnail">
                              <video
                                src={media.content}
                                className="thumbnail-video"
                              />
                              <div className="video-icon">🎬</div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Modal>
            </>
          ) : message.type === "video" ? (
            <div className="message-video-container">
              <ReactPlayer
                url={message.content}
                controls
                width="100%"
                height="auto"
                className="message-video-player"
                config={{
                  file: {
                    attributes: {
                      preload: "metadata",
                    },
                  },
                }}
              />
              <span className="video-timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.type === "audio" ? (
            <>
              <div className="message-audio-container">
                <div className="audio-content">
                  <span className="audio-icon">🎵</span>
                  <div className="audio-player">
                    <audio
                      controls
                      src={message.content}
                      className="message-audio"
                      preload="metadata"
                    />
                  </div>
                </div>
                <span className="audio-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </>
          ) : message.type === "file" ? (
            <>
              <div className="message-file-container">
                <div className="file-content">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <span className="file-name">{fileInfo.name}</span>
                    <span className="file-type">
                      Loại file: {fileInfo.extension.toUpperCase()}
                    </span>
                    <span className="file-size">
                      Dung lượng: {fileInfo.size}
                    </span>
                  </div>
                  <button onClick={handleDownload} className="download-button">
                    <DownloadOutlined />
                  </button>
                </div>
                <span className="file-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </>
          ) : (
            <div
              className="message-content"
              style={{
                backgroundColor: isSender ? "#e6f7ff" : "#fff",
              }}
            >
              <p>
                {isValidURL(message.content) ? (
                  <a
                    href={message.content}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {message.content}
                  </a>
                ) : (
                  message.content
                )}
              </p>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {message.reactions && message.reactions.length > 0 && (
            <div className="message-reactions">
              {Object.entries(countReactions()).map(([type, count]) => (
                <Tooltip
                  key={type}
                  title={
                    <div>
                      <div>{`${count} người đã bày tỏ ${getReactionEmoji(
                        type
                      )}`}</div>
                      <div className="reaction-tooltip-actions">
                        <button onClick={() => handleReaction(type)}>
                          Thêm
                        </button>
                        <button onClick={() => handleRemoveReaction(type)}>
                          Bỏ
                        </button>
                      </div>
                    </div>
                  }
                >
                  <span
                    className="reaction-badge"
                    onClick={() => handleReaction(type)} // Always add on click
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRemoveReaction(type); // Remove on right-click
                    }}
                  >
                    {getReactionEmoji(type)} {count}
                  </span>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions overlay */}
        {isHovered && !isInteractionDisabled && (
          <>
            <div className="message-actions-overlay">
              <button
                onClick={handleReply}
                className="action-icon"
                title="Reply"
              >
                <RollbackOutlined />
              </button>
              <button
                onClick={handleDelete}
                className="action-icon"
                title="Delete"
              >
                <DeleteOutlined />
              </button>
              <button
                onClick={handleShare}
                className="action-icon"
                title="Share"
              >
                <ShareAltOutlined />
              </button>

              <button
                onClick={() => setThreeDotsMenuVisible(!threeDotsMenuVisible)}
                className="action-icon three-dots"
                title="More options"
              >
                <MoreOutlined />
              </button>
            </div>

            <div className="reaction-icons">
              <Popover
                content={
                  <div className="reaction-picker">
                    {["like", "love", "haha", "wow", "sad", "angry"].map(
                      (reactionType) => (
                        <Tooltip key={reactionType} title={reactionType}>
                          <span
                            className="reaction-option"
                            onClick={() => handleReaction(reactionType)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              handleRemoveReaction(reactionType);
                            }}
                          >
                            {getReactionEmoji(reactionType)}
                          </span>
                        </Tooltip>
                      )
                    )}
                  </div>
                }
                trigger="hover"
                placement="top"
                open={showReactionPicker}
                onOpenChange={setShowReactionPicker}
              >
                <span className="reaction-trigger" title="Thêm biểu cảm">
                  <SmileOutlined />
                </span>
              </Popover>
            </div>
          </>
        )}

        {/* Three dots menu */}
        {threeDotsMenuVisible && !isInteractionDisabled && (
          <div className="three-dots-menu">
            <button onClick={handleReply}>Trả lời</button>
            <button onClick={handleShare}>Chia sẻ</button>
            <button onClick={handlePin}>Ghim tin nhắn</button>
            <button onClick={handleDelete}>Xoá tin nhắn</button>
            <button onClick={handleCopy}>Coppy tin nhắn</button>
            {/* <button onClick={handleRecall}>Thu hồi tin nhắn</button> */}
            {canRecall && (
              <button onClick={handleRecall}>Thu hồi tin nhắn</button>
            )}
          </div>
        )}

        {/* Context Menu (on right-click) */}
        {contextMenuVisible && !isInteractionDisabled && (
          <div className="context-menu">
            <button onClick={handleReply}>Trả lời</button>
            <button onClick={handleShare}>Chia sẻ</button>
            <button onClick={handlePin}>Ghim tin nhắn</button>
            <button onClick={handleDelete}>Xoá tin nhắn</button>
            <button onClick={handleCopy}>Copy tin nhắn</button>
            {/* <button onClick={handleRecall}>Thu hồi tin nhắn</button> */}
            {canRecall && (
              <button onClick={handleRecall}>Thu hồi tin nhắn</button>
            )}
          </div>
        )}

        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          message={message}
        />
      </div>
    </>
  );
};

export default Message;
