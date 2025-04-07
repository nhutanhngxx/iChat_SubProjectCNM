import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import reportWebVitals from "./reportWebVitals";
import "antd/dist/reset.css"; // Thay cho 'antd/dist/antd.css' (với các phiên bản mới của Ant Design >= 5.0)
import "./output.css";
import {ThemeProvider}  from "./context/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>  
      <React.StrictMode>
        <App />
      </React.StrictMode>
  </ThemeProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
