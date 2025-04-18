import React, { useState } from "react";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import "./GroupList.css"; // Import file CSS
import "./FriendList.css"; // Import file CSS

const GroupListData = [
  // { name: "Nhóm 1", url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg", members: 5 },
  // { name: "Nhóm 2", url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg", members: 8 },
  // {
  //   name: "Gia đình",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 4,
  // },
  // {
  //   name: "Bạn thân",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 6,
  // },
  // {
  //   name: "Đồng nghiệp",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 10,
  // },
  // {
  //   name: "Câu lạc bộ sách",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 7,
  // },
  // {
  //   name: "Nhóm thể thao",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 9,
  // },
  // {
  //   name: "Lớp đại học",
  //   url: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
  //   members: 12,
  // },
];

const GroupList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredGroups = GroupListData.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) =>
    sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

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
            {filteredGroups.length > 0 ? (
              <ul className="friend-group">
                {filteredGroups.map((group, index) => (
                  <li key={index} className="group-item">
                    <div className="group-item-content">
                      {/* <span className={`avatar ${group.color}`}></span> */}
                      <img
                        src={group.url}
                        alt={group.name}
                        className="avatar"
                      />
                      <div className="group-info">
                        <span className="group-name">{group.name}</span>
                        <span className="group-members">
                          {group.members} thành viên
                        </span>
                      </div>
                    </div>
                    <FaEllipsisV className="menu-icon" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-results">Không tìm thấy nhóm nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupList;
