import React, { useEffect, useState } from "react";
import { get_tag_data } from "../ApiList";
import drag from '../../assets/drag.png';
import "./tagview.css";
import { updateTaskOrderAPI} from '../ApiList';


function Tagview() {
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const [tagviewdata, setTagViewData] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);


  // Fetch Data
  const datafetchfunction = async () => {
    const data = await get_tag_data();
    setTagViewData(data);
    console.log("this is tagviewdata -----", data);
  };

  useEffect(() => {
    datafetchfunction();
    
  }, []);
  


  // Handle Drag Start
  const handleDragStart = (taskId, taskDescription, category) => {
    setDraggingTask({taskId, taskDescription, category})

  };

  // Allow Drop
  const handleTaskDragOver = (e) => {
    e.preventDefault();
  };

  // Handle Drop and Call Backend
  const handleTaskReorder = async (targetAllotteeName, targetTaskIndex, section , cardIndex) => {
     if (!draggingTask) {
       console.error("No task is being dragged.");
       return;
     }
   
     const sectionContainer = document.getElementById(
       section === "To-Do" ? `to_do_tasks_${cardIndex}` : `follow_up_tasks_${cardIndex}`
   );
   
     if (!sectionContainer) {
       console.error(`Section container not found for section: ${section}`);
       return;
     }
    
   
     const reorderedTasks = Array.from(
       sectionContainer.querySelectorAll(".task-item-container")
     ).map((taskElement) => ({
       taskId: taskElement.getAttribute("data-task-id"),
       description: taskElement.getAttribute("data-task-description"),
     }));
     console.log("this is all the tasks", reorderedTasks);
   
     const draggedItemIndex = reorderedTasks.findIndex(
       (item) => item.taskId == draggingTask.taskId
     );
     if (draggedItemIndex === -1) {
       console.error("Dragged item not found in reordered tasks.");
       return;
     }
   
     const [draggedItem] = reorderedTasks.splice(draggedItemIndex, 1);
   
     reorderedTasks.splice(targetTaskIndex, 0, draggedItem);
   console.log("reorderedTasks",reorderedTasks);
   
     const newTargetTask = targetTaskIndex === 0
       ? "top"
       : reorderedTasks[targetTaskIndex - 1];
   
     const targetTaskId = newTargetTask === "top" ? "top" : newTargetTask.taskId;
   
     await updateTaskOrderAPI(targetAllotteeName, section, reorderedTasks.map((task) => ({
       taskId: task.taskId,
       description: task.description,
     })));
     datafetchfunction();
     console.log("Reordered Tasks sent to backend:", reorderedTasks);
   
     setDraggingTask(null);
   };
   






  return (
    <div className="task_container">
      {tagviewdata ? (
        <div className="tasks">
          {Object.entries(tagviewdata).map(([category, tasks], cardIndex) => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPersonnelId = parseInt(urlParams.get("id"));

            let part1Tasks = [];
            let part2Tasks = [];

            if (tasks[0][4] == currentPersonnelId && tasks[0][5] == currentPersonnelId) {
              part1Tasks = tasks.filter(
                ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                  return !completionDate && allotteeId === currentPersonnelId;
                }
              );
            } else {
              part1Tasks = tasks.filter(
                ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                  return !completionDate && allotteeId === currentPersonnelId;
                }
              );

              part2Tasks = tasks.filter(
                ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                  return !verificationDate && allotterId === currentPersonnelId;
                }
              );
            }

            let to_do_tasks = [...part1Tasks, ...part2Tasks];

            const part1FollowUpTasks = tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !verificationDate && allotteeId === currentPersonnelId;
              }
            );
            const part2FollowUpTasks = tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return completionDate;
              }
            );

            let follow_up_tasks = part1FollowUpTasks.filter((task) =>
              part2FollowUpTasks.includes(task)
            );

            const reallocatedTasks = tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !verificationDate && !completionDate && allotterId === currentPersonnelId && allotteeId !== currentPersonnelId;
              }
            );

            to_do_tasks = to_do_tasks.filter((task) => !reallocatedTasks.includes(task));

            follow_up_tasks = [...follow_up_tasks, ...reallocatedTasks];

            follow_up_tasks = follow_up_tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !(allotterId === currentPersonnelId && allotteeId === currentPersonnelId);
              }
            );

            const tasksToMoveToDo = follow_up_tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return allotterId === currentPersonnelId && completionDate && !verificationDate;
              }
            );

            follow_up_tasks = follow_up_tasks.filter(
              ([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !(allotterId === currentPersonnelId && completionDate && !verificationDate);
              }
            );

            to_do_tasks = [...to_do_tasks, ...tasksToMoveToDo];

            return (
              <div
                className="allottee_container"
                key={category}
              >
                <p className="name_text">{category}</p>

                <div id={`to_do_tasks_${cardIndex}`} className="to_do_section">
                  {to_do_tasks.length > 0 && <h3 className="section">To-Do</h3>}
                  {to_do_tasks.map(([taskId, taskDescription, completionDate,verificationDate , allotterId, allotteeId ], index) => (
                    <div
                      key={index}
                      className="task-item-container"
                      draggable
                      data-task-id={taskId}
                      data-task-description={taskDescription}
                      onDragStart={() => handleDragStart(taskId, taskDescription, category)}
                      onDragOver={handleTaskDragOver}
                      onDrop={() => handleTaskReorder(category, index, "To-Do" , cardIndex)}
                      onDragEnd={() => setDraggingTask(null)}   
                    >
                      <img className="drag_image_logo" src={drag} height={15} width={15} alt="drag" />
                      <input
                        type="checkbox"
                        style={{ marginRight: "10px" }}
                        className='checkbox'
                      />
                      <div className="each_task" style={{ padding: "5px" }}>{taskDescription}</div>
                    </div>
                  ))}
                </div>

                <div id={`follow_up_tasks_${cardIndex}`} className="follow_up_tasks">
                  {(to_do_tasks.length > 0 && follow_up_tasks.length > 0) && <hr className="section" />}
                  {follow_up_tasks.length > 0 && <h3 className="section">Follow-Up</h3>}
                  {follow_up_tasks.map(([taskId, taskDescription, completionDate,verificationDate , allotterId, allotteeId ], index) => (
                    <div
                      key={index}
                      className="task-item-container"
                      draggable
                      data-task-id={taskId}
                      data-task-description={taskDescription}
                      onDragStart={() => handleDragStart(taskId, taskDescription, category)}
                      onDragOver={handleTaskDragOver}
                      onDrop={() => handleTaskReorder(category, index, "Follow-Up" , cardIndex)}
                      onDragEnd={() => setDraggingTask(null)}  
                    >
                      <img className="drag_image_logo" src={drag} height={15} width={15} alt="drag" />
                      <input
                        type="checkbox"
                          style={{ marginRight: "10px" }}
                        className='checkbox'
                      />
                      <div className="each_task" style={{ padding: "5px" }}>{taskDescription}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>There is No Tags</div>
      )}
    </div>
  );
}

export default Tagview;
