import React, { useState, useRef, useEffect, useCallback } from 'react';
import './taskcreate.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import closebutton from '../assets/close.png';
import drag from '../assets/drag.png';
import TargetTime from './TargetTime';
import CustomSelect from './CustomSelect';
import WorkType from './WorkType';
import FileUpload from './FileUpload';
import Comment from './Comment';
import SelectText from './SelectText';
import DOMPurify from 'dompurify';
import axios, { all } from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendUserId, fetchData, fetchAllottee ,updateTaskOrderAPI, sendEditTasksData ,deleteTask ,sendComment,fetchTagsByUserId} from './ApiList';
import  ToggleButton  from './ToggleButton';
import revert_icon from '../assets/revert.png';
import { useSelector, useDispatch } from 'react-redux';
import { setEditingTask } from '../components/slices/Taskslice';
import "react-tooltip/dist/react-tooltip.css";
import {Tooltip} from "react-tooltip";
import Tagview from './Tagview/Tagview';
import SearchableDropdown from './SearchableDropdown';
import SelectAlotee from './Tagview/SelectAlotee';
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons




function TaskCreate() {
  const [inputValue, setInputValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const editableInputRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [options, setOptions] = useState([]);
  const [comments, setComments] = useState([]);
  const { userId } = useParams();
  const [draggingTask, setDraggingTask] = useState(null);
  const [draggingAllottee, setDraggingAllottee] = useState(null);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [Allottee, setAllottee] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tasksRef = useRef(tasks);
  const editingTask = useSelector((state) => state.task.editingTask);
  const [modalitem,setModalitem] = useState(null);
  const [allotteeCardIndex,setAllotteeCardIndex] = useState(0);
  const [edit_card_allottee_id, setEditCardAllottee] = useState(null);
  const dispatch = useDispatch();
  const [commentcount ,setCommentcount] = useState(0);
  const [tagoption, setTagoptions] = useState([]);
  const [toDoCount,setToDoCount] = useState(0);
  const [currentAllotee,setCurrentAllotee] = useState("");
  const [tagModalPopup,setTagModalPopup] = useState(false);
  const [tagAloteeName,setTagAloteeName] = useState([]);
  const [tagName , setTagName] = useState("");
  const tagviewRef = useRef(); // Create a ref
  const [expandedCards, setExpandedCards] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const accessTag = [564,219,26,533];
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  //const Base_URL = "https://94cd-49-37-8-126.ngrok-free.app";


// push notification 
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  } else {
    console.log("Notification permission denied.");
  }
};

// Call this function when the app loads
useEffect(() => {
  requestNotificationPermission();
}, []);


const showLocalNotification = async (title, body) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  if (Notification.permission === "granted") {
    // If permission is granted, use service worker to show notification
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [200, 100, 200], // Vibrates on mobile
        data: { url: "/" }, // Modify the URL if needed
      });
    });
  } else if (Notification.permission !== "denied") {
    // Ask for permission if not granted yet
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        showLocalNotification(title, body);
      }
    });
  }
};

// Example Usage: Call this function when a button is clicked
const handleButtonClick = () => {
  showLocalNotification("Task Alert", "A new task has been added!");
};















  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPersonnelId = parseInt(urlParams.get('id'));
    setCurrentAllotee(currentPersonnelId);
    tasksRef.current = tasks;
  }, [tasks]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    // console.log("all data are ", tasks);
    // console.log("all tags are ", tasks.label);
    
    if (editingTask) {
      console.log("Editing task is now true");
      // Perform actions here
    }
    console.log("now the task is in edit mode.",editingTask);
  }, [editingTask]);

 
  
  useEffect(() => {
    sendUserId(setData, setError);
    fetchData(setData, setError);
    fetchAllottee(setAllottee, setError);
    console.log("these are all followup tasks",tasks);
  }, [tasks]);


  // send tag edit popupdata
   const sendTagviewEditData = async (tasksData , tagName) => {
  
    console.log("handle crosss");
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    console.log("this is from 165",tagName,userId);
    console.log("taskTagsData",tasksData);
    const payload = {
      "tag_description":tagName,
      "all_tasks":tasksData,
      "current_personnel_id":userId
    }
    try {
      
      const response = await axios.post(`${Base_URL}/task_create_from_tag_view`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      console.log('Edit tasks response:', response.data.message);
      if( response.data.message)
      {
        toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
      }
      tagviewRef.current.fetchData(); // ✅ Calling child function
      fetchAllottee();
    } catch (error) {
      console.error('Error editing tasks:', error);
    }
  };


useEffect(() => {
  const updateData = () => {
    if(editingTask){
      const sanitizedData = tasks.map(({ ref, ...rest }) => rest);
      console.log("this is sanitizedData from line no 104",edit_card_allottee_id);
      console.log("this is sanitizedData from line no 106",sanitizedData);
      console.log("Tagview",tagModalPopup);
      
      if(tagModalPopup)
        {
          const hasUnassignedTask = tasks.some(task => 
            !task.taskId && (!task.allottee_id || task.allottee_id === null)
          );
  
          if (hasUnassignedTask) {
            toast.warn("Please select an Allottee before proceeding!", {
              position: "top-center",
              hideProgressBar: true,
              autoClose: 400,
            });
            console.log("Tagview inside",tagModalPopup);
            setTagModalPopup(true)
            setTasks([...tasks]);
            openModal();
            return; // Prevent modal from closing
          }
          
          const sanitizetagViewdData = tasks.map(({ ref, taskId, ...rest }) => ({
            task_priority_id: taskId, 
            ...rest
          }));
          
          console.log(" updateData tag sanitizedData",sanitizetagViewdData);
          sendTagviewEditData(sanitizetagViewdData , tagName);
          closeModal(); 
          dispatch(setEditingTask(false));
        }
        else{
          closeModal();
          sendEditTasksData(sanitizedData,edit_card_allottee_id);
          console.log(" updateData sanitizedData",sanitizedData);
        }
      //sendEditTasksData(sanitizedData,edit_card_allottee_id);
      fetchAllottee(setAllottee,setError);
      setTagModalPopup(false);  // ✅ Close the tag modal
    }
  }
  
  console.log("useEffect function is calling");
  
  const saveAllDataWithInputValue = () => {
    if (!inputValue) {
      console.log("Input value is required to save data");
      return;
    }

    // Synchronize tasks with the DOM
    const updatedTasks = tasks.map((task) => {
      if (task.ref?.current) {
        const latestText = task.ref.current.innerText.trim(); // Get latest text from DOM
        return { ...task, text: DOMPurify.sanitize(latestText) };
      }
      return task;
    });
    setTasks(updatedTasks); // Update state with synchronized tasks

    const params = new URLSearchParams(window.location.search);
    

    const userId = params.get("id");
    const dataToSave = {
      title: inputValue,
      user_id: userId,
      items: updatedTasks
        .map((task) => ({
          text: task.text,
          completed: task.completed,
          datetime: task.datetime,
          workType: task.workType,
          comments: task.comments,
          selectedTags: task.selectedTags || [],
          isBold: task.isBold || false,
          isItalic: task.isItalic || false,
        }))
        .filter(
          (item) => item.text !== "" || item.datetime || item.selectedTags.length > 0
        ),
    };

    console.log("dataaaaaaaaaaaaaaaaaaaa",dataToSave);
    
    if (dataToSave.title || dataToSave.items.length > 0) {
      setSavedItems((prevItems) => [...prevItems, dataToSave]);
      setTasks([]);
      setInputValue("");
      if (editableInputRef.current) editableInputRef.current.value = "";
     // document.getElementById("inputField").focus();

      fetch(`${Base_URL}/create_task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "any",
        },
        body: JSON.stringify(dataToSave),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to save data");
          }          
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          console.log("this function is getting called from useEffect function.");
          toast.success(data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          console.log("this portion is getting hitted");
          setTasks([]);
          console.log(isModalOpen)
          fetchAllotteeData();
          fetchAllottee(setAllottee,setError);
        })
        .catch((error) => {
          console.error("Error:", error);
          fetchAllottee(setAllottee,setError);
        }).finally(() => {
          closeModal();
          setIsModalOpen(false);
        });
    }

    setIsSaving(false);
  };



  const handleClick = (event) => {
    if (
      containerRef.current &&
      containerRef.current.contains(event.target) ||
      event.target.closest('.allottee_container') // Ignore clicks inside tagview cards
    ) {
      console.log("Clicked inside modal or tagview card");
      return;
    }
  
    console.log("Clicked outside modal");
  
    setTimeout(() => {
      if (tagModalPopup) {
        console.log("Closing tag modal...");
        updateData();
        
       
        // ✅ Ensure the main modal is also closed
      } else if (editingTask) {
        console.log("Updating and closing modal...");
        updateData();
        fetchAllottee(setAllottee, setError);
        dispatch(setEditingTask(false));
      } else {
        console.log("Saving and closing modal...");
        saveAllDataWithInputValue();
        if(isMobile)
        {
          setIsModalOpen(true);  // ✅ Ensure modal closes
        }else{
          setIsModalOpen(false);  // ✅ Ensure modal closes
        }
      }
    }, 100);
  };
  


  
  window.addEventListener("mousedown", handleClick);

  return () => {
    window.removeEventListener("mousedown", handleClick);
  };

}, [inputValue, tasks, userId]);

  
  
  

  const handleCheckboxChange = async (taskId, isChecked) => {
    if (!taskId || typeof isChecked !== "boolean") {
      console.error("Invalid parameters passed to handleCheckboxChange:", {
        taskId,
        isChecked,
      });
      return;
    }
  
    // Access setAllottee directly from the component's state
    setAllottee((prevAllottee) => {
      const updatedAllottee = { ...prevAllottee };
      Object.entries(updatedAllottee).forEach(([allotteeName, tasks]) => {
        const taskIndex = tasks.findIndex((task) => task[0] === taskId);
        if (taskIndex !== -1) {
          updatedAllottee[allotteeName][taskIndex][2] = isChecked
            ? new Date().toISOString()
            : null;
        }
      });
      return updatedAllottee;
    });
  
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
        fetchAllottee(setAllottee,setError);
        toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
      }
  
      if (!response.data.success) {
        console.error("Backend failed to update task status:", response.data.errors);
      }
    } catch (networkError) {
      console.error("Network error while updating task status:", networkError);
    }
  };
  
  
  const showToastMessage = () => {
    toast.warn("Please select an Allottee", {
      position: "top-center",hideProgressBar: true,
      style: { backgroundColor: "white", color: "black",autoClose:400 }
    });
  };

  const showToast = (type , position , message )=>{
    const validPosition = position || "top-center";
    const toastStyles = { backgroundColor: "white", color: "black" };
    if(type == 'success'){
      toast.success(
        message,{
          position:validPosition,
          style: toastStyles,
          autoClose:400
        }
      );
    }
    else if(type=="warning"){
      toast.warn(message,{
        position:validPosition,
        style: toastStyles,
        autoClose:400
      });
    }
    else if(type == "error"){
      toast.error(message,{
        position:validPosition,
        style: toastStyles
      })
    }else {
      console.error(`Unknown toast type: ${type}`);
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      editableInputRef.current.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      saveAllData();
      closeModal();
    }
  };

  const toggleBold = () => {
    if (selectedTaskIndex !== null) {
      const selectedTask = tasks[selectedTaskIndex];
      selectedTask.isBold = !selectedTask.isBold;
      setTasks([...tasks]);
    }
  };

  const toggleItalic = () => {
    if (selectedTaskIndex !== null) {
      const selectedTask = tasks[selectedTaskIndex];
      selectedTask.isItalic = !selectedTask.isItalic;
      setTasks([...tasks]);
    }
  };

  const createNewTask = (initialChar) => {

    if(tagModalPopup)
    {

    }else{
      if (!inputValue) {
        showToastMessage();
        return;
      }
    }
   
    let newTask;
    if(tagModalPopup)
    {
        newTask = {
        text: initialChar,
        completed: false,
        datetime: null,
        workType: '',
        comments: [],
        isBold: false,
        isItalic: false,
        ref: React.createRef(),
        current_personnel_id:currentAllotee,
        allottee_id : null,
        selectedTags:null

      };
    }
    else{
        newTask = {
        text: initialChar,
        completed: false,
        datetime: null,
        label: [],
        workType: '',
        comments: [],
        isBold: false,
        isItalic: false,
        ref: React.createRef(),
        current_personnel_id:currentAllotee,
        allottee_id :edit_card_allottee_id?.[0] || null
      };

    }
   
    setTasks((prevTasks) => [...prevTasks, newTask]);

    setTimeout(() => {
      const taskElement = newTask.ref.current;
      if (taskElement) {
        taskElement.focus();
        moveCursorToEnd(taskElement);
      }
    }, 0);
  };

  const moveCursorToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const moveCursor = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  };

  const handleTextSelect = (index) => {
    setSelectedTaskIndex(index);
  };


  const handleTaskKeyDown = (index, event) => {
    if (event.key === 'Escape' && !isSaving) {
      const taskElement = tasks[index]?.ref?.current;
      if (taskElement) {
        taskElement.blur();
      }
      setIsSaving(true);
      saveAllData();
      setTasks([]);
      closeModal();
      return;
    }

   

    if (event.key === 'Enter') {
      event.preventDefault();
      if (index < tasks.length - 1) {
        createNewTaskAtIndex(index + 1);
      } else {
        editableInputRef.current.focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index > 0) {
        setTimeout(() => moveCursor(tasks[index - 1].ref.current), 0);
      } else {
        setTimeout(() => {
          if (tasks.length > 0) {
            const lastTaskIndex = tasks.length - 1;
            const lastTaskElement = tasks[lastTaskIndex].ref.current;
            lastTaskElement.focus();
            moveCursor(lastTaskElement);
          }
        }, 0);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (index < tasks.length - 1) {
        setTimeout(() => {
          const nextTaskElement = tasks[index + 1].ref.current;
          nextTaskElement.focus();
          moveCursorToEnd(nextTaskElement);
        }, 0);
      } else {
        setTimeout(() => editableInputRef.current.focus(), 0);
      }
    }
  };


  let debounceTimer = null;
  let accumulatedChars = '';
  const handleEditableInputChange = (event) => {
    setInputValue(event.target.value); // Update the input value state
  };

  const handleEditableKeyDown = (event) => {
    if (event.key === 'Escape' && !isSaving) {
      setIsSaving(true);
      saveAllData();
      closeModal();
      return;
    }
    
    if(tagModalPopup)
      {
  
      }else{
        if (!inputValue) {
          showToastMessage();
          return;
        }
      }
    
    
    if (event.key === 'Backspace' && tasks.length > 0) {
      event.preventDefault();
      const lastTask = tasks[tasks.length - 1];
      setTimeout(() => moveCursor(lastTask.ref.current), 0);

    } else if (event.key === 'ArrowUp' && tasks.length > 0) {
      event.preventDefault();
      const lastTask = tasks[tasks.length - 1];
      setTimeout(() => moveCursor(lastTask.ref.current), 0);
      tasks[tasks.length - 1].ref.current.focus();
    } else if (event.key !== 'Enter' && /^[a-zA-Z0-9`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]$/.test(event.key)) {
      event.preventDefault();
      accumulatedChars += event.key;
      clearTimeout(debounceTimer);
      editableInputRef.current.value = accumulatedChars;
      debounceTimer = setTimeout(() => {
        if (accumulatedChars) {
          createNewTask(accumulatedChars);
          accumulatedChars = '';
          editableInputRef.current.value = '';
        }
      }, 0);
    }
  };

  const createNewTaskAtIndex = (index) => {
    const newTask = {
      text: '',
      completed: false,
      datetime: null,
      label: [],
      ref: React.createRef(),
      current_personnel_id:currentAllotee,
      allottee_id :edit_card_allottee_id?.[0] || null
    };
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      newTasks.splice(index, 0, newTask);
      return newTasks;
    });
    setTimeout(() => {
      newTask.ref.current.focus();
    }, 0);
  };


  const handleDatetimeChange = (index, datetime) => {
    const newTasks = [...tasks];
    newTasks[index].datetime = datetime;
    setTasks(newTasks);
  };

  const handleLabelChange = async(index, tags) => {
    const newTasks = [...tasks];
    newTasks[index].selectedTags = tags;
    setTasks(newTasks);
  };
 
// delete Task .... 

const confirmDeleteTask = (index) => {
  const isConfirmed = window.confirm("Are you sure you want to delete this task?");
  console.log("delete new task",tasks);
  
  if (isConfirmed) {
    handleDeleteTask(index);
  }
};


  const handleDeleteTask = (index) => {
    console.log("delete task id ........", tasks[index].allotterId);
    
    const currentPersonnelId = new URLSearchParams(window.location.search).get('id');
    if(currentPersonnelId == tasks[index].allotterId && editingTask){
      setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
      deleteTask(tasks[index].taskId , tasks[index].allotteeId , tasks[index].allotterId);
    }else{
      setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
    }
    console.log("delete task",tasks[index].taskId);
  };

  const handleTaskCheck = (cardIndex, taskIndex, isChecked) => {
    if (cardIndex === null) {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks];
        if (newTasks[taskIndex]) {
          newTasks[taskIndex].completed = isChecked;
          if (isChecked) {
            const completedTask = newTasks.splice(taskIndex, 1)[0];
            newTasks.push(completedTask);
          }
        }
        return newTasks;
      });
    } else {
      setSavedItems((prevItems) => {
        const newItems = [...prevItems];
        const card = newItems[cardIndex];

        if (card && card.items && card.items[taskIndex]) {
          card.items[taskIndex].completed = isChecked;
          if (isChecked) {
            const completedTask = card.items.splice(taskIndex, 1)[0];
            card.items.push(completedTask);
          }
        }

        return newItems;
      });
    }
  };

  const cleanHTML = (dirty) => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['strong', 'em'],
      ALLOWED_ATTR: []
    });
  };

  const handleTaskDragOverSmooth = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };





  const handleTaskReorder = async (targetAllotteeName, targetTaskIndex, section , cardIndex) => {
    if (!draggingTask) {
      console.error("No task is being dragged.");
      return;
    }

    const draggedTaskSection = draggingTask.section;

    if ((draggedTaskSection === "To-Do" && section === "Follow-Up") || 
        (draggedTaskSection === "Follow-Up" && section === "To-Do")) {
          toast.error("Not Applicable: Cannot move tasks between To-Do and Follow-Up", { 
            position: 'top-center', 
            hideProgressBar: true, 
            autoClose: 400 
          });
        return;
    }

    const sectionContainer = document.getElementById(
      section === "To-Do" ? `to_do_tasks_${cardIndex}` : `follow_up_tasks_${cardIndex}`
    );

    if (!sectionContainer) {
      console.error(`Section container not found for section: ${section}`);
      return;
    }

    // Get all tasks including their completed status
    const reorderedTasks = Array.from(
      sectionContainer.querySelectorAll(".task-item-container")
    ).map((taskElement) => ({
      taskId: taskElement.getAttribute("data-task-id"),
      description: taskElement.getAttribute("data-task-description"),
      completed: taskElement.querySelector(".checkbox")?.checked || false, // ✅ Get completed status
    }));

    console.log("All tasks in section:", reorderedTasks);

    const draggedItemIndex = reorderedTasks.findIndex(
      (item) => item.taskId == draggingTask.taskId
    );

    if (draggedItemIndex === -1) {
      console.error("Dragged item not found in reordered tasks.");
      return;
    }

    const [draggedItem] = reorderedTasks.splice(draggedItemIndex, 1);

    const targetTask = reorderedTasks[targetTaskIndex];

    // ✅ Ensure `targetTask` exists before checking its properties
    if (targetTask && (
        (draggedItem.completed && !targetTask.completed) || 
        (!draggedItem.completed && targetTask.completed)  && (
          (draggedItem.verificationDate && !targetTask.verificationDate) || 
          (!draggedItem.verificationDate && targetTask.verificationDate)  
        ))
      ) {
        toast.error("Task transfer not possible: Cannot mix completed and incomplete tasks.", {
            position: 'top-center',
            hideProgressBar: true,
            autoClose: 400
        });
        return;
    }

    reorderedTasks.splice(targetTaskIndex, 0, draggedItem);

    await updateTaskOrderAPI(targetAllotteeName, section, reorderedTasks.map((task) => ({
      taskId: task.taskId,
      description: task.description,
    })));

    await fetchAllottee(setAllottee, setError);
    console.log("Reordered Tasks sent to backend:", reorderedTasks);

    setDraggingTask(null);
};








  const handleTaskDragStart = (taskId, taskDescription, allotteeName,section) => {
    setDraggingTask({ taskId, taskDescription, allotteeName,section });
  };

  
  const handleTaskDragOver = (e) => {
    e.preventDefault();
  };
  


function handleDragStart(event, taskId, taskDescription) {
  event.dataTransfer.setData("text/plain", JSON.stringify({ taskId, taskDescription }));
  console.log("Dragging Task:", { taskId, taskDescription });
}


async function collectData(event, dropTargetTaskId, dropTargetTaskDescription) {
  if (!event || typeof event.preventDefault !== "function") {
    console.error("Invalid event object passed to handleDrop.");
    return;
  }
  event.preventDefault();
  const { taskId: draggedTaskId, taskDescription: draggedTaskDescription } = JSON.parse(
    event.dataTransfer.getData("text/plain")
  );
  const dropTargetTaskIdInt = parseInt(dropTargetTaskId, 10);
  const droppedData = { dropTargetTaskId: dropTargetTaskIdInt, dropTargetTaskDescription };
  console.log("Dragged Task:", { draggedTaskId, draggedTaskDescription });
  console.log("Dropped Over Task:", {
    dropTargetTaskId: dropTargetTaskIdInt,
    taskDescription: dropTargetTaskDescription,
  });
  console.log(typeof(draggingAllottee));
  console.log(typeof(draggedTaskId));
  console.log(typeof(draggedTaskDescription));
  console.log(typeof(dropTargetTaskIdInt));
  console.log(typeof(dropTargetTaskDescription));
  try {
    await updateTaskOrderAPI(
      draggingAllottee,
      draggedTaskId,
      draggedTaskDescription,
      dropTargetTaskIdInt,
      dropTargetTaskDescription
    );
    console.log("Task order updated successfully. Fetching updated data...");
  
    // Fetch updated data
    await fetchAllottee(setAllottee, setError);
    console.log("Fetched updated data successfully.");
  } catch (error) {
    console.error("Error updating task order or fetching data:", error);
  } finally {
    setDraggingIndex(null);
  }
  
}




  
const fetchAllotteeData = async () => {
  try {
    const userId = new URLSearchParams(window.location.search).get('id');
    const response = await axios.get(`${Base_URL}/task_data?user_id=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    console.log('Fetched tasks:', response.data);
    setAllottee(response.data.personnels);
  } catch (error) {
    console.error('Error fetching task data:', error);
  }
};

const handleAllotteeClick = (allotteeName, tasks) => {
  setSelectedAllottee(allotteeName);  // Set the selected allottee
  
  // Collect all follow-up tasks for the selected allottee
  const followUpTasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
    return allotteeId === currentPersonnelId && !completionDate && !verificationDate;
  });

  setEditableTasks(followUpTasks);  // Populate editable tasks with follow-up tasks
  setEditMode(true);  // Enable edit mode
};










  const saveAllData = useCallback(() => {
    console.log('====================================');
    console.log(editingTask);
    console.log('====================================');
    if(editingTask){
      console.log("Saving all data from first line", { inputValue, tasks });
      const sanitizedData = tasks.map(({ ref, ...rest }) => rest);
      console.log("Tagview",tagModalPopup);
      
      if(tagModalPopup)
        {
          console.log(" saveAllData sanitizedData",sanitizedData);
        }
        else{
           sendEditTasksData(sanitizedData,edit_card_allottee_id);
           console.log(" saveAllData sanitizedData",sanitizedData);

        }  
            console.log("this is sanitizedData from line no 104" ,edit_card_allottee_id);
      fetchAllottee(setAllottee,setError);
      fetchAllotteeData();
    }else{
     // Debugging line
    const params = new URLSearchParams(window.location.search);
    if (inputValue==="") { 
      return;
    }

    const userId = params.get('id');
    const dataToSave = {
      title: inputValue,
      user_id: userId,
      items: tasks.map((task) => {
        let formattedText = DOMPurify.sanitize(task.text);
        return {
          text: formattedText,
          completed: task.completed,
          datetime: task.datetime,
          workType: task.workType,
          comments: task.comments,
          selectedTags: task.selectedTags || [],
          isBold: task.isBold || false,
          isItalic: task.isItalic || false,
        };
      }).filter((item) => item.text !== '' || item.datetime || item.selectedTags.length > 0),
    };
    console.log("Data to Save:", dataToSave);

    if (dataToSave.title || dataToSave.items.length > 0) {
      setSavedItems((prevItems) => [...prevItems, dataToSave]);
      setTasks([]);
      setInputValue('');
      if (editableInputRef.current) editableInputRef.current.value = '';
     // document.getElementById('inputField').focus();

      fetch(`${Base_URL}/create_task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': "any",
        },
        body: JSON.stringify(dataToSave),
      })
        .then(response => {
          
          if (!response.ok) {
            throw new Error('Failed to save data');
          }
          return response.json();
        })
        .then(data => {
          console.log("Success:", data);
          console.log("this function is getting called from useEffect function.");
          toast.success(data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          console.log("this portion is getting hitted");
          setTasks([]);
          console.log(isModalOpen)
          fetchAllotteeData();
          fetchAllottee(setAllottee,setError);
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
        });      
    }
    console.log("Saving all data", { inputValue, tasks }); // Verify state
    console.log("Data to Save:", dataToSave); // Verify the payload

    setIsSaving(false);
    }
  }, [tasks, inputValue, userId]);



  const handleEditTask = (itemIndex) => {
    if (tasks.length > 0 || inputValue.trim()) {
      saveAllData();
    }

    const item = savedItems[itemIndex];
    setInputValue(item.title);
    setTasks(
      item.items.map((task) => ({
        ...task,
        ref: React.createRef(),
        selectedTags: task.selectedTags || [],
      }))
    );

    setSavedItems((prevItems) => prevItems.filter((_, index) => index !== itemIndex));
    //document.getElementById('inputField').focus();
  };

  const handleTaskInput = (index, event) => {
    if (event.type === 'blur' || event.key === 'Enter') {
      const newTasks = [...tasks];
      console.log("ew add input " , newTasks);
      
      newTasks[index].text = DOMPurify.sanitize(event.currentTarget.innerHTML, {
        ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'u', 'a'],
        ALLOWED_ATTR: ['href', 'target']
      });
      setTasks(newTasks);
      return;
    }
    const taskElement = event.currentTarget;
    taskElement.innerHTML = DOMPurify.sanitize(taskElement.innerHTML, {
      ALLOWED_TAGS: ['b', 'i', 'strong', 'em'],
    });
    setTimeout(() => {
      moveCursorToEnd(taskElement);
    }, 0);
  };

  const handleCommentsChange = async (updatedComments, comment_index) => {
    const task_priority_id = tasks[comment_index].taskId;
    const comment_text = updatedComments;

    try {
        // Optimistically update UI first
        setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks];
            updatedTasks[comment_index].comments.push(comment_text); // Add comment locally
            return updatedTasks;
        });

        // Send comment to API
        await sendComment(task_priority_id, comment_text);
        await fetchAllottee(setAllottee,setError);

        // Fetch the latest comments count from the API
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};




  const editTask = async (allotteeName, to_do_tasks, followUpTasks , isTagView =false ) => {
    setToDoCount(to_do_tasks.length);
    let allTask  = to_do_tasks.concat(followUpTasks);
    let transformedTasks;
    if(isTagView)
    {
      setTagName(allotteeName);
      let all_taskrefs = [];
      //console.log("this is all tasks type",typeof(followUpTasks),allTask);
        transformedTasks = allTask.map(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId, priority, comment,taskAlloteeName]) => {
        const taskRef = React.createRef();
        all_taskrefs.push(taskRef);
        return {
            taskId,
            allotteeId,
            allotterId,
            text: taskDescription,
            ref: taskRef,
            completed: completionDate ? true : false,
            datetime: completionDate || verificationDate || null,
            taskAlloteeName: taskAlloteeName,
            workType: '',
            priority: priority,
            comments: comment || null, 
            isBold: false,
            isItalic: false,
        };
    });
      console.log("comments ;;;;;" , transformedTasks);
      
      setTasks(transformedTasks);
      tasksRef.current = transformedTasks;
      openModal();

    }else
    {
        const allotteeId = await fetchAllotteeId(allotteeName);
        setEditCardAllottee(allotteeId);
        setInputValue(allotteeId);
        // followUpTasks = followUpTasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
        //     return allotteeId == allotteeId;
        // });
        let all_taskrefs = [];
        console.log("this is all tasks type",typeof(followUpTasks),allTask);
        //const commentsArray = allTask.map(task => task[7]); 
        // console.log("comments ..........." , commentsArray);
        
         transformedTasks = allTask.map(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId, priority, comment,labels]) => {
          const taskRef = React.createRef();
          all_taskrefs.push(taskRef);
          return {
              taskId,
              allotteeId,
              allotterId,
              text: taskDescription,
              ref: taskRef,
              completed: completionDate ? true : false,
              datetime: completionDate || verificationDate || null,
              label: labels,
              workType: '',
              priority: priority,
              comments: comment || null, 
              isBold: false,
              isItalic: false,
          };
      });
        console.log("comments ;;;;;" , transformedTasks);
        
        setTasks(transformedTasks);
        tasksRef.current = transformedTasks;
        openModal();
        console.log("followup tasks", allTask);
        console.log("these are all taskrefs", all_taskrefs);
    }
    const handleSaveAllTasks = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.target.blur();
            const updatedTasks = tasksRef.current.map(task => ({
                taskId: task.taskId,
                allotteeId: task.allotteeId,
                updatedText: task.text,
            }));
            console.log("these are updatedtask", updatedTasks);
            if(tagModalPopup)
            {
              
                console.log("tagview updatedTasks", updatedTasks);
            }
            else{
              saveEditTask(updatedTasks);
              console.log("exicutive updatedTasks", updatedTasks);

            }
            console.log("these are all updated tasks", updatedTasks);
            // setEditingTask(null);
            setIsModalOpen(false);
            setTasks([]);
        }
    };

    setTimeout(() => {
        // Attach 'keydown' listener to existing and newly added tasks
        transformedTasks.forEach((task) => {
            if (task.ref.current) {
              task.ref.current.addEventListener('keydown', handleSaveAllTasks);
            }
        });

        // Add event listeners for newly created tasks
        editableInputRef.current.addEventListener('keydown', handleSaveAllTasks);

        return () => {
            transformedTasks.forEach((task) => {
                if (task.ref.current) {
                    task.ref.current.removeEventListener('keydown', handleSaveAllTasks);
                }
            });

            if (editableInputRef.current) {
                editableInputRef.current.removeEventListener('keydown', handleSaveAllTasks);
            }
        };
    }, 0);
};

const saveEditTask =  async (taskId, allotteeId, updatedText) => {
  try {
      const dataToEdit = {
        task_id: taskId,
        allottee_id: allotteeId,
        text: updatedText,
      };
      const response = await fetch(`${Base_URL}/edit_task`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'any',
          },
          body: JSON.stringify(dataToEdit),
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;
      
      if (data) {
        console.log('Edit Success:', data);
        setTimeout(fetchAllotteeData, 200);
        setTasks([]);
        setInputValue('');
        toast.success(data.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
      } else {
        console.error('No data returned from edit task API');
      }
  } catch (error) {
      console.error('Error saving edited task:', error);
  }
};

const fetchAllotteeId = async (allotteeName) => {
    try {
        const response = await axios.post(
            `${Base_URL}/id_name_converter`,
            { name: allotteeName },
            { headers: { 
              'Content-Type': 'application/json',
               'Accept': 'application/json',
               'ngrok-skip-browser-warning': "any",
              } }
        );
        const allotteeId = response.data.id_name_converter;
        console.log("Fetched Allottee ID:", allotteeId);
        return allotteeId;
    } catch (error) {
        console.error('Error fetching ID for allottee name:', error);
        return null;
    }
};

const handleDropOnAllotteeContainer = async (targetAllotteeName) => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPersonnelId = parseInt(urlParams.get('id'));
  if (!draggingTask) return;
  if (draggingTask.allotteeName !== targetAllotteeName) {
    console.log("Dragged Task ID:", draggingTask.taskId);
    console.log("Dropped on Allottee:", targetAllotteeName);
    const dataToSend = {
      current_personnel_id : currentPersonnelId,
      task_priority_id: draggingTask.taskId,
      allocated_to: targetAllotteeName,
    };

    try {
      const response = await axios.post(
        `${Base_URL}/task_transfer`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "any"
          }
        }
      );
      setTimeout(fetchAllotteeData, 0);
      // toast.success("Task transferred Successfully !", {
      //   position: "top-center", 
      //   style: { backgroundColor: "white", color: "black" },
      // });
      if(response.data.message == 'Task Reallocated Successfully.'){
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



const dragAllotteeCard = (allotteeindex,allotteeName)=>{
  setDraggingAllottee(allotteeName);
  setAllotteeCardIndex(allotteeindex);
  console.log("Dragging allottee:", allotteeName,"modalitem",allotteeCardIndex,allotteeindex);
}



const handleAllotteeReorder = (targetAllotteeName,cardIndex) => {
  if (!draggingAllottee || draggingAllottee === targetAllotteeName) {
    console.log("No draggingAllottee or dropped on the same allottee.");
    return;
  }
  const old_card_order = Object.keys(Allottee);
  console.log("Dragged Allottee:", draggingAllottee);
  console.log("Dropped Over Allottee:", cardIndex);
  console.log("these are allottees",Object.keys(Allottee));

  old_card_order.splice(allotteeCardIndex,1);
  old_card_order.splice(cardIndex,0,draggingAllottee);
  console.log("old card order",old_card_order);
  
  const userId = new URLSearchParams(window.location.search).get('id');
  const dataToSend = {
    current_user: userId,
    draggedAllottee: draggingAllottee,
    droppedAllottee: targetAllotteeName,
    fullOrder: old_card_order,
  };

  axios
    .post(`${Base_URL}/allottee_card_reorder`, dataToSend, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        'ngrok-skip-browser-warning': "any",
      },
    })
    .then((response) => {
      console.log("Backend response:", response.data);
      fetchAllotteeData();
      toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
    })
    .catch((error) => {
      console.error("Error sending allottee reorder data:", error);
    });

  setDraggingAllottee(null);
};




const handleFileChange = async(fileIndex , fileName) =>
  {
    const task_priority_id = tasks[fileIndex].taskId;
    console.log('====================================');
    console.log("files ..." , fileName);
    console.log('====================================');  
  }


const handleDrop = (allotteeName,cardIndex) => {
  // console.log("this is card index",allotteeCardIndex);
  // setAllotteeCardIndex(null);
  if (draggingTask) {
    handleDropOnAllotteeContainer(allotteeName);
  } else if (draggingAllottee) {
    handleAllotteeReorder(allotteeName,cardIndex);
  }
};

const handleToggleChange = (newState) => {
  console.log('Toggle button state:', newState);
  setIsToggleOn(newState);
};

const modalDragStart = (e,index)=>{
  setModalitem(index);
  e.dataTransfer.effectAllowed = "move";
}
const modalDragOver =(e)=>{
  e.preventDefault();
}
const handleTaskDrop = (e, index) => {
  e.preventDefault();
  const updateItems = [...tasks]
  const draggedItem = updateItems[modalitem]
  updateItems.splice(modalitem, 1);
  updateItems.splice(index, 0, draggedItem);
  setTasks(updateItems);
  setModalitem(null);
};



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
      fetchAllottee(setAllottee,setError);
    } else {
      console.error('Backend failed to update task status:', response.data.errors);
      toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
    }
  } catch (error) {
    console.error('An error occurred while updating task status:', error);
  }
};



const openModal = () => {
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setTasks([]);
  setInputValue('');
  setTagModalPopup(false);
};

const handleCrossbtn = async()=>{
  try{
    if(editingTask){
      console.log("hii",tasks);
      closeModal();
      const sanitizedData = tasks.map(({ ref, ...rest }) => rest);
      console.log("sanitizedData data",sanitizedData);
      console.log("Tagview",tagModalPopup);
      
      if(tagModalPopup)
      {
        const hasUnassignedTask = tasks.some(task => 
          !task.taskId && (!task.allottee_id || task.allottee_id === null)
        );

        if (hasUnassignedTask) {
          toast.warn("Please select an Allottee before proceeding!", {
            position: "top-center",
            hideProgressBar: true,
            autoClose: 400,
          });
          setTagModalPopup(true)
          setTasks([...tasks]);
          openModal();
          return; // Prevent modal from closing
        }
        console.log("handleCrossbtn sanitizedData",sanitizedData);
        const sanitizetagViewdData = tasks.map(({ ref, taskId, ...rest }) => ({
          task_priority_id: taskId, 
          ...rest
        }));
        
        sendTagviewEditData(sanitizetagViewdData , tagName);
      }
      else{
        await sendEditTasksData(sanitizedData,edit_card_allottee_id);
        console.log("handleCrossbtn sanitizedData",sanitizedData);

      }
      console.log("this is sanitizedData from line no 104",edit_card_allottee_id);
      await fetchAllottee(setAllottee,setError);
    }else{
      closeModal();
      saveAllData();
      setIsModalOpen(false);
      setTagModalPopup(false); // 🔹 Ensuring tag modal closes too
      fetchAllottee(setAllottee,setError);
    }
  }
  catch (error) {
    console.error("Error in handleCrossbtn:", error);
    setError("An error occurred while processing your request.");
  }
}

  function takecount(count){
    setCommentcount(count)
  }
  
  function deleteComment(task_index,del_index){
    console.log(task_index , del_index);
    let updated_comments = tasks[task_index].comments.filter((item ,index)=> item[index] !== item[del_index]);
    console.log("Updated comments:", updated_comments);
    setTasks((pre)=>{
     const  updated_Task = [...pre];
      updated_Task[task_index].comments = updated_comments;
      return updated_Task;
    })
  }

  const handleCustomTags =(tag , index)=>
  {
      const newTasks = [...tasks];
      newTasks[index].selectedTags = tag;
      setTasks(newTasks);
  }


// Allotee name change on tagview .........
  const handleAlloteeChange = async(alloteeId , alloteeName, index) =>
    {
      const task = tasks[index];
      if (!task.taskId) {
        console.log("New Task - No API call needed", task);
        const updatedTasks = [...tasks];
        updatedTasks[index].allottee_id = alloteeId;
        updatedTasks[index].selectedTags = tagName;
        setTasks(updatedTasks);
        return;
      }
    
       // If the task already has an allottee, check if it has changed
       if (task.allotteeId !== alloteeId) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentPersonnelId = parseInt(urlParams.get('id'));
        console.log(`Calling API: Changing allottee from ${task.allotteeId} to ${alloteeId}`);
    
        // Update the UI first
        const updatedTasks = [...tasks];
        updatedTasks[index].allottee_id = alloteeId;
        setTasks(updatedTasks);
    
        // Prepare API payload
        const dataToSend = {
          current_personnel_id : currentPersonnelId,
          task_priority_id: task.taskId,
          allocated_to: alloteeName,
        };

        console.log("allotee Change ", dataToSend);
    
        try {
          const response = await axios.post(
            `${Base_URL}/task_transfer`,
            dataToSend,
            {
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "any"
              }
            }
          );
          setTimeout(fetchAllotteeData, 0);
          if(response.data.message == 'Task Reallocated Successfully.'){
            toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          }else{
            toast.warn(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
          }
          console.log("API response:", response.data);
        } catch (error) {
          console.error("Error sending task transfer data:", error);
        }
      }
    }
  
  useEffect(()=>
  {
    console.log("input........................." , inputValue);

  },[inputValue])
  

  return (

    <div className="main_div">
      {isModalOpen && (
        <div className="modal-overlay">
          <div ref={containerRef} className="container">
            <button className="close_button" onClick={handleCrossbtn}>
              <img src={closebutton} className="close_icon" height={15} width={15} />
            </button>

            {/* <select
              className="select_allottee"
              id="inputField"
              value={inputValue || ''}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                display:editingTask?'none':'block'
              }}
            >
            
              
              {data.map(([id, name]) => (
                <option key={id} value={id} multiple={false}>
                  {name}
                </option>
              ))}
            </select> */}

            <div className='select_allottee'  
                style={{
                display:editingTask?'none':'block'
                }}
             >
                <SearchableDropdown data={data} setInputValue={setInputValue}  />
            </div>

                {
                  tagModalPopup ? (
                    <div 
                    className="editable-div-container" 
                    style={{
                      marginTop:editingTask?'5vh':'0px'
                    }}>
      
                    {tasks.map((task, index) => (
                      <div
                        key={index}
                        className={`new-div`}
                        draggable
                        onDragStart={(e) => modalDragStart(e, index)}
                        onDragOver={(e)=>{modalDragOver(e)}}
                        onDrop={(e) => handleTaskDrop(e, index)}
                      >
                        <div className='first-container'>
                                <img className="drag_image_logo" src={drag} height={20} width={20} alt="drag" />
                                <input
                                  type="checkbox"
                                  className={`new-div-checkbox ${index<toDoCount ? "disable_task" : ""}`}
                                  checked={task.completed || false}
                                  onChange={(e) => handleTaskCheck(null, index, e.target.checked)}
                                />
                                <div
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  value={tasks}
                                  onChange={(e) => handleTaskInput(index, e)} // Typing input
                                  onBlur={(e) => handleTaskInput(index, e)}  // Save on blur
                                  onMouseUp={() => handleTextSelect(index)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Escape') {
                                      handleTaskKeyDown(index, e); // Handle other keys
                                    }
                                  }}
                                  ref={task.ref}
                                  className={`new-div-input ${index<toDoCount ? "disable_task" : ""}`}
                                  style={{ border: '1px solid #ccc', padding: '5px', minHeight: '37px', whiteSpace: 'pre-wrap' }}
                                  dangerouslySetInnerHTML={{ __html: task.text }} // Only rendered when loading the tasks initially
                                />
      
                                {selectedTaskIndex === index &&
                                  <SelectText
                                    targetRef={task.ref}
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    index={index}
                                  // toggleBold={toggleBold}
                                  // toggleItalic={toggleItalic}
                                  />
                                }
                        </div>
                        <div className="second-container">
                        <Tooltip id="my-tooltip" className='revert_tooltip' style={{ maxWidth: "70px"}}/>
      
                              <div data-tooltip-id="my-tooltip"
                                   data-tooltip-content="Target Time"
                                   data-tooltip-place="top">
                                    <TargetTime
                                      dateTime={task.datetime}
                                      onDatetimeChange={(newDatetime) => handleDatetimeChange(index, newDatetime)}
                                      onKeyDown={(e) => handleTaskKeyDown(index, e)}
                                    />
                                </div>  
      
      
                              <div id='icon_div'>
                                <div  data-tooltip-id="my-tooltip"
                                      data-tooltip-content="Add Allotee"
                                      data-tooltip-place="top">
                                  <SelectAlotee
                                    // taskPriorityId={tasks[index].taskId}
                                    setTaskAloteeName={handleAlloteeChange}
                                    index={index}
                                    taskAlloteeName={task.taskAlloteeName}
                                    options={data}
                                    setTagAloteeName={setTagAloteeName}
                                  />
                                </div>
                                
                                <div className='comment_sectoin' 
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content="Comment"
                                  data-tooltip-place="top">
                                  <Comment
                                    comments={Array.isArray(task.comments) ? task.comments : []}
                                    sendComments={ handleCommentsChange}
                                    comment_index = {index}
                                    comment_count = {takecount}
                                    comment_delete = {deleteComment}
                                  />
                                  <div className='count_layer'>{tasks[index] && tasks[index].comments && tasks[index].comments.length>0 ?tasks[index].comments.length:null}</div>
                                </div>
                                 
                                <div>
                                  <FileUpload fileIndex= {index} sendFile={handleFileChange} />
                                </div>
      
      
                                {(tasks[index].allotterId === currentAllotee || !tasks[index].taskId) && (
                                 <div className='timer_inp'>
                                  <WorkType selectedOption={task.workType}
                                    setSelectedOption={(value) => {
                                      const updatedTasks = [...tasks];
                                      updatedTasks[index].workType = value;
                                      setTasks(updatedTasks);
                                    }}
                                  />
                                </div>)} 
                                
      
                              </div>
                              {(tasks[index].allotterId === currentAllotee || !tasks[index].taskId) && (
                                  <button className="delete-button" onClick={() => confirmDeleteTask(index)}>
                                    <DeleteOutlinedIcon className='cross_button' style={{ fontSize: 30 }} />
                                  </button>
                              )}
                               
                            
                             
                        </div>
                      </div>
                    ))}
                    <div className="editable-input-container">
                      <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                      <input
                        id="editableInput"
                        ref={editableInputRef}
                        type="text"
                        onChange={handleEditableInputChange} // Update input value on typing
                        onKeyDown={handleEditableKeyDown}   // Handle key press events
                        placeholder="Add Task"
                        style={{
                          padding: '5px',
                          minHeight: '20px',
                          width: '100%',
                          outline: 'none',
                          border: 'none',
                        }}
                      />
                    </div>
                  </div>
                  ) : (

                    <div 
                    className="editable-div-container" 
                    style={{
                      marginTop:editingTask?'5vh':'0px'
                    }}>
      
                    {tasks.map((task, index) => (
                      <div
                        key={index}
                        className={`new-div`}
                        draggable
                        onDragStart={(e) => modalDragStart(e, index)}
                        onDragOver={(e)=>{modalDragOver(e)}}
                        onDrop={(e) => handleTaskDrop(e, index)}
                      >
                        <div className='first-container'>
                                <img className="drag_image_logo" src={drag} height={20} width={20} alt="drag" />
                                <input
                                  type="checkbox"
                                  className={`new-div-checkbox ${index<toDoCount ? "disable_task" : ""}`}
                                  checked={task.completed || false}
                                  onChange={(e) => handleTaskCheck(null, index, e.target.checked)}
                                />
                                <div
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  value={tasks}
                                  onChange={(e) => handleTaskInput(index, e)} // Typing input
                                  onBlur={(e) => handleTaskInput(index, e)}  // Save on blur
                                  onMouseUp={() => handleTextSelect(index)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Escape') {
                                      handleTaskKeyDown(index, e); // Handle other keys
                                    }
                                  }}
                                  ref={task.ref}
                                  className={`new-div-input ${index<toDoCount ? "disable_task" : ""}`}
                                  style={{ border: '1px solid #ccc', padding: '5px', minHeight: '37px', whiteSpace: 'pre-wrap' }}
                                  dangerouslySetInnerHTML={{ __html: task.text }} // Only rendered when loading the tasks initially
                                />
      
                                {selectedTaskIndex === index &&
                                  <SelectText
                                    targetRef={task.ref}
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    index={index}
                                  // toggleBold={toggleBold}
                                  // toggleItalic={toggleItalic}
                                  />
                                }
                        </div>
                        <div className="second-container">
                        <Tooltip id="my-tooltip" className='revert_tooltip' style={{ maxWidth: "70px"}}/>
      
                              <div data-tooltip-id="my-tooltip"
                                   data-tooltip-content="Target Time"
                                   data-tooltip-place="top">
                                    <TargetTime
                                      dateTime={task.datetime}
                                      onDatetimeChange={(newDatetime) => handleDatetimeChange(index, newDatetime)}
                                      onKeyDown={(e) => handleTaskKeyDown(index, e)}
                                    />
                                </div>  
      
      
                              <div id='icon_div'>
                                <div  data-tooltip-id="my-tooltip"
                                      data-tooltip-content="Add Label"
                                      data-tooltip-place="top">
                                  <CustomSelect
                                    taskPriorityId={tasks[index].taskId}
                                    sendCustomTags={handleCustomTags}
                                    index={index}
                                    allLabel={Array.isArray(task.label) ? task.label : []}
                                  />
                                </div>
      
      
                                <div className='comment_sectoin' 
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content="Comment"
                                  data-tooltip-place="top">
                                  <Comment
                                    comments={Array.isArray(task.comments) ? task.comments : []}
                                    sendComments={ handleCommentsChange}
                                    comment_index = {index}
                                    comment_count = {takecount}
                                    comment_delete = {deleteComment}
                                  />
                                  <div className='count_layer'>{tasks[index] && tasks[index].comments && tasks[index].comments.length>0 ?tasks[index].comments.length:null}</div>
                                </div>
                                 
                                <div>
                                  <FileUpload fileIndex= {index} sendFile={handleFileChange} />
                                </div>
      
      
                                {(tasks[index].allotterId === currentAllotee || !tasks[index].taskId) && (
                                 <div className='timer_inp'>
                                  <WorkType selectedOption={task.workType}
                                    setSelectedOption={(value) => {
                                      const updatedTasks = [...tasks];
                                      updatedTasks[index].workType = value;
                                      setTasks(updatedTasks);
                                    }}
                                  />
                                </div>)} 
                                
      
                              </div>
                              {(tasks[index].allotterId === currentAllotee || !tasks[index].taskId) && (
                                  <button className="delete-button" onClick={() => confirmDeleteTask(index)}>
                                    <DeleteOutlinedIcon className='cross_button' style={{ fontSize: 30 }} />
                                  </button>
                              )}
                               
                            
                             
                        </div>
                      </div>
                    ))}
                    <div className="editable-input-container">
                      <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                      <input
                        id="editableInput"
                        ref={editableInputRef}
                        type="text"
                        onChange={handleEditableInputChange} // Update input value on typing
                        onKeyDown={handleEditableKeyDown}   // Handle key press events
                        placeholder="Add Task"
                        style={{
                          padding: '5px',
                          minHeight: '20px',
                          width: '100%',
                          outline: 'none',
                          border: 'none',
                        }}
                      />
                    </div>
                  </div>
                  )
                }
           
          </div>
        </div>
      )}
      
      <div>
        <ul>
          {options.map((option, index) => (
            <li key={index}>{option.name}</li>
          ))}
        </ul>
      </div>

      

      {/* <div className='add_task_btn_div'>
        <button className='add_task_btn' onClick={openModal}><i className="fa fa-plus"></i><p>New Card</p></button>
      </div> */}

      <div className="add_task_btn_div">
        <div
          className={`add-card-button ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={()=>
            {
              openModal();
              handleButtonClick();
            }}
        >
          <i className="fa fa-plus plus_btn"></i>
          {isHovered && <span className="add-card-text">Add Card</span>}
        </div>
      </div>



       {  accessTag.includes(currentAllotee) && 
              <div className='toggle_button'>
                <p className='toggle_text'>Personnel</p>
                 <ToggleButton onToggleChange={handleToggleChange}/>
                <p className='toggle_text'>Tag</p>
              </div>
       }


      {!isToggleOn ?
      <div className='task_container'>
        {/* <h1 className='allottee_wise_task'>Allottee Wise Tasks</h1> */}
        <div className='tasks'>
        {
          Object.entries(Allottee).map(([allotteeName, tasks] , cardIndex) => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPersonnelId = parseInt(urlParams.get('id'));
            let part1Tasks  = [];
            let part2Tasks = [];
            
            if((tasks[0][4] == currentPersonnelId) && (tasks[0][5] == currentPersonnelId))
            {
              part1Tasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !completionDate && allotteeId === currentPersonnelId;
              });
            }
            else{
              part1Tasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !completionDate && allotteeId === currentPersonnelId;
              });
  
               part2Tasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
                return !verificationDate && allotterId === currentPersonnelId;
              });
            }
           
            let to_do_tasks = [...part1Tasks, ...part2Tasks];

            const part1FollowUpTasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return !verificationDate && allotteeId === currentPersonnelId;
            });
            const part2FollowUpTasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return completionDate;
            });
            
            let follow_up_tasks = part1FollowUpTasks.filter(task => part2FollowUpTasks.includes(task));

            // Reallocate tasks where verification and completion are missing but allotter is currentPersonnelId
            const reallocatedTasks = tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return !verificationDate && !completionDate && allotterId === currentPersonnelId && allotteeId !== currentPersonnelId;
            });

            // Remove reallocated tasks from to_do_tasks
            to_do_tasks = to_do_tasks.filter(task => !reallocatedTasks.includes(task));
            //console.log("todo-task.................",to_do_tasks);
            
            // Add reallocated tasks to follow_up_tasks
            follow_up_tasks = [...follow_up_tasks, ...reallocatedTasks];
            // Filter out tasks where both allotterId and allotteeId are equal to currentPersonnelId from follow_up_tasks
            follow_up_tasks = follow_up_tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return !(allotterId === currentPersonnelId && allotteeId === currentPersonnelId);
            });
            // Now check if any tasks have allotterId == currentPersonnelId, completionDate is not null, but verificationDate is null
            // Move these tasks to the "to_do_tasks" list and remove from the "follow_up_tasks" list
            const tasksToMoveToDo = follow_up_tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return allotterId === currentPersonnelId && completionDate && !verificationDate;
            });
            // Remove these tasks from follow_up_tasks
            follow_up_tasks = follow_up_tasks.filter(([taskId, taskDescription, completionDate, verificationDate, allotterId, allotteeId]) => {
              return !(allotterId === currentPersonnelId && completionDate && !verificationDate);
            });
            // Add these tasks to to_do_tasks
            to_do_tasks = [...to_do_tasks, ...tasksToMoveToDo];


            return (
          
                <div className={`allottee_container ${expandedCards[cardIndex] ? "expanded" : ""}`}
                key={allotteeName}
                draggable
                onDragOver={handleTaskDragOver}
                onDragStart={()=>{dragAllotteeCard(cardIndex,allotteeName)}}
                onDrop={() => handleDrop(allotteeName,cardIndex)}
               
              >
               {isMobile ? (
    <div className="card_header" onClick={() => 
        setExpandedCards((prev) => ({ ...prev, [cardIndex]: !prev[cardIndex] }))
    }>
        <p className="name_text">{allotteeName}</p>
        {expandedCards[cardIndex] ? <FaChevronUp className="arrow_icon" /> : <FaChevronDown className="arrow_icon" />}
    </div>
) : (
    <p className="name_text">{allotteeName}</p>
)}

                {/* To-Do Tasks */}
                {(expandedCards || !isMobile) && (

                <div className={`card_body_wrapper ${expandedCards[cardIndex] ? "open" : "closed"}`}  
                        onClick={() => {
                        dispatch(setEditingTask(true));
                        editTask(allotteeName ,to_do_tasks, follow_up_tasks , false)
                        }
                      }
                >
    
                    <div id={`to_do_tasks_${cardIndex}`} className='to_do_section'>
                      {to_do_tasks.length > 0 && <h3 className='section'>To-Do</h3>}
                      {to_do_tasks.map(([taskId, taskDescription, completionDate,verificationDate , allotterId, allotteeId ], index) => (
                        <div
                          key={taskId}
                          className="task-item-container"
                          draggable
                          data-task-id={taskId}
                          data-task-description={taskDescription}
                          onDragStart={() => handleTaskDragStart(taskId, taskDescription, allotteeName ,"To-Do")}
                          onDragOver={handleTaskDragOver}
                          onDrop={() => handleTaskReorder(allotteeName, index, "To-Do" , cardIndex)}
                          onDragEnd={() => setDraggingTask(null)}
                        >
                          <img className="drag_image_logo" src={drag} height={15} width={15} alt="drag" />
                          <input
                            type="checkbox"
                            checked={false}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleCheckboxChange(taskId, e.target.checked)}
                            style={{ marginRight: "10px" }}
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
                            onClick={() => editTask(taskId, taskDescription, allotteeName)}
                            suppressContentEditableWarning={true}
                            className="each_task"
                            style={{
                              padding: "5px",
                              whiteSpace: "pre-wrap",
                              fontSize: "15px",
                            }}
                            dangerouslySetInnerHTML={{ __html: taskDescription }}
                          />
                        </div>
                      ))}
                    </div>


                    {/* Follow-Up Tasks */}
                    <div id={`follow_up_tasks_${cardIndex}` } className='follow_up_tasks'>
                    {(to_do_tasks.length > 0 && follow_up_tasks.length>0) && <hr className='section'/>} 
                    {follow_up_tasks.length > 0 && <h3 className='section'>Follow-Up</h3>}

                      {follow_up_tasks.map(([taskId, taskDescription, completionDate,verificationDate , allotterId, allotteeId], index) => (
                        <div
                          key={taskId}
                          className="task-item-container"
                          draggable
                          data-task-id={taskId}
                          data-task-description={taskDescription}
                          onDragStart={() => handleTaskDragStart(taskId, taskDescription, allotteeName,"Follow-Up")}
                          onDragOver={handleTaskDragOver}
                          onDrop={() => handleTaskReorder(allotteeName, index,"Follow-Up" , cardIndex)}
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
                            
                            suppressContentEditableWarning={true}
                            className="each_task"
                            style={{
                              padding: "5px",
                              whiteSpace: "pre-wrap",
                              fontSize: "15px",
                              
                            }}
                            dangerouslySetInnerHTML={{ __html: taskDescription }}
                          />
                        </div>
                      ))}
                    </div>
                </div>

                )}
              </div>
            );
          })
        }

        </div>
      </div>
      :
      <div className='task_container'>
        <Tagview  ref={tagviewRef} openModal={openModal} setTagModalPopup = {setTagModalPopup} editTask={editTask}  />
      </div>
      }
    </div>
  );
}

export default TaskCreate;

