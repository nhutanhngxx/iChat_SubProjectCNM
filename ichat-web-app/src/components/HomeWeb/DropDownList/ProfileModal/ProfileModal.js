import React from "react";
import { Modal, Avatar, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import "./ProfileModal.css";

const ProfileModal = ({ visible, onClose }) => {
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
            src="data:image/jpeg;base64,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"
            alt="cover"
            className="cover-img"
          />
        </div>
        <div className="profile-details">
          <Avatar
            size={64}
            src="https://via.placeholder.com/64"
            className="profile-avatar"
          />
          <span className="profile-name">Đinh Nguyên Chung</span>
          <EditOutlined className="edit-icon" />
        </div>
      </div>
      <div className="info-section">
        <p>
          <strong>Giới tính:</strong> Nam
        </p>
        <p>
          <strong>Ngày sinh:</strong> 24 tháng 04, 2003
        </p>
        <p>
          <strong>Điện thoại:</strong> +84 *** *** ****
        </p>
        <p className="info-note">
          Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này
        </p>
      </div>
      <Button type="primary" block className="update-button">
        Cập nhật
      </Button>
    </Modal>
  );
};

export default ProfileModal;
