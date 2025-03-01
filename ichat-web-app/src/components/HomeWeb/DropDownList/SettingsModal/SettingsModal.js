import React, { useState } from "react";
import { Modal, Menu, Switch, Radio, Select } from "antd";
import {
  SettingOutlined,
  LockOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  CloudOutlined,
  PhoneOutlined,
  ToolOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import "./SettingsModal.css";

const { Option } = Select;

const SettingsModal = ({ visible, onClose }) => {
  const [selectedMenu, setSelectedMenu] = useState("general");
  const [contactsOption, setContactsOption] = useState("zaloOnly");
  const [language, setLanguage] = useState("vi");

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      className="settings-modal"
    >
      <div className="settings-container">
        {/* Sidebar Menu */}
        <div className="settings-sidebar">
          <Menu
            mode="vertical"
            selectedKeys={[selectedMenu]}
            onClick={(e) => setSelectedMenu(e.key)}
          >
            <Menu.Item key="general" icon={<SettingOutlined />}>
              Cài đặt chung
            </Menu.Item>
            <Menu.Item key="security" icon={<LockOutlined />}>
              Tài khoản và bảo mật
            </Menu.Item>
            <Menu.Item key="privacy" icon={<UserOutlined />}>
              Quyền riêng tư
            </Menu.Item>
            <Menu.Item key="sync" icon={<CloudOutlined />}>
              Đồng bộ tin nhắn
            </Menu.Item>
            <Menu.Item key="interface" icon={<GlobalOutlined />}>
              Giao diện
            </Menu.Item>
            <Menu.Item key="notifications" icon={<BellOutlined />}>
              Thông báo
            </Menu.Item>
            <Menu.Item key="messages" icon={<MessageOutlined />}>
              Tin nhắn
            </Menu.Item>
            <Menu.Item key="calls" icon={<PhoneOutlined />}>
              Cài đặt cuộc gọi
            </Menu.Item>
            <Menu.Item key="tools" icon={<ToolOutlined />}>
              Tiện ích
            </Menu.Item>
          </Menu>
        </div>

        {/* Content */}
        <div className="settings-content">
          {selectedMenu === "general" && (
            <>
              <h3>Danh bạ</h3>
              <p>Danh sách bạn bè được hiển thị trong danh bạ</p>
              <Radio.Group
                onChange={(e) => setContactsOption(e.target.value)}
                value={contactsOption}
              >
                <Radio value="all">Hiển thị tất cả bạn bè</Radio>
                <Radio value="zaloOnly">Chỉ hiển thị bạn bè đang sử dụng Zalo</Radio>
              </Radio.Group>

              <h3>Ngôn ngữ</h3>
              <p>Thay đổi ngôn ngữ</p>
              <Select value={language} onChange={(value) => setLanguage(value)} style={{ width: "100%" }}>
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>

              <h3>Khởi động & ghi nhớ tài khoản</h3>
              <div className="settings-switch">
                <p>Khởi động Zalo khi mở máy</p>
                <Switch defaultChecked />
              </div>
              <div className="settings-switch">
                <p>Ghi nhớ tài khoản đăng nhập</p>
                <Switch defaultChecked />
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
