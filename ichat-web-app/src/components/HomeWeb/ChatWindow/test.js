import { useState } from "react";
import { Modal, Button, Checkbox, Input, Avatar, Tag } from "antd";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";

const contacts = [
  { id: 1, name: "Di 4", avatar: "" },
  { id: 2, name: "Benzen English", avatar: "" },
  { id: 3, name: "Thanh Cảnh", avatar: "https://via.placeholder.com/50" },
  { id: 4, name: "Em Tin", avatar: "https://via.placeholder.com/50" },
  { id: 5, name: "Lê Phước Nguyễn", avatar: "https://via.placeholder.com/50" },
];

const GroupCreateModal = ({ visible, onClose }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);

  const toggleSelect = (contact) => {
    if (selectedContacts.some((c) => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  return (
    <Modal
      title="Tạo nhóm"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary">
          Tạo nhóm
        </Button>,
      ]}
    >
      {/* Nhập tên nhóm */}
      <div className="flex items-center gap-3 mt-2">
        <Avatar size={50} icon={<UserOutlined />} />
        <Input placeholder="Nhập tên nhóm..." />
      </div>

      {/* Tìm kiếm */}
      <div className="mt-3">
        <Input placeholder="Nhập tên, số điện thoại..." />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-3">
        {[
          "Tất cả",
          "Khách hàng",
          "Gia đình",
          "Công việc",
          "Bạn bè",
          "Trả lời sau",
        ].map((tab) => (
          <Button key={tab} className="bg-gray-200 text-black">
            {tab}
          </Button>
        ))}
      </div>

      {/* Danh sách liên hệ */}
      <div className="mt-3 h-40 overflow-y-auto border-t pt-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 px-2 rounded-md"
            onClick={() => toggleSelect(contact)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedContacts.some((c) => c.id === contact.id)}
              />
              <Avatar
                src={contact.avatar || "https://via.placeholder.com/50"}
              />
              <span>{contact.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách đã chọn */}
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <h3 className="text-sm font-medium">
          Đã chọn {selectedContacts.length}/100
        </h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          {selectedContacts.map((contact) => (
            <Tag
              key={contact.id}
              closable
              onClose={() => toggleSelect(contact)}
              className="flex items-center gap-2 bg-white shadow-sm"
            >
              <Avatar
                src={contact.avatar || "https://via.placeholder.com/40"}
                size={24}
              />
              {contact.name}
            </Tag>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default GroupCreateModal;
