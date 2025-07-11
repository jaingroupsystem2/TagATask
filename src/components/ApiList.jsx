import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { fetchTasks } from "../components/Deadline/deadline";


 const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  //const Base_URL = "https://94cd-49-37-8-126.ngrok-free.app";

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
export const sendUserId = async(setData) => {
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
      }
    } catch (error) {
      console.error('Error sending User ID:', error);
    }
  }
};

// Function to fetch options from Rails API
export const fetchData = async (setData) => {
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
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};



export const fetchAllottee = async (setAllottee) => {
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
  }
};


// update task reorder on Exicutive view 
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
    toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
  } catch (error) {
    console.error('Error updating task order:', error);
  }
};

// update task reorder on tagview 

export const updateTagViewTaskOrderAPI = async (targetAllotteeName,section,reorderedTasks) => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  const payload = {
    "current_personnel_id":userId,
    "tag_description":targetAllotteeName,
    "section_name":section,
    "all_task_data":reorderedTasks,
  };
console.log("..............",payload);


  try {
   

    // Log payload to Chrome console
    console.log("Payload sent to backend:", payload);

    const response = await axios.post(`${Base_URL}/tag_task_priority_create`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Log successful update response from backend
    console.log('Task order updated successfully:', response.data);
    toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
  } catch (error) {
    console.error('Error updating task order:', error);
  }
};

export const sendEditTasksData = async (tasksData,edit_card_allottee_id) => {
  
  const userId = localStorage.getItem("tagatask_user_id");
  console.log("this is from 165",edit_card_allottee_id,userId);
  console.log("tasksData",tasksData);
 

  try {
    const currentPersonnelId = new URLSearchParams(window.location.search).get('id');
    
    const response = await axios.post(`${Base_URL}/edit_task`, tasksData, {
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
    fetchAllottee();
  } catch (error) {
    console.error('Error editing tasks:', error);
  }
};

export const deleteTask = async(task_priority_id,allottee_id , allotter_id)=>{
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  const payload = {
    "task_priority_id":task_priority_id,
    "allottee_id":allottee_id,
    "allotter_id":allotter_id,
    "current_personnel_id":userId
  }
  try{
    const response = await axios.post(`${Base_URL}/delete_task`,payload,{
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
  }catch(error){
    console.error('Error while deleting task from edit popup:', error);
  }
}

export const sendComment = async(task_priority_id , comment_text)=>{
  const userId = localStorage.getItem("tagatask_user_id");
  const payload = {
    "task_priority_id":task_priority_id,
    "comment":comment_text[0],
    "updated_by":userId
  }
  try{
    const response = await axios.post(`${Base_URL}/api_list/task_comment_update`,payload,{
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    toast.success(response.data.message,{position: 'top-center',hideProgressBar: true,autoClose:400});
  }catch(error){
    console.error('Error while deleting task from edit popup:', error);
  }
}


export const fetchTagsByUserId = async () => {
  try {
    const current_user_id = localStorage.getItem("tagatask_user_id");
    console.log("api calling for tag section",current_user_id);
    const response = await axios.get(`${Base_URL}/api_list/tag_option?user_id=${current_user_id}`,{
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    console.log("Tags value from API:", response);
    return response.data.tag_options;
  } catch (error) {
    console.error("Error fetching tags:", error.response ? error.response.data : error.message);
  }
};

export const sendTagsByUserId = async (task_priority_id,tag_id,tag_description) => {
  try {
    const current_user_id =  localStorage.getItem("tagatask_user_id");
    const payload = {
      "task_priority_id":task_priority_id,
      "tag_id":tag_id,
      "tag_description":tag_description,
      "user_id":current_user_id
    }
    const response = await axios.post(`${Base_URL}/api_list/task_tag_update`,payload,{
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    console.log("Tags value from API:", response.data);
    return response.data.tags;
  } catch (error) {
    console.error("Error fetching tags:", error.response ? error.response.data : error.message);
  }
};


export const get_tag_data = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const current_user_id = urlParams.get('id');
    const response = await axios.get(`https://prioritease2-c953f12d76f1.herokuapp.com/api_list/tag_data/?user_id=${current_user_id}`,{
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    return response.data.tags;
  } catch (error) {
    console.error("Error fetching tags:", error.response ? error.response.data : error.message);
  }
};

 
// Delete Tag by Tag  ID
export const deleteTagsByUserId = async (task_priority_id,tag_id) => {
  
  try {
    const payload = {
      "task_priority_id":task_priority_id,
      "tag_id":tag_id
    }
    const response = await axios.post(`${Base_URL}/api_list/task_tag_destroy`,payload,{
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
      },
    });
    if(response.data.success)
    {
      toast.success(response.data.message,{position: 'top-center',hideProgressBar: true , autoClose: 300});
      const data = await fetchTasks();
      console.log(data);
      
    }
    else{
      toast.error(response.data.message,{position: 'top-center',hideProgressBar: true});
    }
  } catch (error) {
    console.error("Error fetching tags:", error.response ? error.response.data : error.message);
  }
};


// DeadLine View 
export const getDeadLineData = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const current_user_id = urlParams.get('id');
  try {
    const response = await axios.get(`${Base_URL}/deadline_view?user_id=${current_user_id}`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': "any",
        "user_id": current_user_id
      }
    });    

    console.log("response" , response);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};