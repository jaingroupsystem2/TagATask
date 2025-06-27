
import React, { useEffect, useState } from "react";
import "./deadline.css";
import PopupModal from "./PopupModal";
import axios from "axios";
import {Tooltip} from "react-tooltip";
import revert_icon from '../../assets/revert.png';
import { toast } from 'react-toastify';
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons


export const fetchTasks = async () => {
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const current_user_id = localStorage.getItem("tagatask_user_id");
console.log(Base_URL);

  try {
    const response = await axios.get(`${Base_URL}/deadline_view?user_id=${current_user_id}`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      }
    }); 
    const data = response.data?.deadline_view_tasks || [];

    const normalizeTasks = () => {
      const result = {
        overdue: {},
        today: [], // May or may not exist
        future: {},
        targetless: []
      };

      // Find categories in API
      const overdueBlock = data.find((d) => d.Overdue)?.Overdue;
      const futureBlock = data.find((d) => d.Future)?.Future;
      const targetlessBlock = data.find((d) => d.Targetless)?.Targetless;
      const todayBlock = data.find((d) => d.Today)?.Today;

      console.log("overdueBlock" , overdueBlock);
      console.log("futureBlock" , futureBlock);
      console.log("targetlessBlock" , targetlessBlock);
      console.log("overdueBlock" , todayBlock);



      // Helper
      const mapTask = (task) => ({
        id: task.task_priority_id,
        title: task.task_description,
        completed_on:task.completed_on,
        comments: task.Comments,
        tag_data:task.tag_data,
        target_date: task.target_date
      });

      // Overdue
      if (overdueBlock) {
        const lastWeek =  overdueBlock.previous_week_data || {};
        const weekBefore = overdueBlock.week_before_previous_week_data || {};
        const lastMonth = overdueBlock.last_month_data || {};

        if(lastWeek["1 - 7 Days"])
          {
            result.overdue["1 - 7 Days"] = lastWeek["1 - 7 Days"].map(mapTask);
          }
  
        if (weekBefore["2 - 4 Weeks"]) {
          result.overdue["2 - 4 weeks"] = weekBefore["2 - 4 Weeks"].map(mapTask);
        }

        if (lastMonth["Greater than 1 Month"]) {
          result.overdue["> 1 month"] = lastMonth["Greater than 1 Month"].map(mapTask);
        }

        
      }

      // Future
      if (futureBlock) {
        const afterWeek =  futureBlock.coming_week_data || {};
        const afterOneWeek = futureBlock.week_after_coming_week_data || {};
        const nextMonth = futureBlock.coming_month_data || {};


        if(afterWeek["1 - 7 Days"])
          {
            result.future["1 - 7 Days"] = afterWeek["1 - 7 Days"].map(mapTask);
          }

        if (afterOneWeek["2 - 4 Weeks"]) {
          result.future["2 - 4 weeks"] = afterOneWeek["2 - 4 Weeks"].map(mapTask);
        }

        if (nextMonth["Greater than 1 Month"]) {
          result.future["> 1 month"] = nextMonth["Greater than 1 Month"].map(mapTask);
        }
      }

      // Today (not in current API, but fallback safe)
      if (todayBlock && Array.isArray(todayBlock)) {
        result.today = todayBlock.map(mapTask);
      }

      // Targetless
      if (Array.isArray(targetlessBlock)) {
        result.targetless = targetlessBlock.map(mapTask);
      }

      return result;
    };

    return normalizeTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      overdue: {},
      today: [],
      future: {},
      targetless: []
    };
  }
};

const DeadlineView = () => {
  const [tasks, setTasks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const [expandedCards, setExpandedCards] = useState({});


  const loadTasks = async () => {
    const data = await fetchTasks();
    setTasks(data);
  };
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const toggleCardExpansion = (category) => {
    setExpandedCards((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleCardClick = (category) => {
    setActiveCategory(category);
    setShowModal(true);
  };

 
  // Handle Done Mork 
   const handleCheckboxChange = async (taskId, isChecked) => {
      if (!taskId || typeof isChecked !== "boolean") {
        console.error("Invalid parameters passed to handleCheckboxChange:", {
          taskId,
          isChecked,
        });
        return;
      }
    
     
      try {
        const currentPersonnelId = localStorage.getItem("tagatask_user_id");
        const response = await axios.post(
          `${Base_URL}/done_mark`,
          {
            task_priority_id: taskId,
            completed: isChecked,
            current_personnel: currentPersonnelId
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'any', // Custom header
            }
          }
        );
        if(response.data.success){
          toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          loadTasks();
        }
    
        if (!response.data.success) {
          console.error("Backend failed to update task status:", response.data.errors);
        }
      } catch (networkError) {
        console.error("Network error while updating task status:", networkError);
      }
    };
  

    // handle revert task 
    const handleRevertClick = async (taskId) => {
      try {
        const response = await axios.post(`${Base_URL}/revert`, {
          task_priority_id: taskId,
          status: "task is reverted",
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'any', // Custom header
          }
        }
      );
    
        if (response.data.success) {
          console.log("Backend updated task status successfully for taskId:", taskId);
          toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          
           // 🔥 Remove the task from the current category in UI
            setTasks(prevTasks => {
              const updatedTasks = { ...prevTasks };

              if (activeCategory === "today" || activeCategory === "targetless") {
                updatedTasks[activeCategory] = updatedTasks[activeCategory].filter(
                  task => task.id !== taskId
                );
              } else {
                for (const subCat in updatedTasks[activeCategory]) {
                  updatedTasks[activeCategory][subCat] = updatedTasks[activeCategory][subCat].filter(
                    task => task.id !== taskId
                  );
                }
              }

              return updatedTasks;
            });
        
        } else {
          toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
        }
      } catch (error) {
        console.error('An error occurred while updating task status:', error);
      }
    };

  const renderTasks = (category) => {
    const categoryColors = {
      overdue: "red",
      today: "white",
      future: "skyblue",
      targetless: "white"
    };


  


    if (category === "targetless" || category === "today") {
      return (
        <ul>
          {(tasks[category] || []).map((task) => (
            <li key={task.id} className="task-item">


            <div className="task-check">
                <input
                  type="checkbox"
                  checked={false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                  className="deadline-checkbox"
                />
           </div>

            <div className="task-revert">
              {
                task.completed_on ? (
                    <>
                        <Tooltip id="my-tooltip" className='revert_tooltip'/>
                          <img 
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Revert This Task"
                            data-tooltip-place="top"
                            src={revert_icon} 
                            className='revert_icon'
                            data-tip="Send back this task to the Allottee"
                            onClick={(e) =>{
                                     e.stopPropagation();
                                     handleRevertClick(task.id);
                                  }
                              }/>
                          <Tooltip
                            place="top"
                            type="dark"
                            effect="solid"
                            delayShow={200}
                          />
                     </>
                  ) : null
              }              
              </div> 
                                    
              <div className="task-title">
                 <span dangerouslySetInnerHTML={{ __html: task.title }} />
              </div>
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

              <div className="task-check">
                <input
                  type="checkbox"
                  checked={false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                  className="deadline-checkbox"
                />
              </div>
              <div className="task-revert">
              {
                task.completed_on ? (
                    <>
                        <Tooltip id="my-tooltip" className='revert_tooltip'/>
                          <img 
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Revert This Task"
                            data-tooltip-place="top"
                            src={revert_icon} 
                            className='revert_icon'
                            data-tip="Send back this task to the Allottee"
                            onClick={(e) =>{
                                     e.stopPropagation();
                                     handleRevertClick(task.id);
                                  }
                              }/>
                          <Tooltip
                            place="top"
                            type="dark"
                            effect="solid"
                            delayShow={200}
                          />
                     </>
                  ) : null
              }              
              </div>
            <div className="task-title">
               <  span dangerouslySetInnerHTML={{ __html: task.title }} />
            </div>
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  const categories = ["overdue", "today", "future", "targetless"];

  return (
    <div className="deadline-container">
      {categories.map((category) => {
  const isExpanded = expandedCards[category];

  return (
    <div key={category} className="deadline-card">
      <div className="cardTitle" onClick={() => toggleCardExpansion(category)}>
        <span>{category}</span>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      {isExpanded && (
        <div className="cardBody">
          {tasks[category] ? renderTasks(category) : <p>Loading...</p>}
        </div>
      )}
    </div>
  );
})}


      {showModal && (
        <PopupModal
          activeCategory={activeCategory}
          tasks={tasks}
          setTasks={setTasks}
          onClose={() => {
            setShowModal(false);
            loadTasks(); // ✅ Refresh tasks after modal closes
          }}
          handleCheckboxChange={handleCheckboxChange}
        />
      )}
    </div>
  );
};

export default DeadlineView;
