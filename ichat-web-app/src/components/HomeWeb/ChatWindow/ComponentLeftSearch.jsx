"use client";

import { useState } from "react";
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
} from "antd";
import {
  CloseOutlined,
  SearchOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileOutlined,
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
    name: "DS_SV_Tham dự Hội thảo chia sẻ...",
    size: "22.89 KB",
    date: "07/01/2025",
    type: "excel",
  },
  {
    id: 2,
    name: "DJI_20240929211100_0574.D.MP4",
    size: "373.43 MB",
    author: "Thanh Cảnh",
    date: "30/09/2024",
    type: "video",
  },
  {
    id: 3,
    name: "Pháp luật đại cương.pdf",
    size: "93.15 MB",
    date: "25/09/2024",
    type: "pdf",
  },
  {
    id: 4,
    name: "Giáo trình pháp luật đại cương -...",
    size: "18.53 MB",
    date: "25/09/2024",
    type: "pdf",
  },
  {
    id: 5,
    name: "GT Pháp luật đại cương.pdf",
    size: "4.44 MB",
    date: "25/09/2024",
    type: "pdf",
  },
  {
    id: 6,
    name: "Đặc tả yêu cầu và sơ đồ usecase...",
    size: "384.2 KB",
    author: "Vũ Hải Nam",
    date: "25/08/2024",
    type: "word",
  },
];

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

const renderMessageItem = (message) => (
  <List.Item className="list-item">
    <div className="avatar-container">
      <Avatar size={48} src={message.avatar} />
    </div>
    <div className="chat-info">
      <Row justify="space-between">
        <Col>
          <span className="chat-name">{message.name}</span>
        </Col>
        <Col>
          <span className="chat-time">{message.time}</span>
        </Col>
      </Row>
      <Row>
        <span className="chat-message">{message.content}</span>
      </Row>
    </div>
  </List.Item>
);

// Hàm renderFileItem
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
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>{file.size}</span>
          {file.author && (
            <>
              <span>-</span>
              <span>{file.author}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{file.date}</div>
    </List.Item>
  );
};

// Component MessageList
const MessageList = ({ messages, filteredSearchMessages }) => (
  <div className="">
    <div className="title-tabpane">
      Tin nhắn (
      {filteredSearchMessages.length > 99
        ? "99+"
        : filteredSearchMessages.length}
      )
    </div>
    <List
      itemLayout="horizontal"
      dataSource={filteredSearchMessages}
      renderItem={renderMessageItem}
    />
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

  const filteredUsers = users.filter((user) =>
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
          <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
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
                        <Avatar src={user.avatar} size={24} />
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
            onClick={() => {
              setIsDateDropdownOpen(!isDateDropdownOpen);
              setIsTimeOptionsOpen(false);
            }}
          >
            {dateRange.from ? (
              <div className="filter-date-selected">
                <FaCalendar className="filter-date-icon" />
                <span className="filter-date-range">{`${formatDate(
                  dateRange.from
                )} - ${formatDate(dateRange.to)}`}</span>
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
  // Thêm các state quản lý dropdown
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
      <span className="filter-item">Lọc theo:</span>
      <Select
        defaultValue="all"
        onChange={(value) => setSelectedType(value)}
        style={{ width: 120, marginRight: 10 }}
      >
        <Option value="all">Tất cả</Option>
        <Option value="word">Word</Option>
        <Option value="pdf">PDF</Option>
        <Option value="excel">Excel</Option>
        <Option value="video">Video</Option>
      </Select>

      {/* Date dropdown */}
      <div className="filter-date-dropdown">
        <button
          onClick={() => {
            setIsDateDropdownOpen(!isDateDropdownOpen);
            setIsTimeOptionsOpen(false);
          }}
        >
          {dateRange.from ? (
            <div className="filter-date-selected">
              <FaCalendar className="filter-date-icon" />
              <span className="filter-date-range">{`${formatDate(
                dateRange.from
              )} - ${formatDate(dateRange.to)}`}</span>
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

// Component SearchResults
const SearchResults = ({
  filteredSearchUser,
  filteredSearchMessages,
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
    >
      <TabPane tab={<strong>Tất cả</strong>} key="1">
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
      <TabPane tab={<strong>Liên hệ</strong>} key="2">
        <div className="title-tabpane">
          Cá nhân ({filteredSearchUser.length})
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredSearchUser}
          renderItem={renderItemSearch}
        />
      </TabPane>
      <TabPane tab={<strong>Tin nhắn</strong>} key="3">
        <MessageFilter />
        <MessageList
          messages={messages}
          filteredSearchMessages={filteredSearchMessages}
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
  </Content>
);

// Component chính
const ComponentLeftSearch = ({ userList, onSelectUser, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [searchSenderFilteredMessage, setSearchSenderFilteredMessage] =
    useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredRecentlyUser, setFilteredRecentlyUser] = useState(
    userList || users
  );
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const handleDropdownVisibleChange = (flag) => setDropdownOpen(flag);

  const handleDelete = (id) => {
    setFilteredRecentlyUser(
      filteredRecentlyUser.filter((item) => item.id !== id)
    );
  };

  const filteredSearchUser = contacts.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSearchMessages = messages.filter((msg) => {
    const searchTerm = searchText.toLowerCase();
    return (
      msg.name.toLowerCase().includes(searchTerm) ||
      msg.content.toLowerCase().includes(searchTerm)
    );
  });

  const filteredFiles = files.filter((file) => {
    if (selectedType !== "all" && file.type !== selectedType) return false;
    if (dateRange.from && dateRange.to) {
      const fileDate = parseDate(file.date);
      if (!(fileDate instanceof Date) || isNaN(fileDate.getTime()))
        return false;

      if (
        !(dateRange.from instanceof Date) ||
        isNaN(dateRange.from.getTime()) ||
        !(dateRange.to instanceof Date) ||
        isNaN(dateRange.to.getTime())
      ) {
        return true;
      }

      if (fileDate < dateRange.from || fileDate > dateRange.to) return false;
    }
    return file.name.toLowerCase().includes(searchText.toLowerCase());
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
          filteredSearchMessages={filteredSearchMessages}
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
