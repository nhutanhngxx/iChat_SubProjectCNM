import React, { useState, useEffect, useRef, use } from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Button,
  Modal,
  Input,
  Checkbox,
  message,
  Alert,
} from "antd";
import {
  VideoCameraOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  ProfileOutlined,
  EditOutlined,
  TagOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  UserAddOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatMessages,
  sendMessage,
  fetchMessages,
  updateMessages,
  sendImageMessage,
  replyToMessage,
  sendMultipleImages,
  getUserMessages,
} from "../../../redux/slices/messagesSlice";
import Message from "./Message";
import MessageInput from "./MessageInput";
import ConversationDetails from "./ConversationDetails.jsx";
import SearchRight from "./SearchRight";
import { set } from "lodash";
import "./MessageArea.css";
import socket from "../../services/socket";
import {
  getUserFriends,
  checkBlockingStatus,
  unblockUser,
} from "../../../redux/slices/friendSlice";
import VideoCallModal from "./CallVideo/VideoCallModal";
import { message as antMessage } from "antd";
import { sendFriendRequest } from "../../../redux/slices/friendSlice";
import CreateGroupModal from "./CreateGroupModal";

const { Header, Content } = Layout;

// Constants
const CATEGORY_COLORS = [
  "#ef4444",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

const AddCategoryModal = ({ setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (categoryName.trim()) {
      setCategories((prev) => [
        ...prev,
        { name: categoryName, color: selectedColor },
      ]);
      setCategoryName("");
      setSelectedColor(CATEGORY_COLORS[0]);
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <Button
        type="text"
        className="add-category-button"
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        Thêm phân loại
      </Button>

      <Modal
        title="Thêm mới thẻ phân loại"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Thêm phân loại"
        cancelText="Hủy"
        okButtonProps={{ disabled: !categoryName.trim() }}
      >
        <label>Tên thẻ phân loại</label>
        <Input
          placeholder="Nhập tên thẻ phân loại"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          style={{ marginBottom: "10px" }}
        />

        <label>Thay đổi màu thẻ</label>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              style={{
                background: color,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border:
                  selectedColor === color
                    ? "3px solid black"
                    : "1px solid gray",
                cursor: "pointer",
              }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

const EditCategoryModal = ({ initialName, initialColor, onCancel, onSave }) => {
  const [categoryName, setCategoryName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const handleSubmit = () => {
    if (categoryName.trim()) {
      onSave({ name: categoryName, color: selectedColor });
    }
  };

  return (
    <Modal
      title="Chỉnh sửa thẻ phân loại"
      open={true}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{ disabled: !categoryName.trim() }}
    >
      <label>Tên thẻ phân loại</label>
      <Input
        placeholder="Nhập tên thẻ phân loại"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <label>Thay đổi màu thẻ</label>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            style={{
              background: color,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border:
                selectedColor === color ? "3px solid black" : "1px solid gray",
              cursor: "pointer",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </Modal>
  );
};

const CategoryMenu = () => {
  const [visible, setVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([
    { name: "Khách hàng", color: "#e74c3c" },
    { name: "Gia đình", color: "#e84393" },
    { name: "Công việc", color: "#f39c12" },
    { name: "Bạn bè", color: "#f1c40f" },
    { name: "Trả lời sau", color: "#2ecc71" },
    { name: "Đồng nghiệp", color: "#3498db" },
  ]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setVisible(false); // Đóng dropdown sau khi chọn
  };

  const handleUpdateCategory = (updatedCategory) => {
    setCategories(
      categories.map((cat, index) =>
        index === editingCategory.index ? updatedCategory : cat
      )
    );
    setEditingCategory(null);
  };

  const handleDelete = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleManageCategories = () => {
    setVisible(false);
    setIsModalVisible(true);
  };

  const menu = (
    <Menu className="category-menu">
      {categories.map((category, index) => (
        <Menu.Item
          key={index}
          className="category-item"
          onClick={() => handleSelectCategory(category)}
        >
          <div className="category-content">
            <div
              className="category-dot"
              style={{ backgroundColor: category.color }}
            />
            <span>{category.name}</span>
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        key="manage"
        className="manage-item"
        onClick={handleManageCategories}
      >
        <div className="manage-content">
          <SettingOutlined />
          <span>Quản lý thể phân loại</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="category-dropdown-container">
      <Dropdown
        overlay={menu}
        visible={visible}
        onVisibleChange={setVisible}
        trigger={["click"]}
        placement="bottomLeft"
      >
        <div
          className="category-icon"
          style={{
            // Thêm style động dựa vào category được chọn
            backgroundColor: selectedCategory?.color || "transparent",
            borderRadius: "50%",
            padding: 8,
            transition: "background-color 0.3s",
            fontSize: 15,
          }}
        >
          <TagOutlined
            style={{
              color: selectedCategory ? "white" : "inherit",
              display: "block",
            }}
          />
        </div>
      </Dropdown>

      <Modal
        title="Quản lý thể phân loại"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
        className="category-management-modal"
      >
        <div className="category-management-content">
          <h4>Danh sách thể phân loại</h4>
          <div className="category-list">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-list-item"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="category-drag-handle">
                  <MenuOutlined />
                </div>
                <div
                  className="category-tag"
                  style={{ backgroundColor: category.color }}
                />
                <div className="category-name">{category.name}</div>

                {hoveredIndex === index && (
                  <div className="category-actions">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setEditingCategory({ index, ...category })}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(index)}
                      className="delete"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <AddCategoryModal setCategories={setCategories} />
        </div>

        {editingCategory && (
          <EditCategoryModal
            initialName={editingCategory.name}
            initialColor={editingCategory.color}
            onCancel={() => setEditingCategory(null)}
            onSave={handleUpdateCategory}
          />
        )}
      </Modal>
    </div>
  );
};
const MessageArea = ({ selectedChat, user, onChatChange, onSelectUser }) => {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.messages.chatMessages);
  const userMessages = useSelector((state) => state.messages.userMessages);
  // Xác định đúng messages cần sử dụng dựa trên loại chat
  const displayMessages =
    selectedChat?.chat_type === "group" ? userMessages : chatMessages;

  // Gọi video
  const [isCalling, setIsCalling] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // Hiển thị thông tin hội thoại
  const [showConversation, setShowConversation] = useState(false);
  const [showSearchRight, setShowSearchRight] = useState(false);
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const messageEndRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Trả lời tin nhắn
  const [replyingTo, setReplyingTo] = useState(null);
  //state để reset lại mesageArea khi người dùng rời nhóm
  const [currentChat, setCurrentChat] = useState(selectedChat);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByUser, setBlockedByUser] = useState(false);
  const [blockedByTarget, setBlockedByTarget] = useState(false);
  //Scroll để tìm tin nhắn
  const scrollToMessage = (message) => {
    if (!message || !message._id) return;

    // Find the message element by its ID
    const messageElement = document.getElementById(`message-${message._id}`);

    if (messageElement) {
      // Scroll to the message with a smooth animation
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add a highlight effect
      messageElement.classList.add("highlighted-message");

      // Remove the highlight after a few seconds
      setTimeout(() => {
        messageElement.classList.remove("highlighted-message");
      }, 3000);
    }
  };
  // useEffect để thoát khỏi componet khi người dùng rời nhóm
  useEffect(() => {
    const handleGroupLeft = (event) => {
      if (event.detail && event.detail.groupId) {
        // Thông báo lên component cha
        if (onChatChange) {
          onChatChange(null);
        }

        // Hoặc sử dụng sự kiện để thông báo lên component cha
        window.dispatchEvent(
          new CustomEvent("user-left-group", {
            detail: { groupId: event.detail.groupId },
          })
        );
      }
    };

    window.addEventListener("group-left", handleGroupLeft);

    return () => {
      window.removeEventListener("group-left", handleGroupLeft);
    };
  }, [onChatChange]);
  // Hàm xử lý khi bấm icon Video
  const handleStartCall = async () => {
    try {
      // Lấy token từ backend của bạn
      const res = await fetch(
        "http://localhost:5001/api/video-call/get-token",
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch token");
      }

      const data = await res.json();
      setToken(data.token);

      // Kiểm tra xem token có hợp lệ không
      if (!data.token) {
        throw new Error("No token received from the server");
      }

      // Tạo room (hoặc lấy room ID từ DB nếu đã có)
      const createRoom = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.token}`, // Đảm bảo token có tiền tố 'Bearer'
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Tên phòng", // Thêm thông tin tên phòng nếu cần
        }),
      });

      // Kiểm tra phản hồi từ API
      if (!createRoom.ok) {
        const errorData = await createRoom.json(); // Lấy lỗi chi tiết
        console.error("Error response from VideoSDK:", errorData);
        throw new Error(
          `Error creating room: ${
            errorData.error || errorData.message || "Unknown error"
          }`
        );
      }

      const roomData = await createRoom.json();
      setMeetingId(roomData.roomId);
      setIsCalling(true);
    } catch (err) {
      console.error("Error starting video call", err);
      // Hiển thị lỗi chi tiết ra console để dễ dàng theo dõi
      alert(`Error: ${err.message}`);
    }
  };

  //  handler function
  const handleReplyToMessage = (messageToReply) => {
    setReplyingTo(messageToReply);
  };

  // this function to clear reply when needed
  const clearReplyingTo = () => {
    setReplyingTo(null);
  };

  const handleShowSearchRight = () => {
    setShowSearchRight(!showSearchRight);
    setShowConversation(false);
  };
  const handleShowConversation = () => {
    setShowConversation(!showConversation);
    setShowSearchRight(false);
  };
  // State quản lý mở rộng/thu nhỏ hội thoại
  const [isExpanded, setIsExpanded] = useState(false);
  // để đóng picker của MessageInput khi mở picker từ MessageArea
  const [showPickerFromMessArea, setshowPickerFromMessArea] = useState(true);
  const [activeTabFromMessageArea, setActiveTabFromMessageArea] =
    useState("info");
  const handleExpandContract = () => {
    setIsExpanded(!isExpanded); // Mở rộng
    setshowPickerFromMessArea(!showPickerFromMessArea); // Đóng picker
    setActiveTabFromMessageArea("info"); // Chuyển về tab thông tin
  };

  // Mở hộp thoại thông tin hội thoại có biểu tượng
  const handleShowConversationSymbol = () => {
    setShowConversation(true);
    setShowSearchRight(false);
    setshowPickerFromMessArea(false);
    handleExpandContract();
  };
  // At the top of your MessageArea component
  useEffect(() => {}, [selectedChat]);
  // Gọi API khi component render
  useEffect(() => {
    if (user?.id && selectedChat?.receiver_id) {
      dispatch(
        fetchChatMessages({
          senderId: user.id,
          receiverId: selectedChat.receiver_id,
        })
      );
    }
  }, [dispatch, user?.id, selectedChat?.receiver_id]);
  // Near the top of your component
  const [isFriendWithReceiver, setIsFriendWithReceiver] = useState(true);
  const [friends, setFriends] = useState({ friends: [] });

  // Add this useEffect to fetch friends
  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     try {
  //       const result = await dispatch(
  //         getUserFriends(user._id || user.id)
  //       ).unwrap();
  //       setFriends(result);

  //       // Chỉ kiểm tra nếu không phải chat nhóm
  //       if (
  //         result &&
  //         result.friends &&
  //         selectedChat &&
  //         selectedChat.chat_type !== "group"
  //       ) {
  //         const isFriend = result.friends.some(
  //           (friend) =>
  //             friend.id === selectedChat.id ||
  //             friend._id === selectedChat.id ||
  //             String(friend.id) === String(selectedChat.id)
  //         );
  //         setIsFriendWithReceiver(isFriend);
  //       } else if (selectedChat?.chat_type === "group") {
  //         // Nếu là chat nhóm, luôn set là true
  //         setIsFriendWithReceiver(true);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching friends:", err);
  //     }
  //   };

  //   if (user?._id || user?.id) {
  //     fetchFriends();
  //   }
  // }, [dispatch, user, selectedChat]);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await dispatch(
          getUserFriends(user._id || user.id)
        ).unwrap();
        setFriends(result);

        // Chỉ kiểm tra nếu không phải chat nhóm
        if (
          result &&
          result.friends &&
          selectedChat &&
          selectedChat.chat_type !== "group"
        ) {
          const isFriend = result.friends.some(
            (friend) =>
              friend.id === selectedChat.id ||
              friend._id === selectedChat.id ||
              String(friend.id) === String(selectedChat.id)
          );
          setIsFriendWithReceiver(isFriend);

          // Nếu không phải bạn bè, kiểm tra trạng thái chặn
          if (!isFriend && selectedChat.id !== user.id) {
            const blockStatus = await dispatch(
              checkBlockingStatus({
                userId: user._id || user.id,
                otherUserId: selectedChat.id,
              })
            ).unwrap();

            setIsBlocked(blockStatus.isBlocked);
            setBlockedByUser(blockStatus.blockedByUser);
            setBlockedByTarget(blockStatus.blockedByTarget);
          } else {
            // Reset trạng thái chặn nếu là bạn bè
            setIsBlocked(false);
            setBlockedByUser(false);
            setBlockedByTarget(false);
          }
        } else if (selectedChat?.chat_type === "group") {
          // Nếu là chat nhóm, luôn set là true
          setIsFriendWithReceiver(true);
          setIsBlocked(false);
        }
      } catch (err) {
        console.error("Error fetching friends or checking block status:", err);
      }
    };

    if (user?._id || user?.id) {
      fetchFriends();
    }
  }, [dispatch, user, selectedChat]);
  // Trạng thái bỏ chặn
  const handleUnblock = async () => {
    try {
      antMessage.loading({
        content: "Đang hủy chặn...",
        key: "unblockUser",
      });

      const result = await dispatch(
        unblockUser({
          blocker_id: user.id,
          blocked_id: selectedChat.id,
        })
      ).unwrap();

      if (result.status === "ok") {
        antMessage.success({
          content: "Đã hủy chặn người dùng",
          key: "unblockUser",
          duration: 2,
        });

        // Reset trạng thái chặn
        setIsBlocked(false);
        setBlockedByUser(false);
      } else {
        throw new Error(result.message || "Không thể hủy chặn người dùng");
      }
    } catch (error) {
      antMessage.error({
        content: error.message || "Không thể hủy chặn. Vui lòng thử lại sau.",
        key: "unblockUser",
      });
      console.error("Error unblocking user:", error);
    }
  };
  const handleSendMessage = async (
    text = "",
    image = null,
    file = null,
    content,
    replyToId = null // ID của tin nhắn được trả lời (nếu có)
  ) => {
    // Kiểm tra xem có phải là chat nhóm không
    const isGroupChat = selectedChat?.chat_type === "group";

    // Chỉ kiểm tra bạn bè nếu là chat private
    if (!isGroupChat && !isFriendWithReceiver && selectedChat.id !== user.id) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }

    if ((text.trim() || image || file) && selectedChat) {
      const newMessage = {
        sender_id: user?.id, // ID người gửi
        receiver_id: selectedChat?.id, // ID người nhận
        content: text ? text : content || "",
        type: "text", // Loại tin nhắn (text, image, file)
        chat_type: selectedChat.chat_type || "private",
        ...(replyToId && { reply_to: replyToId }), // ID tin nhắn được trả lời (nếu có)
      };

      try {
        const response = await dispatch(sendMessage(newMessage)).unwrap(); // Chờ gửi thành công

        const sentMessage = response.data; // Tin nhắn vừa gửi
        // Gửi qua socket để bên kia nhận real-time
        let roomId;
        if (selectedChat.chat_type === "group") {
          roomId = `group_${selectedChat.id}`;
        } else {
          const userIds = [user.id, selectedChat.id].sort();
          roomId = `chat_${userIds[0]}_${userIds[1]}`;
        }

        socket.emit("send-message", {
          ...sentMessage, // Tin nhắn vừa gửi
          chatId: roomId, // ID phòng chat
        });
        dispatch(fetchMessages(user?.id));
        dispatch(updateMessages(sentMessage)); // Cập nhật tin nhắn vào Redux store
        // Cuộn xuống sau khi gửi tin nhắn thành công
        setTimeout(() => {
          if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } catch (error) {}
    }
  };
  const handleImageUpload = async (imageFile) => {
    if (selectedChat) {
      try {
        const result = await dispatch(
          sendImageMessage({
            sender_id: user?.id,
            receiver_id: selectedChat?.id,
            image: imageFile, // là file thật
            chat_type: selectedChat.chat_type || "private",
          })
        ).unwrap();

        const sentMessage = result.data;

        let roomId;
        if (selectedChat.chat_type === "group") {
          roomId = `group_${selectedChat.id}`;
        } else {
          const userIds = [user.id, selectedChat.id].sort();
          roomId = `chat_${userIds[0]}_${userIds[1]}`;
        }

        socket.emit("send-message", {
          ...sentMessage,
          chatId: roomId,
        });

        dispatch(fetchMessages(user?.id));
        dispatch(updateMessages(sentMessage)); // Cập nhật tin nhắn vào Redux store
      } catch (err) {
        console.error("Lỗi gửi ảnh:", err);
      }
    }
  };
  // Gửi nhiều ảnh
  const handleSendMultipleImages = async (selectedImages) => {
    try {
      const response = await dispatch(
        sendMultipleImages({
          sender_id: user.id,
          receiver_id: selectedChat.id,
          images: selectedImages,
          chat_type: selectedChat.chat_type || "private",
        })
      ).unwrap();

      const sentMessages = response.data; // Danh sách tin nhắn vừa gửi

      // Nếu là chat nhóm, cập nhật lại tin nhắn nhóm
      if (selectedChat.chat_type === "group") {
        dispatch(getUserMessages(selectedChat.id));
      }

      // Thông báo qua socket
      const roomId =
        selectedChat.chat_type === "group"
          ? `group_${selectedChat.id}`
          : `chat_${[user.id, selectedChat.id].sort()[0]}_${
              [user.id, selectedChat.id].sort()[1]
            }`;

      // Thông báo cho các client khác
      socket.emit("send-message", {
        ...sentMessages,
        chatId: roomId,
      });

      dispatch(fetchMessages(user?.id));
      dispatch(updateMessages(sentMessages));
    } catch (error) {
      console.error("Error sending multiple images:", error);
      antMessage.error("Không thể gửi ảnh. Vui lòng thử lại.");
    }
  };
  const handleFileUpload = async (file, mediaType) => {
    if (selectedChat) {
      try {
        message.loading({ content: "Đang tải lên...", key: "uploadMedia" });
        // Determine file type if not provided
        const fileType = mediaType || determineFileType(file);

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender_id", user?.id);
        formData.append("receiver_id", selectedChat?.id);
        formData.append("type", fileType); // Important: specify file type

        const result = await dispatch(
          sendImageMessage({
            sender_id: user?.id,
            receiver_id: selectedChat?.id,
            image: file,
            fileType: fileType, // Specify the file type
            chat_type: selectedChat.chat_type || "private",
          })
        ).unwrap();

        const sentMessage = result.data;

        let roomId;
        if (selectedChat.chat_type === "group") {
          roomId = `group_${selectedChat.id}`;
        } else {
          const userIds = [user.id, selectedChat.id].sort();
          roomId = `chat_${userIds[0]}_${userIds[1]}`;
        }

        socket.emit("send-message", {
          ...sentMessage,
          chatId: roomId,
        });

        dispatch(fetchMessages(user?.id)); // Optional
        dispatch(updateMessages(sentMessage)); // Cập nhật tin nhắn vào Redux store
        // Show success message
        message.success({
          content: `${
            fileType.charAt(0).toUpperCase() + fileType.slice(1)
          } đã được gửi thành công!`,
          key: "uploadMedia",
        });
      } catch (error) {
        message.error({
          content: "Không thể gửi tệp. Vui lòng thử lại.",
          key: "uploadMedia",
        });
      }
    }
  };
  const determineFileType = (file) => {
    const mimeType = file.type;

    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("image/")) return "image";
    return "file";
  };
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages, selectedChat]); // Sử dụng displayMessages thay vì messages

  const handleScrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Keets ban
  const handleSendFriendRequest = async () => {
    try {
      antMessage.loading({
        content: "Đang gửi lời mời kết bạn...",
        key: "friendRequest",
      });

      const result = await dispatch(
        sendFriendRequest({
          senderId: user.id,
          receiverId: selectedChat.id,
        })
      ).unwrap();

      if (result.status === "ok") {
        antMessage.success({
          content: result.message,
          key: "friendRequest",
          duration: 2,
        });
        setFriendRequestSent(true);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      antMessage.error({
        content:
          error.message ||
          "Không thể gửi lời mời kết bạn. Vui lòng thử lại sau.",
        key: "friendRequest",
      });
      console.error("Error sending friend request:", error);
    }
  };
  useEffect(() => {
    // Đảm bảo tất cả tin nhắn đã reply đều được tải
    const loadAllRepliedMessages = async () => {
      if (!selectedChat?.id || !user?.id || !messages || messages.length === 0)
        return;

      // Lấy danh sách các ID tin nhắn đã reply
      const repliedIds = messages
        .filter((msg) => msg.reply_to)
        .map((msg) => msg.reply_to)
        .filter((id) => id); // Lọc ra các ID hợp lệ

      if (repliedIds.length > 0) {
        try {
          // API call với danh sách ID để lấy tất cả tin nhắn cùng lúc
          const response = await dispatch(
            fetchChatMessages({
              senderId: user.id,
              receiverId: selectedChat.id,
              includeRepliedMessages: true,
              repliedIds: repliedIds, // Truyền danh sách ID cần lấy
            })
          ).unwrap();
        } catch (error) {
          console.error("Failed to fetch replies:", error);
        }
      }
    };

    loadAllRepliedMessages();
  }, [messages, user?.id, selectedChat?.id, dispatch]);
  if (!selectedChat) return null;
  return (
    <div className="message-wrapper">
      <Layout className="message-area-container">
        <Header className="chat-header-message">
          <div className="user-profile-message">
            <div className="avatar-message">
              <Avatar
                size={48}
                src={selectedChat.avatar_path} // Thay đổi avatar
                className="profile-avatar-message"
              />
            </div>
            <div className="user-info-message">
              <h3 className="user-name-message">
                {selectedChat.name} <EditOutlined />
              </h3>
              <CategoryMenu />
            </div>
          </div>

          <div className="action-buttons-message-area">
            {selectedChat.chat_type !== "group" && (
              <UsergroupAddOutlined
                className="header-icon-message-area"
                onClick={() => setModalVisible(true)}
              />
            )}
            <CreateGroupModal
              visible={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={() => {
                setModalVisible(false);
              }}
              userMessageId={selectedChat.id}
            />
            <VideoCameraOutlined
              className="header-icon-message"
              onClick={handleStartCall}
            />
            <SearchOutlined
              className="header-icon"
              onClick={handleShowSearchRight}
            />
            <ProfileOutlined
              className="header-icon"
              onClick={handleShowConversation}
            />
          </div>
        </Header>
        <VideoCallModal
          isCalling={isCalling}
          setIsCalling={setIsCalling}
          token={token}
          meetingId={meetingId}
        />

        <Content className="message-area-content">
          <div className="message-container">
            {!isFriendWithReceiver && selectedChat.chat_type !== "group" && (
              <div className="not-friend-banner">
                {isBlocked ? (
                  <Alert
                    message={
                      blockedByUser ? "Bạn đã chặn người này" : "Bạn đã bị chặn"
                    }
                    description={
                      blockedByUser
                        ? "Bạn sẽ không nhận được tin nhắn từ người này cho đến khi hủy chặn."
                        : "Bạn không thể gửi tin nhắn đến người này vì họ đã chặn bạn."
                    }
                    type="error"
                    showIcon
                    action={
                      blockedByUser ? (
                        <Button
                          type="primary"
                          danger
                          size="small"
                          onClick={handleUnblock}
                        >
                          Hủy chặn
                        </Button>
                      ) : null
                    }
                    className="blocked-alert"
                  />
                ) : (
                  <Alert
                    message="Hai bạn chưa là bạn bè"
                    description="Kết bạn để mở khóa tính năng tin nhắn đầy đủ."
                    type="warning"
                    showIcon
                    action={
                      friendRequestSent ? (
                        <Button size="small" disabled>
                          Đã gửi lời mời
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          icon={<UserAddOutlined />}
                          onClick={handleSendFriendRequest}
                        >
                          Kết bạn
                        </Button>
                      )
                    }
                    className="not-friend-alert"
                  />
                )}
              </div>
            )}

            {!Array.isArray(displayMessages) || displayMessages.length === 0 ? (
              <div className="empty-conversation">
                <MessageOutlined
                  style={{ fontSize: "80px", opacity: 0.5, color: "black" }}
                />
                <p>Không có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              displayMessages
                .filter((message) => {
                  // Simple, direct comparison focusing on string IDs
                  if (!Array.isArray(message.isdelete)) {
                    return true; // Keep message if no isdelete array
                  }

                  // Don't show message if user ID is in the isdelete array
                  return !message.isdelete.some(
                    (id) => id === user.id || id === String(user.id)
                  );
                })
                .map((message) => (
                  <React.Fragment key={message._id || message.id}>
                    <Message
                      message={message}
                      allMessages={displayMessages}
                      selectedChat={selectedChat}
                      isSender={message.sender_id === user.id}
                      onClick={handleScrollToBottom}
                      user={user}
                      onReplyToMessage={handleReplyToMessage}
                    />
                  </React.Fragment>
                ))
            )}

            <div ref={messageEndRef}></div>
          </div>
        </Content>

        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          onImageUpload={handleImageUpload} // Truyền callback để xử lý ảnh
          onFileUpload={handleFileUpload} // Truyền callback để xử lý file
          handleShowConversationSymbol={handleShowConversationSymbol} // Truyền hàm xử lý hiển thị thông tin hội thoại
          showPickerFromMessArea={showPickerFromMessArea}
          isExpanded={isExpanded} // Truyền state isExpanded
          showConversation={showConversation} // Truyền showConversation
          replyingTo={replyingTo} // Add this prop
          clearReplyingTo={clearReplyingTo} // Add this prop
          user={user}
          selectedChat={selectedChat} // Thêm prop selectedChat
          onImageMutippleUpload={handleSendMultipleImages} // Truyền hàm gửi nhiều ảnh
        />
      </Layout>
      {showConversation && (
        <Layout className="conversation-details">
          <ConversationDetails
            isVisible={showConversation}
            selectedChat={selectedChat}
            isExpanded={isExpanded}
            handleExpandContract={handleExpandContract}
            activeTabFromMessageArea={activeTabFromMessageArea}
            onImageUpload={handleImageUpload}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            allMessages={displayMessages}
            user={user}
            onLeaveGroup={() => {
              // Thông báo cho component cha thông qua sự kiện
              window.dispatchEvent(
                new CustomEvent("user-left-group", {
                  detail: { groupId: selectedChat.id },
                })
              );
            }}
            onSelectUser={onSelectUser}
            onUpdateSelectedChat={(updatedChat) => {
              onChatChange(updatedChat); // Use the setter function passed from ChatWindow
            }}
          />
        </Layout>
      )}
      {/* Hiển thị tìm kiếm bên thông tin hội thoại */}
      {showSearchRight && (
        <Layout className="layout-search-right">
          <SearchRight
            setShowSearchRight={setShowSearchRight}
            messages={displayMessages}
            onMessageSelect={scrollToMessage}
            selectedChat={selectedChat}
            user={user}
          />
        </Layout>
      )}
    </div>
  );
};

export default MessageArea;
