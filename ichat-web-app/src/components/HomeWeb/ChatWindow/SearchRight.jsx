import React from "react";
import { CiSearch } from "react-icons/ci";
import "./SearchRight.css";
import { FaUser } from "react-icons/fa6";
import { useState } from "react";
import { set } from "lodash";
const SearchRight = ({ setShowSearchRight }) => {
  const [showSenderFilter, setShowSenderFilter] = useState(false);
  //   const [showDateFilter, setShowDateFilter] = useState(false);
  const users = [
    {
      id: 1,
      name: "Bạn",
      avatar: "https://i.pravatar.cc/300?img=1",
    },
    {
      id: 2,
      name: "George Alan",
      avatar: "https://i.pravatar.cc/300?img=1",
    },
  ];
  return (
    <div className="conntainer-seachright">
      <div className="search-right-header-title">
        <h3>Tìm kiếm trong trò chuyện</h3>{" "}
        <p
          onClick={() => {
            setShowSearchRight(false);
          }}
        >
          X
        </p>
      </div>

      <div className="search-right-header">
        <div>
          <CiSearch className="icon-ciSeach" />
          <input type="text" />
          <button>Xoá</button>
        </div>
      </div>
      <div className="search-right-header-fillter">
        <p>Lọc : </p>

        <button onClick={() => setShowSenderFilter(!showSenderFilter)}>
          <FaUser />
          <span>Người gửi</span>
          <span>▼</span>
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
              {users.map((user, index) => (
                <div key={index} className="mini-modal-sender-list-item">
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button>
          <FaUser />
          <span>Ngày gửi</span>
          <span>▼</span>
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default SearchRight;
