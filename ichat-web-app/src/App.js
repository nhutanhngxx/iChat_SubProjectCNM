import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Login from "./components/Login";
import HomeWeb from "./components/HomeWeb";
import Test from "./components/HomeWeb/ChatWindow/test";
import { ThemeProvider } from "./components/HomeWeb/DropDownList/SettingsModal/TabSetting/ThemeContext";
import {PersistGate} from "redux-persist/integration/react";
import {persistor} from "./redux/store";
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<HomeWeb />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

// Chỉ render `App` một lần
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
