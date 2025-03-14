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
    <div className="w-[364px] min-w-[364px] max-w-[364px] rounded-lg bg-white">
      {/* Filter section */}
      <div className="flex items-center justify-center text-sm relative p-2">
        <span className="text-zinc-600 mr-2">Lọc theo:</span>

        {/* User dropdown */}
        <div className="relative">
          <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
            {selectedUser ? (
              <div className="flex items-center mr-3 px-2 py-1 rounded hover:bg-zinc-200 text-blue-500 bg-blue-100">
                <FaUser className="h-3 w-3 mr-1" />
                <div className="flex items-center">
                  <span className="truncate max-w-[64px]">
                    {selectedUser.name}
                  </span>
                  {selectedUser && (
                    <button
                      onClick={clearUserFilter}
                      className="ml-1 text-blue-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center mr-3 px-2 py-1 rounded hover:bg-zinc-200 bg-gray-500">
                <FaUser className="h-3 w-3 mr-1" />
                <div className="flex items-center">
                  <span>Người gửi</span>
                </div>
                <FaChevronDown className="h-3 w-3 ml-1" />
              </div>
            )}
          </button>

          {isUserDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[200px] h-[320px] bg-white rounded-lg shadow-lg z-50">
              <div className="p-1">
                <div className="relative">
                  <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-400 h-2.5 w-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    className="w-full bg-zinc-100 rounded-md pl-7 pr-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      className="w-full px-2 py-1 flex items-center hover:bg-zinc-100 transition-colors"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="w-6 h-6 rounded-full mr-2 flex-shrink-0">
                        <Avatar src={user.avatar} size={24} />
                      </div>
                      <span className="text-xs truncate text-left">
                        {user.name}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-zinc-400">
                    <p className="text-xs">Không tìm thấy kết quả</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date dropdown */}
        <div className="relative">
          <button
            className=""
            onClick={() => {
              setIsDateDropdownOpen(!isDateDropdownOpen);
              setIsTimeOptionsOpen(false);
            }}
          >
            {dateRange.from ? (
              <div className="flex items-center px-2 py-1 rounded hover:bg-zinc-200 text-blue-500 bg-blue-100">
                <FaCalendar className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[64px]">{`${formatDate(
                  dateRange.from
                )} - ${formatDate(dateRange.to)}`}</span>
                {dateRange.from && (
                  <button
                    onClick={clearDateFilter}
                    className="ml-1 text-zinc-400 text-blue-500"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center px-2 py-1 rounded hover:bg-zinc-200 bg-white">
                <FaCalendar className="h-3 w-3 mr-1" />
                <span>Ngày gửi</span>
                <FaChevronDown className="h-3 w-3 ml-1" />
              </div>
            )}
          </button>

          {isDateDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-[286px] bg-white rounded-lg shadow-lg z-50">
              {/* Quick time suggestions */}
              <div className="p-3 border-b border-zinc-200">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setIsTimeOptionsOpen(!isTimeOptionsOpen)}
                >
                  <h3 className="text-sm font-medium">Gợi ý thời gian</h3>
                  <FaChevronRight className="h-3 w-3 text-gray-400" />
                </div>
              </div>

              {/* Time options dropdown */}
              {isTimeOptionsOpen && (
                <div className="absolute left-full top-0 mt-3 ml-1 w-[140px] bg-white rounded-lg shadow-lg z-[9999] py-1">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
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
              <div className="p-3">
                <h3 className="text-sm font-medium mb-2">
                  Chọn khoảng thời gian
                </h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <DatePicker
                      selected={dateRange.from}
                      onChange={(date) =>
                        setDateRange({ ...dateRange, from: date })
                      }
                      placeholderText="Từ ngày"
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm hover:bg-gray-50"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <DatePicker
                      selected={dateRange.to}
                      onChange={(date) =>
                        setDateRange({ ...dateRange, to: date })
                      }
                      placeholderText="Đến ngày"
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm hover:bg-gray-50"
                      minDate={dateRange.from}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-3 flex justify-end gap-2 border-t border-zinc-200">
                <button
                  className="px-4 py-2 text-sm rounded hover:bg-gray-100"
                  onClick={() => {
                    setIsDateDropdownOpen(false);
                    setIsTimeOptionsOpen(false);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="relative">
        <button
          onClick={() => {
            setIsDateDropdownOpen(!isDateDropdownOpen);
            setIsTimeOptionsOpen(false);
          }}
        >
          {dateRange.from ? (
            <div className="flex items-center px-2 py-1 rounded hover:bg-zinc-200 text-blue-500 bg-blue-100">
              <FaCalendar className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[64px]">{`${formatDate(
                dateRange.from
              )} - ${formatDate(dateRange.to)}`}</span>
              {dateRange.from && (
                <button
                  onClick={clearDateFilter}
                  className="ml-1 text-zinc-400 text-blue-500"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center px-2 py-1 rounded hover:bg-zinc-200 bg-white">
              <FaCalendar className="h-3 w-3 mr-1" />
              <span>Ngày gửi</span>
              <FaChevronDown className="h-3 w-3 ml-1" />
            </div>
          )}
        </button>

        {isDateDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-[286px] bg-white rounded-lg shadow-lg z-50">
            {/* Quick time suggestions */}
            <div className="p-3 border-b border-zinc-200">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => setIsTimeOptionsOpen(!isTimeOptionsOpen)}
              >
                <h3 className="text-sm font-medium">Gợi ý thời gian</h3>
                <FaChevronRight className="h-3 w-3 text-gray-400" />
              </div>
            </div>

            {/* Time options dropdown */}
            {isTimeOptionsOpen && (
              <div className="absolute left-full top-0 mt-3 ml-1 w-[140px] bg-white rounded-lg shadow-lg z-[9999] py-1">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
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
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">
                Chọn khoảng thời gian
              </h3>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <DatePicker
                    selected={dateRange.from}
                    onChange={(date) =>
                      setDateRange({ ...dateRange, from: date })
                    }
                    placeholderText="Từ ngày"
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm hover:bg-gray-50"
                  />
                </div>
                <div className="flex-1 relative">
                  <DatePicker
                    selected={dateRange.to}
                    onChange={(date) =>
                      setDateRange({ ...dateRange, to: date })
                    }
                    placeholderText="Đến ngày"
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm hover:bg-gray-50"
                    minDate={dateRange.from}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-3 flex justify-end gap-2 border-t border-zinc-200">
              <button
                className="px-4 py-2 text-sm rounded hover:bg-gray-100"
                onClick={() => {
                  setIsDateDropdownOpen(false);
                  setIsTimeOptionsOpen(false);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
