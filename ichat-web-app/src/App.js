import './App.css';
import Login from './components/Login';
import HomeWeb from './components/HomeWeb';
import Test from './components/HomeWeb/ChatWindow/test';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import Routes thay cho Switch

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dùng element để render component */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeWeb />} />
        <Route path="/test" element={<Test />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
