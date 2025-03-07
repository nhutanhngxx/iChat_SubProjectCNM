import React from "react";
import { CiSearch } from "react-icons/ci";
import "./SearchRight.css";
import { FaUser } from "react-icons/fa6";
import { useState } from "react";
import { concat, set } from "lodash";
import { PiGreaterThan } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";

const SearchRight = ({ setShowSearchRight }) => {
  const [showSenderFilter, setShowSenderFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showDateBeetweenFilter, setShowDateBeetweenFilter] = useState(false);

  // State của text input search
  const [text, setText] = useState("");

  const handleShowSenderFilter = () => {
    setShowSenderFilter(!showSenderFilter);
    setShowDateFilter(false);
  };
  const handleShowDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    setShowSenderFilter(false);
  };
  // Lọc theo người gửi
  const [selectedName, setSelectedName] = useState("");
  const handleSelectUser = (name) => {
    setSelectedName(name);
    console.log(selectedName);

    setShowSenderFilter(false); // Ẩn modal sau khi chọn
  };

  const handleClearInput = () => {
    setSelectedName("");
  };

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
          <IoMdClose />
        </p>
      </div>

      <div className="search-right-header">
        <div>
          <CiSearch className="icon-ciSeach" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tìm kiếm..."
          />
          {text && (
            <button
              onClick={() => setText("")}
              style={{ cursor: "pointer", color: "rgb(122, 122, 122);" }}
            >
              Xoá
            </button>
          )}
        </div>
      </div>
      <div className="search-right-header-fillter">
        <p>Lọc : </p>

        <button
          onClick={() => handleShowSenderFilter()}
          className={`${selectedName ? "text-blue" : ""}`}
        >
          <FaUser />
          <span
            style={{
              display: "inline-block",
              maxWidth: "120px", // Giới hạn độ rộng tối đa
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {selectedName ? selectedName : "Người gửi"}
          </span>
          {selectedName ? (
            <span onClick={handleClearInput} className="cursor-pointer">
              ✖
            </span>
          ) : (
            <span>▼</span>
          )}
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
                <div
                  key={index}
                  className="mini-modal-sender-list-item"
                  onClick={() => handleSelectUser(user.name)}
                >
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
        <button onClick={() => handleShowDateFilter()}>
          <FaUser />
          <span>Ngày gửi</span>
          <span>▼</span>
        </button>
        {showDateFilter && (
          <div className="mini-modal-date">
            <div
              onMouseEnter={() => setShowDateBeetweenFilter(true)}
              onMouseLeave={() => setShowDateBeetweenFilter(false)}
            >
              <p>Gợi ý thời gian </p>
              <p>
                <PiGreaterThan />
              </p>
            </div>
            {showDateBeetweenFilter && (
              <div
                className="mini-modal-date-beetween"
                onMouseEnter={() => setShowDateBeetweenFilter(true)}
                onMouseLeave={() => setShowDateBeetweenFilter(false)}
              >
                <p>Ngày hôm qua</p>
                <p>Ngày hôm nay</p>
                <p>7 ngày trước</p>
                <p>30 ngày trước</p>
              </div>
            )}
            <div>
              <label className="block">Chọn khoảng thời gian</label>
              <div className="beetween-date">
                <input
                  type="date"
                  placeholder="Từ ngày"
                  className="border p-1 w-full rounded"
                />
                <input type="date" className="border p-1 w-full rounded" />
              </div>
              <div className="mini-modal-date-button">
                <button onClick={() => setShowDateFilter(false)}>Huỷ</button>
                <button>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="conttent-searchRight">
        <div className="search-right-empty">
          <h3>Không tìm thấy kết quả</h3>
          <img
            src="https://chat.zalo.me/assets/search_empty_keyword_state.b291c6f32343a363d7bd2d062ba1cf04.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default SearchRight;
