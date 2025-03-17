import styled from "styled-components";

const Title = styled.h1`
  font-family: "Roboto", sans-serif;
  color: #333;
  font-size: 2vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Image = styled.img`
  hight: 4%;
  width: 4%;
`;

const InfoPanel = styled.div`
  text-align: center;
  font-family: "Roboto", sans-serif;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  color: #666;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: auto;
  width: auto;
  background-color: #ffffff;
  border-radius: 12px;
`;

const GameArea = styled.div`
  position: relative;
  border: 2px solid #333;
  background-color: #f0f0f0;
  overflow: hidden; // Prevent overflow of game elements
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  flex-grow: 1;
  border-radius: 8px;
`;

const Cell = styled.div`
  position: absolute;
  box-sizing: border-box;
  left: ${(props) => props.x * props.cellSize}px;
  top: ${(props) => props.y * props.cellSize}px;
  width: ${(props) => props.cellSize}px;
  height: ${(props) => props.cellSize}px;
  background-color: ${(props) => {
    if (props.isHead) return "#388E3C";
    if (props.isSnake) return "#4CAF50";
    if (props.isFood) return "#F44336";
    return "transparent";
  }};
  border-radius: ${(props) => {
    if (props.isHead) return "6px";
    if (props.isSnake) return "4px";
    if (props.isFood) return "50%";
    return "0";
  }};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 15px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #388e3c;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px 20px;
  }
`;

export { Button, Cell, GameArea, GameContainer, InfoPanel, InfoText, Overlay, Title, Image };
