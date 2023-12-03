import ReactModal from "react-modal";

interface ModalProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onRequestClose: () => void;
}

ReactModal.setAppElement("*");

export function Modal({ children, isOpen, onRequestClose }: ModalProps) {
  //  styling for the modal
  const modalStyle = {
    overlay: {
      zIndex: "900000",
      backgroundColor: "rgba(0,0,0,0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "0px",
      borderRadius: ".5rem",
      width: "auto",
      backgroundColor: "#fff",
      border: "none",
    },
  };

  return (
    <ReactModal
      // this opens the modal if isOpen value evaluates to true
      isOpen={isOpen}
      //   function to close the modal
      onRequestClose={onRequestClose}
      style={modalStyle}
    >
      {children}
    </ReactModal>
  );
}

interface ModalBody {
  children: React.ReactNode;
}

export function ModalBody({ children }: ModalBody) {
  return <form className="w-[21.4rem] md:w-[30rem] p-8">{children}</form>;
}
