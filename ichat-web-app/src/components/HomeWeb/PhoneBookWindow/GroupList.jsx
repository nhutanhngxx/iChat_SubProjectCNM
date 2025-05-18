import React, { useState, useEffect } from "react";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import "./GroupList.css"; // Import file CSS
import "./FriendList.css"; // Import file CSS
import { getUserGroups, getGroupMembers } from "../../../redux/slices/groupSlice";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const GroupList = ({ onSelectGroup }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [memberCounts, setMemberCounts] = useState({});

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser?.id) return;

      setIsLoading(true);
      try {
        const response = await dispatch(getUserGroups(currentUser.id)).unwrap();
        // console.log("Fetched user groups:", response);
        setGroups(response || []);

        // Sau khi lấy danh sách nhóm, lấy số lượng thành viên cho mỗi nhóm
        fetchMemberCounts(response || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
        message.error("Không thể tải danh sách nhóm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [dispatch, currentUser?.id]);


  // Hàm lấy số lượng thành viên cho mỗi nhóm
  const fetchMemberCounts = async (groupsList) => {
    if (!groupsList || groupsList.length === 0) return;

    const countsObject = {};

    try {
      // Tạo mảng các lời hứa để fetch song song
      const fetchPromises = groupsList.map(async (group) => {
        try {
          // Sử dụng API endpoint từ slice đã cung cấp
          const response = await axios.get(
            `${REACT_APP_API_URL}/api/groups/${group._id}/members`
          );

          if (response.data && response.data.data) {
            countsObject[group._id] = response.data.data.length;
          } else {
            countsObject[group._id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching members for group ${group._id}:`, error);
          countsObject[group._id] = 0;
        }
      });

      // Đợi tất cả các lời hứa hoàn thành
      await Promise.all(fetchPromises);

      // Cập nhật state với số lượng thành viên
      setMemberCounts(countsObject);
    } catch (error) {
      console.error("Error fetching member counts:", error);
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredGroups = groups
    .filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Xử lý khi người dùng chọn một nhóm
  const handleSelectGroup = (group) => {
    // Tạo đối tượng nhóm với định dạng phù hợp để hiển thị trong ChatWindow
    const formattedGroup = {
      id: group._id,
      name: group.name,
      avatar_path: group.avatar || "",
      chat_type: "group",
      admin_id: group.admin_id,
      // Các thuộc tính khác có thể cần thiết cho ChatWindow
      lastMessage: group.lastMessage || "",
      timestamp: group.timestamp || new Date(),
      unread: 0,
      receiver_id: group._id,
      member_count: memberCounts[group._id] || 0 // Thêm số lượng thành viên
    };

    // console.log("Selected group:", formattedGroup);
    // Store the selected friend in localStorage to retrieve in ChatWindow
    localStorage.setItem("selectedFriend", JSON.stringify(formattedGroup));

    // Navigate to home with a chatwindow parameter to indicate opening chat window
    navigate("/home", {
      state: { activateChat: true, selectedFriend: formattedGroup },
    });
  };

  return (
    <div className="body">
      {/* Header */}
      <div className="content-header">
        <BsFillPersonLinesFill className="icons" />
        <h2 className="title">Danh sách nhóm</h2>
      </div>

      {/* Content */}
      <div className="content-body">
        {/* Số lượng nhóm */}
        <div className="group-count">
          Nhóm (<span className="count">{filteredGroups.length}</span>)
        </div>
        <div className="group-list">
          {/* Thanh tìm kiếm */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm nhóm..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Tên (A-Z)</option>
              <option value="desc">Tên (Z-A)</option>
            </select>
            <select className="filter-select">
              <option>Tất cả</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          {/* Danh sách nhóm */}
          <div className="group-items">
            {isLoading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <p>Đang tải danh sách nhóm...</p>
              </div>
            ) : filteredGroups.length > 0 ? (
              <ul className="friend-group">
                {filteredGroups.map((group) => (
                  <li
                    key={group._id}
                    className="group-item"
                    onClick={() => handleSelectGroup(group)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="group-item-content">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div className="group-info">
                        <span className="group-name">{group.name}</span>
                        <span className="group-members">
                          {memberCounts[group._id] || 0} thành viên
                        </span>
                      </div>
                    </div>
                    <FaEllipsisV className="menu-icon" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-results">
                {searchTerm ? "Không tìm thấy nhóm nào" : "Bạn chưa tham gia nhóm nào"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupList;
