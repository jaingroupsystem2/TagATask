import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    editingTask: false,
    tasks: [],
    isModalOpen: false, // Initially Modal state is False
    isToggleOn:false,
    isShowOn:false,
  },
  reducers: {
    setEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    openModal: (state) => {
      state.isModalOpen = true;
    },
    setcloseModal: (state) => {
      state.isModalOpen = false;
    },
    setToggleState: (state, action) => {
      state.isToggleOn = action.payload;
    },
    toggleState: (state) => {
      state.isToggleOn = !state.isToggleOn;
    },
    setShowState: (state, action) => {
      state.isShowOn = action.payload;
    },
    showState: (state) => {
      state.isShowOn = !state.isShowOn;
    }
  },
});

export const { 
               setEditingTask,
               setTasks, 
               openModal ,
               setcloseModal, 
               setToggleState,
               toggleState,
               showState,
               setShowState

              } = taskSlice.actions;
              
export default taskSlice.reducer;
