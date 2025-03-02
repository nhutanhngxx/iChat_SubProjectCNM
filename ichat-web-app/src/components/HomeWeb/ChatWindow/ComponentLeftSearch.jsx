import React, { useState } from "react";
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
} from "antd";
import {
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FileExcelOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { MdMoreHoriz } from "react-icons/md";
import "./ComponentLeftSearch.css";

import SearchComponent from "./SearchComponent";
import MenuMdMoreHoriz from "./MenuMdMoreHoriz";

const { Content } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dữ liệu giả lập
const users = [
  {
    id: 1,
    name: "Lê Thị Quỳnh Như",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  { id: 2, name: "Vh Nam", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Nguyễn Duy Khoa", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Ngọc Điểm", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 5, name: "Anh Luân", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 6, name: "Cloud của tôi", avatar: "https://i.pravatar.cc/150?img=6" },
];

const contacts = [
  {
    id: 1,
    name: "Nhà thuốc FPT Long Châu",
    avatar: "https://via.placeholder.com/40",
    type: "business",
  },
  {
    id: 2,
    name: "FSoft Tour (7h00 ngày 22/0...)",
    avatar: "https://via.placeholder.com/40",
    type: "group",
  },
  {
    id: 3,
    name: "✨ CHAT HACK MAP LIÊN QUÂN ✨",
    avatar: "https://via.placeholder.com/40",
    type: "gaming",
  },
  {
    id: 4,
    name: "HACK LQ FREE",
    avatar: "https://via.placeholder.com/40",
    type: "gaming",
  },
  {
    id: 5,
    name: "Cloud của tôi",
    avatar: "https://via.placeholder.com/40",
    subtitle: "Tên cũ: Truyền File",
    type: "cloud",
  },
];

const messages = [
  {
    id: 1,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content: "@Ngo Trung Dung sai thì về làm lại tiếp kk",
    avatar: "https://i.pravatar.cc/40?img=1",
    unread: 5,
  },
  {
    id: 2,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "@Ngo Trung Dung khảo sát để có dữ liệu từ dữ liệu đó mới phân tích...",
    avatar: "https://i.pravatar.cc/40?img=2",
    unread: 5,
  },
  {
    id: 3,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "Ngo Trung Dung: vậy thì làm khảo sát với phân tích dữ liệu có ý nghĩa gì nữa",
    avatar: "https://i.pravatar.cc/40?img=3",
    unread: 5,
  },
  {
    id: 4,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "Bạn: chân dung khách hàng là khách hàng mình muốn hướng tới, nếu chung...",
    avatar: "https://i.pravatar.cc/40?img=4",
    unread: 5,
  },
];

const files = [
  {
    id: 1,
    name: "DS_SV_Tham_du_Hoi_thao_chia_se_...",
    type: "excel",
    size: "22.89 KB",
    sender: "Nguyen Thi Hanh",
    date: "07/01/2025",
  },
  {
    id: 2,
    name: "DJI_2024092921100_0574.D.MP4",
    type: "video",
    size: "373.43 MB",
    sender: "Thanh Canh",
    date: "30/09/2024",
  },
  {
    id: 3,
    name: "Pháp luật đại cương.pdf",
    type: "pdf",
    size: "93.15 MB",
    sender: "Unknown",
    date: "25/09/2024",
  },
  {
    id: 4,
    name: "Giáo trình pháp luật đại cương –...",
    type: "pdf",
    size: "18.53 MB",
    sender: "Unknown",
    date: "25/09/2024",
  },
];

// Hàm parseDate
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
};

// Component RecentlySearched
const RecentlySearched = ({ filteredRecentlyUser, handleDelete }) => (
  <div>
    <div className="title-chat-sidebar">Tìm gần đây</div>
    <Content className="chat-list">
      <List
        itemLayout="horizontal"
        dataSource={filteredRecentlyUser}
        renderItem={(item) => renderItemRecently(item, handleDelete)}
      />
    </Content>
  </div>
);

// Component SearchResults
const SearchResults = ({
  filteredSearchUser,
  messages,
  filteredFiles,
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  dropdownOpen,
  handleDropdownVisibleChange,
  userMenu,
  dateMenu,
  fileDateMenu,
}) => (
  <Content className="chat-list">
    <Tabs
      defaultActiveKey="1"
      tabBarStyle={{ margin: "0px 0px 4px 0px", padding: "0 20px" }}
      style={{ fontWeight: "bold" }}
    >
      <TabPane tab="Tất cả" key="1">
        <div className="title-tabpane">
          Liên hệ ({filteredSearchUser.length})
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredSearchUser}
          renderItem={renderItemSearch}
        />
        <MessageList messages={messages} filteredSearchMessages={messages} />
        <FileList filteredFiles={filteredFiles} />
      </TabPane>
      <TabPane tab="Liên hệ" key="2">
        <div className="title-tabpane">
          Cá nhân ({filteredSearchUser.length})
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredSearchUser}
          renderItem={renderItemSearch}
        />
      </TabPane>
      <TabPane tab="Tin nhắn" key="3">
        <MessageFilter
          userMenu={userMenu}
          dateMenu={dateMenu}
          dropdownOpen={dropdownOpen}
          handleDropdownVisibleChange={handleDropdownVisibleChange}
        />
        <MessageList messages={messages} filteredSearchMessages={messages} />
      </TabPane>
      <TabPane tab="File" key="4">
        <FileFilter
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          fileDateMenu={fileDateMenu}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <FileList filteredFiles={filteredFiles} />
      </TabPane>
    </Tabs>
  </Content>
);

// Component MessageFilter
const MessageFilter = ({
  userMenu,
  dateMenu,
  dropdownOpen,
  handleDropdownVisibleChange,
}) => (
  <div className="filter-container">
    <span className="filter-item">Lọc theo:</span>
    <Dropdown
      overlay={userMenu}
      trigger={["click"]}
      open={dropdownOpen}
      onVisibleChange={handleDropdownVisibleChange}
    >
      <Select
        defaultValue="Người gửi"
        suffixIcon={<UserOutlined />}
        className="filter-select"
      />
    </Dropdown>
    <Dropdown overlay={dateMenu} trigger={["click"]}>
      <Select
        defaultValue="Ngày gửi"
        suffixIcon={<CalendarOutlined />}
        className="filter-select"
      />
    </Dropdown>
  </div>
);

// Component MessageList
const MessageList = ({ messages, filteredSearchMessages }) => (
  <div className="message-container">
    <div className="title-tabpane">
      Tin nhắn ({filteredSearchMessages.length})
    </div>
    <div className="message-list">
      {messages.map((msg) => (
        <div key={msg.id} className="message-item">
          <img src={msg.avatar} alt={msg.name} className="message-avatar" />
          <div className="message-content">
            <div className="message-header-row">
              <span className="message-name">{msg.name}</span>
              <span className="message-time">{msg.time}</span>
            </div>
            <p className="message-text">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Component FileFilter
const FileFilter = ({
  selectedType,
  setSelectedType,
  fileDateMenu,
  dateRange,
  setDateRange,
}) => (
  <div className="filter-container">
    <span className="filter-item">Lọc theo:</span>
    <Select
      defaultValue="all"
      onChange={(value) => setSelectedType(value)}
      style={{ width: 120, marginRight: 10 }}
    >
      <Option value="all">Tất cả</Option>
      <Option value="pdf">PDF</Option>
      <Option value="excel">Excel</Option>
      <Option value="video">Video</Option>
    </Select>
    <Dropdown overlay={fileDateMenu} trigger={["click"]}>
      <Select
        defaultValue="Ngày gửi"
        suffixIcon={<CalendarOutlined />}
        style={{ width: 120 }}
        className="filter-select"
      />
    </Dropdown>
  </div>
);

// Component FileList
const FileList = ({ filteredFiles }) => (
  <div className="file-list">
    <div className="title-tabpane">File ({filteredFiles.length})</div>
    <List
      itemLayout="horizontal"
      dataSource={filteredFiles}
      renderItem={renderFileItem}
    />
  </div>
);

// Hàm renderItemRecently
const renderItemRecently = (item, handleDelete) => (
  <List.Item className="list-item">
    <div className="avatar-container">
      <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
    </div>
    <div className="chat-info">
      <span className="chat-name">{item.name}</span>
    </div>
    <div className="delete-button" onClick={() => handleDelete(item.id)}>
      <CloseOutlined />
    </div>
  </List.Item>
);

// Hàm renderItemSearch
const renderItemSearch = (item) => (
  <List.Item className="list-item">
    <div className="avatar-container">
      <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
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

// Hàm renderFileItem
const renderFileItem = (file) => {
  let icon;
  switch (file.type) {
    case "excel":
      icon = <FileExcelOutlined style={{ color: "green", fontSize: "24px" }} />;
      break;
    case "video":
      icon = (
        <PlayCircleOutlined style={{ color: "purple", fontSize: "24px" }} />
      );
      break;
    case "pdf":
      icon = <FilePdfOutlined style={{ color: "red", fontSize: "24px" }} />;
      break;
    default:
      icon = <FileOutlined style={{ fontSize: "24px" }} />;
  }
  return (
    <List.Item className="list-item">
      <div className="file-icon">{icon}</div>
      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{file.size}</span>
        <span className="file-sender">{file.sender}</span>
        <span className="file-date">{file.date}</span>
      </div>
    </List.Item>
  );
};

// Component chính
const ComponentLeftSearch = ({ userList, onSelectUser, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredRecentlyUser, setFilteredRecentlyUser] = useState(userList);
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);

  const handleDropdownVisibleChange = (flag) => setDropdownOpen(flag);

  const handleDelete = (id) => {
    setFilteredRecentlyUser(
      filteredRecentlyUser.filter((item) => item.id !== id)
    );
  };

  const filteredSearchUser = contacts.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSearchMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredFiles = files.filter((file) => {
    if (selectedType !== "all" && file.type !== selectedType) return false;
    if (dateRange[0] && dateRange[1]) {
      const fileDate = parseDate(file.date);
      const startDate = dateRange[0].toDate();
      const endDate = dateRange[1].toDate();
      if (fileDate < startDate || fileDate > endDate) return false;
    }
    return true;
  });

  const userMenu = (
    <Menu>
      <Menu.Item key="search">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Menu.Item>
      {users
        .filter((user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase())
        )
        .map((user) => (
          <Menu.Item key={user.id}>
            <Avatar src={user.avatar} size={24} /> {user.name}
          </Menu.Item>
        ))}
    </Menu>
  );

  const dateMenu = (
    <Menu>
      <Menu.Item key="suggestion">Gợi ý thời gian</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="range">
        <Space direction="vertical">
          <RangePicker onClick={(e) => e.stopPropagation()} />
        </Space>
      </Menu.Item>
    </Menu>
  );

  const fileDateMenu = (
    <Menu>
      <Menu.Item key="range">
        <RangePicker onChange={(dates) => setDateRange(dates)} />
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="chat-sidebar">
      <SearchComponent
        searchText={searchText}
        setSearchText={setSearchText}
        onClose={onClose}
      />
      {searchText !== "" ? (
        <SearchResults
          filteredSearchUser={filteredSearchUser}
          messages={messages}
          filteredFiles={filteredFiles}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          dropdownOpen={dropdownOpen}
          handleDropdownVisibleChange={handleDropdownVisibleChange}
          userMenu={userMenu}
          dateMenu={dateMenu}
          fileDateMenu={fileDateMenu}
        />
      ) : (
        <RecentlySearched
          filteredRecentlyUser={filteredRecentlyUser}
          handleDelete={handleDelete}
        />
      )}
    </Layout>
  );
};

export default ComponentLeftSearch;
