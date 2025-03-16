import React, { useState } from "react";
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
  MoreOutlined,
} from "@ant-design/icons";
import { MdMoreHoriz } from "react-icons/md";
import "./ComponentLeft.css";

import SearchBar from "../Common/SearchBar";
import ComponentLeftSearch from "./ComponentLeftSearch";

import MenuMdMoreHoriz from "./MenuMdMoreHoriz";

const { TabPane } = Tabs;

// Danh sách các danh mục với màu sắc tương ứng
const categories = [
  { label: "Khách hàng", value: "Khách hàng", color: "red" },
  { label: "Gia đình", value: "Gia đình", color: "pink" },
  { label: "Cộng việc", value: "Cộng việc", color: "orange" },
  { label: "Bạn bè", value: "Bạn bè", color: "yellow" },
  { label: "Tra lời sau", value: "Tra lời sau", color: "green" },
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

// Component ChatItem: Render từng mục trong danh sách chat
const ChatItem = ({ item, onSelectUser }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <List.Item className="chat-item" onClick={() => onSelectUser(item)}>
      <div className="avatar-container">
        <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
      </div>
      <div className="chat-info">
        <Row justify="space-between">
          <Col>
            <span className="chat-name">{item.name}</span>
          </Col>
          <Col>
            <div className="time-and-more-container">
              <Dropdown overlay={<MenuMdMoreHoriz />} trigger={["click"]}>
                <MdMoreHoriz className="md-more-horiz-icon" />
              </Dropdown>
              <span className="chat-time">{item.time}</span>
            </div>
          </Col>
        </Row>
        <Row
          justify="space-between"
          align="middle"
          style={{ width: "100%", display: "inline-flex" }}
        >
          <Col>
            <span className={`last-message ${item.type || "text"}`}>
              {item.type === "video" && <VideoCameraOutlined />}
              {item.type === "audio" && <PhoneOutlined />}
              {item.type === "notification" && <NotificationOutlined />}
              {(item.lastMessage?.length > 10
                ? `${item.lastMessage.slice(0, 30)}...`
                : item.lastMessage) || "Tin nhắn trống"}
            </span>
          </Col>
          <Col>
            <Badge count={item.unread || 0} offset={[0, 0]} />
          </Col>
        </Row>
      </div>
    </List.Item>
  );
};

// Component ChatList: Hiển thị danh sách các ChatItem
const ChatList = ({ filteredChatList, onSelectUser }) => (
  <List
    itemLayout="horizontal"
    dataSource={filteredChatList}
    renderItem={(item) => <ChatItem item={item} onSelectUser={onSelectUser} />}
  />
);

// Component chính: ComponentLeft
const ComponentLeft = ({ userList, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState("priority");
  const [searchText] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState([]);

  // Hàm xử lý khi nhấn vào SearchBar
  const handleFocus = () => {
    setShowInterface(true);
  };

  const handleClose = () => {
    setShowInterface(false);
  };

  // Lọc danh sách chat dựa trên searchText
  const filteredChatList = userList.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && chat.status === "unread");
    const matchesCategory =
      categoryFilters.length === 0 || categoryFilters.includes(chat.category);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Menu cho Dropdown
  const menu = <Menu items={[{ key: "1", label: "Đánh dấu đã đọc" }]} />;

  // Nội dung của Popover
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
        <ComponentLeftSearch onClose={handleClose} userList={userList} />
      ) : (
        <Layout className="chat-sidebar">
          <SearchBar onFocus={handleFocus} />
          {/* <HeaderTabs
            menu={menu}
            filterContent={filterContent}
            filteredChatList={filteredChatList}
            onSelectUser={onSelectUser}
          /> */}
          <div className="conversations-container">
            <div className="classification-conversation-container">
              <div className="tabs-header">
                <button
                  className={`tab-header ${
                    activeTab === "priority" ? "active-tab-header" : ""
                  }`}
                  onClick={() => setActiveTab("priority")}
                >
                  Ưu tiên
                </button>

                <button
                  className={`tab-header ${
                    activeTab === "other" ? "active-tab-header" : ""
                  }`}
                  onClick={() => setActiveTab("other")}
                >
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
                      <Menu.Item key="1">Đánh dấu đã đọc</Menu.Item>
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
              <ChatList
                filteredChatList={filteredChatList}
                onSelectUser={onSelectUser}
              />
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
};

export default ComponentLeft;
