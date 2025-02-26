import React from 'react';
import { Avatar } from 'antd';
import './ConversationDetails.css';
import { EditOutlined } from '@ant-design/icons';

const ConversationDetails = ({ isVisible, selectedChat }) => {
  if (!isVisible) return null; // Ẩn component nếu isVisible = false

  return (
    <div className="conversation-details">
      <div className="header">
        <h2>Thông tin hội thoại</h2>
        <div className="avatar">
          <Avatar
            size={60}
            src={`https://i.pravatar.cc/300?img=${selectedChat.id}`}
          />
        </div>
        <h3>{selectedChat.name} <EditOutlined /></h3>
        
      </div>
      <div className="action-buttons">
        <button>Tắt thông báo</button>
        <button>Ghim hộp thoại</button>
        <button>Tạo nhóm trò chuyện</button>
      </div>
      <div className="conversation-options">
        <h3>Đánh dấu nhắc nhở</h3>
        <div className="select-wrapper">
          <select>
            <option>2 giờ chiều</option>
          </select>
        </div>
        <h3>Âm thanh</h3>
        <div className="select-wrapper">
          <select>
            <option>Xem tất</option>
          </select>
        </div>
      </div>
      <div className="file-link-section">
        <div className="file">
          <h3>File</h3>
          <div className="select-wrapper">
            <select>
              <option>Xem tất</option>
            </select>
          </div>
        </div>
        <div className="link">
          <h3>Link</h3>
          <div className="select-wrapper">
            <select>
              <option>Xem tất</option>
            </select>
          </div>
        </div>
      </div>
      <div className="footer">
        <button>Thoát nhóm ngay</button>
      </div>
    </div>
  );
};

export default ConversationDetails;
