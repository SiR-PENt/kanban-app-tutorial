import { useEffect, useState, useRef } from "react";
import {
  useFetchDataFromDbQuery,
  useUpdateBoardToDbMutation,
} from "@/components/redux/services/apiSlice";
import { useAppDispatch, useAppSelector } from "@/components/redux/hooks";
import { getCurrentBoardName } from "@/components/redux/features/appSlice";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  openAddAndEditBoardModal,
  openAddAndEditTaskModal,
  openDeleteBoardAndTaskModal,
} from "@/components/redux/features/appSlice";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
// import Droppable from the custom hook
import { StrictModeDroppable as Droppable } from "./StrictModeDroppable";
// Define types for the tasks data
interface ITask {
  id: string;
  title: string;
  status: string;
}

// Define types for the data in each column
interface Column {
  id: string;
  name: string;
  tasks: ITask[];
}

export default function BoardTasks() {
  // Get loading state and data from the useFetchDataFromDbQuery endpoint
  const { isLoading, data } = useFetchDataFromDbQuery();
  const [updateBoardToDb] = useUpdateBoardToDbMutation();
  // Manage column data in columns state
  const [columns, setColumns] = useState<Column[]>([]);
  // Get active board name from the redux store
  const currentBoardTitle = useAppSelector(getCurrentBoardName);
  const dispatch = useAppDispatch();
  // check if it's the first render
  const initialRender = useRef(true);
  // Once data fetches successfully, this function in the useEffect runs
  useEffect(() => {
    if (data !== undefined) {
      const [boards] = data;
      if (boards) {
        // Get the data of the active board
        const activeBoardData = boards.boards.find(
          (board: { name: string }) => board.name === currentBoardTitle
        );
        if (activeBoardData) {
          const { columns } = activeBoardData;
          setColumns(columns);
        }
      }
    }
  }, [data, currentBoardTitle]);

  const handleDragEnd = async ({ destination, source }: any) => {
    // Check if the destination is not null (i.e., it was dropped in a valid droppable)
    if (!destination) return;

    // get a deep nested copy of the columns state
    const newColumns = columns.map((column) => ({
      ...column,
      tasks: [...column.tasks], // Create a new array for tasks
    }));

    // Find the source and destination columns based on their droppableIds
    const sourceColumnIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destinationColumnIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Task that was dragged
    const itemMoved = newColumns[sourceColumnIndex]?.tasks[source.index];

    // Remove from its source
    newColumns[sourceColumnIndex].tasks.splice(source.index, 1);

    // Insert into its destination
    newColumns[destinationColumnIndex].tasks.splice(
      destination.index,
      0,
      itemMoved
    );

    // Update the state
    setColumns(newColumns);
  };

  useEffect(() => {
    // Check if it's the initial render, to avoid sending the data to the backend on mount
    if (!initialRender.current) {
      // Update the backend with the new order
      try {
        if (data) {
          const [boards] = data;
          const boardsCopy = [...boards.boards];
          const activeBoardIndex = boardsCopy.findIndex(
            (board: { name: string }) => board.name === currentBoardTitle
          );
          const updatedBoard = {
            ...boards.boards[activeBoardIndex],
            columns,
          };
          boardsCopy[activeBoardIndex] = updatedBoard;
          updateBoardToDb(boardsCopy);
        }
      } catch (error) {
        // Handle error
        console.error("Error updating board:", error);
      }
    } else {
      // Set initial render to false after the first render
      initialRender.current = false;
    }
  }, [columns]);

  return (
    <div className="overflow-x-auto overflow-y-auto w-full p-6 bg-stone-200">
      {/* If data has not been fetched successfully, display a loading state, else display the column of tasks */}
      {isLoading ? (
        <p className="text-3xl w-full text-center font-bold">
          Loading tasks...
        </p>
      ) : (
        <>
          {/* If columns of tasks isn't empty: display the tasks, else display the prompt to add a new column */}
          {columns.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-6">
                {columns.map((column, _index) => {
                  const { id, name } = column;
                  return (
                    <div key={id} className="w-[17.5rem] shrink-0">
                      <p className="text-black">{`${column.name} (${
                        column.tasks ? column.tasks?.length : 0
                      })`}</p>
                      <Droppable droppableId={id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="h-full"
                          >
                            {column.tasks &&
                              // Display the tasks if there are tasks in the column, if not, display an empty column
                              (column.tasks.length > 0 ? (
                                column.tasks.map((task, index) => {
                                  const { id, title, status } = task;
                                  return (
                                    <Draggable
                                      key={id}
                                      draggableId={id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="bg-white p-6 rounded-md mt-6 flex items-center justify-between border"
                                        >
                                          <p>{task.title}</p>
                                          <div className="flex items-center space-x-1">
                                            <MdEdit
                                              onClick={() =>
                                                dispatch(
                                                  openAddAndEditTaskModal({
                                                    variant: "Edit Task",
                                                    title,
                                                    index,
                                                    name,
                                                  })
                                                )
                                              }
                                              className="text-lg cursor-pointer"
                                            />
                                            <MdDelete
                                              onClick={() =>
                                                dispatch(
                                                  openDeleteBoardAndTaskModal({
                                                    variant:
                                                      "Delete this task?",
                                                    title,
                                                    status,
                                                    index,
                                                  })
                                                )
                                              }
                                              className="text-lg cursor-pointer text-red-500"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })
                              ) : (
                                <div className="mt-6 h-full rounded-md border-dashed border-4 border-white" />
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
                {/* If the number of columns of tasks is less than 7, display an option to add more columns */}
                {columns.length < 7 ? (
                  <div
                    onClick={() =>
                      dispatch(openAddAndEditBoardModal("Edit Board"))
                    }
                    className="rounded-md bg-white w-[17.5rem] mt-12 shrink-0 flex justify-center items-center"
                  >
                    <p className="cursor-pointer font-bold text-black text-2xl">
                      + New Column
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </DragDropContext>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <div className="flex flex-col items-center">
                <p className="text-black text-sm">
                  This board is empty. Create a new column to get started.
                </p>
                <button className="bg-blue-500 text-black px-4 py-2 flex mt-6 rounded-3xl items-center space-x-2">
                  <p>+ Add New Column</p>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
