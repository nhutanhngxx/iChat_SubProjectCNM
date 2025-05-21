import React, { useState, useEffect } from "react";
import { Avatar, Button, Modal, Checkbox, Input, Divider, Alert } from "antd";
import {
  SearchOutlined,
  CameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getUserFriends } from "../../../redux/slices/friendSlice";
import { createGroup } from "../../../redux/slices/groupSlice";
import imageCompression from "browser-image-compression";
import { fetchMessages } from "../../../redux/slices/messagesSlice";
import socket from "../../services/socket";

const CreateGroupModal = ({ visible, onCancel, onOk, userMessageId }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [avatarGroup, setAvatarGroup] = useState(null);
  const [compressedAvatarFile, setCompressedAvatarFile] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const resultFriends = await dispatch(
          getUserFriends(currentUser.id)
        ).unwrap();
        setFriendsData(resultFriends.friends);
        setFilteredFriends(resultFriends.friends);
        setIsLoadingFriends(false);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách :", error);
        setIsLoadingFriends(false);
      }
    };

    if (currentUser?.id) {
      fetchList();
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (visible && currentUser) {
      const defaultContacts = userMessageId
        ? [currentUser.id, userMessageId]
        : [currentUser.id];
      setSelectedContacts(defaultContacts);
    }
  }, [visible, currentUser, userMessageId]);

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

  const handleCreateGroup = async () => {
    try {
      const newGroup = await dispatch(
        createGroup({
          name: groupName,
          admin_id: currentUser.id,
          avatar: compressedAvatarFile,
          participant_ids: selectedContacts,
        })
      ).unwrap();
      console.log("Nhóm mới đã được tạo:", newGroup);
      socket.emit("join-room", newGroup._id);

      socket.emit("create-group", newGroup._id || newGroup.id, {
        name: groupName,
        admin_id: currentUser.id,
        participant_ids: selectedContacts,
      });

      // onOk();
      resetFields();
      dispatch(fetchMessages(currentUser.id || currentUser._id)).unwrap();
      onCancel();
    } catch (error) {
      console.error("Tạo nhóm thất bại:", error);
    }
  };
  // Thêm trong useEffect hoặc sau khi tạo nhóm thành công
  useEffect(() => {
    const handleGroupCreated = (groupId) => {
      // Tham gia vào phòng nhóm mới
      socket.emit("join-room", groupId);
      console.log("Đã tham gia vào phòng nhóm mới:", groupId);
    };

    socket.on("group-created", handleGroupCreated);

    return () => {
      socket.off("group-created", handleGroupCreated);
    };
  }, []);

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
      setCompressedAvatarFile(compressedFile);
    } catch (error) {
      console.error("Lỗi khi nén ảnh avatar:", error);
    }
  };

  const resetFields = () => {
    setGroupName("");
    setAvatarGroup(null);
    setCompressedAvatarFile(null);
    setSearchText("");
    setFilteredFriends(friendsData);
    const defaultContacts = userMessageId
      ? [currentUser.id, userMessageId]
      : [currentUser.id];
    setSelectedContacts(defaultContacts);
  };

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <Modal
      title="Tạo nhóm trò chuyện mới"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="create"
          type="primary"
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedContacts.length < 3}
        >
          Tạo nhóm
        </Button>,
      ]}
      width={550}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
        >
          <div style={{ marginRight: 20, position: "relative" }}>
            <Avatar
              size={64}
              src={avatarGroup}
              style={{ cursor: "pointer" }}
              onClick={() =>
                document.getElementById("new-group-avatar").click()
              }
            >
              {!avatarGroup && (groupName ? groupName[0].toUpperCase() : "G")}
            </Avatar>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#1890ff",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() =>
                document.getElementById("new-group-avatar").click()
              }
            >
              <CameraOutlined style={{ color: "white", fontSize: 12 }} />
            </div>
            <input
              type="file"
              id="new-group-avatar"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <Input
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <Divider orientation="left">Thêm thành viên</Divider>

        <div style={{ marginBottom: 15 }}>
          <Input
            placeholder="Tìm kiếm bạn bè..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div style={{ maxHeight: "30vh", overflowY: "auto" }}>
          {isLoadingFriends ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              Đang tải danh sách bạn bè...
            </div>
          ) : (
            <>
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleContact(friend._id)}
                >
                  <Checkbox
                    checked={selectedContacts.includes(friend._id)}
                    onChange={() => { }}
                  />
                  <Avatar
                    src={friend.avatar_path}
                    style={{ marginLeft: 10, marginRight: 10 }}
                  >
                    {!friend.avatar_path &&
                      (friend.full_name || "U").charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{friend.full_name}</span>
                </div>
              ))}

              {filteredFriends.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "#999",
                  }}
                >
                  Không tìm thấy bạn bè nào
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: 15 }}>
          <Alert
            message="Lưu ý"
            description="Nhóm cần có ít nhất 3 thành viên (bạn và ít nhất 2 bạn bè khác)."
            type="info"
            showIcon
          />
        </div>

        {selectedContacts.length > 1 && (
          <div style={{ marginTop: 15 }}>
            <div style={{ marginBottom: 5 }}>
              Đã chọn ({selectedContacts.length} thành viên):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <span
                style={{
                  padding: "2px 8px",
                  background: "#e6f7ff",
                  borderRadius: 4,
                  border: "1px solid #91d5ff",
                }}
              >
                Bạn (Nhóm trưởng)
              </span>
              {selectedContacts
                .filter((id) => id !== currentUser.id)
                .map((contactId) => {
                  const contact = friendsData.find((f) => f._id === contactId);
                  return contact ? (
                    <span
                      key={contactId}
                      style={{
                        padding: "2px 8px",
                        background: "#e6f7ff",
                        borderRadius: 4,
                        border: "1px solid #91d5ff",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {contact.full_name}
                      <CloseOutlined
                        style={{ cursor: "pointer", fontSize: 10 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleContact(contactId);
                        }}
                      />
                    </span>
                  ) : null;
                })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
