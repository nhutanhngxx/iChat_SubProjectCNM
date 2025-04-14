import React, { useState, useEffect } from "react";
import { Avatar, Button, Modal } from "antd";
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
  const [fileInfo, setFileInfo] = useState({
    name: "",
    extension: "",
    size: "",
  });
  // Hàm lấy thông tin file từ URL
  // useEffect(() => {
  //   const fetchFileInfo = async () => {
  //     try {
  //       const url = message.content;
  //       const fileName = decodeURIComponent(url.split("/").pop());
  //       const fileExtension = fileName.split(".").pop();

  //       // Gửi HEAD request để lấy metadata (bao gồm size)
  //       const response = await fetch(url, { method: "HEAD" });
  //       const sizeInBytes = response.headers.get("content-length");

  //       const size = formatBytes(sizeInBytes);

  //       setFileInfo({
  //         name: fileName,
  //         extension: fileExtension,
  //         size,
  //       });
  //     } catch (error) {
  //       console.error("Lỗi khi lấy thông tin file:", error);
  //     }
  //   };

  //   fetchFileInfo();
  // }, [message.content]);
  useEffect(() => {
    const fetchFileInfo = () => {
      try {
        const url = message.content;
        const fileName = decodeURIComponent(url.split("/").pop());
        const fileExtension = fileName.split(".").pop();

        setFileInfo({
          name: fileName,
          extension: fileExtension,
          size: "Không xác định (CORS bị chặn)", // fallback
        });
      } catch (error) {
        console.error("Lỗi khi xử lý file:", error);
      }
    };

    fetchFileInfo();
  }, [message.content]);

  const formatBytes = (bytes) => {
    if (!bytes) return "Không rõ dung lượng";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };
  // const handleDownload = async () => {
  //   const response = await fetch(message.content);
  //   const blob = await response.blob();

  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = fileInfo.name;
  //   link.click();
  // };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = message.content;
    link.setAttribute("download", fileInfo.name); // tên file khi tải về
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`message ${isSender ? "sent" : "received"}`}>
      {!isSender && (
        <div className="avatar-message">
          <Avatar
            size={32}
            src={selectedChat.avatar_path}
            className="profile-avatar-message"
          />
        </div>
      )}

      {message.type === "image" ? (
        <>
          <div
            className="message-image-container"
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          >
            <img
              src={message.content}
              alt="Message image"
              className="message-image"
            />
            <span className="image-hd">HD</span>
            <span className="image-timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
            style={{ top: "30px" }}
          >
            <img
              src={message.content}
              alt="Full-size image"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
              }}
            />
          </Modal>
        </>
      ) : message.type === "file" ? (
        <div className="message-file-container">
          <div className="file-content">
            <span className="file-icon">📄</span> {/* Biểu tượng file Excel */}
            <div className="file-info">
              <span className="file-name">
                {/* {decodeURIComponent(message.content.split("/").pop())} */}
                {fileInfo.name}
              </span>
              {/* <span className="file-size">{message.content.size}</span> */}
              {/* Nếu có size thì hiển thị */}
              <span className="file-type">
                Loại file: {fileInfo.extension.toUpperCase()}
              </span>
              <span className="file-size">Dung lượng: {fileInfo.size}</span>
              <span className="file-cloud">Đã có trên Cloud</span>
            </div>
            <button onClick={handleDownload} className="download-button">
              📥 Tải về
            </button>
          </div>
          <span className="file-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
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
        <div
          className="message-content"
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
