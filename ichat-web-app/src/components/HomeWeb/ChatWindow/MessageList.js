import React from "react";
import { List, Avatar } from "antd";

const MessageList = ({ messages }) => {
  return (
    <List
      dataSource={messages}
      renderItem={(message) => (
        <List.Item className="message-item">
          <Avatar size="small" src={message.senderAvatar} />
          <div className="message-content">
            <p>{message.text}</p>
            <span className="timestamp">{message.timestamp}</span>
          </div>
        </List.Item>
      )}
    />
  );
};

export default MessageList;
