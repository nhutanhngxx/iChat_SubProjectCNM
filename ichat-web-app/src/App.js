import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import Login from "./components/Login";
import HomeWeb from "./components/HomeWeb";
import Test from "./components/HomeWeb/ChatWindow/test";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/store";
import InvitePage from "./pages/InvitePage";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<HomeWeb />} />
            <Route path="/test" element={<Test />} />
            <Route path="/invite/:token" element={<InvitePage />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

// Chỉ render `App` một lần
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
