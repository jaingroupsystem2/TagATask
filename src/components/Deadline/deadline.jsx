// React component (DeadlineView.jsx)
import React, { useEffect, useState } from "react";
import "./deadline.css";
import PopupModal from "./PopupModal";


const fetchTasks = () =>
  Promise.resolve({
    overdue: {
      "0 - 7 days": [
        { id: 101, title: "Fix homepage bug Fix homepage bug Fix" },
        { id: 102, title: "Resubmit vendor form" },
        { id: 103, title: "Upload bank documents" },
        { id: 104, title: "Fix broken footer links" },
      ],
      "2 - 4 weeks": [
        { id: 105, title: "Resolve backlog issues" },
        { id: 106, title: "Cleanup analytics reports" },
        { id: 107, title: "Send weekly client update" },
      ],
      "> 1 month": [
        { id: 108, title: "Update audit sheet" },
        { id: 109, title: "Complete March inventory" },
      ],
    },
    today: [
      { id: 110, title: "Hey Whatsapp" },
      { id: 111, title: "Update pinboard" },
      { id: 112, title: "Scan old receipts" },
      { id: 113, title: "Brainstorm ideas" },
      { id: 114, title: "Team bonding activity" },
      { id: 115, title: "Prepare knowledge session" },
      { id: 116, title: "Update personal goals" },
      { id: 117, title: "Review pending self-tasks" },
      { id: 118, title: "Decorate desk" },
      { id: 119, title: "Fix plant watering schedule" },
      { id: 120, title: "Clean up old Slack channels" },
      { id: 121, title: "Sort app folders" },
      { id: 122, title: "Sort app folders" },
      { id: 123, title: "Sort app folders" },
      { id: 124, title: "Sort app folders" },
      { id: 125, title: "Sort app folders" },
      { id: 126, title: "Sort app folders" },
      { id: 127, title: "Sort app folders" },

    ],
    future: {
      "0 - 7 days": [
        { id: 201, title: "Plan quarterly review" },
        { id: 202, title: "Schedule team feedback" },
        { id: 203, title: "Organize project roadmap" },
        { id: 204, title: "Send upcoming tasks brief" },
      ],
      "2 - 4 weeks": [
        { id: 205, title: "Finalize audit checklist" },
        { id: 206, title: "Budget reallocation plan" },
        { id: 207, title: "Review vendor contracts" },
      ],
      "> 1 month": [
        { id: 208, title: "Prepare annual summary" },
        { id: 209, title: "Restructure department layout" },
      ],
    },
    targetless: [
      { id: 301, title: "Organize files" },
      { id: 302, title: "Update pinboard" },
      { id: 303, title: "Scan old receipts" },
      { id: 304, title: "Brainstorm ideas" },
      { id: 305, title: "Team bonding activity" },
      { id: 306, title: "Prepare knowledge session" },
      { id: 307, title: "Update personal goals" },
      { id: 308, title: "Review pending self-tasks" },
      { id: 309, title: "Decorate desk" },
      { id: 310, title: "Fix plant watering schedule" },
      { id: 311, title: "Clean up old Slack channels" },
      { id: 312, title: "Sort app folders" },
    ],
  });


  const deadline = () => {
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
