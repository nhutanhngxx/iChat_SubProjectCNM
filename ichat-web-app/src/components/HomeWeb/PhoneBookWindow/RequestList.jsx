import React, { useState } from "react";
import "./RequestList.css";
import { FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import "./modal.css";
import { CiRedo } from "react-icons/ci";
import { message } from "antd";

const initialRequestData = [
  {
    id: 1,
    full_name: "Nhựt Anh",
    gender: "male",
    dob: "1998-05-10",
    phone: "0123456789",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://example.com/cover1.jpg",
    status: "active",
    created_at: "2024-02-27T10:00:00Z",
    updated_at: "2024-02-27T10:00:00Z",
    message: "Chào bạn, mình muốn kết bạn với bạn",
    received: true,
  },
  {
    id: 2,
    full_name: "Thành Cường",
    gender: "male",
    dob: "1995-09-22",
    phone: "0987654321",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://example.com/cover2.jpg",
    status: "active",
    created_at: "2024-02-27T10:05:00Z",
    updated_at: "2024-02-27T10:05:00Z",
    message: "Chào bạn, mình muốn kết bạn với bạn",
    received: true,
  },
  {
    id: 3,
    full_name: "Xuân Nam",
    gender: "male",
    dob: "2000-01-15",
    phone: "0345678912",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://example.com/cover3.jpg",
    status: "inactive",
    created_at: "2024-02-27T10:10:00Z",
    updated_at: "2024-02-27T10:10:00Z",
    message: "Chào bạn, mình muốn kết bạn với bạn",
    received: true,
  },
  {
    id: 4,
    full_name: "Tâm Cao Linh",
    gender: "female",
    dob: "1999-07-30",
    phone: "0567891234",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://example.com/cover4.jpg",
    status: "pending",
    created_at: "2024-02-27T10:15:00Z",
    updated_at: "2024-02-27T10:15:00Z",
  },
  {
    id: 5,
    full_name: "Nguyễn T T",
    gender: "female",
    dob: "2002-08-11",
    phone: "0678912345",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://example.com/cover5.jpg",
    status: "banned",
    created_at: "2024-02-27T10:20:00Z",
    updated_at: "2024-02-27T10:20:00Z",
  },
];

const initialSuggestedFriends = [
  {
    id: 6,
    name: "Lê Hoàng",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 11,
  },
  {
    id: 7,
    name: "Trần Minh",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 6,
  },
  {
    id: 8,
    name: "Phạm Thư",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 3,
  },
];

const RequestList = () => {
  const [requestData, setRequestData] = useState(initialRequestData);
  const [suggestedFriends, setSuggestedFriends] = useState(
    initialSuggestedFriends
  );
  const [userInfo, setUserInfo] = useState(null);

  const handleOpenUserInfo = (user) => {
    setUserInfo(user);
  };

  const closeUserInfoModal = () => {
    setUserInfo(null);
  };

  const [modalData, setModalData] = useState(null);
  // Mở modal xác nhận
  const openModal = (type, id) => {
    setModalData({ type, id });
  };

  // Đóng modal
  const closeModal = () => {
    setModalData(null);
  };
  // Xác nhận đồng ý hoặc từ chối
  const handleConfirmAction = () => {
    if (!modalData) return;
    const { type, id } = modalData;

    if (type === "accept") {
      setRequestData((prev) => prev.filter((req) => req.id !== id));
    } else if (type === "reject") {
      setRequestData((prev) => prev.filter((req) => req.id !== id));
    }

    closeModal();
  };

  // Thu hồi lời mời
  const handleCancelRequest = (id) => {
    setRequestData((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, message_request: "Đã thu hồi lời mời", received: false }
          : req
      )
    );
  };
  // Gửi lời mời kết bạn
  const handleSendRequest = (id) => {
    setSuggestedFriends((prev) =>
      prev.map((friend) =>
        friend.id === id ? { ...friend, sent: true } : friend
      )
    );
  };

  // Bỏ qua gợi ý
  const handleIgnoreSuggestion = (id) => {
    setSuggestedFriends((prev) => prev.filter((friend) => friend.id !== id));
  };
  return (
    <div className="body">
      <div className="content-header">
        <h2 className="title">Lời mời kết bạn</h2>
      </div>
      <div className="request-list">
        {/* Lời mời đã nhận */}
        <h3 className="section-title">
          Lời mời đã nhận ({requestData.filter((r) => r.received).length})
        </h3>
        <div className="request-container">
          {requestData
            .filter((r) => r.received)
            .map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <div
                    className="info-user"
                    onClick={() => handleOpenUserInfo(request)}
                  >
                    <img
                      src={request.avatar_path}
                      alt={request.full_name}
                      className="avatar"
                    />

                    <div className="info">
                      <strong>{request.full_name}</strong>
                      <p className="date">08:01</p>
                    </div>
                  </div>
                  <div className="icons">
                    <FaFacebookMessenger className="icon" />
                  </div>
                </div>
                <div className="box-message">
                  <span className="message">{request.message}</span>
                </div>

                <div className="actions">
                  <button
                    className="btn reject"
                    onClick={() => openModal("reject", request.id)}
                  >
                    <FaTimes /> Từ chối
                  </button>
                  <button
                    className="btn accept"
                    onClick={() => openModal("accept", request.id)}
                  >
                    <FaCheck /> Đồng ý
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Lời mời đã gửi */}
        <h3 className="section-title">
          Lời mời đã gửi ({requestData.filter((r) => !r.received).length})
        </h3>
        <div className="request-container">
          {requestData
            .filter((r) => !r.received)
            .map((request) => (
              <div key={request.id} className="request-card ">
                <div className="request-info sent ">
                  <div className="info info-rq">
                    <div className="info-rq-left">
                      <div className="info-user">
                        <img
                          src={request.avatar_path}
                          alt={request.full_name}
                          className="avatar"
                        />
                        <div className="request-message">
                          <strong>{request.full_name}</strong>
                          <p className="message">{request.message}</p>
                        </div>
                      </div>
                    </div>
                    <div className="icons">
                      <FaFacebookMessenger className="icon" />
                    </div>
                  </div>
                </div>
                <button
                  className="btn cancel"
                  onClick={() => handleCancelRequest(request.id)}
                >
                  {request.message_request ? (
                    <>
                      <CiRedo />
                      <p> Đã thu hồi lời mời</p>
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      <p> Thu hồi lời mời</p>
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>

        {/* Gợi ý kết bạn */}
        <h3 className="section-title">Gợi ý kết bạn</h3>
        <div className="request-container">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="request-card suggested">
              <div className="request-info suggestion">
                <div className="info-suggestion info-user">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="avatar"
                  />

                  <div className="group-together">
                    <strong>{friend.name}</strong>
                    <p>{friend.group} nhóm bạn chung</p>
                  </div>
                </div>
                <div className="group-button">
                  <button
                    className="btn add-friend"
                    onClick={() => handleIgnoreSuggestion(friend.id)}
                  >
                    <FaTimes /> Bỏ Qua
                  </button>
                  <button
                    className="btn add-friend"
                    onClick={() => handleSendRequest(friend.id)}
                  >
                    {friend.sent ? (
                      "Đã gửi lời mời"
                    ) : (
                      <>
                        <FaUserPlus /> Kết bạn
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal xác nhận */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              Bạn có chắc chắn muốn{" "}
              {modalData.type === "accept" ? "đồng ý" : "từ chối"}?
            </p>
            <div className="modal-actions">
              <button className="btn confirm" onClick={handleConfirmAction}>
                Xác nhận
              </button>
              <button className="btn cancel" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal thông tin người dùng */}
      {userInfo && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="cover-pic">
                <img src="https://i.ibb.co/B2S2WVRX/Pamela2.jpg" alt="cover" />
              </div>
              <div>
                <div className="modal-info">
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="avatar"
                  />
                  <h3>{userInfo.name}</h3>
                </div>
                <div className="modal-message">
                  <p>{userInfo.message}</p>
                </div>
                <div className="modal-button">
                  <button>Đồng ý</button>
                  <button>Từ chối</button>
                </div>
              </div>
            </div>
            <div className="modal-content-info">
              <h3>Thông tin cá nhân</h3>
              <p> Giới tính: Nam</p>

              <p> Ngày sinh: 08/11/2000</p>
            </div>
            <div>
              <div>
                <p>Nhóm chung</p>
              </div>
              <div>Chặn tin nhắn và cuộc gọi</div>
              <div>Báo xấu</div>
            </div>
            <div></div>

            <button className="btn" onClick={closeUserInfoModal}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
