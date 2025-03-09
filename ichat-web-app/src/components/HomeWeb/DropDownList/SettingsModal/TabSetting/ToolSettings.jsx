import React, { useState } from "react";
import { Switch, Checkbox } from "antd";

const SuggestionSettings = () => {
  const [stickerSuggestionEnabled, setStickerSuggestionEnabled] =
    useState(true);
  const [mentionSuggestionEnabled, setMentionSuggestionEnabled] =
    useState(false);
  const [gifSearchEnabled, setGifSearchEnabled] = useState(false);
  const [stickerSearchEnabled, setStickerSearchEnabled] = useState(false);

  return (
    <div className="suggestion-settings">
      <h2>Gợi ý Sticker</h2>
      <div className="setting-item">
        <p>
          Hiện gợi ý Sticker phù hợp với nội dung tin nhắn đang soạn
          <Switch
            checked={stickerSuggestionEnabled}
            onChange={(checked) => setStickerSuggestionEnabled(checked)}
          />
        </p>
      </div>

      <h2>Gợi ý @</h2>
      <div className="setting-item">
        <Checkbox
          checked={mentionSuggestionEnabled}
          onChange={(e) => setMentionSuggestionEnabled(e.target.checked)}
        >
          Gợi ý nhắc tên theo nội dung đang soạn
        </Checkbox>
      </div>
      <div className="setting-item">
        <Checkbox
          checked={gifSearchEnabled}
          onChange={(e) => setGifSearchEnabled(e.target.checked)}
        >
          Tìm GIF từ Tenor
        </Checkbox>
      </div>
      <div className="setting-item">
        <Checkbox
          checked={stickerSearchEnabled}
          onChange={(e) => setStickerSearchEnabled(e.target.checked)}
        >
          Tìm sticker
        </Checkbox>
      </div>
    </div>
  );
};

export default SuggestionSettings;
