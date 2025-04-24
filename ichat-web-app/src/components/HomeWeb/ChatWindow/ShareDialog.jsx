import { Modal } from "antd";
import React, { useEffect, useState } from "react";
import { Avatar, Checkbox, Button } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { message as AntdMessage } from "antd";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { forwardMessage } from "../../../redux/slices/messagesSlice";
import { useDispatch, useSelector } from "react-redux";

const ShareDialog = ({ open, onClose, message }) => {
    const [searchText, setSearchText] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [friendsData, setFriendsData] = useState([]);
    const [groupsData, setGroupsData] = useState([]);
    const [userMessage, setUserMessage] = useState(null);

    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const resultFriends = await dispatch(
                    getUserFriends(currentUser.id)
                ).unwrap();
                setFriendsData(resultFriends.friends)
            } catch (error) {
                console.error("Lỗi khi fetch danh sách user:", error);
            }

        };
        if (currentUser?.id) {
            fetchUserData();
        }
    }, [dispatch, currentUser, friendsData]);

    useEffect(() => {
        if (searchText.trim() === "")
            setFilteredFriends(friendsData);
        else {
            const lower = searchText.toLowerCase();
            const filtered = friendsData.filter(
                (friend) =>
                    friend.full_name.toLowerCase().includes(lower)
            );
            setFilteredFriends(filtered);
        }
    });

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


    const handShare = async () => {
        if (selectedContacts.length === 0) {
            AntdMessage.warning("Bạn chưa chọn người nhận");
            return;
        }

        try {
            await Promise.all(
                selectedContacts.map((receiverId) =>
                    dispatch(
                        forwardMessage({ messageId: message._id, receiverId, currentUserId: currentUser.id })
                    )
                )
            );
            AntdMessage.success("Chuyển tiếp thành công!");
            onClose();
        } catch (error) {
            AntdMessage.error("Có lỗi xảy ra khi chuyển tiếp.")
        }
    };

    return (
        <Modal
            style={{ overflow: "hidden", height: "100vh", width: "552px" }}
            title={<span className="text-xl font-semibold">Chia sẻ</span>}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    disabled={false}
                    onClick={handShare}
                >
                    Chia sẻ
                </Button>,
            ]}
        >
            <div>
                {/* Thanh tìm kiếm */}
                <div className="search-container">
                    <SearchOutlined className="search-icon" style={{ left: 30 }} />
                    <input
                        type="text"
                        placeholder="Nhập tên bạn bè, nhóm..."
                        onFocus={(e) => (e.target.style.borderColor = "#1890ff")}
                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>



                {/* Chọn danh sách bạn bè và nhóm để chuyển tiếp */}
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

                {/* Nội dung tin nhắn chuyển tiếp */}
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <p>Chia sẻ tin nhắn:</p>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'normal' }}>
                        <p>{message?.content}</p>
                    </div>

                </div>



            </div>
        </Modal>
    );
};

export default ShareDialog;
