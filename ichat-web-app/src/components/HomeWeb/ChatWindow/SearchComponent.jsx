import React from "react";
import { Input, Button } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import "./SearchComponent.css";

const SearchComponent = ({ searchText, setSearchText, onClose }) => {
  const handleClear = () => {
    setSearchText("");
  };

  return (
    <div className="search-container">
      <Input
        prefix={<SearchOutlined className="search-icon" />}
        suffix={
          searchText && (
            <CloseOutlined className="clear-icon" onClick={handleClear} />
          )
        }
        className="search-bar"
        placeholder="Tìm kiếm"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Button type="text" className="close" onClick={onClose}>
        <p style={{ margin: 0 }}>Đóng</p>
      </Button>
    </div>
  );
};

export default SearchComponent;
