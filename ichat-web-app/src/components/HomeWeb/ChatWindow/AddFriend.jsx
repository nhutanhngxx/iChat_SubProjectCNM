import React, { useState } from "react";
import { Modal, Input, Button, Select, message } from "antd";
import { useDispatch } from "react-redux";
import { searchUsersByPhone } from "../../../redux/slices/userSlide";
import "./AddFriend.css";
import UserInfoCard from "./UserInfoCard";

const AddFriend = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (value) => {
    if (!value) {
      return "Vui lòng nhập số điện thoại";
    }
    if (!/^\d+$/.test(value)) {
      return "Số điện thoại chỉ được chứa số";
    }
    if (value.length !== 10) {
      return "Số điện thoại phải có 10 số";
    }
    if (!value.startsWith('0')) {
      return "Số điện thoại phải bắt đầu bằng số 0";
    }
    return "";
  };

  const handleSearch = async () => {
    const error = validatePhone(phone);
    if (error) {
      message.error(error);
      return;
    }

    setIsSearching(true);
    try {
      // Chuyển đổi số điện thoại sang format +84
      const formattedPhone = '+84' + phone.substring(1);
      const result = await dispatch(searchUsersByPhone(formattedPhone)).unwrap();

      if (result && result.length > 0) {
        setUserResult(result[0]);
        setShowUserInfo(true);
      } else {
        message.error("Không tìm thấy người dùng");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tìm kiếm");
      console.error("Lỗi khi tìm kiếm người dùng:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // chỉ cho phép nhập số
    setPhone(value);
    const error = validatePhone(value);
    setPhoneError(error);
  };

  const handleCloseUserInfo = () => {
    setShowUserInfo(false);
    setUserResult(null);
    setPhone("");
    setPhoneError("");
  };

  const handleModalClose = () => {
    handleCloseUserInfo();
    onClose();
  };


  const suggestedFriends = [
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
    <>
      <Modal
        title="Thêm bạn"
        open={visible && !showUserInfo}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Hủy
          </Button>,
          <Button
            key="search"
            type="primary"
            onClick={handleSearch}
            loading={isSearching}
            disabled={!phone || !!phoneError}
          >
            Tìm kiếm
          </Button>,
        ]}
        width={400}
      >
        <div className="phone-input">
          <div className="country-select">
            <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="country-flag" />
            <span className="country-code">(+84)</span>
            <span className="dropdown-icon">▼</span>
          </div>
          <Input
            placeholder="Số điện thoại"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={10}
            className={`number-input ${phoneError ? 'error' : ''}`}
            status={phoneError ? "error" : ""}
          />
          {phoneError && (
            <div className="error-message">
              {phoneError}
            </div>
          )}
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

      {/* Modal hiển thị thông tin user khi tìm thấy */}
      <Modal
        open={showUserInfo}
        onCancel={handleCloseUserInfo}
        footer={null}
        width={400}
        className="user-info-modal"
      >
        {userResult && (
          <UserInfoCard
            user={userResult}
            onClose={handleCloseUserInfo}
          />
        )}
      </Modal>
    </>
  );
};

export default AddFriend;
