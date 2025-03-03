import React from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
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

      <div style={{ display: "inline-flex" }}>
        {/* Ô nhập tin nhắn */}
        <div className="message-input-box">
          <TextareaAutosize
            placeholder="Nhập @, tin nhắn tới "
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Ngăn xuống dòng mặc định
                handleSendMessage();
              }
            }}
            style={{
              width: "100%", // Đảm bảo chiều rộng đầy đủ
              minHeight: "38px", // Chiều cao tối thiểu
              lineHeight: "1.5", // Khoảng cách dòng
              padding: "0px", // Padding giống giao diện không viền
              border: "none", // Loại bỏ viền (tương tự bordered={false} trong Ant Design)
              borderRadius: "4px", // Góc bo tròn nhẹ (tùy chỉnh)
              resize: "none", // Ngăn người dùng thay đổi kích thước thủ công
              overflow: "auto", // Cho phép cuộn nếu nội dung quá dài
              outline: "none", // Loại bỏ outline khi focus
              boxShadow: "none", // Loại bỏ shadow khi focus hoặc hover
            }}
            maxRows={3} // Giới hạn tối đa 3 dòng (tùy chỉnh)
          />
        </div>
        {/* Nút emoji & like */}
        <div className="message-actions">
          <SmileOutlined className="action-icon" />
          {inputMessage ? (
            <div
              className="send-icon"
              onClick={handleSendMessage}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SendOutlined style={{ fontSize: "20px" }} />
            </div>
          ) : (
            <LikeOutlined className="action-icon" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
