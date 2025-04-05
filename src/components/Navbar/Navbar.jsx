import React from 'react'
import tagaTask from '../../assets/TagaTask.jpg';
import './Navbar.css'
import { Sidebar } from '../Sidebar/Sidebar';

function Navbar() {
  return (
    <>
    <div className='navbar'>
        <div className="left-bar">
            <img src={tagaTask} alt='tagaTask' className='img'/>
            <p>TagaTask</p>
        </div>
        <div className="right-bar">
            <button className="button">Log Out</button>
        </div>
    </div>
    </>
  )
}

export default Navbar