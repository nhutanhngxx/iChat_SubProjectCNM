import React, { useState } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BsPersonAdd } from "react-icons/bs";
import { PiUsersThreeFill } from "react-icons/pi";

import "./index.css"; // Import CSS
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import RequestList from "./RequestList";
import RequestGroupList from "./RequestGroupList";

const PhoneBookWindow = () => {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div className="book-window">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Search */}
        <div className="search">
          <input type="text" placeholder="Tìm Kiếm"></input>
          <div className="button-icons-group">
            <button>
              <BsPersonAdd className="text-gray-600 mr-2 icons" />
            </button>
            <button>
              <FaUserFriends className="text-gray-600 mr-2 icons" />
            </button>
          </div>
        </div>
        <div className="menu">
          <div
            className={`menu-item ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <BsFillPersonLinesFill className="text-gray-600 mr-2 icons" />
            <span>Danh sách bạn bè</span>
          </div>
          <div
            className={`menu-item ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            <FaUsers className="text-gray-600 mr-2 icons" />
            <span>Danh sách nhóm và cộng đồng</span>
          </div>
          <div
            className={`menu-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <BsPersonAdd className="text-gray-600 mr-2 icons" />
            <span>Lời mời kết bạn</span>
          </div>
          <div
            className={`menu-item ${
              activeTab === "requestsgroups" ? "active" : ""
            }`}
            onClick={() => setActiveTab("requestsgroups")}
          >
            <PiUsersThreeFill className="text-gray-600 mr-2 icons" />
            <span>Lời mời vào nhóm cộng đồng</span>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="content">
        {activeTab === "friends" && <FriendList />}
        {activeTab === "groups" && <GroupList />}
        {activeTab === "requests" && <RequestList />}
        {activeTab === "requestsgroups" && <RequestGroupList />}
      </div>
    </div>
  );
};

export default PhoneBookWindow;
