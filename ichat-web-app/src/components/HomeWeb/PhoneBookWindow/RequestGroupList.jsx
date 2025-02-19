import React from "react";
import "./index.css"; // Import CSS

const RequestGroupList = () => {
  return (
    <div className="body">
      {/* Content header  */}
      <div className="content-header">
        <h2 className="text-lg font-bold mb-4">Danh sách bạn bè</h2>
      </div>
      <div className="content-body">
        <ul className="space-y-2">
          <li className="p-2 border-b">Anh Trai</li>
          <li className="p-2 border-b">Anh Hai</li>
          <li className="p-2 border-b">Ba</li>
          <li className="p-2 border-b">Em gái</li>
          <li className="p-2">Mẹ</li>
        </ul>
      </div>
    </div>
  );
};

export default RequestGroupList;
