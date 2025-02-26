import React from "react";
import { Avatar } from "antd";
import "./Message.css";

const Message = ({ message, selectedChat }) => {
  return (
    <div className={`message ${message.type}`}>
      {message.type === "received" && (
        <div className="avatar-message">
          <Avatar
            size={32}
            src={`https://i.pravatar.cc/300?img=${selectedChat.id}`}
            className="profile-avatar-message"
          />
        </div>
      )}
      <div className="message-content">
        <p>{message.text}</p>
        <span className="timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
};

export default Message;