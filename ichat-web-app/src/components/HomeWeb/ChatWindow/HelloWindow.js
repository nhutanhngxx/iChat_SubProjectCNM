import React from "react";
import "./HelloWindow.css"; // Import file CSS

const HelloWindow = () => {
  return (
    <div className="hello-window">
      {/* Tiêu đề */}
      <h2>
        Chào mừng đến với <span className="highlight">iChat</span>
      </h2>

      {/* Mô tả */}
      <p className="description">
        Nền tảng chat tin nhắn hiện đại giúp bạn kết nối với bạn bè, gia đình
        và đồng nghiệp một cách dễ dàng.
      </p>

      {/* Hình ảnh */}
      <div className="image-container">
        <img
          src="https://s3-alpha-sig.figma.com/img/8eef/22c2/3b82d8322b217f52c129ddc1530d8787?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=MLBEm7WFKMlitZURkMjMX1NnRcQP9SbwzXbLpPGefS2-0Qtqwwndyzn1YxAo-ybzDC9uoPXBaKCoi1-FhiDcL3UeSFaAPqIBcUY777t2KiljYaQHQcXnHI7TOgx1lmMwRUv8dyNyzzu7qU2ypLRPBYGC6bMt9ChQqx-aYTOwIp2p2QrEm2NlejF-McZwpLlgQ7o96RjE2yxKkIHfwTIKNu4rY-6RR8mjnFDJ4bDBZfQeJtqroeQ4Dq5WuT3bVxcA-tm9N1H4iVR6whfxIjodi5xP7U-ArdQ6qUIqhTO1GNpMfEcQr7TqOMh6xp2lhOj~QXbEGCJipevho0Wa49h3Fg__"
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
