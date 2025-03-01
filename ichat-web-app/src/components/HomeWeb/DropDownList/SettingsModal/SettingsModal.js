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
import GeneralSettings from "./TabSetting/GeneralSettings";
import SecuritySettings from "./TabSetting/AccountSecurity";
import PrivacySettings from "./TabSetting/PrivacySettings";
import InterfaceSettings from "./TabSetting/InterfaceSettings";
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
              <GeneralSettings />
            </>
          )}
          {selectedMenu === "security" && <SecuritySettings />}
          {selectedMenu === "privacy" && <PrivacySettings />}
          {selectedMenu === "sync" && <h1>Sync</h1>}
          {selectedMenu === "interface" && <InterfaceSettings />}
          {selectedMenu === "notifications" && <h1>Notifications</h1>}
          {selectedMenu === "messages" && <h1>Messages</h1>}
          {selectedMenu === "calls" && <h1>Calls</h1>}
          {selectedMenu === "tools" && <h1>Tools</h1>}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
