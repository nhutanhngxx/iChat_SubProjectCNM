import React from "react";
import "./HelloWindow.css"; // Import file CSS

const HelloWindow = () => {
  return (
    <div className="hello-window" style={{ height: "100vh" }}>
      {/* Tiêu đề */}
      <h2>
        Chào mừng đến với <span className="highlight">iChat</span>
      </h2>

      {/* Mô tả */}
      <p className="description">
        Nền tảng chat tin nhắn hiện đại giúp bạn kết nối với bạn bè, gia đình và
        đồng nghiệp một cách dễ dàng.
      </p>

      {/* Hình ảnh */}
      <div className="image-container">
        <img
          src="https://i.ibb.co/8LVyWRw3/logo-Ichat-removebg-preview-1.png"
          alt="Welcome Illustration"
          className="hello-image"
        />
      </div>

      {/* Chú thích */}
      <p className="tagline">Kết nối mọi lúc, chia sẻ mọi nơi!</p>

      {/* Mô tả thêm */}
      <p className="extra-text">
        Cùng tham gia ngay hôm nay để bắt đầu câu chuyện của bạn!
      </p>
    </div>
  );
};

export default HelloWindow;
