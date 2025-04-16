import React, { useState, useEffect, useRef } from "react";
import { Avatar, Button, Modal } from "antd";
import { message as antMessage } from "antd";
import "./Message.css";
import {
  LikeOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  PushpinOutlined,
  CopyOutlined,
  MoreOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import {
  recallToMessage,
  fetchMessages,
  updateMessages,
  handleSoftDelete,
  replyToMessage,
} from "../../../redux/slices/messagesSlice";
import { useDispatch } from "react-redux";
import socket from "../../services/socket";

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
  const dispatch = useDispatch();
  // const chatMessages = useSelector((state) => state.messages.chatMessages);
  //Thu hồi tin nhắn
  const handleRecall = async () => {
    try {
      // Show loading notification
      const key = "recallMessage";
      antMessage.loading({ content: "Đang thu hồi tin nhắn...", key });

      //Gọi action thu hồi tin nhắn

      const result = await dispatch(recallToMessage(message._id)).unwrap();
      console.log("Recall result:", result);

      if (result && result.data) {
        const sentMessage = result.data; // The recalled message from API

        // Sử dụng socket để gửi tin nhắn thu hồi đến server
        // Tạo roomId từ userId và selectedChatId
        const userIds = [user.id, selectedChat.id].sort();
        const roomId = `chat_${userIds[0]}_${userIds[1]}`;

        // Gửi tin nhắn thu hồi đến server
        socket.emit("recall-message", {
          chatId: roomId,
          messageId: message._id,
          senderId: user.id,
          newContent: "Tin nhắn đã được thu hồi",
        });

        // Thông báo thành công
        antMessage.success({
          content: "Đã thu hồi tin nhắn",
          key,
          duration: 2,
        });
        dispatch(fetchMessages(user.id)); // Fetch updated messages
        // Close menus
        closeContextMenu();
        setThreeDotsMenuVisible(false);
      }
    } catch (error) {
      // Show error message
      antMessage.error({
        content: "Không thể thu hồi tin nhắn. Vui lòng thử lại.",
        duration: 2,
      });
      console.error("Error recalling message:", error);
    }
  };
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
  // useEffect(() => {
  //   const fetchFileInfo = () => {
  //     try {
  //       const fileUrl = message.content;
  //       const fileName = decodeURIComponent(fileUrl.split("/").pop()); // Lấy tên file cuối URL
  //       const fileExtension = fileName.split(".").pop();
  //       const parts = fileName.split("-");
  //       const originalName = parts.slice(2).join("-"); // Bỏ random + timestamp

  //       setFileInfo({
  //         name: originalName,
  //         extension: fileExtension,
  //         size: "Không xác định (CORS bị chặn)", // fallback
  //       });
  //     } catch (error) {
  //       console.error("Lỗi khi xử lý file:", error);
  //     }
  //   };

  //   fetchFileInfo();
  // }, [message.content]);
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
    // Implement reply functionality
    console.log("Reply to message:", message);
    // try {
    //   const key = "replyMessage";
    //   antMessage.loading({ content: "Đang trả lời tin nhắn...", key });
    //   // Call the replyToMessage action
    //   const result = await dispatch(
    //     replyToMessage({
    //       sender_id: user._id || user.id,
    //       receiver_id: message.receiver_id,
    //       content,
    //       type,
    //       chat_type,
    //       reply_to,
    //     })
    //   );
    // } catch (error) {}
    onReplyToMessage(message);
    closeContextMenu();
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share message:", message._id);
    closeContextMenu();
  };

  const handlePin = () => {
    // Implement pin functionality
    console.log("Pin message:", message._id);
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

      // Show success message
      antMessage.success({
        content: "Đã xóa tin nhắn thành công!",
        key,
        duration: 2,
      });
      dispatch(fetchMessages(user.id));
      dispatch(updateMessages(result));

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
    console.log("Copied message:", message._id);
    closeContextMenu();
  };

  const handleReaction = (reaction) => {
    // Implement reaction functionality
    console.log("React with", reaction, "to message:", message._id);
    closeContextMenu();
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
  const findRepliedMessage = (replyId) => {
    if (!replyId) return null;
    if (!Array.isArray(allMessages)) return null;

    // Convert IDs to strings for comparison
    const replyIdStr = String(replyId);
    console.log("Finding replied message:", replyIdStr);

    // First try exact match
    const exactMatch = allMessages.find(
      (msg) => String(msg._id) === replyIdStr
    );
    console.log("Exact match found:", exactMatch);

    if (exactMatch) return exactMatch;

    // Log debugging info if not found
    console.log("Reply message not found:", {
      replyId,
      allMessagesCount: allMessages.length,
      sampleIds: allMessages.slice(0, 3).map((m) => m._id),
    });

    return null;
  };
  // Kết nối socket và lắng nghe sự kiện nhận tin nhắn
  // useEffect(() => {
  //   if (!selectedChat?.id || !user?.id) return;

  //   const userIds = [user.id, selectedChat.id].sort();
  //   const roomId = `chat_${userIds[0]}_${userIds[1]}`;

  //   console.log("Joining room:", roomId);

  //   // Join the consistent room
  //   socket.emit("join-room", roomId);

  //   const handleRecalledMessage = (data) => {
  //     console.log("Message recalled event received:", data);

  //     // Update the recalled message in your Redux store
  //     if (data.messageId) {
  //       // Create an updated message object
  //       const updatedMessage = {
  //         _id: data.messageId,
  //         content: data.newContent || "Tin nhắn đã được thu hồi",
  //       };

  //       dispatch(updateMessages(updatedMessage));
  //       dispatch(fetchMessages(user.id));
  //     }
  //   };

  //   socket.on("message-recalled", handleRecalledMessage);

  //   return () => {
  //     console.log("Cleaning up socket listener");
  //     socket.off("message-recalled", handleRecalledMessage);
  //   };
  // }, [selectedChat?.id, user?.id, dispatch]);
  const RepliedMessage = ({ reply }) => {
    if (!reply) return null;

    const repliedMessage = findRepliedMessage(reply);
    // if (!repliedMessage) return null;
    if (!repliedMessage) {
      // Return a fallback UI when the replied message can't be found
      return (
        <div
          className="replied-message"
          style={{ opacity: 0.5, position: "relative" }}
        >
          <div className="replied-content">
            <p className="replied-text-not-found">
              Tin nhắn đã bị xóa hoặc thu hồi
            </p>
          </div>
        </div>
      );
    }

    return (
      // <div
      //   className="replied-message"
      //   style={{ width: "fit-content", maxWidth: "80%" }}
      // >
      //   <div className="replied-content">
      //     {repliedMessage.type === "text" ? (
      //       <p className="replied-text">
      //         Đã trả lời tin nhắn <br></br> {repliedMessage.content}
      //       </p>
      //     ) : repliedMessage.type === "image" ? (
      //       <div className="replied-image">
      //         <img src={repliedMessage.content} alt="replied" width="50" />
      //       </div>
      //     ) : repliedMessage.type === "file" ? (
      //       <p className="replied-file">📄 File</p>
      //     ) : (
      //       <p>Unsupported reply type</p>
      //     )}
      //   </div>
      // </div>
      <div className="replied-message">
        <div className="replied-content">
          {repliedMessage.type === "text" ? (
            <p className="replied-text">{repliedMessage.content}</p>
          ) : repliedMessage.type === "image" ? (
            <div className="replied-image">
              <img src={repliedMessage.content} alt="replied" width="50" />
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
    console.log("Message component rendered with:", {
      messageId: message._id,
      replyTo: message.reply_to,
      allMessagesCount: allMessages?.length || 0,
    });

    if (message.reply_to) {
      const found = findRepliedMessage(message.reply_to);
      console.log(
        "Replied message found:",
        found ? "Yes" : "No",
        found ? { content: found.content } : null
      );
    }
  }, [message, allMessages]);

  return (
    <div
      className={`message ${isSender ? "sent" : "received"}`}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={messageRef}
      styles={{ display: "flex", flexDirection: "column" }}
    >
      {!isSender && (
        <div className="avatar-message">
          <Avatar
            size={32}
            src={selectedChat.avatar_path}
            className="profile-avatar-message"
          />
        </div>
      )}

      <div className="message-column">
        {/* <RepliedMessage reply={message.reply_to} /> */}
        {message.reply_to && <RepliedMessage reply={message.reply_to} />}
        {message.type === "image" ? (
          <>
            <div
              className="message-image-container"
              onClick={handleImageClick}
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
            <Modal
              open={isModalOpen}
              footer={null}
              onCancel={handleClose}
              centered
              width={500}
              bodyStyle={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 0,
                height: "100%",
                top: "30px",
              }}
              style={{ top: "30px" }}
            >
              <img
                src={message.content}
                alt="Full-size image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "8px",
                }}
              />
            </Modal>
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
                  <span className="file-size">Dung lượng: {fileInfo.size}</span>
                </div>
                <button onClick={handleDownload} className="download-button">
                  📥 Tải về
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
            <p>{message.content}</p>
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Hover actions overlay */}
      {isHovered && (
        <>
          <div className="message-actions-overlay">
            <button onClick={handleReply} className="action-icon" title="Reply">
              <RollbackOutlined />
            </button>
            <button
              onClick={handleDelete}
              className="action-icon"
              title="Delete"
            >
              <DeleteOutlined />
            </button>
            <button onClick={handleShare} className="action-icon" title="Share">
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
            <span onClick={() => handleReaction("👍")} title="Like">
              <LikeOutlined />
            </span>
            {/* <span onClick={() => handleReaction("❤️")} title="Love">
              ❤️
            </span>
            <span onClick={() => handleReaction("😂")} title="Laugh">
              😂
            </span> */}
          </div>
        </>
      )}

      {/* Three dots menu */}
      {threeDotsMenuVisible && (
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
      {contextMenuVisible && (
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
    </div>
  );
};

export default Message;
