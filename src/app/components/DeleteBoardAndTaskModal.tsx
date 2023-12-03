import { Modal, ModalBody } from "./Modal";
import { useAppDispatch, useAppSelector } from "@/components/redux/hooks";
import {
  closeDeleteBoardAndTaskModal,
  getDeleteBoardAndTaskModalValue,
  getDeleteBoardAndTaskModalVariantValue,
  getDeleteBoardAndTaskModalTitle,
  getDeleteBoardAndTaskModalIndex,
  getDeleteBoardAndTaskModalStatus,
  getCurrentBoardName,
} from "@/components/redux/features/appSlice";
import {
  useFetchDataFromDbQuery,
  useUpdateBoardToDbMutation,
} from "@/components/redux/services/apiSlice";

export default function DeleteBoardOrTaskModal() {
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getDeleteBoardAndTaskModalValue);
  const closeModal = () => dispatch(closeDeleteBoardAndTaskModal());
  const currentBoardName = useAppSelector(getCurrentBoardName);
  const modalVariant = useAppSelector(getDeleteBoardAndTaskModalVariantValue);
  const taskTitle = useAppSelector(getDeleteBoardAndTaskModalTitle);
  const taskIndex = useAppSelector(getDeleteBoardAndTaskModalIndex);
  const taskStatus = useAppSelector(getDeleteBoardAndTaskModalStatus);
  let { data } = useFetchDataFromDbQuery();
  const [updateBoardToDb, { isLoading }] = useUpdateBoardToDbMutation();

  const handleDelete = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (data) {
      if (modalVariant === "Delete this board?") {
        // Implement the logic for deleting the board
        if (currentBoardName) {
          //  Assuming data is available, you need to handle the logic to update the data
          const [boards] = data;
          const updatedBoards = boards.boards.filter(
            (board: { name: string }) => board.name !== currentBoardName
          );
          updateBoardToDb(updatedBoards);
        }
      } else {
        // Implement the logic for deleting a task
        if (taskIndex !== undefined && taskStatus && currentBoardName) {
          const [boards] = data;
          //  Handle the logic to update the tasks
          const updatedBoards = boards.boards.map(
            (board: {
              name: string;
              columns: [{ name: string; tasks: [] }];
            }) => {
            // check the board active board
              if (board.name === currentBoardName) {
                // loop through the columns of the board to find the column in which the task to edit is
                const updatedColumns = board.columns.map((column) => {
                  if (column.name === taskStatus) {
                    // delete the the task
                    const updatedTasks = column.tasks.filter(
                      (_, index: number) => index !== taskIndex
                    );
                    return { ...column, tasks: updatedTasks };
                  }
                  return column;
                });
                return { ...board, columns: updatedColumns };
              }
              return board;
            }
          );
          updateBoardToDb(updatedBoards);
        }
      }
    }
  };
  
  return (
    <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
      <ModalBody>
        <p className="text-red font-bold text-lg">{modalVariant}</p>
        <div className="pt-6">
          <p className="text-sm text-medium-grey leading-6">
            {modalVariant === "Delete this board?"
              ? `Are you sure you want to delete the '${currentBoardName}' board? This action will remove all columns
                and tasks and cannot be reversed.`
              : `Are you sure you want to delete the '${taskTitle}' tasks? This action cannot be reversed.`}
          </p>
        </div>
        <div className="pt-6 flex space-x-2">
          <div className="w-1/2">
            <button
              type="submit"
              onClick={(e: React.FormEvent<HTMLButtonElement>) =>
                handleDelete(e)
              }
              className="bg-red-500 rounded-3xl py-2 w-full text-sm font-bold"
            >
              {" "}
              {isLoading ? "Loading" : "Delete"}
            </button>
          </div>
          <div className="w-1/2">
            <button
              onClick={closeModal}
              className="bg-stone-200 rounded-3xl py-2 w-full text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
