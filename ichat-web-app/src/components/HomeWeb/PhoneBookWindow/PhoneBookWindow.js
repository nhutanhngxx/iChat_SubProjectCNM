import React, { useState } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BsPersonAdd } from "react-icons/bs";
import { FaBan } from "react-icons/fa";

import "./index.css"; // Import CSS
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import RequestList from "./RequestList";
import ComponentLeftSearch from "../ChatWindow/ComponentLeftSearch";
import SearchBar from "../Common/SearchBar";
import BlockerUserList from "./BlockerUserList";

const userList = [
  {
    id: 1,
    name: "Lê Thị Quỳnh Như",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
];

const PhoneBookWindow = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchText, setSearchText] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="book-window">
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{ width: "364px", flex: "none", height: "60px" }}
      >
        {showInterface ? (
          <ComponentLeftSearch
            onClose={() => setShowInterface(false)}
            userList={userList}
            onSelectUser={setSelectedUser}
            user
          />
        ) : (
          <div>
            <SearchBar onFocus={() => setShowInterface(true)} />

            <div className="menu">
              <div
                className={`menu-item ${
                  activeTab === "friends" ? "active" : ""
                }`}
                onClick={() => setActiveTab("friends")}
              >
                <BsFillPersonLinesFill className="text-gray-600 mr-2 icons" />
                <span>Danh sách bạn bè</span>
              </div>
              <div
                className={`menu-item ${
                  activeTab === "groups" ? "active" : ""
                }`}
                onClick={() => setActiveTab("groups")}
              >
                <FaUsers className="text-gray-600 mr-2 icons" />
                <span>Danh sách nhóm và cộng đồng</span>
              </div>
              <div
                className={`menu-item ${
                  activeTab === "requests" ? "active" : ""
                }`}
                onClick={() => setActiveTab("requests")}
              >
                <BsPersonAdd className="text-gray-600 mr-2 icons" />
                <span>Lời mời kết bạn</span>
              </div>
              {/* Thêm tab mới cho danh sách người dùng bị chặn */}
              <div
                className={`menu-item ${
                  activeTab === "blockUsers" ? "active" : ""
                }`}
                onClick={() => setActiveTab("blockUsers")}
              >
                <FaBan className="text-gray-600 mr-2 icons" />
                <span>Danh sách chặn liên lạc</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nội dung chính */}
      <div className="content">
        {activeTab === "friends" && <FriendList />}
        {activeTab === "blockUsers" && <BlockerUserList />}
        {activeTab === "groups" && <GroupList />}
        {activeTab === "requests" && <RequestList />}
      </div>
    </div>
  );
};

export default PhoneBookWindow;
