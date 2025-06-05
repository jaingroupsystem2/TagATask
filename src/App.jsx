import './App.css';
import Navbar from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import TaskCreate from './components/TaskCreate';

import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import CalendarPage from './components/Calendar/CalendarPage';
import Deadline from './components/Deadline/deadline';

function App() {
  return (
    <>
      <div className="app">
        <BrowserRouter>
          <Sidebar />
          <ToastContainer />
          <Routes>
            <Route path="/" element={<TaskCreate />} />
            <Route path="/calendar" element={<CalendarPage/>} />
            <Route path="/deadline" element={<Deadline/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
