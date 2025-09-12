import { Modal, ModalProps } from "@/components/ui/Modal";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const useModal = ({ onClose, title, children, ...props }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    onClose && onClose();
  };

  const ModalComponent = createPortal(
    <Modal
      title={title}
      isOpen={isModalOpen}
      ref={modalRef}
      onClose={closeModal}
      {...props}
    >
      {children}
    </Modal>,
    document.body
  );

  return {
    closeModal,
    openModal,
    modal: isModalOpen ? ModalComponent : null,
    isModalOpen,
  };
};

export default useModal;
