// Modal.js
import React from "react";
import { ModalContainer, ModalContent, ModalButton } from "./styles";

const Modal = ({ message, onConfirm, onCancel }) => {
  return (
    <ModalContainer>
      <ModalContent>
        <h2>{message}</h2>
        <div>
          <ModalButton onClick={onConfirm}>Yes</ModalButton>
          <ModalButton onClick={onCancel}>No</ModalButton>
        </div>
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;
