import React, { useEffect, useState } from "react";
import "./RequestList.css";
import { FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import "./modal.css";
import { CiRedo } from "react-icons/ci";
import { CiEdit } from "react-icons/ci";
import { MdClose } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { MdBlock } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { getReceivedFriendRequests } from "../../../redux/slices/friendSlice";
import { getSentFriendRequests } from "../../../redux/slices/friendSlice";
import { cancelFriendRequest } from "../../../redux/slices/friendSlice";
import { acceptFriendRequest } from "../../../redux/slices/friendSlice";

const initialSuggestedFriends = [
  {
    id: 6,
    full_name: "Lê Hoàng Châu",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 11,
  },
  {
    id: 7,
    full_name: "Trần Minh Tuyết",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 6,
  },
  {
    id: 8,
    full_name: "Phạm Thị Vy",
    avatar_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    cover_path: "https://i.ibb.co/B2S2WVRX/Pamela2.jpg",
    group: 3,
  },
];

const RequestList = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth).user;
  const [receivedRequests, setReceivedRequests] = useState([]); // Lời mời đã nhận
  const [sentRequests, setSentRequests] = useState([]); // Lời mời đã gửi

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const result_received = await dispatch(
          getReceivedFriendRequests(currentUser.id)
        ).unwrap();
        setReceivedRequests(result_received.friendRequests);

        const result_sent = await dispatch(
          getSentFriendRequests(currentUser.id)
        ).unwrap();
        setSentRequests(result_sent.friendRequests);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lời mời:", error);
      }
    };
    if (currentUser?.id) {
      fetchFriendRequests();
    }
  }, [dispatch, currentUser, sentRequests, receivedRequests]);

  const [suggestedFriends, setSuggestedFriends] = useState(
    initialSuggestedFriends
  );
  const [userInfo, setUserInfo] = useState(null);
  const [modalType, setModalType] = useState("");

  const handleOpenUserInfo = (user, type) => {
    setModalType(type);
    setUserInfo(user);
  };

  const closeUserInfoModal = () => {
    setUserInfo(null);
    setModalType("");
  };

  const [modalData, setModalData] = useState(null);

  // Đóng modal
  const closeModal = () => {
    setModalData(null);
  };

  // Xác nhận đồng ý
  const handleConfirmAction = async (senderId, receiverId) => {
    try {
      const data = {
        senderId: senderId,
        receiverId: receiverId,
      };

      const result = await dispatch(acceptFriendRequest(data)).unwrap();
      if (result.status === "ok") {
        setReceivedRequests((prev) =>
          prev.filter((req) => req.id !== senderId)
        );
      }
      console.log("Đã chấp nhận lời mời kết bạn thành công");
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
    }
  };

  // Thu hồi lời mời
  // const handleCancelRequest = (id) => {
  //   setRequestData((prev) =>
  //     prev.map((req) =>
  //       req.id === id
  //         ? { ...req, message_request: "Đã thu hồi lời mời", received: false }
  //         : req
  //     )
  //   );
  // };

  const handleCancelRequest = async (requestId, receivedId) => {
    try {
      const data = {
        senderId: requestId,
        receiverId: receivedId,
      };
      const result = await dispatch(cancelFriendRequest(data)).unwrap();

      if (result.status === "ok") {
        setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
      console.log("Đã hủy lời mời kết bạn thành công");
    } catch (error) {
      console.error("Lỗi khi hủy lời mời kết bạn:", error);
    }
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
          Lời mời đã nhận ({receivedRequests.length})
        </h3>
        <div className="request-container">
          {receivedRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <div
                  className="info-user"
                  onClick={() => handleOpenUserInfo(request, "received")}
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
                  onClick={() =>
                    handleCancelRequest(request.id, currentUser.id)
                  }
                >
                  <FaTimes /> Từ chối
                </button>
                <button
                  className="btn accept"
                  onClick={() =>
                    handleConfirmAction(request.id, currentUser.id)
                  }
                >
                  <FaCheck /> Đồng ý
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lời mời đã gửi */}
        <h3 className="section-title">
          Lời mời đã gửi ({sentRequests.length})
        </h3>
        <div className="request-container">
          {sentRequests.map((request) => (
            <div key={request.id} className="request-card ">
              <div className="request-info sent ">
                <div className="info info-rq">
                  <div className="info-rq-left">
                    <div
                      className="info-user"
                      onClick={() => handleOpenUserInfo(request, "sent")}
                    >
                      <div style={{ width: "50px" }}>
                        <img
                          src={request.avatar_path}
                          alt={request.full_name}
                          className="avatar"
                        />
                      </div>
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
                onClick={() => handleCancelRequest(currentUser.id, request.id)}
              >
                {request.message && request.message === "Đã thu hồi lời mời" ? (
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
                <div
                  className="info-suggestion info-user"
                  onClick={() => handleOpenUserInfo(friend, "suggested")}
                >
                  <img
                    src={friend.avatar_path}
                    alt={friend.full_name}
                    className="avatar"
                  />

                  <div className="group-together">
                    <strong>{friend.full_name}</strong>
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
          <div className="modal modal-confirm">
            <h2 style={{ fontSize: "20px", fontWeight: "600" }}>
              Bạn có chắc chắn muốn
              {modalData.type === "accept" ? " đồng ý" : " từ chối"}?
            </h2>
            <div className="modal-actions">
              <button className="btn btn-confirm" onClick={handleConfirmAction}>
                Xác nhận
              </button>
              <button className="btn btn-cancel" onClick={closeModal}>
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
            <div className="modal-title">
              <h4>Thông tin tài khoản</h4>
              <div className="close-btn" onClick={closeUserInfoModal}>
                <MdClose />
              </div>
            </div>
            <div className="modal-users">
              <div className="modal-header">
                <div className="cover-pic">
                  <img
                    src="https://i.ibb.co/B2S2WVRX/Pamela2.jpg"
                    alt="cover"
                  />
                  <div style={{ background: "pink" }}>
                    <div className="modal-info">
                      <img
                        src={userInfo.avatar_path}
                        alt={userInfo.name}
                        className="avatar"
                      />
                      <div className="detail-info">
                        <h3>{userInfo.full_name}</h3>
                        <div className="icon-edit-nameUser">
                          <CiEdit />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "80px" }}>
                {modalType === "received" && (
                  <div className="modal-message">
                    <p>{userInfo.message}</p>
                  </div>
                )}

                <div className="modal-button">
                  {modalType === "received" && (
                    <>
                      <button className="btn-accept">Đồng ý</button>
                      <button className="btn-message">Nhắn tin</button>
                    </>
                  )}

                  {modalType === "sent" && (
                    <>
                      <button className="btn-cancel">Hủy kết bạn</button>
                      <button className="btn-message">Nhắn tin</button>
                    </>
                  )}

                  {modalType === "suggested" && (
                    <>
                      <button className="btn-add-friend">Kết bạn</button>
                      <button className="btn-message">Nhắn tin</button>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-content-info">
                <h3>Thông tin cá nhân</h3>
                <p>
                  Giới tính: <span>Nam</span>
                </p>

                <p>
                  Ngày sinh: <span>08/11/2000</span>
                </p>
              </div>
              <div className="modal-content-other">
                <div>
                  <FaUserGroup />
                  <p>
                    Nhóm chung (<span>8</span>)
                  </p>
                </div>
                <div>
                  <MdBlock />
                  <p>Chặn tin nhắn và cuộc gọi</p>
                </div>
                <div>
                  <IoIosWarning />
                  <p>Báo xấu</p>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
