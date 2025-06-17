import React, { useState } from "react";
import { useDispatch ,useSelector } from 'react-redux';
import './Sidebar.css';
import { CirclePlus } from 'lucide-react';
import { openModal } from '../slices/Taskslice';
import closebutton from '../../assets/close.png';
import hamburger from '../../assets/hamburger.svg';
import { setToggleState ,setShowState} from '../slices/Taskslice'; 
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const isToggleOn = useSelector((state) => state.task.isToggleOn);
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const urlParams = new URLSearchParams(window.location.search);
  const currentPersonnelId = parseInt(urlParams.get('id'));
  const navigate = useNavigate();
  //console.log("user_id",user_id);
  

  // Toogle Button 
  const handleChange = (e) => {
    dispatch(setToggleState(e.target.checked));
  };

// Go to Calendar
const goToCalendar = () => {
  navigate('/calendar');
};

const goToDeadline = () => {
  navigate('/deadline');
};

const goToHome = () =>
{
   navigate(`/?id=${localStorage.getItem("tagatask_user_id")}`)
}


  // Show Hide
  const handleShowHideChange = (e) =>
    {
      dispatch(setShowState(e.target.checked));
    } 

  // Log out 
  const logout = async() =>
    {
      try {
         const res = await axios.post("https://prioritease2-c953f12d76f1.herokuapp.com/log_out",
          {
            user_id: currentPersonnelId,
          }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': "any"
            },
          });

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
      <svg xmlns="http://www.w3.org/2000/svg" className="hamburger-img" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"  onClick={() => setIsOpen(!isOpen)}><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={() => setIsOpen(!isOpen)}>
           <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </div>

        <ul className="item-list">

            <button type="button"  className= "sidebar_button" onClick={goToHome}>
              <span className="button__text">Home</span>
            </button>

          <li className="list first-list">
            <button type="button"  className={`sidebar_button ${!isOpen ? "hidden" : ""}`} onClick={() => dispatch(openModal())}>
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
                   <label className="switch-personal" >
                      <input value="1" id="" name=""  type="checkbox" onChange={handleChange}/>
                      <span className="slider-personnel"></span>
                   </label>
          </li>

          <li className="list second-list-hide">
             <label className="switch-hide hide-show" >
                <input type="checkbox" onChange={handleShowHideChange}/>
                <span className="slider"></span>
              </label>
            
          </li>

            <button type="button"  className= "sidebar_button" onClick={goToCalendar}>
              <span className="button__text">Calendar View</span>
            </button>

            <button type="button"  className= "sidebar_button" onClick={goToDeadline}>
              <span className="button__text">DeadLine View</span>
            </button>
             

        </ul>

        <div className="right-bar">
            <button className="button" onClick={logout}>Log Out</button>
        </div>
      </div>
       
    </div>
  );
};
