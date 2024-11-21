import axios from 'axios';



// export const handleCheckboxChange = async (taskId, isChecked, setAllottee) => {
//   try {
//     const response = await axios.post('https://2a5f-49-37-9-67.ngrok-free.app/done_mark', {
//       task_id: taskId,
//       completed: isChecked,
//     });

//     if (response.data.success) {
//       setAllottee((prevAllottee) => {
//         const updatedAllottee = { ...prevAllottee };
//         for (const [allotteeName, tasks] of Object.entries(updatedAllottee)) {
//           const taskIndex = tasks.findIndex(task => task[0] === taskId);
//           if (taskIndex !== -1) {
//             updatedAllottee[allotteeName][taskIndex][2] = isChecked;
//           }
//         }
//         return updatedAllottee;
//       });
//     } else {
//       console.error('Failed to update task status:', response.data.errors);
//     }
//   } catch (error) {
//     console.error('Error updating task status:', error);
//   }
// };

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
    const response = await axios.post('https://e487-49-37-9-67.ngrok-free.app/done_mark', {
      task_id: taskId,
      completed: isChecked,
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
export const sendUserId = async (setData, setError) => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id');

  if (userId) {
    try {
      const response = await axios.post('https://e487-49-37-9-67.ngrok-free.app/allot', {
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
    const response = await axios.get('https://e487-49-37-9-67.ngrok-free.app/allot', {
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

// Function to fetch allottee data
// export const fetchAllottee = async (setAllottee, setError) => {
//   try {
//     const response = await axios.get('https://e487-49-37-9-67.ngrok-free.app/task_data', {
//       headers: {
//         'Accept': 'application/json',
//         'ngrok-skip-browser-warning': "any"
//       },
//     });
//     console.log(response.data.personnels);
//     setAllottee(response.data.personnels);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     setError('Error fetching data. Please check the console for more details.');
//   }
// };

export const fetchAllottee = async (setAllottee, setError) => {
  try {
    const userId = new URLSearchParams(window.location.search).get('id'); // Get user ID from URL
    const response = await axios.get(`https://e487-49-37-9-67.ngrok-free.app/task_data?user_id=${userId}`, {
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



// export const updateTaskOrderAPI = async (reorderedTasks) => {
//   try {
//     const response = await axios.post('https://2a5f-49-37-9-67.ngrok-free.app/task_order', reorderedTasks, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//     });
//     console.log('Task order updated successfully:', response.data);
//   } catch (error) {
//     console.error('Error updating task order:', error);
//   }
// };




export const updateTaskOrderAPI = async (reorderedTasks, draggedTaskId, targetTaskId) => {
  try {
    const payload = {
      reorderedTasks,
      draggedTaskId,
      targetTaskId,
    };

    // Log payload to Chrome console
    console.log("Payload sent to backend:", payload);

    const response = await axios.post('https://e487-49-37-9-67.ngrok-free.app/task_order', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Log successful update response from backend
    console.log('Task order updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating task order:', error);
  }
};
