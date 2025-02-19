import React, { useState } from "react";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import "./FriendList.css"; // Import file CSS

const friendsData = [
  { name: "Anh Trai", color: "red" },
  { name: "Anh Hai", color: "blue" },
  { name: "Ba", color: "blue" },
  { name: "Em gái", color: "blue" },
  { name: "Mẹ", color: "blue" },
];

const FriendList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredFriends = friendsData
    .filter((friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Nhóm bạn bè theo chữ cái đầu tiên
  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.name.charAt(0).toUpperCase();
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
                      <span className={`avatar ${friend.color}`}></span>
                      <span className="friend-name">{friend.name}</span>
                      <FaEllipsisV className="menu-icon" />
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
