import React from "react";
import { Modal, Avatar, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import "./ProfileModal.css";
import { CiEdit } from "react-icons/ci";

const ProfileModal = ({ visible, onClose, user }) => {
  return (
    <Modal
      title={
        <div className="modal-header">
          <span>Thông tin tài khoản</span>
        </div>
      }
      open={visible}
      footer={null}
      closable={true}
      onCancel={onClose}
      centered
      width={400}
      className="profile-modal"
    >
      <div className="profile-container">
        <div className="cover-photo">
          <img
            src="https://i.ibb.co/21SNwKwZ/anh-nen-thanh-guom-diet-quy-full-hd-cuc-dep-cho-may-tinh-085122374.png"
            alt="cover"
            className="cover-img"
          />
        </div>
        <div className="profile-details">
          <Avatar
            size={70}
            src={user?.avatar_path || ""}
            className="profile-avatar"
          />
          <span className="profile-name">{user?.full_name}</span>
          <EditOutlined className="edit-icon" />
        </div>
      </div>
      <div className="info-section">
        <p>
          <strong>Giới tính:</strong> {user?.gender === "Male" ? "Nam" : "Nữ"}
        </p>
        <p>
          <strong>Ngày sinh:</strong> {user?.dob || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Điện thoại:</strong> {user?.phone || "Chưa cập nhật"}
        </p>
        <p className="info-note">
          Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này
        </p>
      </div>
      <div className="update-section">
        <button className="update-button">
          <div>
            <CiEdit className="icon-ciedit" />
          </div>
          <p>Cập nhật</p>
        </button>
      </div>
    </Modal>
  );
};

export default ProfileModal;
