import './App.css';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import Routes thay cho Switch

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dùng element để render component */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
