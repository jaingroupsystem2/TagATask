// React component (DeadlineView.jsx)
import React, { useEffect, useState } from "react";
import "./deadline.css";
import PopupModal from "./PopupModal";
import axios from "axios";
import {getDeadLineData} from '../ApiList';


  const deadline = () => {
    const [tasks, setTasks] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";


    useEffect(() => {
       const getDeadLineData = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const current_user_id = urlParams.get('id');
        try {
          const response = await axios.get(`${Base_URL}/deadline_view?user_id=${current_user_id}`, {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': "any",
              "user_id": current_user_id
            }
          });    
      
          console.log("response" , response);
          return response.data;
          
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      getDeadLineData();
    }, []);


    const handleCardClick = (category) => {
      setActiveCategory(category);
      setShowModal(true);
    };


    const handleCheckboxChange = (taskId, isChecked) => {
      console.log("Toggled task:", taskId, isChecked);
    };

    const renderTasks = (category) => {
      const categoryColors = {
        overdue: "red",
        today: "white",
        future: "skyblue",
        targetless: "white",
      };

      if (category === "targetless" || category === "today") {
        return (
          <ul>
            {tasks[category].map((task) => (
              <li key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleCheckboxChange(task.id, e.target.checked)
                  }
                  className="checkbox"
                />
                {task.title}
              </li>
            ))}
          </ul>
        );
      }

      const categoryTasks = tasks[category] || {};
      return Object.entries(categoryTasks).map(([type, list]) => (
        <div key={type} className="task-type">
          <h4 style={{ backgroundColor: categoryColors[category] }}>{type}</h4>
          <ul>
            {list.map((task) => (
              <li key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleCheckboxChange(task.id, e.target.checked)
                  }
                  className="checkbox"
                />
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      ));
    };

    const categories = ["overdue", "today", "future", "targetless"];

    return (
      <div className="deadline-container">
        {categories.map((category) => (
          <div
            key={category}
            className="deadline-card"
            onClick={() => handleCardClick(category)}
            style={{ cursor: "pointer" }}
          >
            <h3>{category}</h3>
            {tasks[category] ? renderTasks(category) : <p>Loading...</p>}
          </div>
        ))}

        {/* Modal Popup */}
        {showModal && (
          <PopupModal
            activeCategory={activeCategory}
            tasks={tasks}
            onClose={() => setShowModal(false)}
            handleCheckboxChange={handleCheckboxChange}
          />
        )}
          </div>
        );
};

export default deadline;
