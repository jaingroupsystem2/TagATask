import './App.css';
import Navbar from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import TaskCreate from './components/TaskCreate';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <div>
        <div className="app">
          <Sidebar/>
          <ToastContainer/>
          <TaskCreate/>
        </div>
      </div>
    </>
  )
}

export default App
