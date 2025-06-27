// TaskModal.jsx
import React, { useState } from "react";
import "./deadline.css"; // reuse existing styles
import TargetTime from "../TargetTime";
import SelectText from "../SelectText";
import CustomSelect from "../CustomSelect";
import Comment from "../Comment";
import { sendComment } from "../ApiList"
import { fetchTasks } from "./deadline";
import { Tooltip } from "react-tooltip";
import revert_icon from '../../assets/revert.png';
import axios from "axios";
import { toast } from 'react-toastify';


const PopupModal = ({
  activeCategory,
  tasks,
  setTasks,
  onClose,
}) => {
  if (!activeCategory) return null;

  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const [flattenedTasks, setFlattenedTasks] = useState(
    Array.isArray(tasks[activeCategory])
      ? tasks[activeCategory]
      : Object.values(tasks[activeCategory]).flat()
  );

  console.log(flattenedTasks);

  // Handle comment section
  const handleCommentsChange = async (updatedCommentText, taskId) => {


    try {
      setFlattenedTasks((prevTasks) => {
        return prevTasks.map((task) => {
          if (task.id === taskId) {
            const updatedComments = Array.isArray(task.comments)
              ? [...task.comments, updatedCommentText]
              : [updatedCommentText]; // fallback for null
            console.log("updatedComments", updatedComments);

            return { ...task, comments: updatedComments };
          }
          return task;
        });
      });

      // Send comment to API
      await sendComment(taskId, updatedCommentText);
      const data = await fetchTasks();
      setTasks(data);

    } catch (error) {
      console.error("Error adding comment:", error);
    }

  };


  // Handle Target Date
  const handleDatetimeChange = async (taskId, newTargetTime) => {
    setFlattenedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, target_date: newTargetTime } : task
      )
    );
  };
  


  // Handle task Tag 
  const handleCustomTags = async(tag, taskId) => {
    setFlattenedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, tag_data: tag } : task
      )
    );

    const data = await fetchTasks();
    setTasks(data);

  }

  // Handle revert task 
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
        setFlattenedTasks(prevTasks =>
          prevTasks.filter(task => task.id !== taskId)
        );
        const data = await fetchTasks();
        setTasks(data);

      } else {
        toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
      }
    } catch (error) {
      console.error('An error occurred while updating task status:', error);
    }
  };
  

  // Handle Checkbox
  const handleCheckboxChange = async (taskId, isChecked) => {
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
            'ngrok-skip-browser-warning': 'any',
          }
        }
      );
  
      if (response.data.success) {
        toast.success(response.data.message, {
          position: 'top-center',
          hideProgressBar: true,
          autoClose: 400
        });
  
        // ✅ Remove task from popup
        setFlattenedTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  
      } else {
        toast.error(response.data.message, {
          position: 'top-center',
          hideProgressBar: true
        });
      }
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };
  


























  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <span>{activeCategory.toUpperCase()}</span>
        </div>

        {flattenedTasks.map((task, index) => (
          <>
            <div key={task.id} className="main-div">
              <div className="first-container-modal">
                <input
                  checked={false}
                  type="checkbox"
                  className="new-div-checkbox"
                  onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                />
                  {
                    task.completed_on ? (
                      <div className="task-revert">
                        <Tooltip id="my-tooltip" className='revert_tooltip' />
                        <img
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Revert This Task"
                          data-tooltip-place="top"
                          src={revert_icon}
                          className='revert_icon'
                          data-tip="Send back this task to the Allottee"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevertClick(task.id);
                          }
                      } />
                        <Tooltip
                          place="top"
                          type="dark"
                          effect="solid"
                          delayShow={200}
                        />
                      </div>
                    ) : null
                  }
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="new-div-input-modal"
                >
                  <span dangerouslySetInnerHTML={{ __html: task.title }} />

                </div>

              </div>
              <div className="second-container-modal">
                        <Tooltip id="my-tooltip" className='revert_tooltip' style={{ maxWidth: "70px"}}/>

                <div {...(!task.target_date && {
                                    'data-tooltip-id': 'my-tooltip',
                                    'data-tooltip-content': 'Target Time',
                                    'data-tooltip-place': 'top'
                                  })}
                              >
                      <TargetTime
                        dateTime={task.target_date}
                        onDatetimeChange={(newDatetime) => handleDatetimeChange(task.id, newDatetime)}
                      />
                </div>
                <div id='icon_div'>
                    <div {...(!task.tag_data && {
                                    'data-tooltip-id': 'my-tooltip',
                                    'data-tooltip-content': 'Add Label',
                                    'data-tooltip-place': 'top'
                                  })}>
                          <CustomSelect
                            taskPriorityId={task.id}
                            sendCustomTags={handleCustomTags}
                            index={index}
                            allLabel={Array.isArray(task.tag_data) ? task.tag_data : []}
                          />
                          </div>
                </div>

                <Comment
                  comments={Array.isArray(task.comments) ? task.comments : []}
                  sendComments={handleCommentsChange}
                  comment_index={task.id}
                />
                {task.comments.length > 0 && (
                  <div className="comment-count"> ({task.comments.length})</div>
                )}

              </div>
            </div>

          </>

        ))}
      </div>
    </div>
  );
};

export default PopupModal;
