import React from "react";
import "./index.css"; // Import CSS

const GroupList = () => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Danh sách nhóm</h2>
      <ul className="space-y-2">
        <li className="p-2 border-b">Nhóm Gia Đình</li>
        <li className="p-2 border-b">Nhóm Bạn Cấp 3</li>
        <li className="p-2">Nhóm Công Ty</li>
      </ul>
    </div>
  );
};

export default GroupList;
