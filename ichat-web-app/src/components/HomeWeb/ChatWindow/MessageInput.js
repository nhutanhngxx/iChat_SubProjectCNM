import React, { useState } from "react";
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
  CheckOutlined,
} from "@ant-design/icons";
import {
  Popover,
  Button,
  Upload,
  message,
  Badge,
  Modal,
  Input,
  Avatar,
  Checkbox,
  Tabs,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./MessageInput.css";

// Dữ liệu mẫu cho danh sách bạn bè
const mockContacts = [
  { id: 1, name: "Ái Lý", avatar: "https://i.pravatar.cc/300?img=1" },
  { id: 2, name: "Anh Hải", avatar: "https://i.pravatar.cc/300?img=2" },
  { id: 3, name: "Anh Hùng", avatar: "https://i.pravatar.cc/300?img=3" },
  { id: 4, name: "Anh Luân", avatar: "https://i.pravatar.cc/300?img=4" },
  { id: 5, name: "Anh Viên", avatar: "https://i.pravatar.cc/300?img=5" },
];

// Danh sách các danh mục để lọc
const categories = [
  { label: "Khách hàng", value: "Khách hàng" },
  { label: "Gia đình", value: "Gia đình" },
  { label: "Cộng việc", value: "Cộng việc" },
  { label: "Bạn bè", value: "Bạn bè" },
  { label: "Trả lời sau", value: "Trả lời sau" },
];

const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  onImageUpload,
  onFileUpload,
}) => {
  const [selectedImage, setSelectedImage] = useState(null); // State để lưu ảnh đã chọn
  const [selectedFile, setSelectedFile] = useState(null); // State để lưu file đã chọn
  const [isModalOpen, setIsModalOpen] = useState(false); // State để quản lý modal danh thiếp
  const [searchTerm, setSearchTerm] = useState(""); // State cho thanh tìm kiếm
  const [selectedContacts, setSelectedContacts] = useState([]); // State cho danh sách bạn bè được chọn
  const [activeCategory, setActiveCategory] = useState("Khách hàng"); // State cho tab hiện tại

  // Hàm xử lý khi chọn file ảnh (mở hộp thoại tải ảnh trực tiếp)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result; // Lưu URL của ảnh (base64)
        setSelectedImage(imageUrl);
        onImageUpload(imageUrl); // Truyền ảnh lên MessageArea
        message.success("Ảnh đã được tải lên thành công!");
      };
      reader.readAsDataURL(file);
    }
    // Reset input để có thể chọn lại cùng file
    event.target.value = null;
  };

  // Hàm xử lý khi chọn file (mở hộp thoại tải file trực tiếp)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Lưu file object
      onFileUpload(file); // Truyền file lên MessageArea
      message.success(`File "${file.name}" đã được tải lên thành công!`);
    }
    // Reset input để có thể chọn lại cùng file
    event.target.value = null;
  };

  // Hàm gửi tin nhắn (bao gồm gửi ảnh hoặc file nếu có)
  const handleSend = () => {
    if (inputMessage.trim() || selectedImage || selectedFile) {
      if (selectedImage) {
        console.log("Gửi ảnh:", selectedImage);
        // Thêm logic gửi ảnh đến server (nếu cần)
      }
      if (selectedFile) {
        console.log("Gửi file:", selectedFile.name);
        // Thêm logic gửi file đến server (nếu cần)
      }
      handleSendMessage(inputMessage); // Gửi tin nhắn văn bản nếu có
      setSelectedImage(null); // Reset ảnh sau khi gửi
      setSelectedFile(null); // Reset file sau khi gửi
      setInputMessage(""); // Reset tin nhắn văn bản
    }
  };

  // Hàm xử lý khi chọn bạn bè
  const onContactSelect = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Hàm gửi danh thiếp
  const handleSendContacts = () => {
    if (selectedContacts.length > 0) {
      const contactNames = selectedContacts
        .map((id) => mockContacts.find((c) => c.id === id).name)
        .join(", ");
      message.success(`Đã gửi danh thiếp của: ${contactNames}`);
      setIsModalOpen(false); // Đóng modal sau khi gửi
      setSelectedContacts([]); // Reset danh sách bạn bè được chọn
    } else {
      message.warning("Vui lòng chọn ít nhất một danh thiếp để gửi!");
    }
  };

  // Lọc danh sách bạn bè theo từ khóa tìm kiếm và danh mục
  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch = contact.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "Khách hàng" || // Giả sử tất cả thuộc "Khách hàng" cho đơn giản
      true; // Bạn có thể mở rộng logic này để gán danh mục cho từng contact
    return matchesSearch && matchesCategory;
  });

  // Hàm xử lý các tùy chọn trong popover
  const handleMoreOption = (option) => {
    switch (option) {
      case "createGroup":
        message.info("Tạo nhóm được chọn!");
        break;
      case "assignTask":
        message.info("Giao việc được chọn!");
        break;
      case "markImportant":
        message.info("Đánh dấu tin quan trọng được chọn!");
        break;
      case "markUrgent":
        message.info("Đánh dấu tin khẩn cấp được chọn!");
        break;
      default:
        break;
    }
  };

  // Nội dung của popover cho MoreOutlined
  const moreContent = (
    <div className="more-options-popover">
      <div
        className="option-item"
        onClick={() => handleMoreOption("createGroup")}
      >
        <span role="img" aria-label="clock">
          ⏳
        </span>{" "}
        Tạo nhóm
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("assignTask")}
      >
        <span role="img" aria-label="check">
          ✓
        </span>{" "}
        Giao việc
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("markImportant")}
      >
        <span role="img" aria-label="exclamation">
          !
        </span>{" "}
        Đánh dấu tin quan trọng
        <span className="info-icon">?</span>
      </div>
      <div
        className="option-item"
        onClick={() => handleMoreOption("markUrgent")}
      >
        <span role="img" aria-label="bell">
          🔔
        </span>{" "}
        Đánh dấu tin khẩn cấp
        <span className="info-icon">?</span>
      </div>
    </div>
  );

  return (
    <div className="message-input-container">
      {/* Thanh công cụ trên */}
      <div className="message-toolbar">
        <SmileOutlined className="toolbar-icon" />
        <label htmlFor="image-upload" className="toolbar-icon">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }} // Ẩn input file
          />
          <PictureOutlined />
        </label>
        <label htmlFor="file-upload" className="toolbar-icon">
          <input
            type="file"
            id="file-upload"
            accept="*/*"
            onChange={handleFileUpload}
            style={{ display: "none" }} // Ẩn input file
          />
          <LinkOutlined />
        </label>

        <IdcardOutlined
          className="toolbar-icon"
          onClick={() => setIsModalOpen(true)} // Mở modal trực tiếp khi nhấp
        />
        {/* <Popover
          content={moreContent}
          title={null}
          trigger="click"
          placement="topRight"
          overlayClassName="more-popover"
        >
          <MoreOutlined className="toolbar-icon" />
        </Popover> */}
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
                handleSend();
              }
            }}
            style={{
              width: "100%", // Đảm bảo chiều rộng đầy đủ
              minHeight: "38px", // Chiều cao tối thiểu
              lineHeight: "1.5", // Khoảng cách dòng
              padding: "0px", // Padding giống giao diện không viền
              border: "none", // Loại bỏ viền
              borderRadius: "4px", // Góc bo tròn nhẹ
              resize: "none", // Ngăn người dùng thay đổi kích thước thủ công
              overflow: "auto", // Cho phép cuộn nếu nội dung quá dài
              outline: "none", // Loại bỏ outline khi focus
              boxShadow: "none", // Loại bỏ shadow khi focus hoặc hover
            }}
            maxRows={3} // Giới hạn tối đa 3 dòng
          />
        </div>
        {/* Nút emoji & like */}
        <div className="message-actions">
          <SmileOutlined className="action-icon" />
          {inputMessage || selectedImage || selectedFile ? (
            <div
              className="send-icon"
              onClick={handleSend}
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

      {/* Modal danh thiếp */}
      <Modal
        title="Gửi danh thiếp"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendContacts}
            disabled={selectedContacts.length === 0}
          >
            Gửi danh thiếp
          </Button>,
        ]}
        width={600} // Kích thước modal như trong hình
      >
        <div className="contact-modal-content">
          {/* Thanh tìm kiếm */}
          <Input
            placeholder="Tìm danh thiếp theo tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 16 }}
            bordered={false}
          />

          {/* Tabs để lọc danh mục */}
          <Tabs
            defaultActiveKey="Khách hàng"
            onChange={(key) => setActiveCategory(key)}
            className="contact-tabs"
          >
            {categories.map((category) => (
              <Tabs.TabPane tab={category.label} key={category.value}>
                <div className="contact-list">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="contact-item">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => onContactSelect(contact.id)}
                      >
                        <Avatar
                          size={32}
                          src={contact.avatar}
                          className="contact-avatar"
                        />
                        <span className="contact-name">{contact.name}</span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </Modal>
    </div>
  );
};

export default MessageInput;
