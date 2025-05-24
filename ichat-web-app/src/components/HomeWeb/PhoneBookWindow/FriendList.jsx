import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getUserFriends,
  unfriendUser,
  getBlockedUsers,
  blockUser,
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

const FriendList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { confirm } = Modal;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [friendsData, setFriendsData] = useState([]);
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

  const handleBlock = async (friendId) => {
    try {
      const result = await dispatch(
        blockUser({
          blocker_id: currentUser.id,
          blocked_id: friendId,
        })
      ).unwrap();

      if (result.status === "ok") {
        message.success(result.message);
        dispatch(getUserFriends(currentUser.id));
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi chặn người dùng");
    }
  };

  const handleFriendClick = (friend) => {
    // Format the friend object to match what handleSelectUser in ChatWindow expects
    const chatUser = {
      id: friend.id,
      name: friend.full_name,
      user_status: friend.user_status || "Offline",
      avatar_path:
        friend.avatar_path || "https://default-avatar.com/avatar.jpg",
      receiver_id: friend.id,
    };

    // Store the selected friend in localStorage to retrieve in ChatWindow
    localStorage.setItem("selectedFriend", JSON.stringify(chatUser));

    // Navigate to home with a chatwindow parameter to indicate opening chat window
    navigate("/home", {
      state: { activateChat: true, selectedFriend: chatUser },
    });
  };

  const friendActionMenu = (friendId) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        Xem thông tin
      </Menu.Item>
      <Menu.Item key="category" icon={<TagsOutlined />}>
        Phân loại
        <span style={{ float: "right", marginLeft: "8px" }}>{">"}</span>
      </Menu.Item>
      <Menu.Item key="nickname" icon={<EditOutlined />}>
        Đặt tên gọi nhớ
      </Menu.Item>

      <Menu.Item
        key="block"
        icon={<StopOutlined />}
        onClick={(e) => {
          e.domEvent.stopPropagation();
          handleBlock(friendId);
        }}
      >
        Chặn người này
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={(e) => {
          e.domEvent.stopPropagation();
          handleUnfriend(friendId);
        }}
      >
        Xóa bạn
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const fetchList = async () => {
      try {
        const resultFriends = await dispatch(
          getUserFriends(currentUser.id)
        ).unwrap();
        setFriendsData(resultFriends.friends);

        const resultBlockedUsers = await dispatch(
          getBlockedUsers(currentUser.id)
        ).unwrap();
        setBlockedUsersData(resultBlockedUsers.blockedUsers);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách :", error);
      }
    };

    if (currentUser?.id) {
      fetchList();
    }
  }, [dispatch, currentUser, friendsData]);

  const filteredFriends = (friendsData || [])
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
        <h2 className="title">Danh sách bạn bè</h2>
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
                    <li
                      key={index}
                      className="friend-item"
                      onClick={() => handleFriendClick(friend)}
                      style={{ cursor: "pointer" }}
                    >
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
                        onClick={(e) => e.stopPropagation()} // Prevent clicking dropdown from triggering parent onClick
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

export default FriendList;
