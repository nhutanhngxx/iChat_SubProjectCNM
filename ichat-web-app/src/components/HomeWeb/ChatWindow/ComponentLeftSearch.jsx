"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layout,
  List,
  Avatar,
  Tabs,
  Dropdown,
  Button,
  Select,
  Input,
  Menu,
  DatePicker,
  Space,
  Col,
  Row,
  Spin,
  message,
} from "antd";
import {
  CloseOutlined,
  SearchOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileOutlined,
  FileImageOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { MdMoreHoriz } from "react-icons/md";
import "./ComponentLeftSearch.css";

import SearchComponent from "./SearchComponent";
import MenuMdMoreHoriz from "./MenuMdMoreHoriz";
import {
  FaUser,
  FaCalendar,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getUserMessages,
  fetchChatMessages,
  fetchMessages,
  searchMessagesByKeyword
} from '../../../redux/slices/messagesSlice';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const { Content } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Hàm parseDate
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
};

// Hàm formatDate an toàn
const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

// Format bytes helper
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "Không rõ dung lượng";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Component RecentlySearched
const RecentlySearched = ({ filteredRecentlyUser, handleDelete, handleUserSelect }) => (
  <div>
    <div className="title-chat-sidebar">Tìm gần đây</div>
    <Content className="chat-list">
      {filteredRecentlyUser && filteredRecentlyUser.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={filteredRecentlyUser}
          renderItem={(item) => renderItemRecently(item, handleDelete, handleUserSelect)}
          style={{
            maxHeight: '76vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Không có tìm kiếm gần đây
        </div>
      )}
    </Content>
  </div>
);

// Hàm renderItemRecently
const renderItemRecently = (item, handleDelete, handleUserSelect) => (
  <List.Item className="list-item" onClick={() => handleUserSelect(item)}
    style={{ cursor: 'pointer' }}>
    <div className="avatar-container">
      <Avatar size={48} src={item.avatar_path}>
        {item.name ? item.name.charAt(0).toUpperCase() : "?"}
      </Avatar>
    </div>
    <div className="chat-info">
      <span className="chat-name">{item.name}</span>
    </div>
    <div
      className="delete-button"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(item.receiver_id || item.id);
      }}
    >
      <CloseOutlined />
    </div>
  </List.Item>
);

// Hàm renderItemSearch
const renderItemSearch = (item, handleUserSelect) => (
  <List.Item
    className="list-item"
    onClick={() => handleUserSelect(item)}
    style={{ cursor: 'pointer' }}
  >
    <div className="avatar-container">
      <Avatar
        size={48}
        src={item.avatar_path || item.avatar}
      >
        {item.name ? item.name.charAt(0).toUpperCase() : "?"}
      </Avatar>
    </div>
    <div className="chat-info">
      <span className="chat-name">{item.name}</span>
    </div>
    <div className="delete-button">
      <Dropdown overlay={<MenuMdMoreHoriz />} trigger={["click"]}>
        <Button type="text" icon={<MdMoreHoriz size={24} color="#333" />} />
      </Dropdown>
    </div>
  </List.Item>
);

// Component chính
const ComponentLeftSearch = ({ userList, onClose, onSelectChat, user, onSelectUser, onSelectMessage }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get messages and search results from Redux store
  const allMessages = useSelector(state => state.messages.chatMessages);
  const recentReceivers = useSelector(state => state.messages.messages);
  const userMessages = useSelector(state => state.messages.userMessages);
  const loadingStatus = useSelector(state => state.messages.userMessagesStatus);

  // Get search results from Redux store
  const searchResults = useSelector(state => state.messages.searchResults || []);
  const searchStatus = useSelector(state => state.messages.status); // Use status to track search loading

  // State for search
  const [searchText, setSearchText] = useState("");
  const [filteredRecentlyUser, setFilteredRecentlyUser] = useState(userList || []);
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Cache cho thông tin người dùng để không phải fetch nhiều lần
  const [userInfoCache, setUserInfoCache] = useState({});

  // State lưu trữ thông tin người dùng được tìm kiếm
  const [usersLoading, setUsersLoading] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);


  // Load user messages when component mounts
  useEffect(() => {
    if (user?.id) {
      // Always load recent conversations
      dispatch(fetchMessages(user.id));

      // Only search when there's text to search for
      if (searchText.trim()) {
        dispatch(searchMessagesByKeyword({
          keyword: searchText,
          userId: user.id
        }))
          .unwrap()
          .then(messages => {
            if (messages && messages.length > 0) {
              // Extract user IDs to fetch user info (only for unpopulated fields)
              const userIds = new Set();

              messages.forEach(msg => {
                // Only add IDs that are strings (not populated objects)
                if (typeof msg.sender_id === 'string' && msg.sender_id !== user.id) {
                  userIds.add(msg.sender_id);
                }
                if (typeof msg.receiver_id === 'string' &&
                  msg.receiver_id !== user.id &&
                  msg.chat_type !== 'group') {
                  userIds.add(msg.receiver_id);
                }
              });

              // Fetch only users not in cache
              const userIdsToFetch = Array.from(userIds).filter(id => !userInfoCache[id]);

              if (userIdsToFetch.length > 0) {
                fetchUserInfoBatch(userIdsToFetch);
              }
            }
          })
          .catch(error => {
            console.error("Error searching messages:", error);
          });
      }
    }
  }, [dispatch, user?.id, searchText]);
  // Hàm fetch thông tin người dùng theo lô
  const fetchUserInfoBatch = async (userIds) => {
    if (!userIds.length) return;

    setUsersLoading(true);
    try {
      const newCache = { ...userInfoCache };

      await Promise.all(userIds.map(async (userId) => {
        try {
          const response = await fetch(`${REACT_APP_API_URL}/api/users/${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.user) {
              newCache[userId] = {
                full_name: data.user.full_name || "Người dùng",
                avatar_path: data.user.avatar_path,
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching info for user ${userId}:`, error);
        }
      }));

      setUserInfoCache(newCache);
    } catch (error) {
      console.error("Error fetching user information:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Get user info helper (keep as is)
  const getUserInfo = (userId) => {
    if (!userId) return { full_name: "Người dùng không xác định", avatar_path: null };

    // If userId is an object with _id, it's a populated object
    if (typeof userId === 'object' && userId._id) {
      return {
        full_name: userId.full_name || "Người dùng",
        avatar_path: userId.avatar_path
      };
    }

    return userInfoCache[userId] || { full_name: "Đang tải...", avatar_path: null };
  };
  const handleMessageSelect = (messageItem) => {
    const currentUserId = user?.id || user?._id;

    // Xác định ID và thông tin của cuộc trò chuyện
    let chatId;
    let chatPartnerInfo;

    const senderId = typeof messageItem.sender_id === 'object' ?
      messageItem.sender_id._id : messageItem.sender_id;

    const receiverId = typeof messageItem.receiver_id === 'object' ?
      messageItem.receiver_id._id : messageItem.receiver_id;

    if (messageItem.chat_type === 'group') {
      // Nếu là chat nhóm, luôn sử dụng ID và thông tin của nhóm
      chatId = receiverId;

      // Get group info - if receiver_id is populated, use that data
      chatPartnerInfo = typeof messageItem.receiver_id === 'object' ?
        {
          full_name: messageItem.receiver_id.full_name || "Nhóm",
          avatar_path: messageItem.receiver_id.avatar_path,
          chat_type: 'group'
        } :
        {
          ...getUserInfo(receiverId),
          chat_type: 'group'
        };
    } else {
      // Nếu là chat cá nhân, xác định người đối diện
      if (senderId === currentUserId) {
        chatId = receiverId;
        // If receiver_id is populated, use that data directly
        chatPartnerInfo = typeof messageItem.receiver_id === 'object' ?
          {
            full_name: messageItem.receiver_id.full_name,
            avatar_path: messageItem.receiver_id.avatar_path
          } :
          getUserInfo(receiverId);
      } else {
        chatId = senderId;
        // If sender_id is populated, use that data directly
        chatPartnerInfo = typeof messageItem.sender_id === 'object' ?
          {
            full_name: messageItem.sender_id.full_name,
            avatar_path: messageItem.sender_id.avatar_path
          } :
          getUserInfo(senderId);
      }
    }

    message.loading({ content: "Đang tải cuộc trò chuyện...", key: "chatLoading" });

    dispatch(fetchChatMessages({
      senderId: currentUserId,
      receiverId: chatId,
    })).then(() => {
      // Tạo đối tượng trò chuyện đúng định dạng
      const userToSelect = {
        id: chatId,
        name: chatPartnerInfo.full_name || "Cuộc trò chuyện",
        lastMessage: messageItem.content,
        timestamp: messageItem.timestamp,
        avatar_path: chatPartnerInfo.avatar_path,
        // Đảm bảo chat_type được giữ chính xác
        chat_type: messageItem.chat_type || "private",
        receiver_id: chatId,
        originalMessage: messageItem.content,
        message_id: messageItem._id
      };

      // Gọi onSelectUser để chuyển sang cuộc trò chuyện
      if (onSelectUser && typeof onSelectUser === 'function') {
        onSelectUser(userToSelect);
      }

      // Đóng panel tìm kiếm
      if (onClose && typeof onClose === 'function') {
        onClose();
      }

      message.success({ content: "Đã tải cuộc trò chuyện", key: "chatLoading" });
    }).catch((error) => {
      message.error({ content: "Không thể tải tin nhắn. Vui lòng thử lại.", key: "chatLoading" });
      console.error("Error loading chat:", error);
    });
  };
  const extractUserInfo = (userObject, userCache) => {
    // If userObject is an object with _id, it's a populated object from API
    if (userObject && typeof userObject === 'object' && userObject._id) {
      return {
        id: userObject._id,
        full_name: userObject.full_name || "Người dùng không xác định",
        avatar_path: userObject.avatar_path
      };
    }

    // If it's just an ID, use cached info or default
    return userCache[userObject] || {
      full_name: "Người dùng không xác định",
      avatar_path: null
    };
  };
  const renderMessageItem = (message) => {
    // Extract sender and receiver info from either populated objects or cache
    const senderInfo = extractUserInfo(message.sender_id, userInfoCache);
    const receiverInfo = extractUserInfo(message.receiver_id, userInfoCache);

    // Get sender ID, handling both string IDs and object IDs
    const senderId = typeof message.sender_id === 'object' ?
      message.sender_id._id : message.sender_id;

    // Xác định tin nhắn có phải của người dùng hiện tại hay không
    const isSender = senderId === user.id;

    // Xác định tên và avatar hiển thị
    let displayName;
    let displayAvatar;
    let senderName = isSender ? "Bạn" : (senderInfo?.full_name || "Người dùng không xác định");

    if (message.chat_type === 'group') {
      // Với tin nhắn nhóm: hiển thị tên và avatar của nhóm
      displayName = receiverInfo?.full_name || "Nhóm";
      displayAvatar = receiverInfo?.avatar_path;
    } else {
      // Với tin nhắn cá nhân: Nếu người gửi là mình thì hiển thị thông tin người nhận, ngược lại hiển thị thông tin người gửi
      if (isSender) {
        displayName = receiverInfo?.full_name || "Người dùng";
        displayAvatar = receiverInfo?.avatar_path;
      } else {
        displayName = senderInfo?.full_name || "Người dùng";
        displayAvatar = senderInfo?.avatar_path;
      }
    }

    // Format message content preview
    let contentPreview = "";
    if (message.type === "text") {
      const content = message.content || "";
      // Nếu là tin nhắn nhóm, thêm tên người gửi vào nội dung
      if (message.chat_type === 'group') {
        const truncatedContent = content.length > 40
          ? `${content.substring(0, 40)}...`
          : content;
        contentPreview = `${senderName}: ${truncatedContent}`;
      } else {
        contentPreview = content.length > 50
          ? `${content.substring(0, 50)}...`
          : content;
      }
    } else if (message.type === "image") {
      contentPreview = message.chat_type === 'group'
        ? `${senderName}: [Hình ảnh]`
        : "[Hình ảnh]";
    } else if (message.type === "file") {
      // Trích xuất tên file từ đường dẫn
      const fileName = message.content ? decodeURIComponent(message.content.split('/').pop()) : "File";
      contentPreview = message.chat_type === 'group'
        ? `${senderName}: [Tệp: ${fileName}]`
        : `[Tệp: ${fileName}]`;
    } else if (message.type === "video") {
      contentPreview = message.chat_type === 'group'
        ? `${senderName}: [Video]`
        : "[Video]";
    } else if (message.type === "audio") {
      contentPreview = message.chat_type === 'group'
        ? `${senderName}: [Ghi âm]`
        : "[Ghi âm]";
    } else if (message.recall) {
      contentPreview = message.chat_type === 'group'
        ? `${senderName}: Tin nhắn đã bị thu hồi`
        : "Tin nhắn đã bị thu hồi";
    }

    // Format thời gian
    const timestamp = message.timestamp
      ? new Date(message.timestamp).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      : "";

    return (
      <List.Item
        className="list-item"
        id={`search-message-${message._id}`}
        onClick={() => handleMessageSelect(message)}
        style={{ cursor: 'pointer' }}
      >
        <div className="avatar-container">
          <Avatar
            size={48}
            src={displayAvatar}
          >
            {!displayAvatar && displayName ? displayName.charAt(0).toUpperCase() : "?"}
          </Avatar>
        </div>
        <div className="chat-info">
          <Row justify="space-between">
            <Col>
              <span className="chat-name">{displayName}</span>
            </Col>
            <Col>
              <span className="chat-time">{timestamp}</span>
            </Col>
          </Row>
          <Row>
            <span className="chat-message">{contentPreview}</span>
          </Row>
        </div>
      </List.Item>
    );
  };

  // Search function that searches through actual messages
  const searchMessages = useCallback(() => {
    if (!searchText.trim() || !userMessages) return [];

    return userMessages.filter(msg => {
      // Chỉ tìm trong tin nhắn văn bản
      if (msg.type === 'text' && msg.content && typeof msg.content === 'string') {
        return msg.content.toLowerCase().includes(searchText.toLowerCase());
      }
      return false;
    }).slice(0, 20); // Giới hạn 20 kết quả để tăng hiệu suất
  }, [searchText, userMessages]);

  // Function to process files from messages
  const processFileItems = useCallback(() => {
    if (!userMessages) return [];

    return userMessages
      .filter(msg => msg.type === 'file')
      .map(msg => {
        const fileUrl = msg.content;

        // Kiểm tra URL hợp lệ
        const isValidUrl = fileUrl && (
          fileUrl.startsWith('http://') ||
          fileUrl.startsWith('https://') ||
          fileUrl.startsWith('data:')
        );

        // Xử lý đường dẫn để lấy tên file
        let fileName = 'Tệp không xác định';
        let originalName = 'Tệp không xác định';

        if (fileUrl && isValidUrl) {
          try {
            fileName = decodeURIComponent(fileUrl.split('/').pop());

            const parts = fileName.split('-');
            if (parts.length > 2) {
              originalName = parts.slice(2).join('-');
            } else {
              originalName = fileName;
            }
          } catch (error) {
            console.error("Error processing file name:", error);
            originalName = fileName = 'Tệp không xác định';
          }
        } else if (msg.file_name) {
          fileName = originalName = msg.file_name;
        }

        // Xác định loại file từ phần mở rộng
        const fileExt = originalName.split('.').pop()?.toLowerCase() || '';

        let type = 'file';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) type = 'image';
        else if (fileExt === 'pdf') type = 'pdf';
        else if (['doc', 'docx'].includes(fileExt)) type = 'word';
        else if (['xls', 'xlsx'].includes(fileExt)) type = 'excel';
        else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExt)) type = 'video';
        else if (['mp3', 'wav', 'ogg'].includes(fileExt)) type = 'audio';

        // Xác định người gửi có phải là người dùng hiện tại không
        const isSelf = msg.sender_id === user.id;

        // Lấy thông tin đối tác chat
        let chatPartnerId;

        if (msg.chat_type === 'group') {
          // Nếu là nhóm, luôn sử dụng receiver_id của nhóm
          chatPartnerId = msg.receiver_id;
        } else {
          // Nếu là chat cá nhân, xác định người đối diện
          chatPartnerId = isSelf ? msg.receiver_id : msg.sender_id;
        }

        // Hiển thị "Bạn" nếu là tin nhắn của người dùng hiện tại
        const sender = isSelf ? "Bạn" : (getUserInfo(msg.sender_id).full_name || "Không xác định");

        return {
          id: msg._id,
          name: originalName,
          url: isValidUrl ? fileUrl : null,
          type: type,
          sender: sender,
          date: new Date(msg.timestamp).toLocaleDateString('vi-VN'),
          size: msg.file_size ? formatBytes(msg.file_size) : 'Đang tải...',
          message: msg,
          isSelf: isSelf,
          chatPartnerId: chatPartnerId,
          chat_type: msg.chat_type || "private" // Đảm bảo có chat_type
        };
      });
  }, [userMessages, userInfoCache, user?.id]);
  // Thêm useEffect để fetch kích thước file
  useEffect(() => {
    const files = processFileItems();

    // Chỉ xử lý khi có files và files thay đổi
    if (files?.length > 0) {
      const fetchFileSizes = async () => {
        const filesWithSizes = [...files];

        for (let i = 0; i < filesWithSizes.length; i++) {
          const file = filesWithSizes[i];
          if (file.url) {
            try {
              // Gửi HEAD request để lấy kích thước
              const response = await fetch(file.url, { method: 'HEAD' });
              const sizeHeader = response.headers.get('Content-Length');

              if (sizeHeader) {
                file.size = formatBytes(Number(sizeHeader));
              } else {
                file.size = "Không xác định";
              }
            } catch (error) {
              console.error(`Lỗi khi lấy kích thước file ${file.name}:`, error);
              file.size = "Không xác định";
            }
          }
        }

        setProcessedFiles(filesWithSizes);
      };

      fetchFileSizes();
    } else {
      setProcessedFiles([]);
    }
  }, [processFileItems]);
  // Cập nhật renderFileItem để xử lý file không tồn tại
  const renderFileItem = (file) => {
    let icon;
    switch (file.type) {
      case "word":
        icon = <FileWordOutlined style={{ color: "blue", fontSize: "24px" }} />;
        break;
      case "excel":
        icon = <FileExcelOutlined style={{ color: "green", fontSize: "24px" }} />;
        break;
      case "video":
        icon = <PlayCircleOutlined style={{ color: "purple", fontSize: "24px" }} />;
        break;
      case "pdf":
        icon = <FilePdfOutlined style={{ color: "red", fontSize: "24px" }} />;
        break;
      case "image":
        icon = <FileImageOutlined style={{ color: "orange", fontSize: "24px" }} />;
        break;
      case "audio":
        icon = <CustomerServiceOutlined style={{ color: "brown", fontSize: "24px" }} />;
        break;
      default:
        icon = <FileOutlined style={{ fontSize: "24px" }} />;
    }

    return (
      <List.Item
        className="list-item"
        onClick={() => handleMessageSelect(file.message)}
        style={{ cursor: 'pointer' }}
      >
        <div className="avatar-container">
          <div className="file-icon">{icon}</div>
        </div>
        <div className="chat-info">
          <Row justify="space-between">
            <Col>
              <span className="chat-name" title={file.name}>
                {file.name.length > 25 ? file.name.substring(0, 25) + "..." : file.name}
              </span>
            </Col>
            <Col>
              <span className="chat-time">{file.size}</span>
            </Col>
          </Row>
          <Row>
            <span className="chat-message">
              {file.sender} • {file.date}
            </span>
          </Row>
        </div>
      </List.Item>
    );
  };

  // Component MessageList
  const MessageList = ({ filteredSearchMessages }) => (
    <div className="">
      <div className="title-tabpane">
        Tin nhắn ({filteredSearchMessages?.length || 0})
      </div>
      {filteredSearchMessages?.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={filteredSearchMessages}
          renderItem={renderMessageItem}
          style={{
            maxHeight: '76vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
          pagination={{
            pageSize: 20,
            showLessItems: true,
            hideOnSinglePage: true,
          }}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Không tìm thấy tin nhắn phù hợp
        </div>
      )}
    </div>
  );

  // Component FileList
  const FileList = ({ filteredFiles }) => (
    <div className="">
      <div className="title-tabpane">
        File ({filteredFiles?.length || 0})
      </div>
      {filteredFiles?.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={filteredFiles}
          renderItem={renderFileItem}
          style={{
            maxHeight: '76vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Không tìm thấy file phù hợp
        </div>
      )}
    </div>
  );

  // Component MessageFilter
  const MessageFilter = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isTimeOptionsOpen, setIsTimeOptionsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [dateRange, setDateRange] = useState({ from: null, to: null });

    // Quick time options
    const timeOptions = [
      { label: "7 ngày trước", value: 7 },
      { label: "30 ngày trước", value: 30 },
      { label: "3 tháng trước", value: 90 },
    ];

    // Lấy danh sách người dùng từ tin nhắn và cache
    const usersFromMessages = useCallback(() => {
      if (!userMessages) return [];

      const uniqueUsers = new Map();

      // Dùng thông tin từ cache để tạo danh sách người dùng
      Object.entries(userInfoCache).forEach(([userId, userInfo]) => {
        if (userId !== user.id) {
          uniqueUsers.set(userId, {
            id: userId,
            name: userInfo.full_name || "Người dùng",
            avatar: userInfo.avatar_path
          });
        }
      });

      return Array.from(uniqueUsers.values());
    }, [userMessages, userInfoCache, user?.id]);

    const filteredUsers = usersFromMessages().filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const clearDateFilter = (e) => {
      e.stopPropagation();
      setDateRange({ from: null, to: null });
    };

    const handleUserSelect = (user) => {
      setSelectedUser(user);
      setIsUserDropdownOpen(false);
      setSearchQuery("");
    };

    const clearUserFilter = (e) => {
      e.stopPropagation();
      setSelectedUser(null);
    };

    return (
      <div className="filter-messages-container">
        {/* Filter section */}
        <div className="filter-messages-section">
          <span className="filter-label">Lọc theo:</span>

          {/* User dropdown */}
          <div className="filter-user-dropdown">
            <button
              style={{ border: 'none' }}
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              {selectedUser ? (
                <div className="filter-user-selected">
                  <FaUser className="filter-user-icon" />
                  <div className="filter-user-info">
                    <span className="filter-user-name">{selectedUser.name}</span>
                    <button
                      onClick={clearUserFilter}
                      className="filter-user-clear"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="filter-user-default">
                  <FaUser className="filter-user-icon" />
                  <span>Người gửi</span>
                  <FaChevronDown className="filter-user-chevron" />
                </div>
              )}
            </button>

            {isUserDropdownOpen && (
              <div className="filter-user-dropdown-menu">
                <div className="filter-user-search">
                  <FaSearch className="filter-user-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-user-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        className="filter-user-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="filter-user-avatar">
                          <Avatar src={user.avatar} size={24}>
                            {user.name ? user.name.charAt(0) : "?"}
                          </Avatar>
                        </div>
                        <span className="filter-user-item-name">{user.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="filter-user-no-results">
                      <p>Không tìm thấy kết quả</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date dropdown */}
          <div className="filter-date-dropdown">
            <button
              style={{ border: 'none' }}
              onClick={() => {
                setIsDateDropdownOpen(!isDateDropdownOpen);
                setIsTimeOptionsOpen(false);
              }}
            >
              {dateRange.from ? (
                <div className="filter-date-selected">
                  <FaCalendar className="filter-date-icon" />
                  <span className="filter-date-range">
                    {`${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`}
                  </span>
                  <button onClick={clearDateFilter} className="filter-date-clear">
                    ×
                  </button>
                </div>
              ) : (
                <div className="filter-date-default">
                  <FaCalendar className="filter-date-icon" />
                  <span>Ngày gửi</span>
                  <FaChevronDown className="filter-date-chevron" />
                </div>
              )}
            </button>

            {isDateDropdownOpen && (
              <div className="filter-date-dropdown-menu">
                {/* Quick time suggestions */}
                <div className="filter-date-suggestions">
                  <div
                    className="filter-date-suggestions-header"
                    onClick={() => setIsTimeOptionsOpen(!isTimeOptionsOpen)}
                  >
                    <h3>Gợi ý thời gian</h3>
                    <FaChevronRight className="filter-date-suggestions-chevron" />
                  </div>
                </div>

                {/* Time options dropdown */}
                {isTimeOptionsOpen && (
                  <div className="filter-time-options">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        className="filter-time-option"
                        onClick={() => {
                          const to = new Date();
                          const from = new Date();
                          from.setDate(from.getDate() - option.value);
                          setDateRange({ from, to });
                          setIsTimeOptionsOpen(false);
                          setIsDateDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Date range picker */}
                <div className="filter-date-picker">
                  <h3>Chọn khoảng thời gian</h3>
                  <div className="filter-date-inputs">
                    <div className="filter-date-input">
                      <DatePicker
                        selected={dateRange.from}
                        onChange={(date) =>
                          setDateRange({ ...dateRange, from: date })
                        }
                        placeholderText="Từ ngày"
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                    <div className="filter-date-input">
                      <DatePicker
                        selected={dateRange.to}
                        onChange={(date) =>
                          setDateRange({ ...dateRange, to: date })
                        }
                        placeholderText="Đến ngày"
                        dateFormat="dd/MM/yyyy"
                        minDate={dateRange.from}
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="filter-date-actions">
                  <button
                    className="filter-date-cancel"
                    onClick={() => {
                      setIsDateDropdownOpen(false);
                      setIsTimeOptionsOpen(false);
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="filter-date-confirm"
                    onClick={() => {
                      setIsDateDropdownOpen(false);
                      setIsTimeOptionsOpen(false);
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component FileFilter
  const FileFilter = ({
    selectedType,
    setSelectedType,
    dateRange,
    setDateRange,
  }) => {
    // State quản lý dropdown
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isTimeOptionsOpen, setIsTimeOptionsOpen] = useState(false);

    // Options lọc nhanh
    const timeOptions = [
      { label: "7 ngày trước", value: 7 },
      { label: "30 ngày trước", value: 30 },
      { label: "3 tháng trước", value: 90 },
    ];

    // Hàm clear bộ lọc ngày
    const clearDateFilter = (e) => {
      e.stopPropagation();
      setDateRange({ from: null, to: null });
    };

    return (
      <div className="filter-container">
        <span className="filter-label">Lọc theo:</span>
        <Select
          defaultValue="all"
          value={selectedType}
          onChange={(value) => setSelectedType(value)}
          style={{ width: 120, marginRight: 10, borderRadius: 4, border: "none" }}
        >
          <Option value="all">Tất cả</Option>
          <Option value="word">Word</Option>
          <Option value="pdf">PDF</Option>
          <Option value="excel">Excel</Option>
          <Option value="video">Video</Option>
          <Option value="image">Hình ảnh</Option>
          <Option value="audio">Âm thanh</Option>
        </Select>

        {/* Date dropdown */}
        <div className="filter-date-dropdown">
          <button
            style={{ border: 'none' }}
            onClick={() => {
              setIsDateDropdownOpen(!isDateDropdownOpen);
              setIsTimeOptionsOpen(false);
            }}
          >
            {dateRange.from ? (
              <div className="filter-date-selected">
                <FaCalendar className="filter-date-icon" />
                <span className="filter-date-range">
                  {`${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`}
                </span>
                <button onClick={clearDateFilter} className="filter-date-clear">
                  ×
                </button>
              </div>
            ) : (
              <div className="filter-date-default">
                <FaCalendar className="filter-date-icon" />
                <span>Ngày gửi</span>
                <FaChevronDown className="filter-date-chevron" />
              </div>
            )}
          </button>

          {isDateDropdownOpen && (
            <div className="filter-date-dropdown-menu">
              {/* Quick time suggestions */}
              <div className="filter-date-suggestions">
                <div
                  className="filter-date-suggestions-header"
                  onClick={() => setIsTimeOptionsOpen(!isTimeOptionsOpen)}
                >
                  <h3>Gợi ý thời gian</h3>
                  <FaChevronRight className="filter-date-suggestions-chevron" />
                </div>
              </div>

              {/* Time options dropdown */}
              {isTimeOptionsOpen && (
                <div className="filter-time-options">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      className="filter-time-option"
                      onClick={() => {
                        const to = new Date();
                        const from = new Date();
                        from.setDate(from.getDate() - option.value);
                        setDateRange({ from, to });
                        setIsTimeOptionsOpen(false);
                        setIsDateDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Date range picker */}
              <div className="filter-date-picker">
                <h3>Chọn khoảng thời gian</h3>
                <div className="filter-date-inputs">
                  <div className="filter-date-input">
                    <DatePicker
                      selected={dateRange.from}
                      onChange={(date) =>
                        setDateRange({ ...dateRange, from: date })
                      }
                      placeholderText="Từ ngày"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div className="filter-date-input">
                    <DatePicker
                      selected={dateRange.to}
                      onChange={(date) =>
                        setDateRange({ ...dateRange, to: date })
                      }
                      placeholderText="Đến ngày"
                      dateFormat="dd/MM/yyyy"
                      minDate={dateRange.from}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="filter-date-actions">
                <button
                  className="filter-date-cancel"
                  onClick={() => {
                    setIsDateDropdownOpen(false);
                    setIsTimeOptionsOpen(false);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="filter-date-confirm"
                  onClick={() => {
                    setIsDateDropdownOpen(false);
                    setIsTimeOptionsOpen(false);
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component SearchResults
  const SearchResults = ({
    filteredSearchUser,
    filteredFiles,
    selectedType,
    setSelectedType,
    dateRange,
    setDateRange,
  }) => (
    <Tabs
      defaultActiveKey="1"
      tabBarStyle={{ margin: "0px 0px 4px 0px", padding: "0 20px" }}
    >
      <TabPane tab={<strong>Tất cả</strong>} key="1">
        <div className="search-results-tabpane">
          {filteredSearchUser?.length > 0 && (
            <>
              <div className="title-tabpane">
                Liên hệ ({filteredSearchUser.length})
              </div>
              <List
                itemLayout="horizontal"
                dataSource={filteredSearchUser}
                renderItem={(item) => renderItemSearch(item, handleUserSelect)}
                style={{
                  maxHeight: '76vh',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                }}
              />
            </>
          )}

          {searchResults?.length > 0 && (
            <MessageList filteredSearchMessages={searchResults.filter(msg => msg.type === 'text')} />
          )}

          {filteredFiles?.length > 0 && (
            <FileList filteredFiles={filteredFiles} />
          )}

          {!filteredSearchUser?.length && !searchResults?.length && !filteredFiles?.length && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              Không tìm thấy kết quả phù hợp
            </div>
          )}
        </div>
      </TabPane>

      <TabPane tab={<strong>Liên hệ</strong>} key="2">
        <div className="title-tabpane">
          Liên hệ ({filteredSearchUser?.length || 0})
        </div>
        {filteredSearchUser?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={filteredSearchUser}
            renderItem={(item) => renderItemSearch(item, handleUserSelect)}
            style={{
              maxHeight: '76vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            Không tìm thấy liên hệ phù hợp
          </div>
        )}
      </TabPane>

      <TabPane tab={<strong>Tin nhắn</strong>} key="3">
        <MessageFilter />
        <MessageList
          filteredSearchMessages={searchResults.filter(msg => msg.type === 'text')}
        />
      </TabPane>

      <TabPane tab={<strong>File</strong>} key="4">
        <FileFilter
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <FileList filteredFiles={filteredFiles} />
      </TabPane>
    </Tabs>
  );

  // Handler for deleting recent search
  const handleDelete = (receiverId) => {
    setFilteredRecentlyUser(
      filteredRecentlyUser.filter((item) => item.receiver_id !== receiverId && item.id !== receiverId)
    );
  };

  const handleUserSelect = (selectedItem) => {
    const currentUserId = user?.id || user?._id;
    const targetId = selectedItem.receiver_id || selectedItem.id;

    message.loading({ content: "Đang tải cuộc trò chuyện...", key: "loadChat" });

    // Fetch trước tin nhắn để đảm bảo có dữ liệu khi hiển thị cuộc trò chuyện
    dispatch(fetchChatMessages({
      senderId: currentUserId,
      receiverId: targetId
    })).then(() => {
      // Format lại đối tượng người dùng theo cấu trúc mà ChatWindow.handleSelectUser mong đợi
      const userToSelect = {
        id: targetId,
        name: selectedItem.name || selectedItem.full_name,
        lastMessage: selectedItem.lastMessage || "",
        timestamp: selectedItem.timestamp || new Date(),
        avatar_path: selectedItem.avatar_path || selectedItem.avatar,
        receiver_id: targetId, // Đảm bảo luôn có trường này
        chat_type: selectedItem.chat_type || "private",
        // Các trường khác nếu cần
        originalMessage: selectedItem.originalMessage || "",
        unread: selectedItem.unread || 0,
        type: selectedItem.type || "text",
      };

      console.log("Selected user:", userToSelect);

      // Gọi hàm callback từ parent component
      if (onSelectUser && typeof onSelectUser === 'function') {
        onSelectUser(userToSelect);
      }

      // Đóng panel tìm kiếm
      if (onClose && typeof onClose === 'function') {
        onClose();
      }

      message.success({ content: "Đã tải cuộc trò chuyện", key: "loadChat", duration: 1 });
    }).catch(error => {
      console.error("Error selecting chat:", error);
      message.error({ content: "Không thể tải cuộc trò chuyện", key: "loadChat" });
    });
  };

  // Filter files based on type and search
  const getFilteredFiles = useCallback(() => {
    // Start with files from search results if searching
    const filesToFilter = searchText.trim()
      ? searchResults.filter(msg => msg.type === 'file')
      : (userMessages || []).filter(msg => msg.type === 'file');

    // Process these files
    const processedFileList = filesToFilter.map(msg => {
      const fileUrl = msg.content;

      // URL validation and name extraction (keep existing logic)
      const isValidUrl = fileUrl && (
        fileUrl.startsWith('http://') ||
        fileUrl.startsWith('https://') ||
        fileUrl.startsWith('data:')
      );

      let fileName = 'Tệp không xác định';
      let originalName = 'Tệp không xác định';

      if (fileUrl && isValidUrl) {
        try {
          fileName = decodeURIComponent(fileUrl.split('/').pop());

          const parts = fileName.split('-');
          if (parts.length > 2) {
            originalName = parts.slice(2).join('-');
          } else {
            originalName = fileName;
          }
        } catch (error) {
          console.error("Error processing file name:", error);
          originalName = fileName = 'Tệp không xác định';
        }
      } else if (msg.file_name) {
        fileName = originalName = msg.file_name;
      }

      // File type detection
      const fileExt = originalName.split('.').pop()?.toLowerCase() || '';

      let type = 'file';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) type = 'image';
      else if (fileExt === 'pdf') type = 'pdf';
      else if (['doc', 'docx'].includes(fileExt)) type = 'word';
      else if (['xls', 'xlsx'].includes(fileExt)) type = 'excel';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExt)) type = 'video';
      else if (['mp3', 'wav', 'ogg'].includes(fileExt)) type = 'audio';

      // Determine chat partner and sender info
      const isSelf = msg.sender_id === user.id;
      let chatPartnerId;

      if (msg.chat_type === 'group') {
        chatPartnerId = msg.receiver_id;
      } else {
        chatPartnerId = isSelf ? msg.receiver_id : msg.sender_id;
      }

      const sender = isSelf ? "Bạn" : (getUserInfo(msg.sender_id).full_name || "Không xác định");

      return {
        id: msg._id,
        name: originalName,
        url: isValidUrl ? fileUrl : null,
        type: type,
        sender: sender,
        date: new Date(msg.timestamp).toLocaleDateString('vi-VN'),
        size: msg.file_size ? formatBytes(msg.file_size) : 'Đang tải...',
        message: msg,
        isSelf: isSelf,
        chatPartnerId: chatPartnerId,
        chat_type: msg.chat_type || "private"
      };
    });

    // Apply additional filters
    return processedFileList.filter(file => {
      // Type filter
      if (selectedType !== "all" && file.type !== selectedType) return false;

      // Date filter
      if (dateRange.from && dateRange.to) {
        const fileDate = new Date(file.message.timestamp);
        if (fileDate < dateRange.from || fileDate > dateRange.to) return false;
      }

      return true;
    });
  }, [searchResults, userMessages, searchText, selectedType, dateRange, userInfoCache, user?.id]);

  return (
    <div className="chat-sidebar">
      <SearchComponent
        searchText={searchText}
        setSearchText={setSearchText}
        onClose={onClose}
        onSelectUser={onSelectUser}
        user={user}
      />

      {(searchStatus === "loading" || loadingStatus === "loading" || usersLoading) ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin tip="Đang tìm kiếm..." />
        </div>
      ) : searchText === "" ? (
        <RecentlySearched
          filteredRecentlyUser={filteredRecentlyUser}
          handleDelete={handleDelete}
          handleUserSelect={handleUserSelect}
        />
      ) : (
        <SearchResults
          filteredSearchUser={recentReceivers?.filter(user =>
            user.name?.toLowerCase().includes(searchText.toLowerCase())
          ) || []}
          filteredFiles={getFilteredFiles()}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}
    </div>
  );
};


export default ComponentLeftSearch;