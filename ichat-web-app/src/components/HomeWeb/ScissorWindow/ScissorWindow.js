import React, { useState } from "react";
import { Modal, Button } from "antd";

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Nút mở modal */}
      <Button type="primary" onClick={showModal}>
        Mở Modal
      </Button>

      {/* Component Modal */}
      <Modal
        title="Tiêu đề Modal"
        open={isModalOpen} // Trước đây là `visible` (phiên bản cũ)
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Nội dung của modal chồng lên các component khác</p>
      </Modal>
    </div>
  );
};

export default App;
