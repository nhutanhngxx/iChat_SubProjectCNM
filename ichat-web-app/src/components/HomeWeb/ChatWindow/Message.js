import React from "react";
import "./MessageArea.css";

const Message = ({ message }) => {
  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        <p>{message.text}</p>
        <span className="timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
};

export default Message;