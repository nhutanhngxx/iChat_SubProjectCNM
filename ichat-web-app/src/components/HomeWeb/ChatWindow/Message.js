import React,{useState} from "react";
import { Avatar, Button,Modal } from "antd";
import "./Message.css";

import { LikeOutlined, CheckOutlined } from "@ant-design/icons";

const Message = ({ message, selectedChat, isSender }) => {
  // Mở ảnh
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
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

      {message.type==="image" ? (
        <>
        <div className="message-image-container" onClick={handleImageClick} style={{ cursor: "pointer" }}>
          <img
            src={message.content}
            alt="Message image"
            className="message-image"
          />
          <span className="image-hd">HD</span>
          <span className="image-timestamp">{new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
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
        <Modal
              open={isModalOpen}
              footer={null}
              onCancel={handleClose}
              centered
              width={500}
              bodyStyle={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 0, // bỏ padding mặc định để ảnh nằm sát viền nếu muốn
                height: "100%", // đảm bảo ảnh có thể nằm giữa chiều dọc
                top: "30px", 
              }}
              style={{top: "30px"}} 
            >
              <img
                src={message.content}
                alt="Full-size image"
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px" }}
              />
</Modal>

        </>
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
