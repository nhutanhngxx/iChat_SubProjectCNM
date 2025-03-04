import React from "react";
import { Input, Button } from "antd";
import {
  SmileOutlined,
  LikeOutlined,
  SendOutlined,
  PictureOutlined,
  LinkOutlined,
  IdcardOutlined,
  MoreOutlined,
  ExpandOutlined,

} from "@ant-design/icons";
import "./MessageInput.css";

const MessageInput = ({ inputMessage, setInputMessage, handleSendMessage }) => {
  return (
    <div className="message-input-container">
      {/* Thanh công cụ trên */}
      <div className="message-toolbar">
        <SmileOutlined className="toolbar-icon" />
        <PictureOutlined className="toolbar-icon" />
        <LinkOutlined className="toolbar-icon" />
        <IdcardOutlined className="toolbar-icon" />
        <ExpandOutlined className="toolbar-icon" />
        <MoreOutlined className="toolbar-icon" />
        
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="message-input-box">
        <Input
          placeholder="Nhập @, tin nhắn tới "
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          bordered={false}
        />
      </div>

      {/* Nút emoji & like */}
      <div className="message-actions">
          <SmileOutlined className="action-icon" />
          {inputMessage ? (
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
            />
          ) : (
            <LikeOutlined className="action-icon" />
          )}
        </div>
    </div>
  );
};

export default MessageInput;
