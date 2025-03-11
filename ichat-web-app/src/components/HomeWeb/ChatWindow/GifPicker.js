import React from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

const gf = new GiphyFetch("mm4Tuoc7nOLkri11i3Vdt3lvjsZXLSag"); // Thay bằng API Key của bạn

const GifPicker = ({ onSelect }) => {
  return (
    <Grid
      fetchGifs={() => gf.trending({ limit: 10 })}
      onGifClick={(gif) => onSelect(gif.images.original.url)}
      width={300}
      columns={3}
      gutter={6}
    />
  );
};

export default GifPicker;
