import React, { useEffect, useState ,useImperativeHandle, forwardRef} from "react";
import { get_tag_data } from "../ApiList";
import drag from '../../assets/drag.png';
import "./tagview.css";
import { updateTagViewTaskOrderAPI} from '../ApiList';
import axios  from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import revert_icon from '../../assets/revert.png';
import "react-tooltip/dist/react-tooltip.css";
import {Tooltip} from "react-tooltip";
import { setEditingTask } from '../../components/slices/Taskslice';
import { useSelector, useDispatch } from 'react-redux';




const Tagview = forwardRef(({ openModal, setTagModalPopup, editTask }, ref) => {
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  //const Base_URL = "https://94cd-49-37-8-126.ngrok-free.app";

  const [tagviewdata, setTagViewData] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);
  const [draggingAllottee, setDraggingAllottee] = useState(null);
  const [allotteeCardIndex,setAllotteeCardIndex] = useState(0);
  const editingTask = useSelector((state) => state.task.editingTask);
  const dispatch = useDispatch();
  

  // Fetch Data
  const datafetchfunction = async () => {
    const data = await get_tag_data();
    setTagViewData(data);
  };


  useImperativeHandle(ref, () => ({

    fetchData: datafetchfunction,
  }));

  useEffect(() => {
    datafetchfunction();
  }, []);
  

  // Handle Drag Start
  const handleDragStart = (taskId, taskDescription, category) => {
    setDraggingTask({taskId, taskDescription, category})

  };

  const dragAllotteeCard = (allotteeindex,tagName)=>{
    setDraggingAllottee(tagName);
    setAllotteeCardIndex(allotteeindex);
   // console.log("Dragging allottee:", allotteeName,"modalitem",allotteeCardIndex,allotteeindex);
  }

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
     if(section != section)
     {
      toast.warn("Not Applicable",{position: 'top-center',hideProgressBar: true,autoClose:400});
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
   
     await updateTagViewTaskOrderAPI(targetAllotteeName, section, reorderedTasks.map((task) => ({
       task_priority_id: task.taskId,
       description: task.description,
     })));
     datafetchfunction();
     console.log("Reordered Tasks sent to backend:", reorderedTasks);
   
     setDraggingTask(null);
   };

  // Handle drop same card or different card 
  const handleDrop = (tagName,cardIndex) => {
    if (draggingTask) {
      handleDropOnAllotteeContainer(tagName);
    } 
    // else if (draggingAllottee) {
    //   handleAllotteeReorder(tagName,cardIndex);
    // }
  };

  const handleDropOnAllotteeContainer = async (targetAllotteeName) => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPersonnelId = parseInt(urlParams.get('id'));
    if (!draggingTask) return;
    if (draggingTask.category !== targetAllotteeName) {

      const dataToSend = {
        current_personnel_id : currentPersonnelId,
        task_priority_id: draggingTask.taskId,
        dragged_to_tag: targetAllotteeName,
        dragged_from_tag:draggingTask.category
      };      
  
      try {  
        const response = await axios.post(
          `${Base_URL}/task_tag_transfer`,
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "ngrok-skip-browser-warning": "any"
            }
          }
        );
        setTimeout(datafetchfunction, 0);
        if(response.data.message){
          toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
        }else{
          toast.warn(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
        }
        // toast.success(response.data.message,{position: 'top-center',});
        console.log("API response:", response.data);
      } catch (error) {
        console.error("Error sending task transfer data:", error);
      }
    }else{
      console.log("Dragged task dropped within the same allottee. No transfer required.");
    }
  };
   

  // // Handle Allotee Reorder 
  // const handleAllotteeReorder = (targetAllotteeName,cardIndex) => {
  //   if (!draggingAllottee || draggingAllottee === targetAllotteeName) {
  //     console.log("No draggingAllottee or dropped on the same allottee.");
  //     return;
  //   }
  //   const old_card_order = Object.keys(tagviewdata);
  //   console.log("Dragged Allottee:", draggingAllottee);
  //   console.log("Dropped Over Allottee:", cardIndex);
  //   console.log("these are allottees",Object.keys(tagviewdata));
  
  //   old_card_order.splice(allotteeCardIndex,1);
  //   old_card_order.splice(cardIndex,0,draggingAllottee);
  //   console.log("old card order",old_card_order);
    
  //   const userId = new URLSearchParams(window.location.search).get('id');
  //   const dataToSend = {
  //     current_user: userId,
  //     draggedAllottee: draggingAllottee,
  //     droppedAllottee: targetAllotteeName,
  //     fullOrder: old_card_order,
  //   };
  
  //   axios
  //     .post(`${Base_URL}/allottee_card_reorder`, dataToSend, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         'ngrok-skip-browser-warning': "any",
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Backend response:", response.data);
  //       datafetchfunction();
  //       toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
  //     })
  //     .catch((error) => {
  //       console.error("Error sending allottee reorder data:", error);
  //     });
  
  //   setDraggingAllottee(null);
  // };

// Handle checked box 
const handleCheckboxChange = async (taskId, isChecked) => {
  if (!taskId || typeof isChecked !== "boolean") {
    console.error("Invalid parameters passed to handleCheckboxChange:", {
      taskId,
      isChecked,
    });
    return;
  }

  // Access setAllottee directly from the component's state

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPersonnelId = parseInt(urlParams.get('id'));
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
      datafetchfunction();
      toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
    }

    if (!response.data.success) {
      console.error("Backend failed to update task status:", response.data.errors);
    }
  } catch (networkError) {
    console.error("Network error while updating task status:", networkError);
  }
};


// revert Button 
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
      datafetchfunction();

    } else {
      console.error('Backend failed to update task status:', response.data.errors);
      toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
    }
  } catch (error) {
    console.error('An error occurred while updating task status:', error);
  }
};

// open modal 
const tagViewModalOpen = (tagname,to_do_tasks,follow_up_tasks)=>
{
  openModal();
  dispatch(setEditingTask(true));
  editTask(tagname, to_do_tasks, follow_up_tasks, true); // ✅ TagView
  setTagModalPopup(true)
}


// remove html element 
// const stripHtml = (html) => {
//   const tempDiv = document.createElement("div");
//   tempDiv.innerHTML = html;
//   return tempDiv.textContent || tempDiv.innerText || "";
// };




  return (
    <div className="task_container">
      {tagviewdata ? (
        <div className="tasks">
          {Object.entries(tagviewdata).map(([category, tasks], cardIndex) => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPersonnelId = parseInt(urlParams.get("id"));

            let part1Tasks = [];
            let part2Tasks = [];
            // console.log("t",tasks[0][4]);
            // console.log("e",tasks[0][5]);
            
           

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
            
            // to_do_tasks = to_do_tasks.filter((task, index, self) => 
            //   index === self.findIndex(t => t[0] === task[0]) // Keep only the first occurrence of each taskId
            // );

            return (
              <div
                className="allottee_container"
                key={category}
                draggable
                onDragOver={handleTaskDragOver}
                onDragStart={()=>{dragAllotteeCard(cardIndex,category)}}
                onDrop={() => handleDrop(category,cardIndex)}
                onClick={()=>{tagViewModalOpen(category,to_do_tasks,follow_up_tasks)}}
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
                        checked={false}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleCheckboxChange(taskId, e.target.checked)}
                        className='checkbox'                        
                      />
                       {
                        allotterId==currentPersonnelId && allotteeId !== currentPersonnelId ? (
                        <div>
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
                              handleRevertClick(taskId);
                            }
                            }/>
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
                        className="each_task" 
                        style={{ padding: "5px" }} 
                        dangerouslySetInnerHTML={{ __html: taskDescription }}
                      />
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
                        checked={allotteeId==currentPersonnelId && completionDate !=null}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleCheckboxChange(taskId, e.target.checked)}
                        style={{ marginRight: "10px" }}
                        className='checkbox'
                      />
                      <div 
                          className="each_task" 
                          style={{ padding: "5px" }} 
                          dangerouslySetInnerHTML={{ __html: taskDescription }}
                      />

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
})

export default Tagview;
