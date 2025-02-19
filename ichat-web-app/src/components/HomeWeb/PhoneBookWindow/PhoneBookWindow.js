import React, { useState } from "react";
import { FaUserFriends, FaUsers, FaUserPlus } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BsPersonAdd } from "react-icons/bs";
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
            <FaUserPlus className="text-gray-600 mr-2 icons" />
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

// const FriendList = () => (
//   <div className="body">
//     {/* Content header  */}
//     <div className="content-header">
//       <BsFillPersonLinesFill className="text-gray-600 mr-2 icons" />
//       <h2 className="text-lg font-bold mb-4">Danh sách bạn bè</h2>
//     </div>
//     <div className="content-body">
//       <ul className="space-y-2">
//         <li className="p-2 border-b">Anh Trai</li>
//         <li className="p-2 border-b">Anh Hai</li>
//         <li className="p-2 border-b">Ba</li>
//         <li className="p-2 border-b">Em gái</li>
//         <li className="p-2">Mẹ</li>
//       </ul>
//     </div>
//   </div>
// );

// const GroupList = () => (
//   <div>
//     <h2 className="text-lg font-bold mb-4">Danh sách nhóm</h2>
//     <ul className="space-y-2">
//       <li className="p-2 border-b">Nhóm Gia Đình</li>
//       <li className="p-2 border-b">Nhóm Bạn Cấp 3</li>
//       <li className="p-2">Nhóm Công Ty</li>
//     </ul>
//   </div>
// );

// const RequestList = () => (
//   <div>
//     <h2 className="text-lg font-bold mb-4">Lời mời kết bạn</h2>
//     <ul className="space-y-2">
//       <li className="p-2 border-b">Nguyễn Văn A</li>
//       <li className="p-2 border-b">Trần Thị B</li>
//       <li className="p-2">Lê Văn C</li>
//     </ul>
//   </div>
// );

export default PhoneBookWindow;
