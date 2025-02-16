import React from "react";
import { List, Button, Icon } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const FileManager = ({ files }) => {
  return (
    <List
      dataSource={files}
      renderItem={(file) => (
        <List.Item>
          <span>{file.name}</span>
          <Button icon={<DownloadOutlined />} onClick={() => window.open(file.url)}>
            Download
          </Button>
        </List.Item>
      )}
    />
  );
};

export default FileManager;
