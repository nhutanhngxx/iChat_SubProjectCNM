import React, { useEffect, useState, useRef } from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import {
  SmileOutlined,
  LikeOutlined,
  SendOutlined,
  PictureOutlined,
  LinkOutlined,
  IdcardOutlined,
  MoreOutlined,
  ExpandOutlined,
  CheckOutlined,
  PaperClipOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  Popover,
  Button,
  Upload,
  message,
  Badge,
  Modal,
  Input,
  Avatar,
  Checkbox,
  Tabs,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./MessageInput.css";
import Picker from "emoji-picker-react";
import GifPicker from "./GifPicker";
import { RiExpandDiagonalLine } from "react-icons/ri";
import ConversationDetails from "./ConversationDetails";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { useDispatch, useSelector } from "react-redux";
// Dữ liệu mẫu cho danh sách bạn bè
const mockContacts = [
  { id: 1, name: "Ái Lý", avatar: "https://i.pravatar.cc/300?img=1" },
  { id: 2, name: "Anh Hải", avatar: "https://i.pravatar.cc/300?img=2" },
  { id: 3, name: "Anh Hùng", avatar: "https://i.pravatar.cc/300?img=3" },
  { id: 4, name: "Anh Luân", avatar: "https://i.pravatar.cc/300?img=4" },
  { id: 5, name: "Anh Viên", avatar: "https://i.pravatar.cc/300?img=5" },
];

// Danh sách các danh mục để lọc
const categories = [
  { label: "Khách hàng", value: "Khách hàng" },
  { label: "Gia đình", value: "Gia đình" },
  { label: "Cộng việc", value: "Cộng việc" },
  { label: "Bạn bè", value: "Bạn bè" },
  { label: "Trả lời sau", value: "Trả lời sau" },
];

const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  onImageUpload,
  onFileUpload,
  handleShowConversationSymbol,
  showPickerFromMessArea,
  isExpanded,
  showConversation,
  replyingTo,
  clearReplyingTo,
  user,
  selectedChat,
  onImageMutippleUpload,
}) => {
  const [selectedImage, setSelectedImage] = useState(null); // State để lưu ảnh đã chọn
  const [selectedFile, setSelectedFile] = useState(null); // State để lưu file đã chọn
  const [isModalOpen, setIsModalOpen] = useState(false); // State để quản lý modal danh thiếp
  const [searchTerm, setSearchTerm] = useState(""); // State cho thanh tìm kiếm
  const [selectedContacts, setSelectedContacts] = useState([]); // State cho danh sách bạn bè được chọn
  const [activeCategory, setActiveCategory] = useState("Khách hàng"); // State cho tab hiện tại

  // Emoji picker
  const [showPicker, setShowPicker] = useState(false);
  const [showPickerRight, setShowPickerRight] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [activeTab, setActiveTab] = useState("emoji");
  // const [inputMessage, setInputMessage] = useState("");
  // Mở picker ở trên hoặc bên phải
  const pickerContainerRef = useRef(null);
  const pickerRightContainerRef = useRef(null);
  // Check bạn bè
  const [isFriendWithReceiver, setIsFriendWithReceiver] = useState(true);
  const [friends, setFriends] = useState({ friends: [] });
  const dispatch = useDispatch();
  // State lưu trữ nhiều ảnh
  const [selectedImages, setSelectedImages] = useState([]);
  const [showMultipleImagePreview, setShowMultipleImagePreview] =
    useState(false);

  // effect để lấy danh sách bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userId = user?._id || user?.id;
        if (!userId) return;
        const result = await dispatch(getUserFriends(userId)).unwrap();
        setFriends(result);

        // Check if the selected user is a friend
        if (result && result.friends && selectedChat) {
          // Nếu là chat nhóm, luôn coi như là bạn bè
          if (selectedChat.chat_type === "group") {
            setIsFriendWithReceiver(true);
          } else {
            // Chỉ kiểm tra bạn bè đối với chat cá nhân
            const isFriend = result.friends.some(
              (friend) =>
                friend.id === selectedChat.id ||
                friend._id === selectedChat.id ||
                String(friend.id) === String(selectedChat.id)
            );
            setIsFriendWithReceiver(isFriend);
          }
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    if (user?._id || user?.id) {
      fetchFriends();
    }
  }, [dispatch, user, selectedChat]);
  const handleShowPickerTop = () => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }
    if (isExpanded) return;
    setShowPicker((prev) => !prev);
    setShowPickerRight(false);
  };
  //Chạy lại khi mở picker trong tt hộp thoại từ messArea để đóng picker
  const renderCount = useRef(0); // Biến cờ để kiểm tra lần chạy đầu tiên
  useEffect(() => {
    renderCount.current += 1;
    console.log("Render count:", renderCount.current);

    if (renderCount.current === 1) {
      setShowPicker(false);
      console.log("Lần 1: setShowPicker(false)");
      return;
    }

    if (renderCount.current === 2) {
      console.log("Lần 2: Không làm gì cả");
      return;
    }
    // Chỉ chạy khi renderCount > 2
    setShowPicker(showPickerFromMessArea);
    console.log("showPickerFromMessArea: " + showPickerFromMessArea);
  }, [showPickerFromMessArea]);

  const handleShowPickerRight = () => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }
    setShowPickerRight((prev) => !prev);
    setShowPicker(false);
  };
  const onEmojiClick = (event) => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }
    const emoji = event.emoji; // Lấy emoji từ thuộc tính `emoji` của event
    if (emoji) {
      setInputMessage((prevMessage) => prevMessage + emoji); // Thêm emoji vào tin nhắn
    } else {
      console.error("Emoji is undefined or invalid:", event); // Log lỗi nếu emoji không hợp lệ
    }
  };
  // Hàm xử lý khi chọn file ảnh (mở hộp thoại tải ảnh trực tiếp)
  const handleImageUpload = (event) => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }
    const file = event.target.files[0];
    if (file) {
      // setSelectedImage(URL.createObjectURL(file)); // preview ảnh
      onImageUpload(file); // truyền file gốc, không phải base64
      message.success("Ảnh đã được tải lên thành công!");
    }

    event.target.value = null;
  };
  // Hàm xử lý khi người dùng chọn nhiều ảnh
  const handleMultipleImageUpload = (event) => {
    // Check if users are friends
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Verify selected chat
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }

    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Kiểm tra nếu chỉ có 1 ảnh thì xử lý như bình thường
    if (files.length === 1) {
      onImageUpload(files[0]);
      message.success("Ảnh đã được tải lên thành công!");
    } else {
      // Nếu có nhiều ảnh, hiển thị preview và xác nhận
      setSelectedImages(files);
      setShowMultipleImagePreview(true);
      message.info(`Đã chọn ${files.length} ảnh. Nhấn gửi để tải lên.`);
    }

    // Reset input để có thể chọn lại cùng một file
    event.target.value = null;
  };
  // Hàm xử lý khi người dùng xác nhận gửi nhiều ảnh
  const handleSendMultipleImages = () => {
    if (selectedImages.length > 0) {
      message.success(`Đã gửi ${selectedImages.length} ảnh thành công!`);
      onImageMutippleUpload(selectedImages); // Gọi hàm gửi nhiều ảnh
      setShowMultipleImagePreview(false); // Đóng preview sau khi gửi
    }
  };
  // Hàm xử lý khi chọn file (mở hộp thoại tải file trực tiếp)
  const handleFileUpload = (event) => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Validate selected chat
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    // Get file size in MB
    const fileSizeInMB = file.size / (1024 * 1024);

    // Validate file size (limit to 100MB)
    if (fileSizeInMB > 100) {
      message.error("File quá lớn. Vui lòng chọn file nhỏ hơn 100MB.");
      return;
    }

    // Determine file type
    const fileType = determineFileType(file);

    // Handle file based on type
    switch (fileType) {
      case "video":
        handleVideoUpload(file);
        break;
      case "audio":
        handleAudioUpload(file);
        break;
      case "image":
        handleImageUpload(file);
        break;
      default:
        handleGenericFileUpload(file);
        break;
    }

    // Reset input to allow selecting the same file again
    event.target.value = null;
  };

  // Helper function to determine file type
  const determineFileType = (file) => {
    const fileType = file.type.split("/")[0];

    if (fileType === "video") return "video";
    if (fileType === "audio") return "audio";
    if (fileType === "image") return "image";
    return "file";
  };

  // Video upload handler
  const handleVideoUpload = (file) => {
    // Create preview if needed
    const previewUrl = URL.createObjectURL(file);

    // Display preview
    setMediaPreview({
      type: "video",
      url: previewUrl,
      file: file,
    });

    message.success(`Video "${file.name}" đã được chọn và sẵn sàng để gửi!`);
  };

  // Audio upload handler
  const handleAudioUpload = (file) => {
    // Create preview if needed
    const previewUrl = URL.createObjectURL(file);

    // Display preview
    setMediaPreview({
      type: "audio",
      url: previewUrl,
      file: file,
    });

    message.success(`Audio "${file.name}" đã được chọn và sẵn sàng để gửi!`);
  };

  // Generic file upload handler
  const handleGenericFileUpload = (file) => {
    // Set file for upload
    onFileUpload(file);
    message.success(`File "${file.name}" đã được tải lên thành công!`);
  };
  // Mở MediaPreview Modal
  // Add this to your state declarations
  const [mediaPreview, setMediaPreview] = useState(null);

  // Add this function to clear media preview
  const clearMediaPreview = () => {
    if (mediaPreview?.url) {
      URL.revokeObjectURL(mediaPreview.url);
    }
    setMediaPreview(null);
  };

  // Add this component to render media previews
  const MediaPreviewComponent = () => {
    if (!mediaPreview) return null;

    return (
      <div className="media-preview">
        <div className="media-preview-header">
          <span>
            {mediaPreview.type === "video" ? "Video Preview" : "Audio Preview"}
          </span>
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={clearMediaPreview}
          />
        </div>

        {mediaPreview.type === "video" && (
          <video
            controls
            src={mediaPreview.url}
            style={{ maxWidth: "100%", maxHeight: "200px" }}
          />
        )}

        {mediaPreview.type === "audio" && (
          <audio controls src={mediaPreview.url} style={{ width: "100%" }} />
        )}

        <div className="media-preview-footer">
          <span>{mediaPreview.file.name}</span>
          <Button type="primary" onClick={() => handleSendMedia()}>
            Gửi
          </Button>
        </div>
      </div>
    );
  };

  // Add this function to send the media
  const handleSendMedia = () => {
    if (!mediaPreview) return;

    const { file, type } = mediaPreview;

    if (type === "video") {
      // Handle video upload with specific type
      onFileUpload(file, "video");
    } else if (type === "audio") {
      // Handle audio upload with specific type
      onFileUpload(file, "audio");
    }

    clearMediaPreview();
  };
  //hàm fect lại replyingTo khi có thay đổi
  useEffect(() => {
    console.log("MessageInput replyingTo:", replyingTo);
  }, [replyingTo]);
  // Hàm gửi tin nhắn (bao gồm gửi ảnh hoặc file nếu có)
  const handleSend = () => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }

    if (inputMessage.trim() || selectedImage || selectedFile || selectedGif) {
      if (selectedGif) {
        console.log("Gửi GIF:", selectedGif);
      }
      if (selectedImage) {
        console.log("Gửi ảnh:", selectedImage);
      }
      if (selectedFile) {
        console.log("Gửi file:", selectedFile.name);
      }

      // Call the handleSendMessage with reply info if available
      handleSendMessage(
        inputMessage,
        null,
        null,
        inputMessage,
        replyingTo?._id
      );

      // handleSendMessage(inputMessage); // Gửi tin nhắn văn bản nếu có
      setSelectedGif(null); // Reset GIF sau khi gửi
      setSelectedImage(null); // Reset ảnh sau khi gửi
      setSelectedFile(null); // Reset file sau khi gửi
      setInputMessage(""); // Reset tin nhắn văn bản
      if (replyingTo) {
        clearReplyingTo(); // Xóa thông tin trả lời sau khi gửi
      }
    }
    showPicker && setShowPicker(false); // Đóng picker nếu đang mở
    showPickerRight && setShowPickerRight(false); // Đóng picker nếu đang mở
  };

  // Hàm xử lý khi chọn bạn bè
  const onContactSelect = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Hàm gửi danh thiếp
  const handleSendContacts = () => {
    // Check if users are friends before sending
    if (
      !isFriendWithReceiver &&
      selectedChat.id !== user.id &&
      selectedChat?.chat_type !== "group"
    ) {
      message.warning("Bạn cần kết bạn để gửi tin nhắn.");
      return;
    }

    // Always check if you have a valid selected chat and message ID before using
    if (!selectedChat || !selectedChat.id) {
      console.error("No selected chat or invalid chat", selectedChat);
      return;
    }
    if (selectedContacts.length > 0) {
      const contactNames = selectedContacts
        .map((id) => mockContacts.find((c) => c.id === id).name)
        .join(", ");
      message.success(`Đã gửi danh thiếp của: ${contactNames}`);
      setIsModalOpen(false); // Đóng modal sau khi gửi
      setSelectedContacts([]); // Reset danh sách bạn bè được chọn
    } else {
      message.warning("Vui lòng chọn ít nhất một danh thiếp để gửi!");
    }
  };

  // Lọc danh sách bạn bè theo từ khóa tìm kiếm và danh mục
  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch = contact.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "Khách hàng" || // Giả sử tất cả thuộc "Khách hàng" cho đơn giản
      true; // Bạn có thể mở rộng logic này để gán danh mục cho từng contact
    return matchesSearch && matchesCategory;
  });

  // Hàm xử lý các tùy chọn trong popover
  const handleMoreOption = (option) => {
    switch (option) {
      case "createGroup":
        message.info("Tạo nhóm được chọn!");
        break;
      case "assignTask":
        message.info("Giao việc được chọn!");
        break;
      case "markImportant":
        message.info("Đánh dấu tin quan trọng được chọn!");
        break;
      case "markUrgent":
        message.info("Đánh dấu tin khẩn cấp được chọn!");
        break;
      default:
        break;
    }
  };

  // Nội dung của popover cho MoreOutlined
  const moreContent = (
    <div className="more-options-popover">
      <div
        className="option-item"
        onClick={() => handleMoreOption("createGroup")}
      >
        <span role="img" aria-label="clock">
          ⏳
        </span>{" "}
        Tạo nhóm
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("assignTask")}
      >
        <span role="img" aria-label="check">
          ✓
        </span>{" "}
        Giao việc
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("markImportant")}
      >
        <span role="img" aria-label="exclamation">
          !
        </span>{" "}
        Đánh dấu tin quan trọng
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("markUrgent")}
      >
        <span role="img" aria-label="bell">
          🔔
        </span>{" "}
        Đánh dấu tin khẩn cấp
        <span className="info-icon">?</span>
      </div>
    </div>
  );

  const handleGifSelect = async (gifUrl) => {
    try {
      // Check if users are friends before sending
      if (
        !isFriendWithReceiver &&
        selectedChat.id !== user.id &&
        selectedChat?.chat_type !== "group"
      ) {
        message.warning("Bạn cần kết bạn để gửi tin nhắn.");
        return;
      }

      // Always check if you have a valid selected chat and message ID before using
      if (!selectedChat || !selectedChat.id) {
        console.error("No selected chat or invalid chat", selectedChat);
        return;
      }
      // First, fetch the GIF data as a blob
      const response = await fetch(gifUrl);
      if (!response.ok) throw new Error("Failed to fetch GIF");
      const gifBlob = await response.blob();

      // Create a proper File object with a meaningful name
      const filename = `gif_${new Date().getTime()}.gif`;
      const gifFile = new File([gifBlob], filename, { type: "image/gif" });

      // Now process it through your existing image handler
      onImageUpload(gifFile);
      message.success("GIF đã được chọn thành công!");
    } catch (error) {
      console.error("Error processing GIF:", error);
      message.error("Không thể tải GIF, vui lòng thử lại!");
    }
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showPicker &&
        pickerContainerRef.current &&
        !pickerContainerRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
      if (
        showPickerRight &&
        pickerRightContainerRef.current &&
        !pickerRightContainerRef.current.contains(event.target)
      ) {
        setShowPickerRight(false);
      }
    }

    if (showPicker || showPickerRight) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, showPickerRight]);
  return (
    <div className="message-input-container">
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <div className="reply-preview-icon">↩️</div>
            <div className="reply-preview-text">
              <p className="reply-preview-label">Đang trả lời tin nhắn</p>
              <p className="reply-preview-message">
                {replyingTo.type === "text"
                  ? replyingTo.content
                    ? replyingTo.content.substring(0, 50) +
                      (replyingTo.content.length > 50 ? "..." : "")
                    : ""
                  : replyingTo.type === "image"
                  ? "🖼️ Hình ảnh"
                  : "📎 Tệp đính kèm"}
              </p>
            </div>
          </div>
          <button className="reply-preview-close" onClick={clearReplyingTo}>
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      {mediaPreview && <MediaPreviewComponent />}
      {/* Preview nhiều ảnh */}
      {showMultipleImagePreview && selectedImages.length > 0 && (
        <div className="multiple-image-preview">
          <div className="preview-header">
            <span>Đã chọn {selectedImages.length} ảnh</span>
            <Button
              type="text"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedImages([]);
                setShowMultipleImagePreview(false);
              }}
            />
          </div>

          <div className="preview-grid">
            {selectedImages.slice(0, 4).map((image, index) => (
              <div key={index} className="preview-image-container">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="preview-image"
                />
                {index === 3 && selectedImages.length > 4 && (
                  <div className="more-images">
                    +{selectedImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="preview-footer">
            <Button type="primary" onClick={handleSendMultipleImages}>
              Gửi {selectedImages.length} ảnh
            </Button>
          </div>
        </div>
      )}
      {/* Thanh công cụ trên */}
      <div className="message-toolbar">
        <div style={{ bottom: "102px", position: "absolute", left: "0px" }}>
          {showPicker && (
            <div className="picker-container" ref={pickerContainerRef}>
              <div className="tabs">
                <button
                  className={activeTab === "emoji" ? "active" : ""}
                  onClick={() => setActiveTab("emoji")}
                >
                  Emoji
                </button>
                <button
                  className={activeTab === "gif" ? "active" : ""}
                  onClick={() => setActiveTab("gif")}
                >
                  GIF
                </button>
                <button
                  className="expand-icon"
                  onClick={handleShowConversationSymbol}
                >
                  <RiExpandDiagonalLine />
                </button>
              </div>
              <div className="picker-content">
                {activeTab === "emoji" ? (
                  <Picker
                    onEmojiClick={onEmojiClick}
                    className="emoji-picker"
                    style={{ width: "310px" }}
                  />
                ) : (
                  <GifPicker
                    onSelect={setSelectedGif}
                    onImageUpload={handleGifSelect}
                    onClose={() => setShowPicker(false)} // Add this line
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <SmileOutlined className="toolbar-icon" onClick={handleShowPickerTop} />
        <label htmlFor="image-upload" className="toolbar-icon">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleMultipleImageUpload}
            multiple
            style={{ display: "none" }} // Ẩn input file
          />
          <PictureOutlined />
        </label>
        <label htmlFor="file-upload" className="toolbar-icon">
          <input
            type="file"
            id="file-upload"
            accept="audio/*,video/*,image/*,application/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <PaperClipOutlined />
        </label>
        <label htmlFor="media-upload" className="toolbar-icon">
          <input
            type="file"
            id="media-upload"
            accept="audio/*,video/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <PlayCircleOutlined />
        </label>

        <IdcardOutlined
          className="toolbar-icon"
          onClick={() => setIsModalOpen(true)} // Mở modal trực tiếp khi nhấp
        />
      </div>

      <div style={{ display: "inline-flex" }}>
        {/* Ô nhập tin nhắn */}
        <div className="message-input-box">
          <TextareaAutosize
            placeholder="Nhập @, tin nhắn tới "
            value={inputMessage || ""}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Ngăn xuống dòng mặc định
                handleSend();
              }
            }}
            style={{
              width: "100%", // Đảm bảo chiều rộng đầy đủ
              minHeight: "38px", // Chiều cao tối thiểu
              lineHeight: "1.5", // Khoảng cách dòng
              padding: "0px", // Padding giống giao diện không viền
              border: "none", // Loại bỏ viền
              borderRadius: "4px", // Góc bo tròn nhẹ
              resize: "none", // Ngăn người dùng thay đổi kích thước thủ công
              overflow: "auto", // Cho phép cuộn nếu nội dung quá dài
              outline: "none", // Loại bỏ outline khi focus
              boxShadow: "none", // Loại bỏ shadow khi focus hoặc hover
            }}
            maxRows={3} // Giới hạn tối đa 3 dòng
          />
        </div>
        {/* Nút emoji & like */}
        <div className="message-actions">
          <SmileOutlined
            className="action-icon"
            // onClick={() => setShowPickerRight((prev) => !prev)}
            onClick={handleShowPickerRight}
          />
          <div
            style={{
              bottom: "37px",
              position: "absolute",
              right: showConversation ? "-265px" : "50px",
              zIndex: "1000",
            }}
          >
            {showPickerRight && (
              <div className="picker-container" ref={pickerRightContainerRef}>
                <div className="tabs">
                  <button
                    className={activeTab === "emoji" ? "active" : ""}
                    onClick={() => setActiveTab("emoji")}
                  >
                    Emoji
                  </button>
                  <button
                    className={activeTab === "gif" ? "active" : ""}
                    onClick={() => setActiveTab("gif")}
                  >
                    GIF
                  </button>
                </div>
                <div className="picker-content">
                  {activeTab === "emoji" ? (
                    <Picker
                      onEmojiClick={onEmojiClick}
                      className="emoji-picker"
                      style={{ width: "310px" }}
                    />
                  ) : (
                    <GifPicker
                      onSelect={setSelectedGif}
                      onImageUpload={handleGifSelect}
                      onClose={() => setShowPickerRight(false)} // Add this line
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          {inputMessage || selectedImage || selectedFile ? (
            <div
              className="send-icon"
              onClick={handleSend}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SendOutlined style={{ fontSize: "20px" }} />
            </div>
          ) : (
            <LikeOutlined
              className="action-icon"
              onClick={() => {
                handleSendMessage(
                  "👍", // Send thumbs up emoji as text
                  null, // No image
                  null, // No file
                  "👍", // Content (same as text)
                  null // No reply
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Modal danh thiếp */}
      <Modal
        title="Gửi danh thiếp"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendContacts}
            disabled={selectedContacts.length === 0}
          >
            Gửi danh thiếp
          </Button>,
        ]}
        width={600} // Kích thước modal như trong hình
      >
        <div className="contact-modal-content">
          {/* Thanh tìm kiếm */}
          <Input
            placeholder="Tìm danh thiếp theo tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 16 }}
            bordered={false}
          />

          {/* Tabs để lọc danh mục */}
          <Tabs
            defaultActiveKey="Khách hàng"
            onChange={(key) => setActiveCategory(key)}
            className="contact-tabs"
          >
            {categories.map((category) => (
              <Tabs.TabPane tab={category.label} key={category.value}>
                <div className="contact-list">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="contact-item">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => onContactSelect(contact.id)}
                      >
                        <Avatar
                          size={32}
                          src={contact.avatar}
                          className="contact-avatar"
                        />
                        <span className="contact-name">{contact.name}</span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </Modal>
    </div>
  );
};

export default MessageInput;
