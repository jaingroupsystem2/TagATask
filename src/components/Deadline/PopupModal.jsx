// TaskModal.jsx
import React from "react";
import "./deadline.css"; // reuse existing styles
import TargetTime from "../TargetTime";
import SelectText from "../SelectText";
import CustomSelect from "../CustomSelect";
import Comment from "../Comment";

const PopupModal = ({
  activeCategory,
  tasks,
  onClose,
  handleCheckboxChange,
}) => {
  if (!activeCategory) return null;

  const flattenedTasks = Array.isArray(tasks[activeCategory])
    ? tasks[activeCategory]
    : Object.values(tasks[activeCategory]).flat();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <span>{activeCategory.toUpperCase()}</span>
        </div>

        {flattenedTasks.map((task) => (
            <>
                <div key={task.id} className="new-div">
                    <div className="first-container">
                        <input
                            type="checkbox"
                            className="new-div-checkbox"
                            onChange={() => handleCheckboxChange(task.id, true)}
                        />
                        <div
                            contentEditable
                            suppressContentEditableWarning={true}
                            className="editable-task"
                        >
                             <span dangerouslySetInnerHTML={{ __html: task.title }} />

                        </div>
                        
                    </div>
                    <div className="second-container">
                        <TargetTime/>
                        <Comment />
                     </div>
                </div>
               
          </>

        ))}
      </div>
    </div>
  );
};

export default PopupModal;
