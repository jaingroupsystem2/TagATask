import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
// const Base_URL = "https://05ce-49-37-8-126.ngrok-free.app";

export const handleCheckboxChange = async (taskId, isChecked, setAllottee) => {
  // Initial input validation and logging
  if (!taskId || typeof isChecked !== "boolean" || typeof setAllottee !== "function") {
    console.error("Invalid parameters passed to handleCheckboxChange:");
    console.error("taskId:", taskId, "isChecked:", isChecked, "setAllottee:", setAllottee);
    return;
  }
  console.log("Received taskId:", taskId, "isChecked:", isChecked);
  // Optimistically update UI state
  try {
    setAllottee(prevAllottee => {
      console.log("Previous Allottee state:", prevAllottee);
      const updatedAllottee = { ...prevAllottee };

      Object.entries(updatedAllottee).forEach(([allotteeName, tasks]) => {
        const taskIndex = tasks.findIndex(task => task[0] === taskId);
        if (taskIndex !== -1) {
          console.log(`Updating task status for taskId ${taskId} in ${allotteeName}`);
          updatedAllottee[allotteeName][taskIndex][2] = isChecked ? new Date().toISOString() : null;
        }
      });
      
      console.log("Updated Allottee state:", updatedAllottee);
      return updatedAllottee;
    });
  } catch (updateError) {
    console.error("Error updating Allottee state in setAllottee:", updateError);
    return;
  }

  // Send request to backend
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPersonnelId = parseInt(urlParams.get('id'));
    const response = await axios.post(`${Base_URL}/done_mark`, {
      task_priority_id: taskId,
      completed: isChecked,
      current_personnel: currentPersonnelId
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': "any"
      },
    });

    if (!response.data.success) {
      console.error('Backend failed to update task status:', response.data.errors);
    } else {
      console.log("Backend updated task status successfully for taskId:", taskId);
    }
  } catch (networkError) {
    console.error('Network error while updating task status:', networkError);
  }
};



// Function to send user ID to backend
export const sendUserId = async(setData, setError) => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id');

  if (userId) {
    try {
      const response = await axios.post(`${Base_URL}/allot`, {
        user_id: userId,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': "any"
        },
      });
      if (response.data && response.data.names) {
        setData(response.data.names);
      } else {
        setError('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error sending User ID:', error);
    }
  }
};

// Function to fetch options from Rails API
export const fetchData = async (setData, setError) => {
  try {
    const response = await axios.get(`${Base_URL}/allot`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any"
      },
    });
    if (Array.isArray(response.data.names) && response.data.names.every(item => Array.isArray(item) && item.length === 2)) {
      setData(response.data.names);
    } else {
      console.error('Unexpected data structure:', response.data.names);
      setError('Invalid data format received.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    setError('Error fetching data. Please check the console for more details.');
  }
};



export const fetchAllottee = async (setAllottee, setError) => {
  try {
    const userId = new URLSearchParams(window.location.search).get('id'); // Get user ID from URL
    const response = await axios.get(`${Base_URL}/task_data?user_id=${userId}`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    console.log(response.data.personnels);
    setAllottee(response.data.personnels);
  } catch (error) {
    console.error('Error fetching data:', error);
    setError('Error fetching data. Please check the console for more details.');
  }
};



export const updateTaskOrderAPI = async (targetAllotteeName,section,reorderedTasks) => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  try {
    const payload = {
      "current_personnel":userId,
      "card_holder_name":targetAllotteeName,
      "Section_Name":section,
      "Updated_Task_Order":reorderedTasks,
    };

    // Log payload to Chrome console
    console.log("Payload sent to backend:", payload);

    const response = await axios.post(`${Base_URL}/task_order`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Log successful update response from backend
    console.log('Task order updated successfully:', response.data);
    toast.success(response.data.message,{position: 'top-center',});
  } catch (error) {
    console.error('Error updating task order:', error);
  }
};

export const sendEditTasksData = async (tasksData) => {
 

  try {
    const currentPersonnelId = new URLSearchParams(window.location.search).get('id');
    
    const response = await axios.post(`${Base_URL}/edit_task`, tasksData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    console.log('Edit tasks response:', response.data);
    toast.success("Task Updated Successfully !",{position: 'top-center',});
    fetchAllottee();
  } catch (error) {
    console.error('Error editing tasks:', error);
  }
};