
import React, { useEffect, useState } from "react";
import "./deadline.css";
import PopupModal from "./PopupModal";
import axios from "axios";

const fetchTasks = async () => {
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const current_user_id = localStorage.getItem("tagatask_user_id");

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
        comments: task.Comments,
        target_date: task.target_date
      });

      // Overdue
      if (overdueBlock) {
        const lastWeek =  overdueBlock.previous_week_data || {};
        const weekBefore = overdueBlock.week_before_previous_week_data || {};
        const lastMonth = overdueBlock.last_month_data || {};

        if (weekBefore["2 - 4 Weeks"]) {
          result.overdue["2 - 4 weeks"] = weekBefore["2 - 4 Weeks"].map(mapTask);
        }

        if (lastMonth["Greater than 1 Month"]) {
          result.overdue["> 1 month"] = lastMonth["Greater than 1 Month"].map(mapTask);
        }

        if(lastWeek["1 - 7 Days"])
        {
          result.overdue["1 - 7 Days"] = lastWeek["1 - 7 Days"].map(mapTask);
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

  useEffect(() => {
    const loadTasks = async () => {
      const data = await fetchTasks();
      setTasks(data);
    };
    loadTasks();
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
      targetless: "white"
    };

    if (category === "targetless" || category === "today") {
      return (
        <ul>
          {(tasks[category] || []).map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={false}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                className="checkbox"
              />
              <span dangerouslySetInnerHTML={{ __html: task.title }} />
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
                onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                className="checkbox"
              />
              <span dangerouslySetInnerHTML={{ __html: task.title }} />
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
          <div className="cardTitle">
              <span>{category}</span>
          </div>

          {tasks[category] ? renderTasks(category) : <p>Loading...</p>}
        </div>
      ))}

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

export default DeadlineView;
