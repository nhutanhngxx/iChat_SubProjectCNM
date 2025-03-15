// import "./App.css";
// import Login from "./components/Login";
// import HomeWeb from "./components/HomeWeb";
// import Test from "./components/HomeWeb/ChatWindow/test";
// import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import Routes thay cho Switch
// import { Provider } from "react-redux";
// import ReactDOM from "react-dom";
// import store from "./redux/store";
// function App() {
//   return ReactDOM.render(
//     <Provider store={store}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/home" element={<HomeWeb />} />
//           <Route path="/test" element={<Test />} />
//         </Routes>
//       </BrowserRouter>
//     </Provider>,
//     document.getElementById("root")
//   );
// }

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Login from "./components/Login";
import HomeWeb from "./components/HomeWeb";
import Test from "./components/HomeWeb/ChatWindow/test";
import { ThemeProvider } from "./components/HomeWeb/DropDownList/SettingsModal/TabSetting/ThemeContext";
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<HomeWeb />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

// Chỉ render `App` một lần
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
