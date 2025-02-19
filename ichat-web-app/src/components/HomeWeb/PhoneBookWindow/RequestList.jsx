import React from "react";
import "./index.css"; // Import CSS

const RequestList = () => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Lời mời kết bạn</h2>
      <ul className="space-y-2">
        <li className="p-2 border-b">Nguyễn Văn A</li>
        <li className="p-2 border-b">Trần Thị B</li>
        <li className="p-2">Lê Văn C</li>
      </ul>
    </div>
  );
};

export default RequestList;
