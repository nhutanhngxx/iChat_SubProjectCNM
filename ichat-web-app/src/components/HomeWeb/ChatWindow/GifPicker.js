import React from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

const gf = new GiphyFetch("mm4Tuoc7nOLkri11i3Vdt3lvjsZXLSag"); // Thay bằng API Key của bạn

const GifPicker = ({ onSelect, onImageUpload = () => {}, ...props }) => {
  return (
    <div className="gif-picker-container">
      <Grid
        fetchGifs={() => gf.trending({ limit: 20 })}
        onGifClick={(gif, event) =>
          //  onSelect(gif.images.original.url)
          {
            event.preventDefault(); // Chặn chuyển trang Giphy
            const gifUrl = gif.images.original.url;
            onSelect(gifUrl); // Hiển thị GIF trong UI (nếu cần)
            onImageUpload(gifUrl); // Gửi GIF vào MessageArea giống như ảnh}
          }
        }
        width={310}
        columns={3}
        gutter={6}
        hideAttribution={true} // Ẩn logo Giphy
        {...props}
      />
    </div>
  );
};

export default GifPicker;
