import styled from "styled-components";

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
  background-color: #388e3c;
  color: white;
  border: none;
  border-radius: 4px;

  &:hover {
    background-color: rgb(42, 110, 46);
  }
`;

export { ModalButton, ModalContainer, ModalContent };
