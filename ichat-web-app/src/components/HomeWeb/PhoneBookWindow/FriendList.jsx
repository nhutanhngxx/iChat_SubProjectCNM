import React, { useState } from "react";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import "./FriendList.css"; // Import file CSS

const friendsData = [
  {
    name: "Anh Trai",
    color: "red",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
  {
    name: "Anh Hai",
    color: "blue",
    url: "https://i.ibb.co/wNmwL0bW/z5031681385418-29df7773d689107692c787f227cc84c4.jpg",
  },
  {
    name: "Ba",
    color: "blue",
    url: "https://i.ibb.co/23n6GN8X/z5031681390608-cff50a647f157e4733d7f6463432e36d.jpg",
  },
  {
    name: "Em gái",
    color: "blue",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
  {
    name: "Mẹ",
    color: "blue",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
  {
    name: "Thành Cương",
    color: "blue",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
  {
    name: "Xuân Mai",
    color: "blue",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
  {
    name: "Your Love",
    color: "blue",
    url: "https://i.ibb.co/4ngTYr7C/z5031681384600-ab5b44caa4076421b825ae215dd76958.jpg",
  },
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
                        src={friend.url}
                        alt={friend.name}
                        className="avatar"
                      />
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
