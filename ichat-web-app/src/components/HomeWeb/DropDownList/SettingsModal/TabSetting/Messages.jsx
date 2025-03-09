import React, { useState } from "react";
import { Switch, Button } from "antd";
import "./css/Messages.css";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const MessageSettings = () => {
  const [quickMessageEnabled, setQuickMessageEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [priorityEnabled, setPriorityEnabled] = useState(true);
  // Mở danh sách tin nhắn nhanh
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const handleQuickMessageClick = () => {
    setShowQuickMessage(true);
  };
  const handleBackClick = () => {
    setShowQuickMessage(false);
  };
  return (
    <div className="message-settings">
      <div className={`main-content ${showQuickMessage ? "shift-left" : ""}`}>
        <h2>Tin nhắn nhanh</h2>
        <p>
          Tạo, chỉnh sửa và quản lý phím tắt cho những tin nhắn thường sử dụng
          trong hội thoại
        </p>
        <div className="box-quick-message">
          <div className="setting-item">
            <p>Tin nhắn nhanh</p>
            <Switch
              checked={quickMessageEnabled}
              onChange={(checked) => setQuickMessageEnabled(checked)}
            />
          </div>
          <div className="quick-message-btn" onClick={handleQuickMessageClick}>
            <p>Quản lý tin nhắn nhanh</p>
            <FaAngleRight />
          </div>
        </div>

        <h2>Thiết lập ẩn trò chuyện</h2>
        <div className="setting-item">
          <div className="box-pin-setting">
            <p>
              Đặt mã PIN cho các cuộc trò chuyện riêng tư để tránh người khác
              nhìn thấy trên máy của bạn
            </p>

            <div className="pin-setting">
              <p>Mã pin</p>
              <p>
                Đang bật <FaAngleRight />
              </p>
            </div>
          </div>
        </div>

        <h2>Chia mục Ưu tiên và Khác</h2>
        <div className="setting-item">
          <div className="box-priority-setting">
            <p>
              Tách riêng trò chuyện không ưu tiên và chuyển sang mục Khác để tập
              trung hơn
            </p>
            <label>
              <p>Chia mục Ưu tiên</p>
              <Switch
                checked={priorityEnabled}
                onChange={(checked) => setPriorityEnabled(checked)}
              />
            </label>
          </div>
        </div>
      </div>
      <div
        className={`quick-message-content ${
          showQuickMessage ? "slide-in" : ""
        }`}
      >
        <div className="header-quick-mess">
          <FaAngleLeft
            onClick={handleBackClick}
            style={{ fontSize: "20px", marginBottom: "8px", cursor: "pointer" }}
          />
          <h1>Tinh nhắn nhanh</h1>
        </div>
        <div className="box-quick-mess-create">
          <p>Tin nhắn nhanh (1)</p>
          <button>Tạo mới</button>
        </div>
        <div className="box-quick-mess-list">
          <div className="quick-mess-item">
            <div className="quick-mess-header-content">
              <p
                style={{
                  backgroundColor: "#f2f2f2",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  display: "inline-block",
                }}
              >
                /Chào bạn
              </p>
              <p>Chào bạn, bạn đang làm gì vậy?</p>
            </div>
            <div className="quick-mess-btn">
              <p>
                <CiEdit />{" "}
              </p>
              <p>
                <MdDelete />{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSettings;
