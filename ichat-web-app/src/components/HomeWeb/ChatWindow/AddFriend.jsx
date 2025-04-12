import React, { useState } from "react";
import { Modal, Input, Button, Select } from "antd";
import "./AddFriend.css";

const AddFriend = ({ visible, onClose }) => {
  const suggestedFriends = [
    {
      id: 1,
      name: "Ông Ngoại",
      avatar: "https://v0.dev/placeholder.svg?height=40&width=40",
      source: "Từ số điện thoại",
    },
    {
      id: 2,
      name: "Đặng Danh",
      avatar: "https://v0.dev/placeholder.svg?height=40&width=40",
      source: "Từ gợi ý kết bạn",
    },
    {
      id: 3,
      name: "Hoàng Tiến Dũng",
      avatar: "https://v0.dev/placeholder.svg?height=40&width=40",
      source: "Từ gợi ý kết bạn",
    },
    {
      id: 4,
      name: "Hùng",
      avatar: "https://v0.dev/placeholder.svg?height=40&width=40",
      source: "Từ gợi ý kết bạn",
    },
    {
      id: 5,
      name: "Mai Phúc",
      avatar: "https://v0.dev/placeholder.svg?height=40&width=40",
      source: "Từ gợi ý kết bạn",
    },
  ];

  return (
    <Modal
      title="Thêm bạn"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="search" type="primary">
          Tìm kiếm
        </Button>,
      ]}
      width={400}
    >
      <div className="phone-input">
        <Select defaultValue="+84" className="country-code">
          <Select.Option value="+84">
            <span className="flag">🇻🇳</span> (+84)
          </Select.Option>
        </Select>
        <Input placeholder="Số điện thoại" className="number-input" />
      </div>

      <div className="suggested-section">
        <h4>Có thể bạn quen</h4>
        <div className="friends-list">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <img
                  src={friend.avatar || "/placeholder.svg"}
                  alt={friend.name}
                  className="avatar"
                />
                <div className="friend-details">
                  <div className="name">{friend.name}</div>
                  <div className="source">{friend.source}</div>
                </div>
              </div>
              <Button type="primary" size="small">
                Kết bạn
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default AddFriend;
