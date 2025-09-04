import { Modal } from "@/components";
import { ModalProps } from "@/components/Modal";
import { cloneElement, useRef, useState } from "react";
import { createPortal } from "react-dom";

const useModal = ({ onClose, children, ...props }: ModalProps) => {
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
    <Modal isOpen={isModalOpen} ref={modalRef} onClose={closeModal} {...props}>
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
