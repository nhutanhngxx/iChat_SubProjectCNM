import React, { useState, useEffect } from "react";
import { Avatar, Button, Modal, Checkbox, message } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import "./MessageArea.css";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { createGroup } from "../../../redux/slices/groupSlice";
import imageCompression from "browser-image-compression";

const CreateGroupModal = ({ visible, onCancel, onOk, userMessageId }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.user);

    const [selectedContacts, setSelectedContacts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [groupName, setGroupName] = useState("");
    const [avatarGroup, setAvatarGroup] = useState(null); // File ảnh
    const [compressedAvatarFile, setCompressedAvatarFile] = useState(null);
    const [friendsData, setFriendsData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);

    // fetch danh sách bạn bè
    useEffect(() => {
        const fetchList = async () => {
            try {
                const resultFriends = await dispatch(
                    getUserFriends(currentUser.id)
                ).unwrap();
                setFriendsData(resultFriends.friends);
            } catch (error) {
                console.error("Lỗi khi fetch danh sách :", error);
            }
        };

        if (currentUser?.id) {
            fetchList();
        }
    }, [dispatch, currentUser, friendsData]);

    // lấy 2 giá trị userMessageId làm mặc định cho selectedContacts (thành viên được chọn sẵn)
    useEffect(() => {
        if (visible && currentUser) {
            const defaultContacts = [];
            if (userMessageId) {
                defaultContacts.push(userMessageId);
            }
            setSelectedContacts(defaultContacts);
        }
    }, [visible, currentUser, userMessageId]);

    // lọc theo tên 
    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredFriends(friendsData);
        } else {
            const lower = searchText.toLowerCase();
            const filtered = friendsData.filter(
                (friend) =>
                    friend.full_name.toLowerCase().includes(lower) ||
                    (friend.phone && friend.phone.includes(lower))
            );
            setFilteredFriends(filtered);
        }
    }, [searchText, friendsData]);

    // hàm tạo nhóm
    const handleCreateGroup = async () => {
        try {
            await dispatch(
                createGroup({
                    name: groupName,
                    admin_id: currentUser.id,
                    avatar: compressedAvatarFile,
                    participant_ids: selectedContacts,
                })
            ).unwrap();

            message.success("Tạo nhóm thành công");
            //   onOk();
            resetFields();
        } catch (error) {
            message.error("Tạo nhóm thất bại: " + error);
        }
    };

    const resetFields = () => {
        setGroupName("");
        setAvatarGroup(null);
        setCompressedAvatarFile(null);
        setSearchText("");
        setFilteredFriends(friendsData);
        setActiveCategory("all");

        const defaultContacts = [];
        if (userMessageId) {
            defaultContacts.push(userMessageId);
        }

        setSelectedContacts(defaultContacts);
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 600,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const previewUrl = URL.createObjectURL(compressedFile);
            setAvatarGroup(previewUrl);
            setCompressedAvatarFile(compressedFile); // lưu lại để upload
        } catch (error) {
            console.error("Lỗi khi nén ảnh avatar:", error);
        }
    };

    // Hàm để chọn hoặc bỏ chọn một liên hệ
    const toggleContact = (contactId) => {
        setSelectedContacts((prev) =>
            prev.includes(contactId)
                ? prev.filter((id) => id !== contactId)
                : [...prev, contactId]
        );
    };

    // Hàm để xóa một liên hệ đã chọn
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
                    disabled={!groupName || selectedContacts.length < 2}
                    onClick={handleCreateGroup}
                >
                    Tạo nhóm
                </Button>,
            ]}
        >
            <div className="dialog-content" style={{ height: "538px" }}>
                <div>
                    {/* Phần tên nhóm */}
                    <div className="group-name-input">
                        <label style={{ cursor: "pointer" }}>
                            <Avatar
                                src={avatarGroup || "https://via.placeholder.com/40"}
                                className="camera-icon"
                                style={{ width: 40, height: 40 }}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên nhóm..."
                            onChange={(e) => setGroupName(e.target.value)}
                            value={groupName}
                            required
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
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {/* Danh mục */}
                    {/* <div className="categories">
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
            </div> */}
                </div>

                <div className="conversation-container">
                    <div className="conversations-list">
                        <div className="contacts">
                            {Array.isArray(filteredFriends) && filteredFriends.length > 0 ? (
                                filteredFriends.map((contact) => (
                                    <div
                                        key={contact._id}
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
                                        onClick={() => toggleContact(contact._id)}
                                    >
                                        <Checkbox
                                            checked={selectedContacts.includes(contact._id)}
                                        />
                                        <Avatar
                                            src={contact.avatar_path}
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <span style={{ fontWeight: "500" }}>
                                            {contact.full_name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", padding: "20px" }}>
                                    {"Không có bạn bè nào"}
                                </div>
                            )}
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
                                // tìm trong friendsData, nếu không có thì kiểm tra currentUser hoặc userMessage
                                const contact =
                                    friendsData.find((c) => c.id === contactId) ||
                                    (currentUser?.id === contactId ? currentUser : null);

                                if (!contact) return null; // nếu vẫn không có thì bỏ qua
                                return (
                                    <div key={contactId} className="selected-contact">
                                        <img
                                            src={contact.avatar_path}
                                            alt=""
                                            className="selected-avatar"
                                        />
                                        <span className="selected-name">{contact.full_name}</span>
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
            </div>
        </Modal>
    );
};

export default CreateGroupModal;
