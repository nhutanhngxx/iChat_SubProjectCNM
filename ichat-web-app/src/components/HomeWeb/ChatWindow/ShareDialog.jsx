import { Modal } from "antd";
import React, { useEffect, useState } from "react";
import { Avatar, Checkbox, Button } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { message as AntdMessage } from "antd";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { getUserGroups } from "../../../redux/slices/groupSlice";
import {
  forwardMessage,
  fetchMessages,
  fetchChatMessages,
  updateMessages,
} from "../../../redux/slices/messagesSlice";
import { useDispatch, useSelector } from "react-redux";

const ShareDialog = ({ open, onClose, message }) => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // friends | groups
  const [filteredData, setFilteredData] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resultFriends = await dispatch(
          getUserFriends(currentUser.id)
        ).unwrap();
        setFriendsData(resultFriends.friends);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách user:", error);
      }
    };

    const fetchGroupData = async () => {
      try {
        const resultGroups = await dispatch(
          getUserGroups(currentUser.id)
        ).unwrap();
        setGroupsData(resultGroups);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách group:", error);
      }
    };
    if (currentUser?.id) {
      fetchUserData();
      fetchGroupData();
    }
  }, [dispatch, currentUser]);

  // Lọc danh sách bạn bè theo từ khóa tìm kiếm
  useEffect(() => {
    const lower = searchText.toLowerCase().trim();

    if (lower === "") {
      if (activeTab === "friends") {
        setFilteredData(friendsData);
      } else {
        setFilteredData(groupsData);
      }
    } else {
      const matchedFriends = friendsData.filter((friend) =>
        friend.full_name.toLowerCase().includes(lower)
      );
      const matchedGroups = groupsData.filter((group) =>
        group.name.toLowerCase().includes(lower)
      );
      setFilteredData(matchedFriends.concat(matchedGroups));
    }
  }, [searchText, friendsData, groupsData, activeTab]);

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
            forwardMessage({
              messageId: message._id,
              receiverId,
              currentUserId: currentUser.id,
            })
          )
        )
      );
      dispatch(fetchMessages(currentUser.id || currentUser._id)).unwrap();
      AntdMessage.success("Chuyển tiếp thành công!");
      onClose();
    } catch (error) {
      AntdMessage.error("Có lỗi xảy ra khi chuyển tiếp.");
    }
  };

  // console.log("user current from ShareDialog", currentUser);
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

        {/* Chọn tab bạn bè hoặc nhóm */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "12px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={() => setActiveTab("friends")}
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              backgroundColor: activeTab === "friends" ? "#1677ff" : "#f0f0f0",
              color: activeTab === "friends" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Bạn bè
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              backgroundColor: activeTab === "groups" ? "#1677ff" : "#f0f0f0",
              color: activeTab === "groups" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Nhóm
          </button>
        </div>

        {/* Chọn danh sách bạn bè và nhóm để chuyển tiếp */}
        <div className="conversation-container">
          <div className="conversations-list">
            <div className="contacts">
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const isFriend = !!item.full_name; // Dựa vào field đặc trưng
                  const id = item._id;
                  const name = isFriend ? item.full_name : item.name;
                  const avatar = isFriend ? item.avatar_path : item.avatar;

                  return (
                    <div
                      key={id}
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
                      onClick={() => toggleContact(id)}
                    >
                      <Checkbox checked={selectedContacts.includes(id)} />
                      <Avatar
                        src={avatar}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                        }}
                      />
                      <span style={{ fontWeight: "500" }}>{name}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  {activeTab === "friends"
                    ? "Không có bạn bè nào"
                    : "Không có nhóm nào"}
                </div>
              )}
            </div>
          </div>

          {/* Danh sách đã chọn */}
          <div className="selected-section">
            <div className="selected-header">
              Đã chọn{" "}
              <span className="selected-count">
                {selectedContacts.length}/100
              </span>
            </div>
            <div className="selected-contacts">
              {selectedContacts.map((contactId) => {
                const contact =
                  filteredData.find((item) => item._id === contactId) || null;
                if (!contact) return null;

                const isFriend = !!contact.full_name;
                const name = isFriend ? contact.full_name : contact.name;
                const avatar = isFriend ? contact.avatar_path : contact.avatar;

                return (
                  <div key={contactId} className="selected-contact">
                    <img src={avatar} alt="" className="selected-avatar" />
                    <span
                      className="selected-name"
                      style={{
                        display: "inline-block",
                        maxWidth: "90px", // hoặc bao nhiêu tùy thiết kế của bạn
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </span>
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
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            <p>Chia sẻ tin nhắn:</p>
          </div>
          <div style={{ fontSize: "16px", fontWeight: "normal" }}>
            <p>{message?.content}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareDialog;
