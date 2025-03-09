import React from "react";
import { Avatar, Button } from "antd";
import "./ConversationDetails.css";
import {
  EditOutlined,
  BellOutlined,
  PushpinOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

const ConversationDetails = ({ isVisible, selectedChat }) => {
  if (!isVisible) return null; // Ẩn component nếu isVisible = fals

  return (
    <div className="conversation-details" style={{ padding: "20px" }}>
      <div className="header">
        <h2>Thông tin hội thoại</h2>
        <div className="avatar">
          <Avatar
            size={60}
            src={`https://i.pravatar.cc/300?img=${selectedChat.id}`}
          />
        </div>
        <h3>
          {selectedChat.name} <EditOutlined />
        </h3>
      </div>
      <div className="action-buttons">
        <Button icon={<BellOutlined />} className="action-button">
          <span>
            Tắt <br /> thông báo
          </span>
        </Button>
        <Button icon={<PushpinOutlined />} className="action-button">
          <span>
            Ghim <br /> hộp thoại
          </span>
        </Button>
        <Button icon={<UsergroupAddOutlined />} className="action-button">
          <span>
            Tạo nhóm <br /> trò chuyện
          </span>
        </Button>
      </div>
      <div className="conversation-options">
        <h3>Hình ảnh</h3>
        <div className="select-wrapper">
          <select>
            <option></option>
          </select>
        </div>
      </div>
      <div className="file-link-section">
        <div className="file">
          <h3>File</h3>
          <div className="select-wrapper">
            <select>
              <option></option>
            </select>
          </div>
        </div>
        <div className="link">
          <h3>Link</h3>
          <div className="select-wrapper">
            <select>
              <option></option>
            </select>
          </div>
        </div>
      </div>
      <div className="footer">
        <button>Xóa lịch sử trò chuyện</button>
      </div>
    </div>
  );
};

export default ConversationDetails;
