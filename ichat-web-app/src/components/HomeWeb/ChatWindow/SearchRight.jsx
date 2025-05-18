import React from "react";
import { CiSearch } from "react-icons/ci";
import "./SearchRight.css";
import { FaUser } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { concat, set } from "lodash";
import { PiGreaterThan } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Avatar, Spin } from "antd";
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;


const SearchRight = ({
  setShowSearchRight,
  messages,
  onMessageSelect,
  selectedChat,
  user
}) => {
  const [showSenderFilter, setShowSenderFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showDateBeetweenFilter, setShowDateBeetweenFilter] = useState(false);

  // State của text input search
  const [text, setText] = useState("");
  // State để lưu trữ kết quả tìm kiếm
  const [searchResults, setSearchResults] = useState([]);
  // State để hiển thị trạng thái loading
  const [isSearching, setIsSearching] = useState(false);
  // State để lưu tất cả người gửi trong cuộc trò chuyện
  const [chatMembers, setChatMembers] = useState([]);
  // State cho bộ lọc ngày
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // State để lưu trạng thái lọc
  const [filters, setFilters] = useState({
    sender: null,
    dateFrom: null,
    dateTo: null
  });

  // Thêm state để lưu trữ thông tin người dùng
  const [userInfoMap, setUserInfoMap] = useState({}); // Map sender_id đến thông tin người dùng

  const handleShowSenderFilter = () => {
    setShowSenderFilter(!showSenderFilter);
    setShowDateFilter(false);
  };

  const handleShowDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    setShowSenderFilter(false);
  };

  // Lọc theo người gửi
  const [selectedName, setSelectedName] = useState("");
  const handleSelectUser = (name, id) => {
    setSelectedName(name);
    setFilters({ ...filters, sender: id });
    setShowSenderFilter(false); // Ẩn modal sau khi chọn
  };

  const handleClearInput = () => {
    setSelectedName("");
    setFilters({ ...filters, sender: null });
  };

  const handleClearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setFilters({ ...filters, dateFrom: null, dateTo: null });
  };

  const handleDateSelect = (option) => {
    const today = new Date();
    let fromDate = new Date();

    switch (option) {
      case "yesterday":
        fromDate.setDate(today.getDate() - 1);
        break;
      case "today":
        // fromDate is already today
        break;
      case "week":
        fromDate.setDate(today.getDate() - 7);
        break;
      case "month":
        fromDate.setDate(today.getDate() - 30);
        break;
      default:
        return;
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    setDateFrom(fromStr);
    setDateTo(toStr);
    setFilters({
      ...filters,
      dateFrom: fromDate,
      dateTo: today
    });

    setShowDateFilter(false);
  };

  const handleApplyDateFilter = () => {
    if (dateFrom && dateTo) {
      setFilters({
        ...filters,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo)
      });
    }
    setShowDateFilter(false);
  };

  // Thay thế useEffect tạo danh sách người dùng để fetch thông tin từ API
  useEffect(() => {
    const loadChatMembers = async () => {
      if (!messages || messages.length === 0) return;

      // Trích xuất danh sách người gửi từ tin nhắn
      const senderMap = new Map();

      // Luôn thêm người dùng hiện tại
      senderMap.set(user.id, {
        id: user.id,
        name: "Bạn",
        avatar_path: user.avatar_path
      });

      // Thu thập tất cả ID người dùng khác từ tin nhắn
      const otherSenderIds = [...new Set(
        messages
          .filter(msg => msg.sender_id && msg.sender_id !== user.id)
          .map(msg => msg.sender_id)
      )];

      // Nếu đây là chat 1-1, chỉ cần thêm người nhận và không cần fetch API
      if (selectedChat.chat_type !== "group") {
        senderMap.set(selectedChat.id, {
          id: selectedChat.id,
          name: selectedChat.name,
          avatar_path: selectedChat.avatar_path
        });

        setChatMembers(Array.from(senderMap.values()));
        return;
      }

      // Nếu là nhóm, fetch thông tin người dùng từ API
      try {
        // Fetch thông tin đồng thời cho tất cả người gửi
        const fetchPromises = otherSenderIds.map(async (senderId) => {
          try {
            const response = await fetch(`${REACT_APP_API_URL}/api/users/${senderId}`);

            if (!response.ok) {
              console.error(`Failed to fetch user info for ID ${senderId}`);
              return {
                id: senderId,
                name: "Thành viên nhóm",
                avatar_path: null
              };
            }

            const data = await response.json();
            return {
              id: senderId,
              name: data.user?.full_name || "Thành viên nhóm",
              avatar_path: data.user?.avatar_path || null
            };
          } catch (error) {
            console.error(`Error fetching user ${senderId} info:`, error);
            return {
              id: senderId,
              name: "Thành viên nhóm",
              avatar_path: null
            };
          }
        });

        const fetchedUsers = await Promise.all(fetchPromises);

        // Thêm thông tin người dùng đã fetch vào senderMap
        fetchedUsers.forEach(user => {
          if (!senderMap.has(user.id)) {
            senderMap.set(user.id, user);
          }
        });

        setChatMembers(Array.from(senderMap.values()));

        // Cập nhật userInfoMap cho việc hiển thị kết quả tìm kiếm
        const userInfoEntries = fetchedUsers.map(user => [
          user.id,
          { full_name: user.name, avatar_path: user.avatar_path }
        ]);

        setUserInfoMap(prevMap => ({
          ...prevMap,
          ...Object.fromEntries(userInfoEntries)
        }));

      } catch (error) {
        console.error("Error loading chat members:", error);

        // Trường hợp lỗi, dùng thông tin cơ bản
        otherSenderIds.forEach(id => {
          if (!senderMap.has(id)) {
            senderMap.set(id, {
              id: id,
              name: "Thành viên nhóm",
              avatar_path: null
            });
          }
        });

        setChatMembers(Array.from(senderMap.values()));
      }
    };

    loadChatMembers();
  }, [messages, selectedChat, user]);
  // console.log("messages", messages);

  // console.log("chatMembers from SearchRight", chatMembers);


  // Thực hiện tìm kiếm khi text hoặc filters thay đổi
  useEffect(() => {
    // Tìm kiếm khi có text hoặc filter đã được áp dụng
    if (messages && (text.trim() || filters.sender || filters.dateFrom)) {
      searchMessages();
    } else {
      setSearchResults([]);
    }
  }, [text, filters, messages]);

  // Thêm useEffect để lấy thông tin người dùng khi kết quả tìm kiếm thay đổi
  useEffect(() => {
    const fetchUsersInfo = async () => {
      if (!searchResults.length || !selectedChat?.chat_type === "group") return;

      // Lấy tất cả sender_id khác nhau từ kết quả tìm kiếm
      const senderIds = [...new Set(
        searchResults
          .filter(msg => msg.sender_id !== user.id && !userInfoMap[msg.sender_id])
          .map(msg => msg.sender_id)
      )];

      if (!senderIds.length) return;

      // Lấy thông tin người dùng cho mỗi sender_id
      const userInfoPromises = senderIds.map(async (senderId) => {
        try {
          const response = await fetch(`${REACT_APP_API_URL}/api/users/${senderId}`);

          if (!response.ok) {
            console.error(`Failed to fetch user info for ID ${senderId}`);
            return [senderId, { full_name: "Thành viên nhóm", avatar_path: null }];
          }

          const data = await response.json();
          return [senderId, {
            full_name: data.user?.full_name || "Thành viên nhóm",
            avatar_path: data.user?.avatar_path
          }];
        } catch (error) {
          console.error(`Error fetching user ${senderId} info:`, error);
          return [senderId, { full_name: "Thành viên nhóm", avatar_path: null }];
        }
      });

      // Chờ tất cả các promise hoàn thành
      const userInfoResults = await Promise.all(userInfoPromises);

      // Cập nhật map thông tin người dùng
      setUserInfoMap(prevMap => ({
        ...prevMap,
        ...Object.fromEntries(userInfoResults)
      }));
    };

    fetchUsersInfo();
  }, [searchResults, selectedChat?.chat_type]);

  // Hàm tìm kiếm tin nhắn
  const searchMessages = () => {
    if (!messages) return;

    setIsSearching(true);

    setTimeout(() => {
      let results = [...messages];
      // THÊM: Lọc bỏ tin nhắn đã xóa mềm
      results = results.filter(msg => {
        if (!Array.isArray(msg.isdelete)) {
          return true; // Giữ lại nếu không có mảng isdelete
        }
        // Loại bỏ nếu ID người dùng hiện tại có trong mảng isdelete
        return !msg.isdelete.some(id => id === user.id || id === String(user.id));
      });
      // Lọc theo nội dung (text)
      if (text.trim()) {
        results = results.filter(msg =>
          msg.content &&
          msg.content.toLowerCase().includes(text.toLowerCase())
        );
      }

      // Lọc theo người gửi
      if (filters.sender) {
        results = results.filter(msg => msg.sender_id === filters.sender);
      }

      // Lọc theo khoảng thời gian
      if (filters.dateFrom && filters.dateTo) {
        results = results.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= filters.dateFrom && msgDate <= filters.dateTo;
        });
      }

      // Sắp xếp kết quả theo thời gian, mới nhất lên đầu
      results = results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Giới hạn số lượng kết quả (nếu cần)
      // results = results.slice(0, 50);

      setSearchResults(results);
      setIsSearching(false);
    }, 300); // Thêm độ trễ nhỏ để có animation loading
  };

  // Xử lý khi người dùng chọn một tin nhắn từ kết quả tìm kiếm
  const handleMessageClick = (message) => {
    if (onMessageSelect) {
      onMessageSelect(message);
    }
  };

  // Format thời gian hiển thị
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm đánh dấu các từ khóa tìm kiếm trong nội dung
  const highlightText = (content, searchText) => {
    if (!searchText.trim() || !content) return content;

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchText.toLowerCase()
        ? <mark key={index} style={{ background: 'yellow', padding: 0 }}>{part}</mark>
        : part
    );
  };

  return (
    <div className="conntainer-seachright">
      <div className="search-right-header-title">
        <h3>Tìm kiếm trong trò chuyện</h3>
        <p
          onClick={() => {
            setShowSearchRight(false);
          }}
        >
          <IoMdClose />
        </p>
      </div>

      <div className="search-right-header">
        <div>
          <CiSearch className="icon-ciSeach" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tìm kiếm..."
          />
          {text && (
            <button
              onClick={() => setText("")}
              style={{ cursor: "pointer", color: "rgb(122, 122, 122);" }}
            >
              Xoá
            </button>
          )}
        </div>
      </div>
      <div className="search-right-header-fillter">
        <p>Lọc : </p>

        <button
          onClick={() => handleShowSenderFilter()}
          className={`${selectedName ? "text-blue" : ""}`}
        >
          <FaUser />
          <span
            style={{
              display: "inline-block",
              maxWidth: "120px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {selectedName ? selectedName : "Người gửi"}
          </span>
          {selectedName ? (
            <span onClick={handleClearInput} className="cursor-pointer">
              ✖
            </span>
          ) : (
            <span>▼</span>
          )}
        </button>
        {showSenderFilter && (
          <div className="mini-modal-sender">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border p-1 w-full rounded"
            />
            <div className="mini-modal-sender-list">
              {/* Danh sách người dùng */}
              {chatMembers.map((member, index) => (
                <div
                  key={index}
                  className="mini-modal-sender-list-item"
                  onClick={() => handleSelectUser(member.name, member.id)}
                >
                  <Avatar
                    src={member.avatar_path}
                    size={32}
                  >
                    {!member.avatar_path && member.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => handleShowDateFilter()}
          className={`${(filters.dateFrom || filters.dateTo) ? "text-blue" : ""}`}
        >
          <FaRegCalendarAlt />
          <span>Ngày gửi</span>
          {(filters.dateFrom || filters.dateTo) ? (
            <span onClick={handleClearDateFilter} className="cursor-pointer">
              ✖
            </span>
          ) : (
            <span>▼</span>
          )}
        </button>
        {showDateFilter && (
          <div className="mini-modal-date" style={{ zIndex: "1" }}>
            <div
              onMouseEnter={() => setShowDateBeetweenFilter(true)}
              onMouseLeave={() => setShowDateBeetweenFilter(false)}
              style={{ cursor: "pointer" }}
            >
              <p>Gợi ý thời gian </p>
              <p>
                <PiGreaterThan />
              </p>
            </div>
            {showDateBeetweenFilter && (
              <div
                className="mini-modal-date-beetween"
                onMouseEnter={() => setShowDateBeetweenFilter(true)}
                onMouseLeave={() => setShowDateBeetweenFilter(false)}
              >
                <p onClick={() => handleDateSelect("yesterday")}>Ngày hôm qua</p>
                <p onClick={() => handleDateSelect("today")}>Ngày hôm nay</p>
                <p onClick={() => handleDateSelect("week")}>7 ngày trước</p>
                <p onClick={() => handleDateSelect("month")}>30 ngày trước</p>
              </div>
            )}
            <div>
              <label className="block">Chọn khoảng thời gian</label>
              <div className="beetween-date">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Từ ngày"
                  className="border p-1 w-full rounded"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border p-1 w-full rounded"
                />
              </div>
              <div className="mini-modal-date-button">
                <button onClick={() => setShowDateFilter(false)}>Huỷ</button>
                <button onClick={handleApplyDateFilter}>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="conttent-searchRight">
        {isSearching ? (
          <div className="search-loading">
            <Spin size="large" />
            <p>Đang tìm kiếm...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="search-results">
            <div className="search-results-header">
              <p>Kết quả tìm kiếm ({searchResults.length})</p>
            </div>
            <div className="search-results-list">
              {searchResults.map((message, index) => (
                <div
                  key={message._id || index}
                  className="search-result-item"
                  onClick={() => handleMessageClick(message)}
                >
                  <Avatar
                    size={40}
                    src={
                      message.sender_id === user.id
                        ? user.avatar_path
                        : (selectedChat.chat_type === "group"
                          ? userInfoMap[message.sender_id]?.avatar_path
                          : selectedChat.avatar_path)
                    }
                  >
                    {!message.sender_avatar &&
                      (message.sender_id === user.id
                        ? "B"
                        : (selectedChat.chat_type === "group"
                          ? (userInfoMap[message.sender_id]?.full_name || "?").charAt(0)
                          : selectedChat.name.charAt(0))
                      ).toUpperCase()}
                  </Avatar>
                  <div className="search-result-content">
                    <div className="search-result-sender">
                      <span>
                        {message.sender_id === user.id
                          ? "Bạn"
                          : (selectedChat.chat_type === "group"
                            ? (userInfoMap[message.sender_id]?.full_name || "Thành viên nhóm")
                            : selectedChat.name)}
                      </span>
                      <span className="search-result-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="search-result-message">
                      {message.type === 'text' ? (
                        <p>{highlightText(message.content, text)}</p>
                      ) : message.type === 'image' ? (
                        <p>[Hình ảnh]</p>
                      ) : message.type === 'video' ? (
                        <p>[Video]</p>
                      ) : message.type === 'audio' ? (
                        <p>[Âm thanh]</p>
                      ) : message.type === 'file' ? (
                        <p>[Tập tin]</p>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-right-empty">
            <h3>
              {text || filters.sender || filters.dateFrom
                ? "Không tìm thấy kết quả"
                : "Nhập từ khoá để tìm kiếm"}
            </h3>
            <img
              src="https://chat.zalo.me/assets/search_empty_keyword_state.b291c6f32343a363d7bd2d062ba1cf04.png"
              alt=""
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRight;
