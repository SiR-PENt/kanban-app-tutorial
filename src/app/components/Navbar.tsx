'use client' 

import Dropdown from "./Dropdown";
import { useState, useEffect } from 'react'
// Import Redux functions and selectors for managing board names
import { setCurrentBoardName, getCurrentBoardName, openAddAndEditTaskModal } from '../../redux/features/appSlice'
import { useAppDispatch, useAppSelector } from '@/components/redux/hooks'
// Import the data-fetching hook from the API slice
import { useFetchDataFromDbQuery } from "@/components/redux/services/apiSlice";

export default function Navbar() {
  const [show, setShow] = useState<boolean>(false);
  // Destructuring assignment to extract data from the useFetchDataFromDbQuery hook
  const { data } = useFetchDataFromDbQuery();
  // Access the Redux dispatch function for calling actions
  const dispatch = useAppDispatch();

  // Effect hook to run when the data updates
  useEffect(() => {
    if (data) {
      // When a user signs in, set the currentBoardName to the first board's name
      const activeBoard = data[0].boards[0];
      dispatch(setCurrentBoardName(activeBoard.name));
    }
  }, [data]);

  // Select the current board name from the Redux store
  const currentBoardName = useAppSelector(getCurrentBoardName);

  return (
    <nav className="bg-white border flex h-24">
      <div className="flex-none w-[18.75rem] border-r-2 flex items-center pl-[2.12rem]">
        <p className="font-bold text-3xl"> Kanban App </p>
      </div>

      <div className="flex justify-between w-full items-center pr-[2.12rem]">
        {/* populate the current board name in the navbar */}
        <p className="text-black text-2xl font-bold pl-6">{currentBoardName}</p>

        <div className="flex items-center space-x-3">
          <button 
          type='button'
          onClick={() => dispatch(openAddAndEditTaskModal({variant: 'Add New Task'}))}
          className="bg-blue-500 text-black px-4 py-2 flex rounded-3xl items-center space-x-2">
            <p>+ Add New Task</p>
          </button>
          <div className="relative flex items-center">
            <button onClick={() => setShow(!show)} className="text-3xl mb-4">
              ...
            </button>
            <Dropdown show={show} />
          </div>
        </div>
      </div>
    </nav>
  );
}
