import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  unfriendUser,
  getBlockedUsers,
  unblockUser,
} from "../../../redux/slices/friendSlice";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import { Menu, Dropdown, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  EyeOutlined,
  TagsOutlined,
  EditOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./FriendList.css"; // Import file CSS

const BlockerUserList = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { confirm } = Modal;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [blockedUsersData, setBlockedUsersData] = useState([]);

  const handleUnfriend = async (friendId) => {
    confirm({
      title: "Xác nhận xóa bạn",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa người này khỏi danh sách bạn bè?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          const result = await dispatch(
            unfriendUser({
              user_id: currentUser.id,
              friend_id: friendId,
            })
          ).unwrap();

          if (result.status === "ok") {
            message.success("Đã xóa bạn thành công");
            // Cập nhật lại danh sách bạn bè ở đây nếu cần
          }
        } catch (error) {
          message.error(error.message || "Có lỗi xảy ra khi xóa bạn");
        }
      },
    });
  };

  const handleUnblock = async (blockedUserId) => {
    try {
      const result = await dispatch(
        unblockUser({
          blocker_id: currentUser.id,
          blocked_id: blockedUserId,
        })
      ).unwrap();

      if (result.status === "ok") {
        message.success(result.message);
        dispatch(getBlockedUsers(currentUser.id)); // Refresh lại danh sách bị chặn
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi hủy chặn người dùng");
    }
  };

  const friendActionMenu = (friendId) => (
    <Menu>
      <Menu.Item
        key="unblock"
        icon={<StopOutlined />}
        onClick={() => handleUnblock(friendId)}
      >
        Bỏ chặn người này
      </Menu.Item>
      {/* <Menu.Divider /> */}
    </Menu>
  );

  useEffect(() => {
    const fetchList = async () => {
      try {
        const result = await dispatch(getBlockedUsers(currentUser.id)).unwrap();
        console.log("API Response:", result); // Log để kiểm tra cấu trúc dữ liệu

        // Kiểm tra và xử lý dữ liệu từ API
        let users = [];
        if (result && result.data) {
          users = Array.isArray(result.data) ? result.data : [];
        } else if (Array.isArray(result)) {
          users = result;
        }

        setBlockedUsersData(users);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách:", error);
        setBlockedUsersData([]);
      }
    };

    if (currentUser?.id) {
      fetchList();
    }
  }, [dispatch, currentUser, blockedUsersData]);

  console.log("blockedUsersData before filter:", blockedUsersData); // Log để kiểm tra dữ liệu

  // Đảm bảo blockedUsersData là mảng trước khi filter
  const dataArray = Array.isArray(blockedUsersData) ? blockedUsersData : [];

  const filteredFriends = dataArray
    .filter((friend) =>
      (friend?.full_name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? (a?.full_name || "").localeCompare(b?.full_name || "")
        : (b?.full_name || "").localeCompare(a?.full_name || "")
    );

  // Nhóm bạn bè theo chữ cái đầu tiên
  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = (friend?.full_name || "").charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(friend);
    return acc;
  }, {});

  return (
    <div className="body">
      {/* Header */}
      <div className="content-header">
        <BsFillPersonLinesFill className="icons" />
        <h2 className="title">Danh sách chặn liên lạc</h2>
      </div>

      {/* Content */}
      <div className="content-body">
        {/* Số lượng bạn bè */}
        <div className="friend-count">
          Bạn bè (<span className="count">{filteredFriends.length}</span>)
        </div>
        <div className="friend-list">
          {/* Thanh tìm kiếm */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm bạn..."
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

          {/* Danh sách bạn bè theo nhóm chữ cái đầu */}
          <div className="friend-groups">
            {Object.keys(groupedFriends).length > 0 ? (
              Object.keys(groupedFriends).map((letter) => (
                <ul key={letter} className="friend-group">
                  <li className="group-header">{letter}</li>
                  {groupedFriends[letter].map((friend, index) => (
                    <li key={index} className="friend-item">
                      {/* <span className={`avatar ${friend.color}`}></span> */}
                      <img
                        src={friend.avatar_path}
                        alt={friend.name}
                        className="avatar"
                      />
                      <span className="friend-name">{friend.full_name}</span>
                      <Dropdown
                        overlay={friendActionMenu(friend.id)}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <FaEllipsisV className="menu-icon" />
                      </Dropdown>
                    </li>
                  ))}
                </ul>
              ))
            ) : (
              <p className="no-results">Không tìm thấy bạn bè nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockerUserList;
