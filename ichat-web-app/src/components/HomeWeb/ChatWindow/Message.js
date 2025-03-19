import React from "react";
import { Avatar, Button } from "antd";
import "./Message.css";

import { LikeOutlined, CheckOutlined } from "@ant-design/icons";

const Message = ({ message, selectedChat, isSender }) => {
  return (
    <div className={`message ${isSender ? "sent" : "received"}`}
    >
    
      {!isSender && (
        <div className="avatar-message">
          <Avatar
            size={32}
            src={selectedChat.avatar_path}
            className="profile-avatar-message"
          />
        </div>
      )}

      {message.image ? (
        <div className="message-image-container">
          <img
            src={message.image}
            alt="Message image"
            className="message-image"
          />
          <span className="image-hd">HD</span>
          <span className="image-timestamp">{message.timestamp}</span>
          {/* <div className="message-actions-preview">
            <Button size="small" icon={<LikeOutlined />} />
            <Button
              size="small"
              icon={<CheckOutlined />}
              style={{ marginLeft: "8px" }}
            >
              Đã gửi
            </Button>
          </div> */}
        </div>
      ) : message.file ? (
        <div className="message-file-container">
          <div className="file-content">
            <span className="file-icon">📄</span> {/* Biểu tượng file Excel */}
            <div className="file-info">
              <span className="file-name">{message.file.name}</span>
              <span className="file-size">{message.file.size}</span>
              <span className="file-cloud">Đã có trên Cloud</span>
            </div>
          </div>
          <span className="file-timestamp">{message.timestamp}</span>
          {/* <div className="message-actions-preview">
            <Button size="small" icon={<LikeOutlined />} />
            <Button
              size="small"
              icon={<CheckOutlined />}
              style={{ marginLeft: "8px" }}
            >
              Đã gửi
            </Button>
          </div> */}
        </div>
      ) : (
        <div className="message-content" 
        style={{
          backgroundColor: isSender ? "#e6f7ff" : "#fff",
        }}
        >
          <p>{message.content}</p>
          <span className="timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
