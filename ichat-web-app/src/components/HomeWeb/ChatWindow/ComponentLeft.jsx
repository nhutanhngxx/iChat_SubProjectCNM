import React, { useState, useEffect } from "react";
import {
  Layout,
  List,
  Avatar,
  Badge,
  Row,
  Col,
  Menu,
  Dropdown,
  Tabs,
  Popover,
  Radio,
  Checkbox,
  Button,
} from "antd";
import {
  VideoCameraOutlined,
  PhoneOutlined,
  NotificationOutlined,
  DownOutlined,
  PushpinOutlined,
  MoreOutlined,
  MutedOutlined
} from "@ant-design/icons";
import { MdMoreHoriz } from "react-icons/md";
import "./ComponentLeft.css";

import SearchBar from "../Common/SearchBar";
import ComponentLeftSearch from "./ComponentLeftSearch";

import MenuMdMoreHoriz from "./MenuMdMoreHoriz";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/vi";
import { useDispatch } from 'react-redux';
import { getUserFriends } from '../../../redux/slices/friendSlice'; // Import the getUserFriends action

const { TabPane } = Tabs;



// Danh sách các danh mục với màu sắc tương ứng
const categories = [
  { label: "Khách hàng", value: "Khách hàng", color: "red" },
  { label: "Gia đình", value: "Gia đình", color: "pink" },
  { label: "Cộng việc", value: "Cộng việc", color: "orange" },
  { label: "Bạn bè", value: "Bạn bè", color: "yellow" },
  { label: "Trả lời sau", value: "Tra lời sau", color: "green" },
  { label: "Đồng nghiệp", value: "Đồng nghiệp", color: "blue" },
  {
    label: "Tin nhắn tư nguyện là",
    value: "Tin nhắn tư nguyện là",
    color: "black",
  },
];

// Component HeaderTabs: Hiển thị các tab và dropdown menu
const HeaderTabs = ({
  menu,
  filterContent,
  filteredChatList,
  onSelectUser,
}) => (
  <div className="chat-list">
    <div className="chat-tabs-container">
      <Tabs
        defaultActiveKey="1"
        tabBarStyle={{ margin: "0px 0px 4px 0px", padding: "0 8px" }}
        style={{ fontWeight: "bold" }}
        className="custom-tabs"
      >
        <TabPane tab="Ưu tiên" key="1" className="custom-tab-pane">
          <ChatList
            filteredChatList={filteredChatList}
            onSelectUser={onSelectUser}
          />
        </TabPane>
        <TabPane tab="Khác" key="2" className="custom-tab-pane">
          Nội dung của tab Khác
        </TabPane>
      </Tabs>
      <div className="tab-actions">
        <Dropdown trigger={["click"]}>
          <a className="category-dropdown" onClick={(e) => e.preventDefault()}>
            Phân loại <DownOutlined />
          </a>
        </Dropdown>

        <Dropdown trigger={["click"]}>
          <a className="more-options" onClick={(e) => e.preventDefault()}>
            <MoreOutlined />
          </a>
        </Dropdown>
      </div>
    </div>
  </div>
);

//   // Tính thời gian từ timestamp
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("vi"); // đặt ngôn ngữ
// Component ChatItem: Render từng mục trong danh sách chat
const ChatItem = ({ item, onSelectUser, onPin, currentUserId }) => {
  const [isClicked, setIsClicked] = useState(false);
  console.log("Item from ChatItem: ", item);
  console.log("Current User ID: ", currentUserId);



  // Check if message is read by current user
  const isUnread = () => {
    // If the message is from the current user, don't mark as unread
    if (item.isLastMessageFromMe) {
      return false;
    }

    // Check if user has read the message (user ID is in read_by array)
    return !item.read_by?.includes(currentUserId);
  };

  const formatTime = (timestamp) => {
    const now = dayjs();
    const messageTime = dayjs(timestamp);

    const diffInSeconds = now.diff(messageTime, "second");
    const diffInMinutes = now.diff(messageTime, "minute");
    const diffInHours = now.diff(messageTime, "hour");
    const diffInDays = now.diff(messageTime, "day");

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays <= 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return messageTime.format("D/M/YY");
    }
  };

  const handleOnSelectUser = (user) => {
    onSelectUser(user);
    setIsClicked(true);
  };

  // Generate last message text with styling
  const generateLastMessageText = (item) => {
    // Determine prefix (sender)
    const prefix = item.isLastMessageFromMe === true
      ? "Bạn: "
      : (item.chat_type === "group" ? `${item.sender_name || ""}: ` : `${item.name}: `);

    // Determine message content
    let content = "";
    if (item.type === "image") content = "Đã gửi một ảnh";
    else if (item.type === "file") content = "Đã gửi một tệp tin";
    else if (item.type === "video") content = "Đã gửi một video";
    else if (item.type === "audio") content = "Đã gửi một audio";
    else if (item.originalMessage?.length > 30) content = item.originalMessage.slice(0, 30) + "...";
    else content = item.originalMessage || item.lastMessage || "Chưa có tin nhắn";

    return `${prefix}${content}`;
  };

  // Determine if the message should be displayed in bold
  const messageUnread = isUnread();

  return (
    <List.Item
      key={item.id}
      className="chat-item"
      onClick={() => handleOnSelectUser(item)}
    >
      <div className="avatar-container">
        <Avatar size={48} src={item.avatar_path} />
      </div>
      <div className="chat-info">
        <Row justify="space-between">
          <Col>
            <span className={`chat-name ${messageUnread ? "bold-text" : ""}`}>
              {item.name}
            </span>
          </Col>

          <Col>
            <div className="time-and-more-container" onClick={(e) => e.stopPropagation()}>
              <Dropdown overlay={<MenuMdMoreHoriz onPin={() => onPin(item.id)} />} trigger={["click"]}>
                <MdMoreHoriz className="md-more-horiz-icon" />
              </Dropdown>
              <span className="chat-time">{formatTime(item.timestamp)}</span>
            </div>
          </Col>
        </Row>
        <Row
          justify="space-between"
          align="middle"
          style={{ width: "100%", display: "inline-flex" }}
        >
          <Col>
            <span className={`last-message ${item.type || "text"} ${messageUnread ? "bold-text" : ""}`}>
              {item.type === "video" && <VideoCameraOutlined />}
              {item.type === "audio" && <MutedOutlined />}
              {item.type === "notification" && <NotificationOutlined />}
              {!item.originalMessage && !item.lastMessage
                ? "Chưa có tin nhắn"
                : generateLastMessageText(item)
              }
            </span>
          </Col>
          <Col>
            <Badge count={item.unread || 0} offset={[0, 0]} />
            {item.isPinned && <PushpinOutlined style={{ marginLeft: 5 }} />}
          </Col>
        </Row>
      </div>
    </List.Item>
  );
};

// Component ChatList: Hiển thị danh sách các ChatItem
const ChatList = ({ filteredChatList, onSelectUser, onPin, currentUserId }) => (
  <List
    itemLayout="horizontal"
    dataSource={filteredChatList}
    renderItem={(item) => <ChatItem item={item} onSelectUser={onSelectUser} onPin={onPin} currentUserId={currentUserId} />}
    style={{ overflowY: "scroll", maxHeight: "86vh", scrollbarWidth: "none" }} // Thay đổi chiều cao của danh sách
  />
);

// Component chính: ComponentLeft
const ComponentLeft = ({ userList, setUserList, onSelectUser, user }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("priority");
  const [searchText] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [friendsList, setFriendsList] = useState([]); // State to store the user's friends

  // Hàm để lấy danh sách bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (user && user.id) {
          const result = await dispatch(getUserFriends(user.id)).unwrap();
          if (result && result.friends) {
            // Extract friend IDs for easy comparison
            const friendIds = result.friends.map(friend => friend.id);
            setFriendsList(friendIds);
          }
        }
      } catch (error) {
        console.error("Error fetching friends list:", error);
      }
    };

    fetchFriends();
  }, [dispatch, user]);

  // Lọc danh sách chat dựa trên searchText
  const filteredChatList = userList.filter((chat) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && chat.unread !== 0);
    const matchesCategory =
      categoryFilters.length === 0 || categoryFilters.includes(chat.category);
    return matchesStatus && matchesCategory;
  });

  // Sắp xếp hội thoại: ghim lên trên, sau đó theo thời gian
  const sortedConversations = [...filteredChatList].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp); // Sort by most recent
  });

  // Lọc danh sách bạn bè và không phải bạn bè
  const filteredPriorityList = sortedConversations
    .filter((item) => {
      // Check if this conversation is with a friend
      // For private chats (not groups), check if the other user is in friendsList
      if (item.chat_type === "group") {
        // For groups, always show in priority tab
        return true;
      } else {
        // For private chats, check if the user ID is in the friends list
        const chatPartnerId = item.id;
        return friendsList.includes(chatPartnerId);
      }
    });

  const filteredOtherList = sortedConversations
    .filter((item) => {
      // Show conversations with non-friends in the "Other" tab
      if (item.chat_type === "group") {
        // Groups are always in priority tab
        return false;
      } else {
        // For private chats, check if the user ID is NOT in the friends list
        const chatPartnerId = item.id;
        return !friendsList.includes(chatPartnerId);
      }
    });

  const handlePin = (id) => {
    const updatedList = sortedConversations.map((item) =>
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    setUserList(updatedList);
  };

  // Hàm xử lý khi nhấn vào SearchBar
  const handleFocus = () => {
    setShowInterface(true);
  };

  const handleClose = () => {
    setShowInterface(false);
  };

  const handleMarkAllAsRead = () => {
    const updatedList = userList.map((item) => ({
      ...item,
      unread: 0,
    }));
    setUserList(updatedList);
  };

  // Nội dung của Popover Phân loại
  const filterContent = (
    <div className="filter-popover">
      <p>Theo trạng thái</p>
      <Radio.Group
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <Radio value="all">Tất cả</Radio>
        <Radio value="unread">Chưa đọc</Radio>
      </Radio.Group>
      <p>Theo phân loại</p>
      <Checkbox.Group
        options={categories.map((cat) => ({
          label: (
            <span>
              <span
                className="category-dot"
                style={{ backgroundColor: cat.color }}
              ></span>
              {cat.label}
            </span>
          ),
          value: cat.value,
        }))}
        value={categoryFilters}
        onChange={(checkedValues) => setCategoryFilters(checkedValues)}
      />
      <Button type="link" className="manage-categories">
        Quản lý phân loại
      </Button>
    </div>
  );

  return (
    <div>
      {showInterface ? (
        <ComponentLeftSearch
          onClose={() => setShowInterface(false)}
          userList={userList}
          onSelectUser={onSelectUser}
          user={user}
        />
      ) : (
        <Layout className="chat-sidebar">
          <SearchBar onFocus={() => setShowInterface(true)} onSelectUser={onSelectUser} />
          <div className="conversations-container">
            <div className="classification-conversation-container">
              <div className="tabs-header">
                <button
                  className={`tab-header ${activeTab === "priority" ? "active-tab-header" : ""
                    }`}
                  onClick={() => setActiveTab("priority")}
                >
                  {/* {filteredPriorityList.length > 0 ? `Ưu tiên (${filteredPriorityList.length})` : "Bạn bè"} */}
                  Ưu tiên
                </button>

                <button
                  className={`tab-header ${activeTab === "other" ? "active-tab-header" : ""
                    }`}
                  onClick={() => setActiveTab("other")}
                >
                  {/* {filteredOtherList.length > 0 ? `Không phải bạn bè (${filteredOtherList.length})` : "Không phải bạn bè"} */}
                  Khác
                </button>
              </div>
              <div className="actions-header">
                <Dropdown overlay={filterContent} trigger={["click"]}>
                  <button className="filterButton">
                    Phân loại <DownOutlined size={16} />
                  </button>
                </Dropdown>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="1" onClick={handleMarkAllAsRead}>Đánh dấu đã đọc</Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <button className="moreButton">
                    <MoreOutlined size={16} />
                  </button>
                </Dropdown>
              </div>
            </div>
            <div className="list-conversations-container">
              {activeTab === "priority" ? (
                filteredPriorityList.length > 0 ? (
                  <ChatList
                    filteredChatList={filteredPriorityList}
                    onSelectUser={onSelectUser}
                    onPin={handlePin}
                    currentUserId={user?.id}
                  />
                ) : (
                  <div className="empty-list-message">Không có cuộc trò chuyện nào với bạn bè</div>
                )
              ) : (
                filteredOtherList.length > 0 ? (
                  <ChatList
                    filteredChatList={filteredOtherList}
                    onSelectUser={onSelectUser}
                    onPin={handlePin}
                    currentUserId={user?.id}
                  />
                ) : (
                  <div className="empty-list-message">Không có cuộc trò chuyện nào với người không phải bạn bè</div>
                )
              )}
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
};

export default ComponentLeft;
