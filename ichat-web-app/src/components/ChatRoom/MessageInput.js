import React from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "./MessageInput.css";

const MessageInput = ({ inputMessage, setInputMessage, handleSendMessage }) => {
  return (
    <div className="message-input">
      <Input
        placeholder="Type a message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onPressEnter={handleSendMessage}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSendMessage}
      />
    </div>
  );
};

export default MessageInput;