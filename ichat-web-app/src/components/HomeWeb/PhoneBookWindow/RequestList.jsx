import React from "react";
import "./RequestList.css";
import { FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
const requestData = [
  {
    id: 1,
    name: "Nhựt Anh",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    message: "Xin chào, mình là Nhựt Anh. Kết bạn với mình nhé!",
    received: true,
  },
  {
    id: 2,
    name: "Thành Cường",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    message: "Xin chào, mình là Thành Cường. Kết bạn với mình nhé!",
    received: true,
  },
  {
    id: 3,
    name: "Xuân Nam",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    message: "Xin chào, mình là Xuân Nam. Kết bạn với mình nhé!",
    received: true,
  },
  {
    id: 4,
    name: "Tâm Cao Linh",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    message: "Bạn đã gửi lời mời",
    received: false,
  },
  {
    id: 5,
    name: "Nguyễn T T",
    avatar: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    message: "08/11",
    received: false,
  },
];

const suggestedFriends = [
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
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="avatar"
                  />

                  <div className="info">
                    <strong>{request.name}</strong>
                    <p className="date">08:01</p>
                  </div>
                  <div className="icons">
                    <FaFacebookMessenger className="icon" />
                  </div>
                </div>
                <div className="box-message">
                  <span className="message">{request.message}</span>
                </div>

                <div className="actions">
                  <button className="btn reject">
                    <FaTimes /> Từ chối
                  </button>
                  <button className="btn accept">
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
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="avatar"
                      />
                      <div className="request-message">
                        <strong>{request.name}</strong>
                        <p className="message">{request.message}</p>
                      </div>
                    </div>
                    <div className="icons">
                      <FaFacebookMessenger className="icon" />
                    </div>
                  </div>
                </div>
                <button className="btn cancel">Thu hồi lời mời</button>
              </div>
            ))}
        </div>

        {/* Gợi ý kết bạn */}
        <h3 className="section-title">Gợi ý kết bạn</h3>
        <div className="request-container">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="request-card suggested">
              <div className="request-info suggestion">
                <div className="info-suggestion">
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
                  <button className="btn add-friend">
                    <FaTimes /> Bỏ Qua
                  </button>
                  <button className="btn add-friend">
                    <FaUserPlus /> Kết bạn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestList;
