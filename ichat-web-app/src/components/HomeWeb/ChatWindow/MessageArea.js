import React, { useState, useEffect, useRef, use } from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Button,
  Modal,
  Input,
  Checkbox,
} from "antd";
import {
  VideoCameraOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  ProfileOutlined,
  EditOutlined,
  TagOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatMessages,sendMessage,fetchMessages,updateMessages } from "../../../redux/slices/messagesSlice";
import Message from "./Message";
import MessageInput from "./MessageInput";
import ConversationDetails from "./ConversationDetails";
import SearchRight from "./SearchRight";
import { set } from "lodash";
import "./MessageArea.css";

const { Header, Content } = Layout;

// Constants
const CATEGORY_COLORS = [
  "#ef4444",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

const mockMessagesByUser = {
  1: [
    {
      id: 1,
      text: "Hi, is the watch still up for sale?",
      sender: "George Alan",
      timestamp: "2:30 PM",
      type: "received",
    },
    {
      id: 2,
      text: "Awesome! Can I see a couple of pictures?",
      sender: "You",
      timestamp: "2:31 PM",
      type: "sent",
    },
  ],
  2: [
    {
      id: 3,
      text: "Your ride is arriving",
      sender: "Uber Cars",
      timestamp: "1:45 PM",
      type: "received",
    },
  ],
};

// Sub-components
const AddCategoryModal = ({ setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (categoryName.trim()) {
      setCategories((prev) => [
        ...prev,
        { name: categoryName, color: selectedColor },
      ]);
      setCategoryName("");
      setSelectedColor(CATEGORY_COLORS[0]);
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <Button
        type="text"
        className="add-category-button"
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        Thêm phân loại
      </Button>

      <Modal
        title="Thêm mới thẻ phân loại"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Thêm phân loại"
        cancelText="Hủy"
        okButtonProps={{ disabled: !categoryName.trim() }}
      >
        <label>Tên thẻ phân loại</label>
        <Input
          placeholder="Nhập tên thẻ phân loại"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          style={{ marginBottom: "10px" }}
        />

        <label>Thay đổi màu thẻ</label>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              style={{
                background: color,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border:
                  selectedColor === color
                    ? "3px solid black"
                    : "1px solid gray",
                cursor: "pointer",
              }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

const EditCategoryModal = ({ initialName, initialColor, onCancel, onSave }) => {
  const [categoryName, setCategoryName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const handleSubmit = () => {
    if (categoryName.trim()) {
      onSave({ name: categoryName, color: selectedColor });
    }
  };

  return (
    <Modal
      title="Chỉnh sửa thẻ phân loại"
      open={true}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{ disabled: !categoryName.trim() }}
    >
      <label>Tên thẻ phân loại</label>
      <Input
        placeholder="Nhập tên thẻ phân loại"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <label>Thay đổi màu thẻ</label>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            style={{
              background: color,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border:
                selectedColor === color ? "3px solid black" : "1px solid gray",
              cursor: "pointer",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </Modal>
  );
};

const CategoryMenu = () => {
  const [visible, setVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([
    { name: "Khách hàng", color: "#e74c3c" },
    { name: "Gia đình", color: "#e84393" },
    { name: "Công việc", color: "#f39c12" },
    { name: "Bạn bè", color: "#f1c40f" },
    { name: "Trả lời sau", color: "#2ecc71" },
    { name: "Đồng nghiệp", color: "#3498db" },
  ]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setVisible(false); // Đóng dropdown sau khi chọn
  };

  const handleUpdateCategory = (updatedCategory) => {
    setCategories(
      categories.map((cat, index) =>
        index === editingCategory.index ? updatedCategory : cat
      )
    );
    setEditingCategory(null);
  };

  const handleDelete = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleManageCategories = () => {
    setVisible(false);
    setIsModalVisible(true);
  };

  const menu = (
    <Menu className="category-menu">
      {categories.map((category, index) => (
        <Menu.Item
          key={index}
          className="category-item"
          onClick={() => handleSelectCategory(category)}
        >
          <div className="category-content">
            <div
              className="category-dot"
              style={{ backgroundColor: category.color }}
            />
            <span>{category.name}</span>
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        key="manage"
        className="manage-item"
        onClick={handleManageCategories}
      >
        <div className="manage-content">
          <SettingOutlined />
          <span>Quản lý thể phân loại</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="category-dropdown-container">
      <Dropdown
        overlay={menu}
        visible={visible}
        onVisibleChange={setVisible}
        trigger={["click"]}
        placement="bottomLeft"
      >
        <div
          className="category-icon"
          style={{
            // Thêm style động dựa vào category được chọn
            backgroundColor: selectedCategory?.color || "transparent",
            borderRadius: "50%",
            padding: 8,
            transition: "background-color 0.3s",
            fontSize: 15,
          }}
        >
          <TagOutlined
            style={{
              color: selectedCategory ? "white" : "inherit",
              display: "block",
            }}
          />
        </div>
      </Dropdown>

      <Modal
        title="Quản lý thể phân loại"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
        className="category-management-modal"
      >
        <div className="category-management-content">
          <h4>Danh sách thể phân loại</h4>
          <div className="category-list">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-list-item"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="category-drag-handle">
                  <MenuOutlined />
                </div>
                <div
                  className="category-tag"
                  style={{ backgroundColor: category.color }}
                />
                <div className="category-name">{category.name}</div>

                {hoveredIndex === index && (
                  <div className="category-actions">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setEditingCategory({ index, ...category })}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(index)}
                      className="delete"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <AddCategoryModal setCategories={setCategories} />
        </div>

        {editingCategory && (
          <EditCategoryModal
            initialName={editingCategory.name}
            initialColor={editingCategory.color}
            onCancel={() => setEditingCategory(null)}
            onSave={handleUpdateCategory}
          />
        )}
      </Modal>
    </div>
  );
};

const CreateGroupModal = ({ visible, onCancel, onOk }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [groupName, setGroupName] = useState("");

  // Danh sách mock data
  const contacts = [
    { id: "1", name: "Di 4", image: "https://via.placeholder.com/40" },
    {
      id: "2",
      name: "Benzen English",
      image: "https://via.placeholder.com/40",
    },
    { id: "3", name: "Thanh Cảnh", image: "https://via.placeholder.com/40" },
    { id: "4", name: "Em Tin", image: "https://via.placeholder.com/40" },
    {
      id: "5",
      name: "Lê Phước Nguyên",
      image: "https://via.placeholder.com/40",
    },
  ];

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "customers", label: "Khách hàng" },
    { id: "family", label: "Gia đình" },
    { id: "work", label: "Công việc" },
    { id: "friends", label: "Bạn bè" },
  ];

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const removeContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter((c) => c !== contactId));
  };

  return (
    <Modal
      style={{ overflow: "hidden", height: "100vh", width: "552px" }}
      title={<span className="text-xl font-semibold">Tạo nhóm</span>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!groupName || selectedContacts.length === 0}
          onClick={onOk}
        >
          Tạo nhóm
        </Button>,
      ]}
    >
      <div className="dialog-content" style={{ height: "538px" }}>
        <div>
          {/* Phần tên nhóm */}
          <div className="group-name-input">
            <Avatar
              src="https://via.placeholder.com/40"
              className="camera-icon"
            >
              G
            </Avatar>
            <input
              type="text"
              placeholder="Nhập tên nhóm..."
              onChange={(e) => setGroupName(e.target.value)}
              value={groupName}
            />
          </div>

          {/* Thanh tìm kiếm */}
          <div className="search-container">
            <SearchOutlined className="search-icon" style={{ left: 30 }} />
            <input
              type="text"
              placeholder="Nhập tên, số điện thoại..."
              onFocus={(e) => (e.target.style.borderColor = "#1890ff")}
              onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />
          </div>

          {/* Danh mục */}
          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.id}
                style={{
                  borderRadius: "9999px",
                  padding: "5px 16px",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  backgroundColor:
                    activeCategory === category.id ? "#2563eb" : "#f3f4f6",
                  color: activeCategory === category.id ? "white" : "#374151",
                  transition: "background-color 0.2s, color 0.2s",
                  fontSize: "12px",
                }}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="conversation-container">
          <div className="conversations-list">
            <div className="contacts">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => toggleContact(contact.id)}
                >
                  <Checkbox checked={selectedContacts.includes(contact.id)} />
                  <Avatar
                    src={contact.image}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                    }}
                  >
                    {contact.name[0]}
                  </Avatar>
                  <span style={{ fontWeight: "500" }}>{contact.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="selected-section">
            <div className="selected-header">
              Đã chọn{" "}
              <span className="selected-count">
                {selectedContacts.length}/100
              </span>
            </div>
            <div className="selected-contacts">
              {selectedContacts.map((contactId) => {
                const contact = contacts.find((c) => c.id === contactId);
                return (
                  <div key={contactId} className="selected-contact">
                    <img
                      src={contact.image}
                      alt=""
                      className="selected-avatar"
                    />
                    <span className="selected-name">{contact.name}</span>
                    <button
                      className="remove-button"
                      onClick={() => removeContact(contactId)}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Counter
        {selectedContacts.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "5rem",
              right: "3.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "500",
            }}
          >
            Đã chọn {selectedContacts.length}/100
          </div>
        )} */}
      </div>
    </Modal>
  );
};
// Mock messages for different users
// const mockMessagesByUser = {
//   1: [
//     {
//       id: 1,
//       text: "Hi, is the watch still up for sale?",
//       sender: "George Alan",
//       timestamp: "2:30 PM",
//       type: "received",
//     },
//     {
//       id: 2,
//       text: "Awesome! Can I see a couple of pictures?",
//       sender: "You",
//       timestamp: "2:31 PM",
//       type: "sent",
//     },
//   ],
//   2: [
//     {
//       id: 3,
//       text: "Your ride is arriving",
//       sender: "Uber Cars",
//       timestamp: "1:45 PM",
//       type: "received",
//     },
//   ],
// };

const MessageArea = ({ selectedChat, user }) => {
  // Load tin nhắn từ Bacend
  // Lấy dữ liệu tin nhắn từ Redux Store
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.messages.chatMessages);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  // Hiển thị thông tin hội thoại
  const [showConversation, setShowConversation] = useState(false);
  const [showSearchRight, setShowSearchRight] = useState(false);
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const messageEndRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleShowSearchRight = () => {
    setShowSearchRight(!showSearchRight);
    setShowConversation(false);
  };
  const handleShowConversation = () => {
    setShowConversation(!showConversation);
    setShowSearchRight(false);
  };
  // State quản lý mở rộng/thu nhỏ hội thoại
  const [isExpanded, setIsExpanded] = useState(false);
  // để đóng picker của MessageInput khi mở picker từ MessageArea
  const [showPickerFromMessArea, setshowPickerFromMessArea] = useState(true);
  const [activeTabFromMessageArea, setActiveTabFromMessageArea] =
    useState("info");
  const handleExpandContract = () => {
    setIsExpanded(!isExpanded); // Mở rộng
    setshowPickerFromMessArea(!showPickerFromMessArea); // Đóng picker
    setActiveTabFromMessageArea("info"); // Chuyển về tab thông tin
  };

  // Mở hộp thoại thông tin hội thoại có biểu tượng
  const handleShowConversationSymbol = () => {
    setShowConversation(true);
    setShowSearchRight(false);
    setshowPickerFromMessArea(false);
    handleExpandContract();
  };
  console.log(handleExpandContract);

  // Gọi API khi component render
  useEffect(() => {
    if (user?.id && selectedChat?.receiver_id) {
      dispatch(
        fetchChatMessages({
          senderId: user.id,
          receiverId: selectedChat.receiver_id,
        })
      );
    }
  }, [dispatch, user?.id, selectedChat?.receiver_id]);
  console.log("Chat Messages in MessageArea", chatMessages);

  // const handleSendMessage = (text = "") => {

  //   if (
  //     (text.trim() || messages.some((m) => m.image || m.file)) &&
  //     selectedChat
  //   ) {
  //     const newMessage = {
  //       sender_id: user?.id, // ID người gửi
  //       receiver_id: selectedChat?.id, // ID người nhận
  //       content: text || "",
  //       type: "text", // Loại tin nhắn (text, image, file)
  //       chat_type: "private",
  //       // timestamp: new Date().toLocaleTimeString([], {
  //       //   hour: "2-digit",
  //       //   minute: "2-digit",
  //       // }),
  //       // type: "sent",
  //       // image: messages.some((m) => m.image) ? null : undefined,
  //       // file: messages.some((m) => m.file) ? null : undefined,
  //     };
  //     setMessages([...messages, newMessage]);
  //     setInputMessage("");
  //   }
  // };
  const handleSendMessage =async (text = "", image = null, file = null) => {
    if ((text.trim() || image || file) && selectedChat) {
      const newMessage = {
        sender_id: user?.id, // ID người gửi
        receiver_id: selectedChat?.id, // ID người nhận
        content: text || "",
        type: "text", // Loại tin nhắn (text, image, file)
        chat_type: "private",
      };

     try {
      // await dispatch(sendMessage(newMessage)).unwrap(); // Chờ gửi thành công
      // await dispatch(fetchMessages(user?.id)); // Cập nhật danh sách người nhận
      // dispatch(fetchChatMessages({ senderId: user.id, receiverId: selectedChat.receiver_id })); // Cập nhật tin nhắn giữa sender và receiver'
      const response = await dispatch(sendMessage(newMessage)).unwrap(); // Chờ gửi thành công

      const sentMessage = response.data; // Tin nhắn vừa gửi
      
      // Cập nhật danh sách tin nhắn chatMessages ngay lập tức
      dispatch(updateMessages(sentMessage));

      // Cập nhật danh sách người nhận gần nhất
      dispatch(fetchMessages(user?.id));
     } catch (error) {
      console.log("Error sending message:", error);
      
     }
    }
  };
  const handleImageUpload = (imageUrl) => {
    if (selectedChat) {
      const newMessage = {
        id: messages.length + 1,
        text: "",
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "sent",
        image: imageUrl,
      };
      setMessages([...messages, newMessage]);
    }
  };

  const handleFileUpload = (file) => {
    if (selectedChat) {
      const newMessage = {
        id: messages.length + 1,
        text: "",
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "sent",
        file: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type || "application/octet-stream",
        },
      };
      setMessages([...messages, newMessage]);
    }
  };
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat, messages]);
  console.log("Selected Chat in MessageArea", selectedChat);
  console.log("Messages in MessageArea", messages);

  const handleScrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="message-wrapper">
      <Layout className="message-area-container">
        <Header className="chat-header-message">
          <div className="user-profile-message">
            <div className="avatar-message">
              <Avatar
                size={48}
                src={selectedChat.avatar_path} // Thay đổi avatar
                className="profile-avatar-message"
              />
            </div>
            <div className="user-info-message">
              <h3 className="user-name-message">
                {selectedChat.name} <EditOutlined />
              </h3>
              <CategoryMenu />
            </div>
          </div>

          <div className="action-buttons-message-area">
            <UsergroupAddOutlined
              className="header-icon-message-area"
              onClick={() => setModalVisible(true)}
            />
            <CreateGroupModal
              visible={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={() => {
                // Xử lý tạo nhóm
                setModalVisible(false);
              }}
            />
            <VideoCameraOutlined className="header-icon-message" />
            <SearchOutlined
              className="header-icon"
              onClick={handleShowSearchRight}
            />
            <ProfileOutlined
              className="header-icon"
              onClick={handleShowConversation}
            />
          </div>
        </Header>

        <Content className="message-area-content">
          <div className="message-container">
            {(chatMessages || []).map((message) => (
              <div>
                <Message
                key={message.id}
                message={message}
                selectedChat={selectedChat}
                isSender={message.sender_id === user.id}
                onClick={handleScrollToBottom} 

              />
              <div ref={messageEndRef} ></div>
              </div>
            ))}
            {/* Phần tử ẩn để cuộn xuống */}
            <div ref={messageEndRef} />
          </div>
        </Content>

        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          onImageUpload={handleImageUpload} // Truyền callback để xử lý ảnh
          onFileUpload={handleFileUpload} // Truyền callback để xử lý file
          handleShowConversationSymbol={handleShowConversationSymbol} // Truyền hàm xử lý hiển thị thông tin hội thoại
          showPickerFromMessArea={showPickerFromMessArea}
          isExpanded={isExpanded} // Truyền state isExpanded
          showConversation={showConversation} // Truyền showConversation
        />
      </Layout>

      {showConversation && (
        <Layout className="conversation-details">
          <ConversationDetails
            isVisible={showConversation}
            selectedChat={selectedChat}
            isExpanded={isExpanded} // Truyền state isExpanded
            handleExpandContract={handleExpandContract} // Thêm dòng này
            activeTabFromMessageArea={activeTabFromMessageArea} // Truyền activeTabFromMessageArea
            onImageUpload={handleImageUpload} // Truyền callback để xử lý ảnh
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage} // Truyền hàm xử lý gửi tin nhắn
          />
        </Layout>
      )}
      {/* Hiển thị tìm kiếm bên thông tin hội thoại */}
      {showSearchRight && (
        <Layout className="layout-search-right">
          <SearchRight setShowSearchRight={setShowSearchRight} />
        </Layout>
      )}
    </div>
  );
};

export default MessageArea;
