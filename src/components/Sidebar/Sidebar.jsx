import React, { useState } from "react";
import { useDispatch ,useSelector } from 'react-redux';
import './Sidebar.css';
import { CirclePlus } from 'lucide-react';
import { openModal } from '../slices/Taskslice';
import closebutton from '../../assets/close.png';
import hamburger from '../../assets/hamburger.svg';
import { setToggleState ,setShowState} from '../slices/Taskslice'; 
import axios from "axios";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const isToggleOn = useSelector((state) => state.task.isToggleOn);
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const urlParams = new URLSearchParams(window.location.search);
  const user_id = parseInt(urlParams.get('id'));
  // Toogle Button 
  const handleChange = (e) => {
    dispatch(setToggleState(e.target.checked));
  };

  // Show Hide
  const handleShowHideChange = (e) =>
    {
      dispatch(setShowState(e.target.checked));
    } 

  // Log out 
  const logout = async() =>
    {
      try {
         const res = await axios.get("https://prioritease2-c953f12d76f1.herokuapp.com/log_out",
          {withCredentials:true },
        );
        console.log("redirect_url ", res.data)
        console.log(res.status);
        if (res.status == 200){
          window.location.href = res.data.redirect_url;
        }
      } catch (error) {
        console.log(error);
      }
    }


  return (
    <div className="hamburger">
      {/* <img className="hamburger-img" src={hamburger} alt="Hamburger" height={30} width={30} onClick={() => setIsOpen(!isOpen)}/>    */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hamburger-img" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"  onClick={() => setIsOpen(!isOpen)}><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={() => setIsOpen(!isOpen)}>
           <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </div>

        <ul className="item-list">

          <li className="list first-list">
            <CirclePlus  color="white"/>
            <button type="button"  className={`Add-button ${!isOpen ? "hidden" : ""}`} onClick={() => dispatch(openModal())}>
              <span className="button__text">Add Card</span>
              <span className="button__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="currentColor"
                  fill="none"
                  className="svg"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
            </button>
          </li>

          <li className="list second-list">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h440q19 0 36 8.5t28 23.5l216 288-216 288q-11 15-28 23.5t-36 8.5H160Zm0-80h440l180-240-180-240H160v480Zm220-240Z"/></svg>
                   <label className="switch-personal" >
                      <input value="1" id="" name=""  type="checkbox" onChange={handleChange}/>
                      <span className="slider-personnel"></span>
                   </label>
          </li>

          <li className="list second-list-hide">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
             <label className="switch-hide hide-show" >
                <input type="checkbox" onChange={handleShowHideChange}/>
                <span className="slider"></span>
              </label>
            
          </li>
             

        </ul>

        <div className="right-bar">
            <button className="button" onClick={logout}>Log Out</button>
        </div>
      </div>
       
    </div>
  );
};
