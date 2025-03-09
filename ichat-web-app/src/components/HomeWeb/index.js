import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HelloWindow from "./ChatWindow/HelloWindow";
import ChatWindow from "./ChatWindow/ChatWindow";
import PhoneBookWindow from "./PhoneBookWindow/PhoneBookWindow";
import TaskWindow from "./TaskWindow/TaskWindow";
import CloudWindow from "./CloudWindow/CloudWindow";
import ScissorWindow from "./ScissorWindow/ScissorWindow";
import SettingWindow from "./SettingWindow/SettingWindow";
import SettingsModal from "./DropDownList/SettingsModal/SettingsModal";
const { Content } = Layout;

const App = () => {
  const [activeComponent, setActiveComponent] = useState("chatwindow"); // State để quản lý component hiển thị
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false); // Quản lý trạng thái modal

  // Hàm xử lý khi nhấn vào icon trên sidebar
  const handleIconClick = (component) => {
    // setActiveComponent(component);
    if (component === "setting") {
      setSettingsModalVisible(true); // Khi nhấn tab "Cài đặt", mở modal
    } else {
      setActiveComponent(component);
    }
  };
  const handleCloseSettings = () => {
    setSettingsModalVisible(false); // Đóng modal
  };

  // Render component tương ứng dựa trên state
  const renderComponent = () => {
    switch (activeComponent) {
      case "chatwindow":
        return <ChatWindow />;
      case "book":
        return <PhoneBookWindow />;
      case "check":
        return <TaskWindow />;
      // case "cloud":
      //   return <CloudWindow />;
      case "scissor":
        return <ScissorWindow />;
      // case "setting":
      //   return <SettingWindow />;
      default:
        return <HelloWindow />;
    }
  };

  return (
    <Layout className="app-layout">
      {/* Sidebar */}
      <Sidebar onIconClick={handleIconClick} />

      {/* Content */}
      <Content className="main-content">{renderComponent()}</Content>
      {/* Modal Setting */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={handleCloseSettings}
      />
    </Layout>
  );
};

export default App;
